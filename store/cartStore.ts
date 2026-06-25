import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  savedItems: CartItem[];
  couponCode: string | null;
  couponDiscount: number;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  removeSavedItem: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;

  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedItems: [],
      couponCode: null,
      couponDiscount: 0,

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === newItem.productId
          );

          if (existingItem) {
            const newQuantity = Math.min(
              existingItem.quantity + newItem.quantity,
              newItem.maxQuantity
            );
            return {
              items: state.items.map((item) =>
                item.productId === newItem.productId
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
              : item
          ),
        }));
      },

      saveForLater: (productId) => {
        const { items, savedItems } = get();
        const item = items.find((i) => i.productId === productId);

        if (item) {
          const alreadySaved = savedItems.find(
            (i) => i.productId === productId
          );
          set({
            items: items.filter((i) => i.productId !== productId),
            savedItems: alreadySaved
              ? savedItems
              : [...savedItems, { ...item, quantity: 1 }],
          });
        }
      },

      moveToCart: (productId) => {
        const { items, savedItems } = get();
        const item = savedItems.find((i) => i.productId === productId);

        if (item) {
          const inCart = items.find((i) => i.productId === productId);
          set({
            savedItems: savedItems.filter((i) => i.productId !== productId),
            items: inCart
              ? items.map((i) =>
                  i.productId === productId
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
                )
              : [...items, { ...item, quantity: 1 }],
          });
        }
      },

      removeSavedItem: (productId) => {
        set((state) => ({
          savedItems: state.savedItems.filter(
            (item) => item.productId !== productId
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], couponCode: null, couponDiscount: 0 });
      },

      applyCoupon: (code, discount) => {
        set({ couponCode: code, couponDiscount: discount });
      },

      removeCoupon: () => {
        set({ couponCode: null, couponDiscount: 0 });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.salePrice ?? item.price;
          return total + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "retro-gaming-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
