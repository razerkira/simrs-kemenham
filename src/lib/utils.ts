import { UserRole } from "@/types/database";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const returnRole = (roleNumber: number | string): UserRole => {
  switch (roleNumber) {
    case 1:
      return "admin";
    case 2:
      return "verificator";
    case 3:
      return "supervisor";
    case 5:
      return "pegawai";
    default:
      return "pegawai"; // Default atau case 4
  }
};

/**
 * Util role-check universal untuk seluruh aplikasi.
 * Bisa dipakai di halaman mana pun (client/server),
 * karena hanya operasi angka dan tanpa window.
 */

 export type RoleCheckResult = {
  isAdmin: boolean;
  isAdminUnit: boolean;
  isAdminInstansi: boolean;
  isAdminPusat: boolean;
  isPegawai: boolean;

  // Role gabungan
  isVerificator: boolean;
  isSupervisor: boolean;
  isAnyAdmin: boolean;
};

export function checkUserRoles(roleInput?: number | string): RoleCheckResult {
  const role = Number(roleInput);

  const isAdmin = role === 1;
  const isAdminUnit = role === 2;
  const isAdminInstansi = role === 3;
  const isAdminPusat = role === 4;
  const isPegawai = role === 5;

  return {
    isAdmin,
    isAdminUnit,
    isAdminInstansi,
    isAdminPusat,
    isPegawai,

    // gabungan
    isVerificator: isAdminUnit || isAdminInstansi || isAdminPusat || isAdmin,
    isSupervisor: isAdminInstansi || isAdminPusat || isAdmin,
    isAnyAdmin: isAdmin || isAdminUnit || isAdminInstansi || isAdminPusat,
  };
}
