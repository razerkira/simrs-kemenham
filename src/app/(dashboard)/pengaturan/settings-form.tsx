"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Profile } from "@/types/database";
import { updateProfile, FormState } from "./actions";
import { profileSchema, ProfileFormValues } from "./validation";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsFormProps {
  profile: Profile;
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nama: profile.nama ?? "",
      nip: profile.nip ?? "",
      jabatan: profile.jabatan ?? "",
      pangkat_golongan: profile.pangkat_golongan ?? "",
      unit_kerja: profile.unit_kerja ?? "",
      jenis_kelamin: profile.jenis_kelamin?.toLowerCase() as
        | "pria"
        | "wanita"
        | undefined,
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    startTransition(async () => {
      const result = await updateProfile({ id: profile.id, ...data });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
        if (result.errors) {
          Object.keys(result.errors).forEach((key) => {
            const field = key as keyof ProfileFormValues;
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
        {" "}
        <CardTitle>Data Kepegawaian</CardTitle>{" "}
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
                    <Input
                      placeholder="Masukkan nama lengkap Anda"
                      {...field}
                    />
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
                    <Input placeholder="NIP Anda" {...field} />
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
                    <Input placeholder="Jabatan Anda" {...field} />
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
                    <Input placeholder="Pangkat Anda" {...field} />
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
                    <Input placeholder="Unit kerja Anda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jenis_kelamin"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Jenis Kelamin</FormLabel>

                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex space-x-4"
                    ref={field.ref}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="pria" />
                      </FormControl>
                      <FormLabel className="font-normal">Pria</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="wanita" />
                      </FormControl>
                      <FormLabel className="font-normal">Wanita</FormLabel>
                    </FormItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  {" "}
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...{" "}
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
