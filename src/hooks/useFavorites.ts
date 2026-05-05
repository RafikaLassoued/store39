import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      isFavorite: (id) => get().favoriteIds.includes(id),
      toggleFavorite: (id) => {
        const exists = get().favoriteIds.includes(id);
        set({
          favoriteIds: exists
            ? get().favoriteIds.filter((item) => item !== id)
            : [id, ...get().favoriteIds],
        });
      },
    }),
    { name: 'store-favorites' }
  )
);
