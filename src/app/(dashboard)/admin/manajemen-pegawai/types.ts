// src/app/(dashboard)/admin/manajemen-pegawai/types.ts

// Tipe data state untuk balasan dari action edit
export type EditFormState = {
  message: string
  success: boolean
  errors?: Record<string, string[]>
}