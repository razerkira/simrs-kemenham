// src/app/(dashboard)/pengajuan-dinas/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DinasFormState } from "./types";
import { z } from "zod";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const serverDinasSchema = z
  .object({
    deskripsi_kegiatan: z.string().min(10),

    tgl_mulai: z.preprocess((arg) => new Date(arg as string), z.date()),
    tgl_selesai: z.preprocess((arg) => new Date(arg as string), z.date()),

    dokumen: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size <= MAX_FILE_SIZE_BYTES)
      .refine((file) => !file || ALLOWED_MIME_TYPES.includes(file.type)),
  })
  .refine((data) => data.tgl_selesai > data.tgl_mulai);

export async function createPengajuanDinas(
  formData: FormData
): Promise<DinasFormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();
  if (!user) {
    return { success: false, message: "Error: Tidak terautentikasi" };
  }

  const rawData = {
    deskripsi_kegiatan: formData.get("deskripsi_kegiatan"),
    tgl_mulai: formData.get("tgl_mulai"),
    tgl_selesai: formData.get("tgl_selesai"),
    dokumen: formData.get("dokumen") as File | null,
  };

  const validatedFields = serverDinasSchema.safeParse(rawData);
  if (!validatedFields.success) {
    console.error("Server Validation Error:", validatedFields.error.flatten());
    return {
      success: false,
      message: "Validasi server gagal.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { dokumen, ...pengajuanData } = validatedFields.data;

  const { data: dinasData, error: dinasError } = await (
    await supabase
  )
    .from("pengajuan_dinas")
    .insert({
      user_id: user.id,
      deskripsi_kegiatan: pengajuanData.deskripsi_kegiatan,
      tgl_mulai: pengajuanData.tgl_mulai.toISOString(),
      tgl_selesai: pengajuanData.tgl_selesai.toISOString(),
      status: "menunggu_verifikasi",
    })
    .select("id")
    .single();

  if (dinasError) {
    console.error("Supabase error (dinas):", dinasError);
    return { success: false, message: `Error database: ${dinasError.message}` };
  }

  const pengajuanDinasId = dinasData.id;

  if (dokumen && dokumen.size > 0) {
    const fileExt = dokumen.name.split(".").pop();
    const filePath = `${user.id}/dinas-${pengajuanDinasId}.${fileExt}`;

    const { error: storageError } = await (await supabase).storage
      .from("dokumen_pengajuan")
      .upload(filePath, dokumen);

    if (storageError) {
      console.error("Supabase error (storage):", storageError);
      return {
        success: false,
        message: `Gagal meng-upload file: ${storageError.message}`,
      };
    }

    const { error: docError } = await (await supabase)
      .from("dokumen_pendukung")
      .insert({
        pengajuan_dinas_id: pengajuanDinasId,
        pengajuan_cuti_id: null,
        nama_file: dokumen.name,
        storage_path: filePath,
        tipe_file: dokumen.type,
      });

    if (docError) {
      console.error("Supabase error (dokumen):", docError);
      return {
        success: false,
        message: `Gagal mencatat dokumen: ${docError.message}`,
      };
    }
  }

  revalidatePath("/(dashboard)/status-pengajuan");
  revalidatePath("/(dashboard)", "layout");
  redirect("/status-pengajuan");
}
