"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { returnRole } from "@/lib/utils";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Pencil, Trash, Plus } from "lucide-react";

import UserDialogAdd from "./user-dialog-add";
import UserDialogEdit from "./user-dialog-edit";
import { useAuthStore } from "@/store/auth";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: number;
  status_aktif: number;
  last_login: string;
}

interface PaginationResponse {
  current_page: number;
  last_page: number;
  total: number;
  data: User[];
}

export default function UserTable() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currentRole = user?.role ?? 0;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const fetchUsers = async (): Promise<PaginationResponse> => {
    const res = await api.get("/api/v1/users", { params: { page, search } });
    return res.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search],
    queryFn: fetchUsers,
    placeholderData: (prev) => prev,
  });

  const deleteUser = useMutation({
    mutationFn: async (id: number) => await api.delete(`/api/v1/users/${id}`),
    onSuccess: () => {
      toast.success("User berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Gagal menghapus user"),
  });

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4">
        <CardTitle>Daftar Pengguna</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="Cari nama / email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          {currentRole === 1 && (
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4 mr-1" /> Tambah
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              {isLoading
                ? "Memuat data..."
                : data?.data.length === 0
                ? "Tidak ada user ditemukan."
                : `Menampilkan ${data?.data.length} dari total ${data?.total} user.`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                {currentRole === 1 && (
                  <TableHead className="text-right">Aksi</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{returnRole(user.role)}</TableCell>
                  <TableCell>
                    {user.status_aktif ? "Aktif" : "Nonaktif"}
                  </TableCell>
                  <TableCell>{user.last_login || "-"}</TableCell>
                  {currentRole === 1 && (
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelected(user);
                          setOpenEdit(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Yakin ingin menghapus user ini?"))
                            deleteUser.mutate(user.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Halaman {data?.current_page} dari {data?.last_page}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={data?.current_page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={data?.current_page === data?.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>

      {/* Dialogs */}
      <UserDialogAdd open={openAdd} setOpen={setOpenAdd} />
      {selected && (
        <UserDialogEdit
          open={openEdit}
          setOpen={setOpenEdit}
          user={selected}
          clearSelected={() => setSelected(null)}
        />
      )}
    </Card>
  );
}
