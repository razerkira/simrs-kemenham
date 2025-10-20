// src/app/(dashboard)/pengajuan-cuti/types.ts

// Tipe data state untuk balasan ke form
export type CutiFormState = {
  message: string
  success: boolean
  errors?: Record<string, string[]>
}