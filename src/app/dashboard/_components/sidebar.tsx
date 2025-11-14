// src/app/(dashboard)/_components/sidebar.tsx
"use client";

import { Profile, UserProfile } from "@/types/database";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronsLeft,
  ChevronsRight,
  Home,
  Settings,
  FileText,
  PlaneTakeoff,
  FileClock,
  UserCheck,
  FileCheck,
  Users,
  UserPlus,
  Building2,
} from "lucide-react";
import Image from "next/image";

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
  isCollapsed: boolean;
  icon?: React.ElementType;
}
function SidebarLink({
  href,
  children,
  isCollapsed,
  icon: Icon,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      data-active={isActive}
      className={cn(
        "p-2 flex items-center rounded hover:bg-gray-100 data-[active=true]:bg-gray-200 data-[active=true]:font-medium",
        isCollapsed ? "justify-center" : ""
      )}
      title={isCollapsed ? String(children) : undefined}
    >
      {Icon && <Icon className={cn("h-4 w-4", !isCollapsed ? "mr-2" : "")} />}
      {!isCollapsed && <span>{children}</span>}
    </Link>
  );
}

interface SidebarProps {
  profile: UserProfile | Profile;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ profile, isCollapsed }: SidebarProps) {
  const role = profile.role;
  const isAdmin = role === 1;
  const isVerificator = role === 2 || isAdmin;
  const isSupervisor = role === 3 || isAdmin;
  const isPegawai = role === 5 || isVerificator || isSupervisor;

  return (
    <aside
      className={cn(
        "flex flex-col bg-white shadow-lg transition-all duration-300 ease-in-out fixed top-0 left-0 h-screen z-10",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-center border-b flex-shrink-0 relative gap-2">
        <Image
          alt="Logo Kemenham"
          src="/logo_kemenham.png"
          width={50}
          height={50}
          className={cn("", isCollapsed ? "opacity-0" : "opacity-100")}
        />
        <h2
          className={cn(
            "text-xl font-bold transition-opacity",
            isCollapsed ? "opacity-0" : "opacity-100"
          )}
        >
          SIMRS
        </h2>
        <h2
          className={cn(
            "text-xl font-bold absolute transition-opacity",
            isCollapsed ? "opacity-100" : "opacity-0"
          )}
        >
          S
        </h2>
      </div>

      <nav className="flex-1 space-y-4 p-2 overflow-y-auto">
        <div>
          {!isCollapsed && (
            <h3 className="mb-1 px-2 text-xs font-semibold uppercase text-gray-400">
              Menu Utama
            </h3>
          )}
          <ul className="space-y-1">
            <li>
              <SidebarLink
                href="/dashboard"
                isCollapsed={isCollapsed}
                icon={Home}
              >
                Dashboard
              </SidebarLink>
            </li>
            {/* <li>
              <SidebarLink
                href="/dashboard/pengaturan"
                isCollapsed={isCollapsed}
                icon={Settings}
              >
                Pengaturan Akun
              </SidebarLink>
            </li> */}
          </ul>
        </div>
        {isPegawai && (
          <div>
            {!isCollapsed && (
              <h3 className="mb-1 px-2 text-xs font-semibold uppercase text-gray-400">
                Pengajuan
              </h3>
            )}
            <ul className="space-y-1">
              <li>
                <SidebarLink
                  href="/dashboard/pengajuan-cuti"
                  isCollapsed={isCollapsed}
                  icon={FileText}
                >
                  Ajukan Cuti
                </SidebarLink>
              </li>
              {isVerificator && (
                <li>
                  <SidebarLink
                    href="/dashboard/pengajuan-dinas"
                    isCollapsed={isCollapsed}
                    icon={PlaneTakeoff}
                  >
                    Ajukan Dinas
                  </SidebarLink>
                </li>
              )}

              <li>
                <SidebarLink
                  href="/dashboard/status-pengajuan"
                  isCollapsed={isCollapsed}
                  icon={FileClock}
                >
                  Status Pengajuan Saya
                </SidebarLink>
              </li>
              <li>
                <SidebarLink
                  href="/dashboard/profile"
                  isCollapsed={isCollapsed}
                  icon={FileClock}
                >
                  Profil Saya
                </SidebarLink>
              </li>
            </ul>
          </div>
        )}
        {isVerificator && (
          <div>
            {!isCollapsed && (
              <h3 className="mb-1 px-2 text-xs font-semibold uppercase text-gray-400">
                Verifikasi
              </h3>
            )}
            <ul className="space-y-1">
              <li>
                <SidebarLink
                  href="/dashboard/verifikasi/cuti"
                  isCollapsed={isCollapsed}
                  icon={UserCheck}
                >
                  Verifikasi Cuti
                </SidebarLink>
              </li>
              <li>
                <SidebarLink
                  href="/dashboard/verifikasi/dinas"
                  isCollapsed={isCollapsed}
                  icon={UserCheck}
                >
                  Verifikasi Dinas
                </SidebarLink>
              </li>
            </ul>
          </div>
        )}
        {/* {isSupervisor && (
          <div>
            {!isCollapsed && (
              <h3 className="mb-1 px-2 text-xs font-semibold uppercase text-gray-400">
                Persetujuan
              </h3>
            )}
            <ul className="space-y-1">
              <li>
                <SidebarLink
                  href="/dashboard/persetujuan/cuti"
                  isCollapsed={isCollapsed}
                  icon={FileCheck}
                >
                  Persetujuan Cuti
                </SidebarLink>
              </li>
              <li>
                <SidebarLink
                  href="/dashboard/persetujuan/dinas"
                  isCollapsed={isCollapsed}
                  icon={FileCheck}
                >
                  Persetujuan Dinas
                </SidebarLink>
              </li>
            </ul>
          </div>
        )} */}
        {isAdmin && (
          <div>
            {!isCollapsed && (
              <h3 className="mb-1 px-2 text-xs font-semibold uppercase text-gray-400">
                Admin
              </h3>
            )}
            <ul className="space-y-1">
              <li>
                <SidebarLink
                  href="/dashboard/admin/manajemen-pegawai"
                  isCollapsed={isCollapsed}
                  icon={Users}
                >
                  Manajemen Pegawai
                </SidebarLink>
              </li>
              {/* <li>
                <SidebarLink
                  href="/dashboard/admin/buat-akun"
                  isCollapsed={isCollapsed}
                  icon={UserPlus}
                >
                  Buat Akun Pegawai
                </SidebarLink>
              </li> */}
              <li>
                <SidebarLink
                  href="/dashboard/admin/users"
                  isCollapsed={isCollapsed}
                  icon={Users}
                >
                  Manajemen User
                </SidebarLink>
              </li>
              <li>
                <SidebarLink
                  href="/dashboard/admin/manajemen-unit"
                  isCollapsed={isCollapsed}
                  icon={Building2}
                >
                  Manajemen Unit Kerja
                </SidebarLink>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
}
