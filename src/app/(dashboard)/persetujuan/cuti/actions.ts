// src/app/(dashboard)/persetujuan/cuti/actions.ts

"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PersetujuanFormState } from "./types";

const persetujuanSchema = z.object({
  pengajuanId: z.string().uuid("ID pengajuan tidak valid"),
  catatan: z.string().optional(),
  aksi: z.enum(["setuju", "tolak"]),
});

export async function prosesPersetujuanCuti(
  data: z.infer<typeof persetujuanSchema>
): Promise<PersetujuanFormState> {
  const validatedFields = persetujuanSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Data yang dikirim tidak valid.",
    };
  }

  const { pengajuanId, catatan, aksi } = validatedFields.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Error: Tidak terautentikasi" };
  }

  const statusBaru = aksi === "setuju" ? "disetujui" : "ditolak_supervisor";

  const { error } = await supabase
    .from("pengajuan_cuti")
    .update({
      status: statusBaru,
      catatan_supervisor: catatan,
      supervisor_id: user.id,
    })
    .eq("id", pengajuanId)
    .eq("status", "menunggu_persetujuan");

  if (error) {
    console.error("Supabase error (persetujuan cuti):", error);
    return { success: false, message: `Error database: ${error.message}` };
  }

  revalidatePath("/(dashboard)/persetujuan/cuti");

  revalidatePath("/(dashboard)/status-pengajuan");

  return {
    success: true,
    message: `Pengajuan berhasil di-${
      aksi === "setuju" ? "setujui" : "tolak"
    }!`,
  };
}
