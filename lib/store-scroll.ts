const SCROLL_PREFIX = "kalibri:scroll:"
const PENDING_RESTORE = "kalibri:scroll-pending"
const FROM_PATH = "kalibri:from-path"
const CAN_SOFT_BACK = "kalibri:can-soft-back"

function scrollStorageKey(path: string) {
  return `${SCROLL_PREFIX}${path}`
}

export function currentStorePath() {
  return `${window.location.pathname}${window.location.search}`
}

export function saveStoreScroll(
  path = currentStorePath(),
  y = window.scrollY,
) {
  try {
    sessionStorage.setItem(scrollStorageKey(path), String(y))
  } catch {
    /* private mode / quota */
  }
}

export function readStoreScroll(path: string): number | null {
  try {
    const raw = sessionStorage.getItem(scrollStorageKey(path))
    if (raw == null) return null
    const y = Number(raw)
    return Number.isFinite(y) ? y : null
  } catch {
    return null
  }
}

/** Call before client nav into a product detail page. */
export function rememberNavigationToProduct() {
  try {
    const path = currentStorePath()
    saveStoreScroll(path)
    sessionStorage.setItem(FROM_PATH, path)
    sessionStorage.setItem(CAN_SOFT_BACK, "1")
  } catch {
    /* ignore */
  }
}

export function markScrollRestorePending() {
  try {
    sessionStorage.setItem(PENDING_RESTORE, "1")
  } catch {
    /* ignore */
  }
}

export function isScrollRestorePending(): boolean {
  try {
    return sessionStorage.getItem(PENDING_RESTORE) === "1"
  } catch {
    return false
  }
}

export function clearScrollRestorePending() {
  try {
    sessionStorage.removeItem(PENDING_RESTORE)
  } catch {
    /* ignore */
  }
}

export function getStoreReturnPath(): string {
  try {
    return sessionStorage.getItem(FROM_PATH) || "/"
  } catch {
    return "/"
  }
}

export function canSoftStoreBack(): boolean {
  try {
    return sessionStorage.getItem(CAN_SOFT_BACK) === "1"
  } catch {
    return false
  }
}
