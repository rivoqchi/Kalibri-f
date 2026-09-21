import Image from "next/image"

import type { StoreProductService } from "@/lib/api/product-services"

function toTelHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "")
  return digits ? `tel:${digits}` : undefined
}

export function ProfileServices({
  services,
}: {
  services: StoreProductService[]
}) {
  if (services.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium sm:text-base">Maxsulot servisi</h2>
      <ul className="flex flex-col gap-3">
        {services.map((service) => {
          const tel = toTelHref(service.phone)
          return (
            <li
              key={service.id}
              className="flex items-center gap-3 rounded-2xl bg-muted/40 px-3 py-3"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-background sm:size-14">
                {service.imageUrl ? (
                  <Image
                    src={service.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{service.name}</p>
                {service.phone ? (
                  tel ? (
                    <a
                      href={tel}
                      className="mt-0.5 inline-flex min-h-11 items-center text-sm text-muted-foreground tabular-nums"
                    >
                      {service.phone}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
                      {service.phone}
                    </p>
                  )
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
