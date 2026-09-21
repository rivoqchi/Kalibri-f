/** Store contact / social — override via NEXT_PUBLIC_* on deploy. */

export const STORE_PHONE =
  process.env.NEXT_PUBLIC_STORE_PHONE?.trim() || "+99890 318 0510"

export const STORE_PHONE_TEL =
  process.env.NEXT_PUBLIC_STORE_PHONE_TEL?.trim() ||
  STORE_PHONE.replace(/\s+/g, "")

export const STORE_LOGO_SRC = "/KaliBri_foto_main.png"

export const STORE_INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_STORE_INSTAGRAM_URL?.trim() ||
  "https://www.instagram.com/kalibri_texnika_dokoni/"

export const STORE_TELEGRAM_URL =
  process.env.NEXT_PUBLIC_STORE_TELEGRAM_URL?.trim() ||
  "https://t.me/KalibriGroupcoMchj"

/** Yandex Maps embed — override with NEXT_PUBLIC_YANDEX_MAP_EMBED_URL */
export const STORE_MAP_EMBED_URL =
  process.env.NEXT_PUBLIC_YANDEX_MAP_EMBED_URL?.trim() ||
  "https://yandex.uz/map-widget/v1/?ll=69.2877%2C41.3656&z=14&l=map&pt=69.2877,41.3656,pm2rdm&lang=uz_UZ"
