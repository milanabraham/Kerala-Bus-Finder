import { Suspense } from "react";
import SearchResults from "./search-results";

function SearchLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border p-8 text-center">
          <p className="font-medium">
            Loading search results...
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Preparing the timetable results.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchResults />
    </Suspense>
  );
}