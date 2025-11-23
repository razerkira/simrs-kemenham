"use client";

import { toast } from "sonner";
import { redirect } from "next/navigation";
import { checkUserRoles } from "./utils";

/**
 * Guard role client-side.
 * Jika role tidak memenuhi aturan, tampilkan toast + redirect.
 */
export function guardRole(required: (result: ReturnType<typeof checkUserRoles>) => boolean, userRole: number | string) {
  const roles = checkUserRoles(userRole);

  const allowed = required(roles);

  if (!allowed) {
    toast.error("Halaman tidak diizinkan untuk akses ini");
    redirect("/dashboard");
  }

  return true;
}
