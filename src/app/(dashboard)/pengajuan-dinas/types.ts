// src/app/(dashboard)/pengajuan-dinas/types.ts

// Tipe data state untuk balasan ke form
export type DinasFormState = {
  message: string
  success: boolean
  errors?: Record<string, string[]>
}