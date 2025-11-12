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
