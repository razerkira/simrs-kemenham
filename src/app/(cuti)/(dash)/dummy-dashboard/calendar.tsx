"use client";

import React, { useState, useMemo } from "react";
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
  id: string | number;
  jenis: "cuti" | "dinas";
  nama?: string;
  participants?: { nama: string }[];
  alasan?: string;
  kegiatan?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: string;
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

  const getSubmissionsForDate = (date: string) =>
    submissions.filter(
      (s) => date >= s.tanggalMulai && date <= s.tanggalSelesai
    );

  const previousMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );

  const getStatusInfo = (status: string) => {
    const lower = status.toLowerCase();
    if (lower.includes("setuju"))
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        text: "Disetujui",
        color: "text-green-500",
      };
    if (lower.includes("tolak"))
      return {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        text: "Ditolak",
        color: "text-red-500",
      };
    return {
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      text: "Menunggu",
      color: "text-yellow-500",
    };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const daysArray = Array.from({ length: daysInMonth }).map((_, i) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
    const daySubs = getSubmissionsForDate(dateStr);
    return { day: i + 1, dateStr, daySubs };
  });

  const groupedWeeks = useMemo(() => {
    const weeks: { label: string; days: any[] }[] = [];
    let currentWeek: any[] = [];
    daysArray.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === daysArray.length - 1) {
        const start = currentWeek[0]?.day;
        const end = currentWeek[currentWeek.length - 1]?.day;
        weeks.push({
          label: `${start}-${end} ${monthNames[currentDate.getMonth()]}`,
          days: currentWeek,
        });
        currentWeek = [];
      }
    });
    return weeks;
  }, [daysArray, currentDate]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
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

      {/* 🖥️ Desktop Calendar */}
      <div className="hidden md:grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((d) => (
          <div
            key={d}
            className="text-center font-semibold text-gray-600 py-2 text-sm"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="hidden md:grid grid-cols-7 gap-2">
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={i} />
        ))}

        {daysArray.map(({ day, daySubs }) => {
          const hasSubs = daySubs.length > 0;
          const isToday =
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();

          const labelList: string[] = [];

          // Gunakan filter agar bisa dihitung
          const cutiApproved = daySubs.filter(
            (s) =>
              s.jenis === "cuti" && s.status.toLowerCase().includes("setuju")
          ).length;
          const cutiPending = daySubs.filter(
            (s) =>
              s.jenis === "cuti" &&
              !s.status.toLowerCase().includes("setuju") &&
              !s.status.toLowerCase().includes("tolak")
          ).length;
          const cutiRejected = daySubs.filter(
            (s) =>
              s.jenis === "cuti" && s.status.toLowerCase().includes("tolak")
          ).length;

          const dinasApproved = daySubs.filter(
            (s) =>
              s.jenis === "dinas" && s.status.toLowerCase().includes("setuju")
          ).length;
          const dinasPending = daySubs.filter(
            (s) =>
              s.jenis === "dinas" &&
              !s.status.toLowerCase().includes("setuju") &&
              !s.status.toLowerCase().includes("tolak")
          ).length;
          const dinasRejected = daySubs.filter(
            (s) =>
              s.jenis === "dinas" && s.status.toLowerCase().includes("tolak")
          ).length;

          // Buat label jumlah
          if (cutiApproved) labelList.push(`${cutiApproved} disetujui cuti`);
          if (cutiPending) labelList.push(`${cutiPending} menunggu cuti`);
          if (cutiRejected) labelList.push(`${cutiRejected} ditolak cuti`);
          if (dinasApproved) labelList.push(`${dinasApproved} disetujui dinas`);
          if (dinasPending) labelList.push(`${dinasPending} menunggu dinas`);
          if (dinasRejected) labelList.push(`${dinasRejected} ditolak dinas`);

          return (
            <Popover.Root key={day}>
              <Popover.Trigger asChild>
                <div
                  className={cn(
                    "aspect-square border rounded-lg p-1 md:p-2 flex flex-col cursor-pointer",
                    isToday && "bg-blue-50 border-blue-400"
                  )}
                >
                  <div
                    className={cn(
                      "text-xs md:text-sm font-medium",
                      isToday && "text-blue-600 font-bold"
                    )}
                  >
                    {day}
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {labelList.slice(0, 3).map((text, i) => {
                      const lower = text.toLowerCase();
                      return (
                        <span
                          key={i}
                          className={`text-[10px] md:text-xs rounded px-1 ${
                            lower.includes("menunggu")
                              ? "text-yellow-600 bg-yellow-100"
                              : lower.includes("ditolak")
                              ? "text-red-600 bg-red-100"
                              : "text-green-600 bg-green-100"
                          }`}
                        >
                          {text}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Popover.Trigger>

              {hasSubs && (
                <Popover.Content className="min-w-80 bg-white p-5 shadow-lg rounded-lg z-50">
                  <h4 className="font-semibold mb-2 text-sm">
                    Detail {day} {monthNames[currentDate.getMonth()]}
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {daySubs.map((s, i) => {
                      const statusInfo = getStatusInfo(s.status);
                      const isCuti = s.jenis === "cuti";
                      const names = isCuti
                        ? [s.nama]
                        : s.participants?.map((p) => p.nama) || [];
                      return (
                        <div
                          key={i}
                          className="border rounded-lg p-3 bg-gray-50"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1">
                              {isCuti ? (
                                <User className="h-4 w-4 text-blue-500" />
                              ) : (
                                <Users className="h-4 w-4 text-green-500" />
                              )}
                              <span className="capitalize font-medium text-sm">
                                {s.jenis}
                              </span>
                            </div>
                            <div
                              className={`flex items-center text-xs font-medium ${statusInfo.color}`}
                            >
                              {statusInfo.icon}
                              <span className="ml-1">{statusInfo.text}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700">
                            {names.join(", ")}
                          </p>
                          <div className="flex items-start text-xs text-gray-600 mt-1">
                            <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="italic">
                              {s.alasan || s.kegiatan}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Popover.Content>
              )}
            </Popover.Root>
          );
        })}
      </div>

      {/* 📱 Mobile List View */}
      <div className="md:hidden space-y-4">
        {groupedWeeks.map((week, wi) => (
          <div key={wi}>
            <h3 className="font-semibold text-gray-700 mb-2">{week.label}</h3>
            {week.days.map((d) => {
              const hasSubs = d.daySubs.length > 0;
              if (!hasSubs) return null;
              const labelList: string[] = [];
              const cutiApproved = d.daySubs.find(
                (s) =>
                  s.jenis === "cuti" &&
                  s.status.toLowerCase().includes("setuju")
              );
              const cutiPending = d.daySubs.find(
                (s) =>
                  s.jenis === "cuti" &&
                  s.status.toLowerCase().includes("pengajuan")
              );
              const dinasApproved = d.daySubs.find(
                (s) =>
                  s.jenis === "dinas" &&
                  s.status.toLowerCase().includes("setuju")
              );
              if (cutiApproved) labelList.push("Cuti");
              if (cutiPending) labelList.push("Menunggu cuti");
              if (dinasApproved) labelList.push("Dinas");

              return (
                <Popover.Root key={d.day}>
                  <Popover.Trigger asChild>
                    <div className="flex justify-between bg-blue-50 border border-blue-200 rounded-lg p-2 cursor-pointer">
                      <span className="font-medium text-sm">
                        {dayNames[new Date(d.dateStr).getDay()]} {d.day}
                      </span>
                      <span className="text-xs text-gray-700">
                        {labelList.join(", ")}
                      </span>
                    </div>
                  </Popover.Trigger>

                  <Popover.Content className="min-w-72 bg-white p-4 shadow-lg rounded-lg z-50">
                    <h4 className="font-semibold mb-2 text-sm">
                      Detail {d.day} {monthNames[currentDate.getMonth()]}
                    </h4>
                    {d.daySubs.map((s, i) => {
                      const statusInfo = getStatusInfo(s.status);
                      return (
                        <div
                          key={i}
                          className="border rounded-lg p-2 mb-2 last:mb-0 bg-gray-50"
                        >
                          <div className="flex justify-between text-sm font-medium">
                            <span className="capitalize">{s.jenis}</span>
                            <span className={statusInfo.color}>
                              {statusInfo.text}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {s.nama || s.participants?.map((p: any) => p.nama)}
                          </p>
                          <p className="text-xs italic text-gray-500">
                            {s.alasan || s.kegiatan}
                          </p>
                        </div>
                      );
                    })}
                  </Popover.Content>
                </Popover.Root>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
