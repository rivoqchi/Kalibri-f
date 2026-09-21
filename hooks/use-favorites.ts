"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  addFavoriteItem,
  getFavorites,
  removeFavoriteItem,
  replaceFavorites,
} from "@/lib/api/favorites"
import { useAuthStore } from "@/lib/auth/store"

type FavoritesState = {
  ids: string[]
  ready: boolean
  has: (productId: string) => boolean
  hydrateFromApi: () => Promise<void>
  toggle: (productId: string) => void
}

let syncEpoch = 0

function authToken() {
  return useAuthStore.getState().token
}

function bumpEpoch() {
  syncEpoch += 1
  return syncEpoch
}

function applyIds(ids: string[]) {
  useFavoritesStore.setState({ ids, ready: true })
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      ready: false,

      has: (productId) => get().ids.includes(productId),

      hydrateFromApi: async () => {
        const at = syncEpoch
        const localIds = get().ids
        try {
          let fav = await getFavorites(authToken())
          if (at !== syncEpoch) return

          const serverIds = fav.productIds ?? []
          const missing = localIds.filter((id) => !serverIds.includes(id))
          if (missing.length > 0) {
            fav = await replaceFavorites(authToken(), [
              ...serverIds,
              ...missing,
            ])
            if (at !== syncEpoch) return
          }

          applyIds(fav.productIds ?? [])
        } catch {
          if (at !== syncEpoch) return
          set({ ready: true })
        }
      },

      toggle: (productId) => {
        const wasLiked = get().ids.includes(productId)
        bumpEpoch()
        set((state) => ({
          ids: wasLiked
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        }))

        const at = syncEpoch
        void (async () => {
          try {
            const fav = wasLiked
              ? await removeFavoriteItem(authToken(), productId)
              : await addFavoriteItem(authToken(), productId)
            if (at !== syncEpoch) return
            applyIds(fav.productIds ?? [])
          } catch {
            if (at !== syncEpoch) return
            void get().hydrateFromApi()
          }
        })()
      },
    }),
    {
      name: "kalibri-favorites",
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
)
