// src/app/(dashboard)/admin/manajemen-pegawai/actions.ts
"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache' // Untuk refresh tabel
import { z } from 'zod'
import { EditFormState } from './types' // Impor tipe baru
import { editProfileSchema } from './validation' // Impor skema baru
import { createAdminClient } from '@/utils/supabase/admin' // <-- Impor Admin Client

// Tipe data form
type EditProfileValues = z.infer<typeof editProfileSchema>

// Ini adalah Server Action yang akan kita panggil
export async function updatePegawaiProfile(
  data: EditProfileValues // Menerima objek data
): Promise<EditFormState> {
  
  // 1. Validasi input server-side
  const validatedFields = editProfileSchema.safeParse(data)
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Data yang dikirim tidak valid.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 2. Cek apakah pengguna yang melakukan aksi adalah Admin
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: "Error: Tidak terautentikasi" }
  }

  // Ambil role si pengguna yang sedang login
  const { data: adminProfile, error: adminError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminError || adminProfile?.role !== 'admin') {
    return { success: false, message: "Error: Anda tidak punya izin untuk aksi ini." }
  }

  // 3. Pisahkan ID dari data yang akan di-update
  const { id: pegawaiId, ...updateData } = validatedFields.data;

  // 4. Update data di database
  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData) // Update semua field kecuali ID
    .eq('id', pegawaiId) // Targetkan baris pegawai yang dipilih

  if (updateError) {
    console.error('Supabase error (update profile):', updateError)
    return { success: false, message: `Error database: ${updateError.message}` }
  }

  // 5. Jika berhasil, revalidasi (refresh) data di halaman
  revalidatePath('/(dashboard)/admin/manajemen-pegawai')
  
  return { 
    success: true, 
    message: `Data pegawai berhasil diperbarui!` 
  }

  // Skema validasi khusus untuk ubah password


// Tipe state balikan (bisa pakai tipe EditFormState yang sudah ada)
// --- SELESAI SERVER ACTION BARU ---
}

const updatePasswordSchema = z.object({
  userId: z.string().uuid("ID Pegawai tidak valid"),
  passwordBaru: z.string().min(8, "Password baru minimal 8 karakter"),
});

export async function adminUpdateUserPassword(
  data: z.infer<typeof updatePasswordSchema>
): Promise<EditFormState> { // Kita pakai ulang EditFormState

  // 1. Validasi input
  const validatedFields = updatePasswordSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Data password tidak valid.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Cek apakah pengguna yang melakukan aksi adalah Admin (pakai client biasa)
  const supabase = createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (!adminUser) {
    return { success: false, message: "Error: Tidak terautentikasi" }
  }
  const { data: adminProfile, error: adminError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', adminUser.id)
    .single()
  if (adminError || adminProfile?.role !== 'admin') {
    return { success: false, message: "Error: Anda tidak punya izin." }
  }

  // --- Mulai Operasi Admin ---
  const supabaseAdmin = createAdminClient() // <-- Gunakan Kunci Master

  // 3. Update password user via Admin API
  const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
    validatedFields.data.userId, // ID user yang akan diubah
    { password: validatedFields.data.passwordBaru } // Password baru
  );

  if (updateAuthError) {
    console.error('Supabase Admin Error (updateUserById - password):', updateAuthError);
    return { success: false, message: `Gagal mengubah password: ${updateAuthError.message}` };
  }

  // 4. Jika berhasil
  // Tidak perlu revalidatePath karena data tabel tidak berubah
  return {
    success: true,
    message: "Password pengguna berhasil diubah!",
  };
}