import type { MetadataRoute } from "next";

const BASE_URL = "https://kerala-bus-finder.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/account/",
        "/messages/",
        "/favorites/",
        "/login",
        "/register",
        "/forgot-password",
        "/change-password",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}