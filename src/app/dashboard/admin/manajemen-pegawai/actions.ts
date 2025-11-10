// src/app/(dashboard)/admin/manajemen-pegawai/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EditFormState } from "./types";
import { editProfileSchema } from "./validation";
import { createAdminClient } from "@/utils/supabase/admin";

type EditProfileValues = z.infer<typeof editProfileSchema>;

export async function updatePegawaiProfile(
  data: EditProfileValues
): Promise<EditFormState> {
  const validatedFields = editProfileSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Data yang dikirim tidak valid.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Error: Tidak terautentikasi" };
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminError || adminProfile?.role !== "admin") {
    return {
      success: false,
      message: "Error: Anda tidak punya izin untuk aksi ini.",
    };
  }

  const { id: pegawaiId, ...updateData } = validatedFields.data;

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", pegawaiId);

  if (updateError) {
    console.error("Supabase error (update profile):", updateError);
    return {
      success: false,
      message: `Error database: ${updateError.message}`,
    };
  }

  revalidatePath("/(dashboard)/admin/manajemen-pegawai");

  return {
    success: true,
    message: `Data pegawai berhasil diperbarui!`,
  };
}

const updatePasswordSchema = z.object({
  userId: z.string().uuid("ID Pegawai tidak valid"),
  passwordBaru: z.string().min(8, "Password baru minimal 8 karakter"),
});

export async function adminUpdateUserPassword(
  data: z.infer<typeof updatePasswordSchema>
): Promise<EditFormState> {
  const validatedFields = updatePasswordSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Data password tidak valid.",
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

  const supabaseAdmin = await createAdminClient();

  const { error: updateAuthError } =
    await supabaseAdmin.auth.admin.updateUserById(validatedFields.data.userId, {
      password: validatedFields.data.passwordBaru,
    });

  if (updateAuthError) {
    console.error(
      "Supabase Admin Error (updateUserById - password):",
      updateAuthError
    );
    return {
      success: false,
      message: `Gagal mengubah password: ${updateAuthError.message}`,
    };
  }

  return {
    success: true,
    message: "Password pengguna berhasil diubah!",
  };
}
