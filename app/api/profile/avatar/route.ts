import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file was provided." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Please upload a JPG, PNG, WEBP, or GIF image." },
        { status: 400 },
      );
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { error: "Profile pictures must be 5 MB or smaller." },
        { status: 400 },
      );
    }

    const extensionByType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };

    const extension =
      extensionByType[file.type] ||
      file.name.split(".").pop()?.toLowerCase() ||
      "jpg";

    const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Server avatar upload error:", uploadError);

      return NextResponse.json(
        { error: uploadError.message || "Avatar upload failed." },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Server profile avatar update error:", profileError);

      return NextResponse.json(
        { error: "The image uploaded, but the profile could not be updated." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error("Avatar API error:", error);

    return NextResponse.json(
      { error: "Unable to upload the profile picture." },
      { status: 500 },
    );
  }
}
