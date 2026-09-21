"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth/store";

/** true after zustand persist rehydrates from localStorage */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
