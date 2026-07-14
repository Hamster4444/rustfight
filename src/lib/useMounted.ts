"use client";

import { useEffect, useState } from "react";

/** True only after client hydration — avoids SSR mismatch with persisted state. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
