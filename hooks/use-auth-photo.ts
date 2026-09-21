"use client";

import { useEffect, useState } from "react";
import { fetchAuthMePhoto } from "@/lib/api/auth";

function isHttpUrl(value: string | null | undefined): value is string {
  return Boolean(value && /^https?:\/\//i.test(value));
}

export function useAuthPhoto(
  photoUrl: string | null | undefined,
  token: string | null,
  revision?: number,
) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isHttpUrl(photoUrl) || !token) {
      setBlobUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    fetchAuthMePhoto(token).then((blob) => {
      if (cancelled || !blob || blob.size === 0) return;
      objectUrl = URL.createObjectURL(blob);
      setBlobUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoUrl, token, revision]);

  if (isHttpUrl(photoUrl)) return photoUrl;
  return blobUrl;
}
