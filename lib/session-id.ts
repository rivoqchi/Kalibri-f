const SESSION_KEY = "kalibri-session-id"

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

/** Guest identity for cart/search — persisted in localStorage. */
export function getSessionId(): string {
  if (typeof window === "undefined") return ""
  try {
    const existing = window.localStorage.getItem(SESSION_KEY)?.trim()
    if (existing) return existing
    const created = createSessionId()
    window.localStorage.setItem(SESSION_KEY, created)
    return created
  } catch {
    return createSessionId()
  }
}

export function searchIdentityHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "x-session-id": getSessionId(),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}
