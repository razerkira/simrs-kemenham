// src/app/(dashboard)/pengajuan-cuti/types.ts

export type CutiFormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[]>;
};
