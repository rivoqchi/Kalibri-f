"use client";

import { create } from "zustand";
import {
  addCartItem,
  clearCartApi,
  getCart,
  removeCartItem,
  setCartItemQuantity,
} from "@/lib/api/cart";
import { useAuthStore } from "@/lib/auth/store";
import type { CartItem } from "@/types/commerce";

type CartState = {
  items: CartItem[];
  ready: boolean;
  hydrateFromApi: () => Promise<void>;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const qtyTimers = new Map<string, ReturnType<typeof setTimeout>>();
let syncEpoch = 0;

function authToken() {
  return useAuthStore.getState().token;
}

function bumpEpoch() {
  syncEpoch += 1;
  return syncEpoch;
}

function applyItems(items: CartItem[]) {
  useCartStore.setState({ items, ready: true });
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  ready: false,

  hydrateFromApi: async () => {
    const at = syncEpoch;
    try {
      const cart = await getCart(authToken());
      if (at !== syncEpoch) return;
      applyItems(cart.items ?? []);
    } catch {
      if (at !== syncEpoch) return;
      set({ ready: true });
    }
  },

  addItem: (item) => {
    bumpEpoch();
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      if (!existing) {
        return { items: [...state.items, item] };
      }
      return {
        items: state.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        ),
      };
    });

    const at = syncEpoch;
    void (async () => {
      try {
        const cart = await addCartItem(authToken(), {
          productId: item.productId,
          quantity: item.quantity,
        });
        if (at !== syncEpoch) return;
        applyItems(cart.items ?? []);
      } catch {
        if (at !== syncEpoch) return;
        void get().hydrateFromApi();
      }
    })();
  },

  removeItem: (productId) => {
    bumpEpoch();
    const timer = qtyTimers.get(productId);
    if (timer) {
      clearTimeout(timer);
      qtyTimers.delete(productId);
    }

    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }));

    const at = syncEpoch;
    void (async () => {
      try {
        const cart = await removeCartItem(authToken(), productId);
        if (at !== syncEpoch) return;
        applyItems(cart.items ?? []);
      } catch {
        if (at !== syncEpoch) return;
        void get().hydrateFromApi();
      }
    })();
  },

  setQuantity: (productId, quantity) => {
    bumpEpoch();
    set((state) => ({
      items: state.items
        .map((i) => (i.productId === productId ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0),
    }));

    const existing = qtyTimers.get(productId);
    if (existing) clearTimeout(existing);

    const at = syncEpoch;
    qtyTimers.set(
      productId,
      setTimeout(() => {
        qtyTimers.delete(productId);
        void (async () => {
          try {
            const cart =
              quantity <= 0
                ? await removeCartItem(authToken(), productId)
                : await setCartItemQuantity(authToken(), productId, quantity);
            if (at !== syncEpoch) return;
            applyItems(cart.items ?? []);
          } catch {
            if (at !== syncEpoch) return;
            void get().hydrateFromApi();
          }
        })();
      }, 300),
    );
  },

  clear: () => {
    bumpEpoch();
    for (const timer of qtyTimers.values()) clearTimeout(timer);
    qtyTimers.clear();
    set({ items: [] });

    const at = syncEpoch;
    void (async () => {
      try {
        const cart = await clearCartApi(authToken());
        if (at !== syncEpoch) return;
        applyItems(cart.items ?? []);
      } catch {
        if (at !== syncEpoch) return;
        void get().hydrateFromApi();
      }
    })();
  },
}));
