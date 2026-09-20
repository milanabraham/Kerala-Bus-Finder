export type FavoriteBus = {
  id: string;
  serviceName: string;
  operator: string;
  operatorType: "Government" | "Private";
  from: string;
  to: string;
  departure: string;
  arrival: string;
  busType: string;
};

const FAVORITES_KEY = "kerala-bus-favorites";

export function getFavorites(): FavoriteBus[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((bus) => bus.id === id);
}

export function addFavorite(bus: FavoriteBus): void {
  const favorites = getFavorites();

  if (favorites.some((item) => item.id === bus.id)) {
    return;
  }

  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify([...favorites, bus])
  );
}

export function removeFavorite(id: string): void {
  const favorites = getFavorites().filter((bus) => bus.id !== id);

  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(favorites)
  );
}

export function toggleFavorite(bus: FavoriteBus): boolean {
  const alreadyFavorite = isFavorite(bus.id);

  if (alreadyFavorite) {
    removeFavorite(bus.id);
    return false;
  }

  addFavorite(bus);
  return true;
}