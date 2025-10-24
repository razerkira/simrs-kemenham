"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BuatAkunFormState } from "./types";
import { buatAkunSchema, BuatAkunFormValues } from "./validation";

export async function createPegawaiAccount(
  data: BuatAkunFormValues
): Promise<BuatAkunFormState> {
  const validatedFields = buatAkunSchema.safeParse(data);
  if (!validatedFields.success) {
    console.error(
      "Server Validation Error (/buat-akun):",
      validatedFields.error.flatten()
    );
    return {
      success: false,
      message: "Data yang dikirim tidak valid.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();
  if (!adminUser) {
    return { success: false, message: "Error: Tidak terautentikasi" };
  }
  const { data: adminProfile, error: adminError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.id)
    .single();
  if (adminError || adminProfile?.role !== "admin") {
    return { success: false, message: "Error: Anda tidak punya izin." };
  }

  const supabaseAdmin = createAdminClient();

  const { data: newUser, error: signUpError } =
    await supabaseAdmin.auth.admin.createUser({
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      email_confirm: true,
    });

  if (signUpError) {
    console.error("Supabase Admin Error (createUser):", signUpError);
    if (
      signUpError.message.includes(
        "duplicate key value violates unique constraint"
      )
    ) {
      return { success: false, message: "Error: Email ini sudah terdaftar." };
    }
    return {
      success: false,
      message: `Gagal membuat akun: ${signUpError.message}`,
    };
  }

  const newUserId = newUser.user.id;

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      nama: validatedFields.data.nama,
      nip: validatedFields.data.nip || null,
      jabatan: validatedFields.data.jabatan || null,
      pangkat_golongan: validatedFields.data.pangkat_golongan || null,
      unit_kerja: validatedFields.data.unit_kerja || null,
      role: validatedFields.data.role,
    })
    .eq("id", newUserId);

  if (profileError) {
    console.error("Supabase Admin Error (updateProfile):", profileError);
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    return {
      success: false,
      message: `Gagal mengupdate profil: ${profileError.message}. Akun Auth dihapus.`,
    };
  }

  revalidatePath("/(dashboard)/admin/manajemen-pegawai");

  return {
    success: true,
    message: `Akun untuk ${validatedFields.data.email} berhasil dibuat!`,
  };
}
