// src/app/(dashboard)/admin/manajemen-pegawai/types.ts
export type EditFormState = { // <-- Add export
  message: string;
  success: boolean;
  errors?: Record<string, string[]>;
};