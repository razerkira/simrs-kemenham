"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";

// Dummy Data
const notifications = [
  {
    id: 1,
    title: "Pengajuan Cuti Disetujui",
    message: "Cuti Anda disetujui oleh Kasubag TU.",
    is_read: false,
    created_at: "2025-01-10 10:22",
  },
  {
    id: 2,
    title: "Pengajuan Dinas Baru",
    message: "Anda memiliki pengajuan dinas yang belum diverifikasi.",
    is_read: true,
    created_at: "2025-01-09 14:11",
  },
];

export default function NotificationPopover() {
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative cursor-pointer">
          <Bell className="w-6 h-6" />

          {unreadCount > 0 && (
            <span
              className="
              absolute -top-1 -right-1 
              bg-red-500 text-white 
              text-xs w-4 h-4 
              flex items-center justify-center 
              rounded-full
            "
            >
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 bg-white">
        <div className="p-3 border-b flex items-center justify-between">
          <h4 className="font-semibold">Notifikasi</h4>
          <Button variant="ghost" size="sm">
            Tandai semua dibaca
          </Button>
        </div>

        <ScrollArea className="h-72">
          <div className="divide-y">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                className={`w-full text-left p-3 hover:bg-gray-50 transition ${
                  notif.is_read ? "opacity-60" : ""
                }`}
              >
                <div className="font-medium">{notif.title}</div>
                <div className="text-sm text-gray-500">{notif.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {notif.created_at}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
