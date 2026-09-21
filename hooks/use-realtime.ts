"use client";

import { useEffect } from "react";
import {
  getRealtimeSocket,
  joinCartRoom,
  subscribeProduct,
} from "@/lib/realtime/socket";
import { useCartStore } from "@/hooks/use-cart";
import type { Cart } from "@/types/commerce";

type UseRealtimeOptions = {
  sessionId?: string;
  productSlug?: string;
  onProductUpdated?: (payload: unknown) => void;
  onStockChanged?: (payload: unknown) => void;
};

export function useRealtime({
  sessionId,
  productSlug,
  onProductUpdated,
  onStockChanged,
}: UseRealtimeOptions = {}) {
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    const socket = getRealtimeSocket(sessionId);

    if (sessionId) {
      joinCartRoom(sessionId);
    }
    if (productSlug) {
      subscribeProduct(productSlug);
    }

    const onCartUpdated = (cart: Cart & { sessionId?: string }) => {
      // Replace local cart snapshot when server pushes updates
      clear();
      for (const item of cart.items ?? []) {
        useCartStore.getState().addItem(item);
      }
    };

    socket.on("cart:updated", onCartUpdated);
    if (onProductUpdated) socket.on("product:updated", onProductUpdated);
    if (onStockChanged) socket.on("stock:changed", onStockChanged);

    return () => {
      socket.off("cart:updated", onCartUpdated);
      if (onProductUpdated) socket.off("product:updated", onProductUpdated);
      if (onStockChanged) socket.off("stock:changed", onStockChanged);
    };
  }, [sessionId, productSlug, onProductUpdated, onStockChanged, clear]);
}
