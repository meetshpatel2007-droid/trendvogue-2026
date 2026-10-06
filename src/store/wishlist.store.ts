"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  categorySlug: string;
}

interface WishlistStore {
  items: WishlistProduct[];
  toggle: (product: WishlistProduct) => void;
  remove: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const exists = get().items.some((i) => i.id === product.id);
        if (exists) {
          set((s) => ({ items: s.items.filter((i) => i.id !== product.id) }));
        } else {
          set((s) => ({ items: [...s.items, product] }));
        }
      },

      remove: (productId) => {
        set((s) => ({ items: s.items.filter((i) => i.id !== productId) }));
      },

      isInWishlist: (productId) => get().items.some((i) => i.id === productId),

      clear: () => set({ items: [] }),
    }),
    {
      name: "tv-wishlist",
    }
  )
);
