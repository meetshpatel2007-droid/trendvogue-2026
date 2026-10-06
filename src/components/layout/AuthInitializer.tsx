"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

/**
 * Runs on mount to hydrate the auth store from the server session cookie.
 * Must be inside root layout so it runs on every page.
 */
export function AuthInitializer() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return null;
}
