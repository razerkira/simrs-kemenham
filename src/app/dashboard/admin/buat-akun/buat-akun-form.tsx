"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createPegawaiAccount } from "./actions";
import { BuatAkunFormState } from "./types";
import { buatAkunSchema, BuatAkunFormValues } from "./validation";

import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function BuatAkunForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<BuatAkunFormValues>({
    resolver: zodResolver(buatAkunSchema),
    defaultValues: {
      nama: "",
      nip: "",
      jabatan: "",
      pangkat_golongan: "",
      unit_kerja: "",
      role: "pegawai",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: BuatAkunFormValues) => {
    startTransition(async () => {
      const result = await createPegawaiAccount(data);

      if (result.success) {
        toast.success(result.message);
        form.reset();
      } else {
        toast.error(result.message);
        if (result.errors) {
          Object.keys(result.errors).forEach((key) => {
            const field = key as keyof BuatAkunFormValues;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Pegawai Baru</CardTitle>
        <CardDescription>
          Password minimal 8 karakter. Akun akan langsung aktif.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap pegawai" {...field} />
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
                    <Input placeholder="NIP pegawai" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Pegawai</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contoh@kemenham.go.id"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Akun</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Minimal 8 karakter"
                      {...field}
                    />
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
                    <Input placeholder="Jabatan pegawai" {...field} />
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
                  <FormLabel>Pangkat (Gol/Ruang)</FormLabel>
                  <FormControl>
                    <Input placeholder="Pangkat/Golongan" {...field} />
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
                    <Input placeholder="Unit kerja pegawai" {...field} />
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
                  <FormLabel>Role Awal Pengguna</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role awal" />
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

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  {" "}
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Membuat
                  Akun...{" "}
                </>
              ) : (
                "Buat Akun Pegawai"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
