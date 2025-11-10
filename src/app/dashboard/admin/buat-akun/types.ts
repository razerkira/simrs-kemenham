// Tipe data state untuk balasan dari action buat akun
export type BuatAkunFormState = {
  message: string
  success: boolean
  errors?: Record<string, string[]>
}