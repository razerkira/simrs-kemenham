"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import ManajemenPegawaiTable from "./manajemen-pegawai-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import PegawaiTable from "./pegawai-table";

interface PegawaiResponse {
  current_page: number;
  data: any[];
  last_page: number;
  total: number;
}

export default function ManajemenPegawaiPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  if (user?.role !== 1) {
    redirect("/");
  }

  const fetchPegawai = async (): Promise<PegawaiResponse> => {
    const res = await api.get(`/api/v1/pegawai`, {
      params: { page, search },
    });
    return res.data;
  };

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["pegawai", page, search],
    queryFn: fetchPegawai,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    refetch();
  }, [page, search]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Data Pegawai</h1>
          <p className="text-gray-600">
            Kelola data profil, akun, dan role untuk seluruh pegawai Kemenham.
          </p>
        </div>
      </div>

      {/* <ManajemenPegawaiTable
        dataPegawai={data?.data ?? []}
        loading={isLoading}
        pagination={{
          currentPage: data?.current_page ?? 1,
          lastPage: data?.last_page ?? 1,
          total: data?.total ?? 0,
          onPageChange: (p) => setPage(p),
        }}
      /> */}

      <PegawaiTable />
    </div>
  );
}
