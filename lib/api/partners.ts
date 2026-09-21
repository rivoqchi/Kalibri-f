import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { uploadMediaImage } from "@/lib/api/media";

export type PartnerMonth = {
  month: number;
  percent: number;
};

export type StorePartner = {
  id: string;
  name: string;
  imageUrl: string;
  phone: string;
  months: PartnerMonth[];
  isActive: boolean;
};

export type AdminPartner = StorePartner;

/** Monthly installment: `(price * (1 + percent/100)) / months` */
export function calcInstallmentMonthly(
  price: number,
  months: number,
  percent: number,
) {
  if (
    !Number.isFinite(price) ||
    !Number.isFinite(months) ||
    months <= 0 ||
    !Number.isFinite(percent) ||
    percent < 0
  ) {
    return NaN;
  }
  return (price * (1 + percent / 100)) / months;
}

export function listPartners() {
  return apiFetch<StorePartner[]>(endpoints.partners.list, {
    revalidate: 60,
    tags: ["partners"],
  });
}

export type PartnerWriteBody = {
  name?: string;
  imageUrl?: string;
  phone?: string;
  months?: PartnerMonth[];
  isActive?: boolean;
};

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function listAdminPartners(token: string) {
  return apiFetch<AdminPartner[]>(endpoints.partners.admin, {
    headers: authHeaders(token),
    revalidate: false,
  });
}

export function createPartner(
  token: string,
  body: {
    name: string;
    imageUrl: string;
    phone?: string;
    months?: PartnerMonth[];
    isActive?: boolean;
  },
) {
  return apiFetch<AdminPartner>(endpoints.partners.list, {
    method: "POST",
    headers: authHeaders(token),
    body,
    revalidate: false,
  });
}

export function updatePartner(
  token: string,
  id: string,
  body: PartnerWriteBody,
) {
  return apiFetch<AdminPartner>(endpoints.partners.byId(id), {
    method: "PATCH",
    headers: authHeaders(token),
    body,
    revalidate: false,
  });
}

export async function uploadPartnerImage(token: string, file: File) {
  return uploadMediaImage(token, file, "partners");
}
