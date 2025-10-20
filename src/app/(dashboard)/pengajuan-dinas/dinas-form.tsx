// src/app/(dashboard)/pengajuan-dinas/dinas-form.tsx

"use client"

import { useState, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { dinasSchema } from './validation' // Skema client-side (sudah ada 'dokumen')
import { createPengajuanDinas } from './actions'
import { DinasFormState } from './types' // Tipe state dari file baru

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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Tipe data form berdasarkan skema Zod
type DinasFormValues = z.infer<typeof dinasSchema>

// Helper function (tidak berubah)
function combineDateTime(date: Date | undefined, time: string): Date | null {
  if (!date || !time) return null
  const [hours, minutes] = time.split(':').map(Number)
  const newDate = new Date(date)
  newDate.setHours(hours, minutes, 0, 0) 
  return newDate
}

export default function DinasForm() {
  const [isPending, startTransition] = useTransition()

  // Setup React Hook Form (tidak berubah)
  const form = useForm<DinasFormValues>({
    resolver: zodResolver(dinasSchema),
  })

  // State "Intermediate" (tidak berubah)
  const [mulaiDate, setMulaiDate] = useState<Date | undefined>()
  const [mulaiTime, setMulaiTime] = useState<string>("")
  const [selesaiDate, setSelesaiDate] = useState<Date | undefined>()
  const [selesaiTime, setSelesaiTime] = useState<string>("")

  // Efek untuk menggabungkan Tanggal & Jam Mulai (tidak berubah)
  useEffect(() => {
    const combinedDate = combineDateTime(mulaiDate, mulaiTime)
    if (combinedDate) {
      form.setValue('tgl_mulai', combinedDate, { shouldValidate: true })
    }
  }, [mulaiDate, mulaiTime, form.setValue])

  // Efek untuk menggabungkan Tanggal & Jam Selesai (tidak berubah)
  useEffect(() => {
    const combinedDate = combineDateTime(selesaiDate, selesaiTime)
    if (combinedDate) {
      form.setValue('tgl_selesai', combinedDate, { shouldValidate: true })
    }
  }, [selesaiDate, selesaiTime, form.setValue])

  // --- FUNGSI SUBMIT (BERUBAH TOTAL) ---
  // Mirip dengan form cuti, kita ubah 'data' menjadi 'FormData'
  const onSubmit = (data: DinasFormValues) => {
    
    // 1. Buat objek FormData
    const formData = new FormData();
    
    // 2. Tambahkan semua data ke FormData
    formData.append('deskripsi_kegiatan', data.deskripsi_kegiatan);
    // 'data.tgl_mulai' dan 'data.tgl_selesai' sudah
    // menjadi objek Date yang valid berkat 'useEffect' di atas
    formData.append('tgl_mulai', data.tgl_mulai.toISOString());
    formData.append('tgl_selesai', data.tgl_selesai.toISOString());
    
    // 3. Tambahkan file HANYA jika ada (file-nya opsional)
    if (data.dokumen) {
      formData.append('dokumen', data.dokumen);
    }

    // 4. Panggil server action dengan FormData
    startTransition(async () => {
      const result = await createPengajuanDinas(formData) as DinasFormState;

      if (result && !result.success) {
        toast.error(result.message)
        if (result.errors) {
          Object.keys(result.errors).forEach((key) => {
            const field = key as keyof DinasFormValues
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
  // --- SELESAI PERUBAHAN FUNGSI SUBMIT ---

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Kegiatan</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {/* Form sekarang memanggil onSubmit dari react-hook-form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Field: Deskripsi Kegiatan (Tidak berubah) */}
            <FormField
              control={form.control}
              name="deskripsi_kegiatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Kegiatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Menghadiri rapat koordinasi teknis..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field Kustom: Tanggal & Jam Mulai (Tidak berubah) */}
            <FormItem className="flex flex-col">
              <FormLabel>Waktu Mulai Dinas</FormLabel>
              <div className="flex gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("flex-1 pl-3 text-left font-normal", !mulaiDate && "text-muted-foreground")}>
                        {mulaiDate ? format(mulaiDate, "PPP", { locale: localeID }) : (<span>Pilih tanggal</span>)}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={mulaiDate} onSelect={setMulaiDate} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormControl>
                  <Input type="time" value={mulaiTime} onChange={(e) => setMulaiTime(e.target.value)} className="w-[120px]" />
                </FormControl>
              </div>
              {form.formState.errors.tgl_mulai && (
                <FormMessage>{form.formState.errors.tgl_mulai.message}</FormMessage>
              )}
            </FormItem>

            {/* Field Kustom: Tanggal & Jam Selesai (Tidak berubah) */}
            <FormItem className="flex flex-col">
              <FormLabel>Waktu Selesai Dinas</FormLabel>
              <div className="flex gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("flex-1 pl-3 text-left font-normal", !selesaiDate && "text-muted-foreground")}>
                        {selesaiDate ? format(selesaiDate, "PPP", { locale: localeID }) : (<span>Pilih tanggal</span>)}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={selesaiDate} onSelect={setSelesaiDate} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormControl>
                  <Input type="time" value={selesaiTime} onChange={(e) => setSelesaiTime(e.target.value)} className="w-[120px]" />
                </FormControl>
              </div>
              {form.formState.errors.tgl_selesai && (
                <FormMessage>{form.formState.errors.tgl_selesai.message}</FormMessage>
              )}
            </FormItem>
            
            {/* --- FIELD BARU: Upload Dokumen --- */}
            {/* Kita copy-paste dari form cuti */}
            <FormField
              control={form.control}
              name="dokumen"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel>Dokumen Pendukung (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
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
              {isPending ? "Mengajukan..." : "Ajukan Dinas"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}