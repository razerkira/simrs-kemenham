// src/app/(dashboard)/pengajuan-cuti/cuti-form.tsx

"use client"

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { cutiSchema } from './validation'
import { createPengajuanCuti } from './actions'
import { CutiFormState } from './types' // Impor tipe dari file baru

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input" // Kita butuh input untuk file
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Tipe data form berdasarkan skema Zod
type CutiFormValues = z.infer<typeof cutiSchema>

export default function CutiForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm<CutiFormValues>({
    resolver: zodResolver(cutiSchema),
  })

  // --- FUNGSI SUBMIT (BERUBAH TOTAL) ---
  const onSubmit = (data: CutiFormValues) => {
    // 1. Buat objek FormData
    const formData = new FormData();
    
    // 2. Tambahkan semua data ke FormData
    formData.append('jenis_cuti', data.jenis_cuti);
    formData.append('tgl_mulai', data.tgl_mulai.toISOString());
    formData.append('tgl_selesai', data.tgl_selesai.toISOString());
    
    // 3. Tambahkan file HANYA jika ada (file-nya opsional)
    if (data.dokumen) {
      formData.append('dokumen', data.dokumen);
    }
    
    // 4. Panggil server action dengan FormData
    startTransition(async () => {
      // Kirim FormData ke Server Action
      const result = await createPengajuanCuti(formData) as CutiFormState;

      if (result && !result.success) {
        toast.error(result.message)
        if (result.errors) {
          Object.keys(result.errors).forEach((key) => {
            const field = key as keyof CutiFormValues
            const messages = result.errors?.[field]
            if (messages) {
              form.setError(field, { type: 'server', message: messages.join(', ') })
            }
          })
        }
      }
      // Jika sukses, server action akan me-redirect
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Pengajuan</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {/* Form sekarang memanggil onSubmit dari react-hook-form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Field: Jenis Cuti (Textarea) - (Tidak berubah) */}
            <FormField
              control={form.control}
              name="jenis_cuti"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Cuti / Alasan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Cuti Tahunan, Cuti Sakit..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tuliskan jenis cuti beserta alasan singkat jika diperlukan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field: Tanggal Mulai (Kalender) - (Tidak berubah) */}
            <FormField
              control={form.control}
              name="tgl_mulai"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Mulai Cuti</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: localeID })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field: Tanggal Selesai (Kalender) - (Tidak berubah) */}
            <FormField
              control={form.control}
              name="tgl_selesai"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Selesai Cuti</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: localeID })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- FIELD BARU: Upload Dokumen --- */}
            <FormField
              control={form.control}
              name="dokumen"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel>Dokumen Pendukung (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      // Kita perlu handler custom untuk 'onChange'
                      // untuk mendapatkan 'File' object, bukan 'FileList'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file); // Kirim File object ke react-hook-form
                      }}
                      onBlur={onBlur}
                      name={name}
                      ref={ref}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload file .pdf, .doc, .docx, .jpg, atau .png. Maks 5MB.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* --- SELESAI FIELD BARU --- */}

            <Button type="submit" disabled={isPending}>
              {isPending ? "Mengajukan..." : "Ajukan Cuti"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}