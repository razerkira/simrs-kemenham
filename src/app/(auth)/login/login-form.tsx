"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.get("https://simrs.idxpert.id/sanctum/csrf-cookie");

      const res = await api.post("/api/v1/auth/login", { username, password });
      login(res.data.user, res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 p-8 space-y-6"
    >
      {/* Username Field */}
      <div className="space-y-1">
        <Label htmlFor="username" className="text-sm text-stone-700">
          Username
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3.5 text-stone-400 w-5 h-5" />
          <Input
            id="username"
            placeholder="Masukkan username Anda"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-stone-50 focus-visible:ring-stone-400 focus-visible:ring-2 transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <Label htmlFor="password" className="text-sm text-stone-700">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-stone-400 w-5 h-5" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan password Anda"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-11 rounded-xl bg-stone-50 focus-visible:ring-stone-400 focus-visible:ring-2 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl text-white text-base font-medium transition-all cursor-pointer"
      >
        {loading ? "Memproses..." : "Masuk"}
      </Button>

      {/* Footer */}
      <p className="text-center text-sm text-stone-500 mt-4">
        © {new Date().getFullYear()} SIMRS KEMENHAM
      </p>
    </form>
  );
}
