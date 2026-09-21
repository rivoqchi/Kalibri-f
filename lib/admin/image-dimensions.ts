export type ImageDimensions = {
  width: number
  height: number
}

/** Exact source sizes derived from storefront/admin display ratios. */
export const ADMIN_IMAGE_DIMENSIONS = {
  products: { width: 1200, height: 1500 },
  categories: { width: 512, height: 512 },
  brands: { width: 512, height: 512 },
  partners: { width: 512, height: 512 },
  services: { width: 512, height: 512 },
  directions: { width: 512, height: 512 },
  ads: { width: 2400, height: 800 },
  avatars: { width: 512, height: 512 },
} as const satisfies Record<string, ImageDimensions>

export type AdminImageFolder = keyof typeof ADMIN_IMAGE_DIMENSIONS

export function formatImageDimensions(dims: ImageDimensions): string {
  return `${dims.width}×${dims.height}`
}

export function imageDimensionLabel(
  base: string,
  dims: ImageDimensions,
): string {
  return `${base} (${formatImageDimensions(dims)})`
}

export type ValidateImageDimensionsResult =
  | { ok: true; width: number; height: number }
  | { ok: false; message: string }

function readNaturalSize(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new window.Image()
    image.onload = () => {
      const width = image.naturalWidth
      const height = image.naturalHeight
      URL.revokeObjectURL(url)
      resolve({ width, height })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("image"))
    }
    image.src = url
  })
}

export async function validateImageDimensions(
  file: File,
  required: ImageDimensions,
): Promise<ValidateImageDimensionsResult> {
  const label = formatImageDimensions(required)
  try {
    const { width, height } = await readNaturalSize(file)
    if (width === required.width && height === required.height) {
      return { ok: true, width, height }
    }
    return {
      ok: false,
      message: `${label} kerak (${width}×${height})`,
    }
  } catch {
    return { ok: false, message: `${label} kerak` }
  }
}
