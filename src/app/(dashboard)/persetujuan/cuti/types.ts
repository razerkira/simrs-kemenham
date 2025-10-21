// src/app/(dashboard)/persetujuan/cuti/types.ts
export type PersetujuanFormState = { // <-- Ensure 'export' is here
  message: string;
  success: boolean;
  // Add errors property if your action might return field errors
  errors?: Record<string, string[]>;
};