"use client"

// --- TAMBAHAN BARU ---
import { useState, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from "sonner"

import { Profile, UserRole } from '@/types/database'
// --- IMPOR ACTION BARU ---
import { updatePegawaiProfile, adminUpdateUserPassword} from './actions' 
import { EditFormState } from './types';
import { editProfileSchema } from './validation' // Skema ini sudah punya 'passwordBaru' opsional

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator" // Untuk garis pemisah

// Tipe data form berdasarkan skema Zod (termasuk passwordBaru opsional)
type EditProfileFormValues = z.infer<typeof editProfileSchema>

interface DialogEditPegawaiProps {
  pegawai: Profile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DialogEditPegawai({ 
  pegawai, 
  open, 
  onOpenChange 
}: DialogEditPegawaiProps) {
  
  // State untuk loading update profil
  const [isProfilePending, startProfileTransition] = useTransition() 
  // State untuk loading update password
  const [isPasswordPending, startPasswordTransition] = useTransition() 

  // Setup React Hook Form
  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema.omit({ id: true })), // Omit ID
    // Default values akan diisi ulang
  })

  // Efek untuk mengisi ulang form
  useEffect(() => {
    if (pegawai) {
      form.reset({
        nama: pegawai.nama ?? "",
        nip: pegawai.nip ?? "",
        jabatan: pegawai.jabatan ?? "",
        pangkat_golongan: pegawai.pangkat_golongan ?? "",
        unit_kerja: pegawai.unit_kerja ?? "",
        role: pegawai.role ?? 'pegawai',
        passwordBaru: "", // Selalu kosongkan field password saat dialog dibuka
      });
    }
  }, [pegawai, form.reset]);

  // Fungsi Submit untuk UPDATE PROFIL
  const onProfileSubmit = (data: Omit<EditProfileFormValues, 'id' | 'passwordBaru'>) => {
    if (!pegawai) return;

    startProfileTransition(async () => {
      const result = await updatePegawaiProfile({
        id: pegawai.id,
        ...data // Hanya kirim data profil, BUKAN password
      })

      if (result.success) {
        toast.success(result.message)
        onOpenChange(false) // Tutup dialog
      } else {
        toast.error(result.message)
        if (result.errors) {
          Object.keys(result.errors).forEach((key) => {
            const field = key as keyof EditProfileFormValues
            const messages = result.errors?.[field]
            if (messages) {
              form.setError(field, { type: 'server', message: messages.join(', ') })
            }
          })
        }
      }
    })
  }

  // --- FUNGSI BARU UNTUK UBAH PASSWORD ---
  const handlePasswordChange = () => {
    if (!pegawai) return;

    // Ambil nilai password baru dari form
    const newPassword = form.getValues('passwordBaru');

    // Validasi client-side sederhana
    if (!newPassword || newPassword.length < 8) {
      form.setError('passwordBaru', { 
        type: 'manual', 
        message: 'Password baru minimal 8 karakter.' 
      });
      return; // Hentikan jika tidak valid
    } else {
      // Hapus error jika sudah valid
      form.clearErrors('passwordBaru'); 
    }

    startPasswordTransition(async () => {
      // Panggil server action khusus password
      const result = await adminUpdateUserPassword({
        userId: pegawai.id,
        passwordBaru: newPassword,
      });

      if (result.success) {
        toast.success(result.message);
        // Kosongkan field password setelah berhasil
        form.setValue('passwordBaru', ''); 
      } else {
        toast.error(result.message);
        // Mungkin ada error spesifik dari action (misal: Supabase error)
        if (result.errors?.passwordBaru) {
           form.setError('passwordBaru', { type: 'server', message: result.errors.passwordBaru.join(', ') });
        }
      }
    });
  };
  // --- SELESAI FUNGSI BARU ---

  if (!pegawai) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Tambahkan overflow-hidden agar scroll hanya di content */}
      <DialogContent className="max-w-lg overflow-hidden"> 
        <DialogHeader>
          <DialogTitle>Edit Data Pegawai</DialogTitle>
          <DialogDescription>
            Perbarui informasi profil dan role. Ubah password hanya jika diperlukan.
          </DialogDescription>
        </DialogHeader>
        
        {/* Konten Form Edit (buat bisa di-scroll) */}
        <div className="py-4 max-h-[70vh] overflow-y-auto pr-6 pl-1"> 
          <Form {...form}>
            {/* Kita pakai form biasa, submit dikontrol manual */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              
              {/* Info Profil */}
              <h3 className="text-sm font-semibold text-muted-foreground">Informasi Profil</h3>
              <div className="space-y-4 rounded-md border p-4">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input value={pegawai.email ?? 'N/A'} disabled />
                </div>
                {/* Field Nama, NIP, Jabatan, Pangkat, Unit Kerja (Sama seperti sebelumnya) */}
                <FormField control={form.control} name="nama" render={({ field }) => ( <FormItem><FormLabel>Nama</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="nip" render={({ field }) => ( <FormItem><FormLabel>NIP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="jabatan" render={({ field }) => ( <FormItem><FormLabel>Jabatan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="pangkat_golongan" render={({ field }) => ( <FormItem><FormLabel>Pangkat</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="unit_kerja" render={({ field }) => ( <FormItem><FormLabel>Unit Kerja</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="role" render={({ field }) => ( <FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="pegawai">Pegawai</SelectItem><SelectItem value="verificator">Verificator</SelectItem><SelectItem value="supervisor">Supervisor</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
              </div>
              
              <Separator /> 

              {/* --- BAGIAN BARU: Ubah Password --- */}
              <h3 className="text-sm font-semibold text-muted-foreground">Ubah Password (Opsional)</h3>
              <div className="space-y-4 rounded-md border p-4">
                <FormField
                  control={form.control}
                  name="passwordBaru"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Baru</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Isi hanya jika ingin mengubah" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="button" // Penting: type="button" agar tidak submit form utama
                  variant="outline" 
                  onClick={handlePasswordChange} // Panggil handler password
                  disabled={isPasswordPending || isProfilePending} // Disable saat loading
                  className="w-full"
                >
                  {isPasswordPending ? "Mengubah..." : "Ubah Password"}
                </Button>
              </div>
              {/* --- SELESAI BAGIAN BARU --- */}
              
            </form>
          </Form>
        </div>

        <DialogFooter className="gap-2 pt-4 sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost" disabled={isProfilePending || isPasswordPending}>Batal</Button>
          </DialogClose>
          {/* Tombol Simpan Perubahan PROFIL */}
          <Button 
            onClick={form.handleSubmit(onProfileSubmit)} // Panggil handler profil
            disabled={isProfilePending || isPasswordPending} // Disable saat loading
          >
            {isProfilePending ? "Menyimpan..." : "Simpan Perubahan Profil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}