"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;       // productId
  name: string;
  price: number;
  mrp: number;
  image: string;
  size: string;
  color?: string;
  quantity: number;
  stockQty: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, size: string, color?: string) => void;
  updateQty: (productId: string, size: string, color: string | undefined, qty: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const itemKey = (productId: string, size: string, color?: string) =>
  `${productId}__${size}__${color ?? ""}`;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (incoming) => {
        const key = itemKey(incoming.id, incoming.size, incoming.color);
        set((s) => {
          const existing = s.items.find(
            (i) => itemKey(i.id, i.size, i.color) === key
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                itemKey(i.id, i.size, i.color) === key
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + (incoming.quantity ?? 1),
                        i.stockQty
                      ),
                    }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...s.items,
              { ...incoming, quantity: incoming.quantity ?? 1 },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (productId, size, color) => {
        const key = itemKey(productId, size, color);
        set((s) => ({
          items: s.items.filter((i) => itemKey(i.id, i.size, i.color) !== key),
        }));
      },

      updateQty: (productId, size, color, qty) => {
        const key = itemKey(productId, size, color);
        if (qty <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            itemKey(i.id, i.size, i.color) === key
              ? { ...i, quantity: Math.min(qty, i.stockQty) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openDrawer:  () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "tv-cart",
    }
  )
);
