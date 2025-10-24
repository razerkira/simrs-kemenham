// src/app/(dashboard)/_components/sidebar.tsx
"use client"

import { Profile } from '@/types/database'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button' // Button tidak dipakai lagi di sini
// Impor semua ikon yang diperlukan
import { ChevronsLeft, ChevronsRight, Home, Settings, FileText, PlaneTakeoff, FileClock, UserCheck, FileCheck, Users, UserPlus } from 'lucide-react'

// Komponen Link Kustom (Helper)
interface SidebarLinkProps {
  href: string
  children: React.ReactNode
  isCollapsed: boolean
  icon?: React.ElementType
}
function SidebarLink({ href, children, isCollapsed, icon: Icon }: SidebarLinkProps) {
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

// Props Sidebar sekarang menerima isCollapsed & toggleSidebar
interface SidebarProps {
  profile: Profile
  isCollapsed: boolean
  toggleSidebar: () => void // Hanya diterima, tidak dipakai di sini
}

export default function Sidebar({
  profile,
  isCollapsed,
  // toggleSidebar // Tidak perlu toggleSidebar lagi di sini
}: SidebarProps) {

  const role = profile.role
  const isAdmin = role === 'admin'
  const isVerificator = role === 'verificator' || isAdmin
  const isSupervisor = role === 'supervisor' || isAdmin
  const isPegawai = role === 'pegawai' || isVerificator || isSupervisor

  return (
    // Sidebar dengan tinggi penuh layar dan posisi fixed
    <aside className={cn(
        "flex flex-col bg-white shadow-lg transition-all duration-300 ease-in-out fixed top-0 left-0 h-screen z-10",
        isCollapsed ? "w-16" : "w-64"
      )}>
      {/* Header Sidebar */}
      <div className="flex h-16 items-center justify-center border-b flex-shrink-0 relative">
        <h2 className={cn("text-xl font-bold transition-opacity", isCollapsed ? "opacity-0" : "opacity-100")}>
          SIMRS
        </h2>
         <h2 className={cn("text-xl font-bold absolute transition-opacity", isCollapsed ? "opacity-100" : "opacity-0")}>
          S
        </h2>
      </div>

      {/* Navigasi Menu */}
      <nav className="flex-1 space-y-4 p-2 overflow-y-auto">
        {/* --- MENU UTAMA --- */}
        <div>
          {!isCollapsed && (<h3 className="mb-1 px-2 text-xs font-semibold uppercase text-gray-400">Menu Utama</h3>)}
          <ul className="space-y-1">
            <li><SidebarLink href="/" isCollapsed={isCollapsed} icon={Home}>Dashboard</SidebarLink></li>
            <li><SidebarLink href="/pengaturan" isCollapsed={isCollapsed} icon={Settings}>Pengaturan Akun</SidebarLink></li>
          </ul>
        </div>
        {/* --- MENU PEGAWAI --- */}
        {isPegawai && (
          <div>
            {!isCollapsed && (<h3 className="mb-1 px-2 text-xs font-semibold uppercase text-gray-400">Pengajuan</h3>)}
            <ul className="space-y-1">
              <li><SidebarLink href="/pengajuan-cuti" isCollapsed={isCollapsed} icon={FileText}>Ajukan Cuti</SidebarLink></li>
              <li><SidebarLink href="/pengajuan-dinas" isCollapsed={isCollapsed} icon={PlaneTakeoff}>Ajukan Dinas</SidebarLink></li>
              <li><SidebarLink href="/status-pengajuan" isCollapsed={isCollapsed} icon={FileClock}>Status Pengajuan Saya</SidebarLink></li>
            </ul>
          </div>
        )}
        {/* --- MENU VERIFIKATOR --- */}
        {isVerificator && (
          <div>
             {!isCollapsed && (<h3 className="mb-1 px-2 text-xs font-semibold uppercase text-gray-400">Verifikasi</h3>)}
            <ul className="space-y-1">
              <li><SidebarLink href="/verifikasi/cuti" isCollapsed={isCollapsed} icon={UserCheck}>Verifikasi Cuti</SidebarLink></li>
              <li><SidebarLink href="/verifikasi/dinas" isCollapsed={isCollapsed} icon={UserCheck}>Verifikasi Dinas</SidebarLink></li>
            </ul>
          </div>
        )}
        {/* --- MENU SUPERVISOR --- */}
        {isSupervisor && (
          <div>
             {!isCollapsed && (<h3 className="mb-1 px-2 text-xs font-semibold uppercase text-gray-400">Persetujuan</h3>)}
            <ul className="space-y-1">
              <li><SidebarLink href="/persetujuan/cuti" isCollapsed={isCollapsed} icon={FileCheck}>Persetujuan Cuti</SidebarLink></li>
              <li><SidebarLink href="/persetujuan/dinas" isCollapsed={isCollapsed} icon={FileCheck}>Persetujuan Dinas</SidebarLink></li>
            </ul>
          </div>
        )}
        {/* --- MENU ADMIN --- */}
        {isAdmin && (
          <div>
             {!isCollapsed && (<h3 className="mb-1 px-2 text-xs font-semibold uppercase text-gray-400">Admin</h3>)}
            <ul className="space-y-1">
              <li><SidebarLink href="/admin/manajemen-pegawai" isCollapsed={isCollapsed} icon={Users}>Manajemen Pegawai</SidebarLink></li>
              <li><SidebarLink href="/admin/buat-akun" isCollapsed={isCollapsed} icon={UserPlus}>Buat Akun Pegawai</SidebarLink></li>
            </ul>
          </div>
        )}
      </nav>

      {/* HAPUS TOMBOL TOGGLE DARI SINI */}

    </aside>
  )
}
