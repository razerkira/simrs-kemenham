"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import UserTab from "./userTab";
import PegawaiTab from "./pegawaiTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyProfilePage() {
  const [activeTab, setActiveTab] = useState("user");
  const {
    user: authUser,
    token: authToken,
    login: updateStoreUser,
  } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/api/v1/user/me");
      return res.data.user;
    },
  });

  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profil Saya</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">Detail Profil</h1>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger className="cursor-pointer" value="user">
                User
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="pegawai">
                Pegawai
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <UserTab
                user={data}
                updateStoreUser={(userData) =>
                  updateStoreUser(userData, authToken || "")
                }
              />
            </TabsContent>

            <TabsContent value="pegawai">
              <PegawaiTab pegawai={data.pegawai ?? null} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
