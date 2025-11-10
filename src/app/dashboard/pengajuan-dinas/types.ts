// src/app/(dashboard)/pengajuan-dinas/types.ts

export type DinasFormState = {
  message: string
  success: boolean
  errors?: Record<string, string[]>
}