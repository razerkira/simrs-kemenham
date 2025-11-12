"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Pegawai, Profile, UserProfile, UserRole } from "@/types/database";
import { updatePegawaiProfile, adminUpdateUserPassword } from "./actions";
import { EditFormState } from "./types";
import { editProfileSchema } from "./validation";

const formSchema = editProfileSchema.omit({ id: true });
type EditProfileFormValues = z.infer<typeof formSchema>;

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { returnRole } from "@/lib/utils";

interface DialogEditPegawaiProps {
  pegawai: UserProfile | Profile | Pegawai | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DialogEditPegawai({
  pegawai,
  open,
  onOpenChange,
}: DialogEditPegawaiProps) {
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (pegawai) {
      let initialRole: UserRole;
  
      if (pegawai.role !== null && typeof pegawai.role === 'number') {
        // Jika tipe data adalah NUMBER (dari UserProfile)
        initialRole = returnRole(pegawai.role);
      } else if (pegawai.role !== null && typeof pegawai.role === 'string') {
        // Jika tipe data adalah STRING (dari Profile)
        initialRole = pegawai.role;
      } else {
        // Jika null atau undefined
        initialRole = "pegawai";
      }
  
      form.reset({
        nama: pegawai.name ?? "",
        nip: pegawai.nip ?? "",
        jabatan: pegawai.jabatan ?? "",
        pangkat_golongan: pegawai.pangkat_golongan ?? "",
        unit_kerja: pegawai.unit_kerja ?? "",
        // Gunakan initialRole yang sudah dikonversi atau dipastikan tipenya
        role: initialRole, 
        passwordBaru: "",
      });
    }
  }, [pegawai, form.reset]);


  const onProfileSubmit = (data: EditProfileFormValues) => {
    if (!pegawai) return;

    const { passwordBaru, ...profileData } = data;

    startProfileTransition(async () => {
      const result = await updatePegawaiProfile({
        id: pegawai.id.toString(),
        ...profileData,
      });

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);

        if (result.errors) {
          Object.keys(result.errors).forEach((key) => {
            const field = key as keyof EditProfileFormValues;
            const messages = result.errors?.[field];
            if (messages) {
              form.setError(field, {
                type: "server",
                message: messages.join(", "),
              });
            }
          });
        }
      }
    });
  };

  const handlePasswordChange = () => {
    if (!pegawai) return;

    const newPassword = form.getValues("passwordBaru");

    if (!newPassword || newPassword.length < 8) {
      form.setError("passwordBaru", {
        type: "manual",
        message: "Password baru minimal 8 karakter.",
      });
      return;
    } else {
      form.clearErrors("passwordBaru");
    }

    startPasswordTransition(async () => {
      const result = await adminUpdateUserPassword({
        userId: pegawai.id.toString(),
        passwordBaru: newPassword,
      });

      if (result.success) {
        toast.success(result.message);
        form.setValue("passwordBaru", "");
      } else {
        toast.error(result.message);
        if (result.errors?.passwordBaru) {
          form.setError("passwordBaru", {
            type: "server",
            message: result.errors.passwordBaru.join(", "),
          });
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
            Perbarui informasi profil dan role. Ubah password hanya jika
            diperlukan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-6 pl-1"
          >
            <h3 className="text-sm font-semibold text-muted-foreground">
              Informasi Profil
            </h3>
            <div className="space-y-4 rounded-md border p-4">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={pegawai.email ?? "N/A"} disabled />
              </div>

              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIP</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jabatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pangkat_golongan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pangkat</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit_kerja"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Kerja</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pegawai">Pegawai</SelectItem>
                        <SelectItem value="verificator">Verificator</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <h3 className="text-sm font-semibold text-muted-foreground">
              Ubah Password (Opsional)
            </h3>
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
        </Form>

        <DialogFooter className="gap-2 pt-4 sm:justify-between">
          <DialogClose asChild>
            <Button
              variant="ghost"
              disabled={isProfilePending || isPasswordPending}
            >
              Batal
            </Button>
          </DialogClose>

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
