import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, { message: "Nama wajib diisi" }),
  username: z.string().min(1, { message: "Username wajib diisi" }),
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().optional(),
});
