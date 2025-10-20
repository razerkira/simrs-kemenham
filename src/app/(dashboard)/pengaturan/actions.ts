"use server"

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { profileSchema, ProfileFormValues } from './validation'; // Impor schema & type

// Tipe data state balikan
export type FormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[]>;
};

// Tipe data input yang diterima (termasuk ID)
type UpdateProfileInput = ProfileFormValues & { id: string };

// Action menerima OBJEK
export async function updateProfile(
  data: UpdateProfileInput
): Promise<FormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== data.id) {
    return { success: false, message: "Error: Tidak terautentikasi atau ID tidak cocok" };
  }

  const { id, ...formData } = data; // Pisahkan ID
  const validatedFields = profileSchema.safeParse(formData); // Validasi sisanya

  if (!validatedFields.success) {
    console.error("Server Validation Error (/pengaturan):", validatedFields.error.flatten());
    return {
      success: false,
      message: "Validasi server gagal.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Update data
  const { error } = await supabase
    .from('profiles')
    .update(validatedFields.data)
    .eq('id', user.id);

  if (error) {
    console.error('Supabase error (/pengaturan):', error);
    return { success: false, message: `Error database: ${error.message}` };
  }

  revalidatePath('/(dashboard)', 'layout');

  return {
    success: true,
    message: "Profil berhasil diperbarui!"
  };
}