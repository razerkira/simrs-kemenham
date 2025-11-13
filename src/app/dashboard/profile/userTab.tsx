"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { z } from "zod";
import { UserProfile } from "@/types/database";
import { userSchema } from "./validation/userSchema";

interface Props {
  user: UserProfile;
  updateStoreUser: (user: UserProfile) => void;
}

export default function UserTab({ user, updateStoreUser }: Props) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: async () => api.put("/api/v1/user/profile", form),
    onSuccess: (res: any) => {
      toast.success("User berhasil diperbarui");
      updateStoreUser({
        ...user,
        name: form.name,
        username: form.username,
        email: form.email,
      });
      setForm((prev) => ({ ...prev, password: "" }));
    },
    onError: () => toast.error("Gagal memperbarui user"),
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = userSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nama</Label>
        <Input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>
      <div>
        <Label>Username</Label>
        <Input
          value={form.username}
          onChange={(e) => handleChange("username", e.target.value)}
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>
      <div>
        <Label>Password</Label>
        <Input
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder="Kosongkan jika tidak diubah"
        />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        Update
      </Button>
    </form>
  );
}
