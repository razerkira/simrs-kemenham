"use client"

import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from "sonner"

import { Profile, UserRole } from '@/types/database'
import { updatePegawaiProfile, adminUpdateUserPassword} from './actions'
import { EditFormState } from './types'
import { editProfileSchema } from './validation' // Import the FULL schema

// --- DEFINE FORM TYPE BASED ON OMITTED SCHEMA ---
const formSchema = editProfileSchema.omit({ id: true }); // Create the schema without ID
type EditProfileFormValues = z.infer<typeof formSchema>; // Infer type from the omitted schema
// --- END TYPE DEFINITION ---


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
  Form, // Keep Form for context
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
import { Separator } from "@/components/ui/separator"
import { Loader2 } from 'lucide-react'


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

  const [isProfilePending, startProfileTransition] = useTransition()
  const [isPasswordPending, startPasswordTransition] = useTransition()

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(formSchema), // Use the omitted schema
    // Default values set by useEffect
  })

  // Effect to reset form when 'pegawai' prop changes
  useEffect(() => {
    if (pegawai) {
      form.reset({
        nama: pegawai.nama ?? "",
        nip: pegawai.nip ?? "",
        jabatan: pegawai.jabatan ?? "",
        pangkat_golongan: pegawai.pangkat_golongan ?? "",
        unit_kerja: pegawai.unit_kerja ?? "",
        role: pegawai.role ?? 'pegawai',
        passwordBaru: "", // Always clear password field
      });
    }
  }, [pegawai, form.reset]);

  // Submit handler for PROFILE changes
  const onProfileSubmit = (data: EditProfileFormValues) => {
    if (!pegawai) return;

    // Exclude passwordBaru when submitting profile data
    const { passwordBaru, ...profileData } = data;

    startProfileTransition(async () => {
      const result = await updatePegawaiProfile({
        id: pegawai.id, // Include the ID here
        ...profileData // Send only profile data
      });

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false); // Close dialog on success
      } else {
        toast.error(result.message);
        // --- ERROR HANDLING FOR PROFILE SUBMIT ---
        if (result.errors) {
          Object.keys(result.errors).forEach((key) => {
            const field = key as keyof EditProfileFormValues; // Use correct type
            const messages = result.errors?.[field];
            if (messages) {
              form.setError(field, { type: 'server', message: messages.join(', ') });
            }
          });
        }
        // --- END ERROR HANDLING ---
      }
    });
  }

  // Submit handler for PASSWORD change
  const handlePasswordChange = () => {
    if (!pegawai) return;

    const newPassword = form.getValues('passwordBaru');

    // Client-side validation
    if (!newPassword || newPassword.length < 8) {
      form.setError('passwordBaru', {
        type: 'manual',
        message: 'Password baru minimal 8 karakter.'
      });
      return;
    } else {
      form.clearErrors('passwordBaru');
    }

    startPasswordTransition(async () => {
      const result = await adminUpdateUserPassword({
        userId: pegawai.id,
        passwordBaru: newPassword,
      });

      if (result.success) {
        toast.success(result.message);
        form.setValue('passwordBaru', ''); // Clear field on success
      } else {
        toast.error(result.message);
        if (result.errors?.passwordBaru) {
           form.setError('passwordBaru', { type: 'server', message: result.errors.passwordBaru.join(', ') });
        }
      }
    });
  };

  if (!pegawai) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Data Pegawai</DialogTitle>
          <DialogDescription>
            Perbarui informasi profil dan role. Ubah password hanya jika diperlukan.
          </DialogDescription>
        </DialogHeader>

        {/* Use the <Form> wrapper to provide context */}
        <Form {...form}>
          {/* Form tag doesn't need its own onSubmit here */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-6 pl-1">

            {/* Info Profil */}
            <h3 className="text-sm font-semibold text-muted-foreground">Informasi Profil</h3>
            <div className="space-y-4 rounded-md border p-4">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={pegawai.email ?? 'N/A'} disabled />
              </div>
              {/* Profile Fields using FormField */}
              <FormField control={form.control} name="nama" render={({ field }) => ( <FormItem><FormLabel>Nama</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="nip" render={({ field }) => ( <FormItem><FormLabel>NIP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="jabatan" render={({ field }) => ( <FormItem><FormLabel>Jabatan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="pangkat_golongan" render={({ field }) => ( <FormItem><FormLabel>Pangkat</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="unit_kerja" render={({ field }) => ( <FormItem><FormLabel>Unit Kerja</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="role" render={({ field }) => ( <FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="pegawai">Pegawai</SelectItem><SelectItem value="verificator">Verificator</SelectItem><SelectItem value="supervisor">Supervisor</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
            </div>

            <Separator />

            {/* Ubah Password Section */}
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
                type="button"
                variant="outline"
                onClick={handlePasswordChange}
                disabled={isPasswordPending || isProfilePending}
                className="w-full"
              >
                {isPasswordPending ? "Mengubah..." : "Ubah Password"}
              </Button>
            </div>
          </form>
        </Form> {/* End <Form> wrapper */}

        <DialogFooter className="gap-2 pt-4 sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost" disabled={isProfilePending || isPasswordPending}>Batal</Button>
          </DialogClose>
          {/* Trigger profile submit using form.handleSubmit */}
          <Button
            onClick={form.handleSubmit(onProfileSubmit)}
            disabled={isProfilePending || isPasswordPending}
          >
            {isProfilePending ? "Menyimpan..." : "Simpan Perubahan Profil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}