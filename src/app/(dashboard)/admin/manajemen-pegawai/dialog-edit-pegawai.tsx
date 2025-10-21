// src/app/(dashboard)/admin/manajemen-pegawai/dialog-edit-pegawai.tsx
"use client"

import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from "sonner"

import { Profile, UserRole } from '@/types/database'
import { updatePegawaiProfile, adminUpdateUserPassword, EditFormState } from './actions'
// Import the FULL schema
import { editProfileSchema } from './validation'

// --- DEFINE FORM TYPE BASED ON OMITTED SCHEMA ---
const formSchema = editProfileSchema.omit({ id: true }); // Create the schema without ID
type EditProfileFormValues = z.infer<typeof formSchema>; // Infer type from the omitted schema
// --- END TYPE DEFINITION ---


import { Button } from "@/components/ui/button"
// ... other imports ...
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

  // Use the locally defined EditProfileFormValues
  const form = useForm<EditProfileFormValues>({
    // Use the omitted schema directly in the resolver
    resolver: zodResolver(formSchema),
    // Default values remain the same
  })

  // ... rest of the component (useEffect, onProfileSubmit, handlePasswordChange, return statement) ...
  // Make sure the rest of the component uses 'EditProfileFormValues' where needed

  // Example: Inside onProfileSubmit
  const onProfileSubmit = (data: EditProfileFormValues) => { // Type 'data' correctly
     if (!pegawai) return;
     // ... rest of submit logic
  }

  // Example: Inside error handling
  if (result.errors) {
    Object.keys(result.errors).forEach((key) => {
      // Ensure 'field' is correctly typed based on EditProfileFormValues
      const field = key as keyof EditProfileFormValues;
      // ... rest of error logic
    });
  }

  // ... rest of the component ...

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
          {/* ... Dialog Content ... */}
          {/* Ensure all FormFields use names present in EditProfileFormValues */}
          {/* e.g., <FormField control={form.control} name="nama" ... /> */}
          {/* ... Dialog Footer ... */}
      </Dialog>
  );

}