"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  jenis: "cuti" | "dinas";
  nama?: string; // untuk cuti
  participants?: { nama: string }[]; // untuk dinas
  alasan?: string;
  kegiatan?: string;
  tipe?: "Full" | "Half";
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  status: "approved" | "rejected" | "pending";
}

interface CalendarProps {
  submissions: Submission[];
}

const Calendar: React.FC<CalendarProps> = ({ submissions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
    };
  };

  const getSubmissionsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return submissions.filter(
      (s) => dateStr >= s.tanggalMulai && dateStr <= s.tanggalSelesai
    );
  };

  const getStatusInfo = (status: Submission["status"]) => {
    switch (status) {
      case "approved":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: "Disetujui",
          color: "text-green-500",
        };
      case "rejected":
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          text: "Ditolak",
          color: "text-red-500",
        };
      default:
        return {
          icon: <Clock className="h-4 w-4 text-yellow-500" />,
          text: "Menunggu",
          color: "text-yellow-500",
        };
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Nama hari */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-gray-600 py-2 text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Kalender */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const daySubs = getSubmissionsForDate(day);
          const hasSubs = daySubs.length > 0;
          const isToday =
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
          const approvedCuti = daySubs.filter(
            (s) => s.status === "approved" && s.jenis === "cuti"
          ).length;
          const approvedDinas = daySubs.filter(
            (s) => s.status === "approved" && s.jenis === "dinas"
          ).length;

          return (
            <Popover.Root key={day}>
              <Popover.Trigger asChild disabled={!hasSubs}>
                <div
                  className={cn(
                    "aspect-square border rounded-lg p-2 flex flex-col transition-colors",
                    hasSubs
                      ? "bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100"
                      : "border-gray-200",
                    isToday && "bg-primary/10 border-primary"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-medium text-gray-900",
                      isToday && "text-primary font-bold"
                    )}
                  >
                    {day}
                  </div>
                  <div className="mt-1 flex flex-col gap-1 text-xs">
                    {approvedCuti > 0 && (
                      <div className="text-blue-600 bg-blue-100 px-1 rounded">
                        {approvedCuti} cuti
                      </div>
                    )}
                    {approvedDinas > 0 && (
                      <div className="text-green-600 bg-green-100 px-1 rounded">
                        {approvedDinas} dinas
                      </div>
                    )}
                  </div>
                </div>
              </Popover.Trigger>

              {hasSubs && (
                <Popover.Content className="min-w-80 bg-white p-6">
                  <div className="space-y-4">
                    <h4 className="font-medium leading-none">
                      Detail Tanggal {day}
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {daySubs.map((sub) => {
                        const statusInfo = getStatusInfo(sub.status);
                        const isCuti = sub.jenis === "cuti";
                        const names = isCuti
                          ? [sub.nama]
                          : sub.participants?.map((p) => p.nama) || [];
                        return (
                          <div
                            key={sub.id}
                            className="p-3 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                {isCuti ? (
                                  <User className="h-4 w-4 mr-2 text-blue-500" />
                                ) : (
                                  <Users className="h-4 w-4 mr-2 text-green-500" />
                                )}
                                <span className="font-semibold text-sm capitalize">
                                  {sub.jenis}
                                </span>
                              </div>
                              <div
                                className={`flex items-center text-xs font-medium ${statusInfo.color}`}
                              >
                                {statusInfo.icon}
                                <span className="ml-1">{statusInfo.text}</span>
                              </div>
                            </div>
                            <div className="space-y-1 mb-2">
                              {names.map((n, i) => (
                                <p key={i} className="text-sm text-gray-800">
                                  {n}
                                </p>
                              ))}
                            </div>
                            <div className="flex items-start text-xs text-gray-600">
                              <FileText className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                              <p className="italic">
                                {sub.alasan || sub.kegiatan}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Popover.Content>
              )}
            </Popover.Root>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
