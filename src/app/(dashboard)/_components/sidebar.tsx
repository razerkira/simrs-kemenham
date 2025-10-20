// src/app/(dashboard)/_components/sidebar.tsx

"use client" // <-- WAJIB

import { Profile } from '@/types/database'
// --- IMPOR BARU ---
import { usePathname } from 'next/navigation'
// --- Komponen Link Kustom (Helper) ---
import Link from 'next/link' // Gunakan Link Next.js untuk performa

interface SidebarLinkProps {
  href: string
  children: React.ReactNode
}

function SidebarLink({ href, children }: SidebarLinkProps) {
  const pathname = usePathname();
  // Cek apakah path saat ini sama persis dengan href
  const isActive = pathname === href; 

  return (
    <Link 
      href={href} 
      // Beri atribut data-active jika link aktif
      data-active={isActive} 
      // Styling: jika data-active=true, beri bg-gray-200
      className="p-2 block rounded hover:bg-gray-100 data-[active=true]:bg-gray-200 data-[active=true]:font-medium"
    >
      {children}
    </Link>
  );
}
// --- Akhir Komponen Link Kustom ---


export default function Sidebar({ profile }: { profile: Profile }) {
  
  const role = profile.role 
  const isAdmin = role === 'admin'
  const isVerificator = role === 'verificator' || isAdmin
  const isSupervisor = role === 'supervisor' || isAdmin
  const isPegawai = role === 'pegawai' || isVerificator || isSupervisor

  return (
    <aside className="w-64 flex-shrink-0 bg-white shadow-lg flex flex-col"> {/* Tambah flex flex-col */}
      <div className="flex h-16 items-center justify-center border-b flex-shrink-0"> {/* Tambah flex-shrink-0 */}
        <h2 className="text-xl font-bold">SIMRS</h2>
      </div>
      
      {/* Buat nav bisa di-scroll */}
      <nav className="flex-1 space-y-4 p-4 overflow-y-auto"> 
        
        {/* --- MENU UTAMA --- */}
        <div>
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">
            Menu Utama
          </h3>
          <ul className="space-y-1">
            {/* --- Gunakan Komponen SidebarLink --- */}
            <li><SidebarLink href="/">Dashboard</SidebarLink></li>
            <li><SidebarLink href="/pengaturan">Pengaturan Akun</SidebarLink></li>
          </ul>
        </div>

        {/* --- MENU PEGAWAI --- */}
        {isPegawai && (
          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">
              Pengajuan
            </h3>
            <ul className="space-y-1">
              <li><SidebarLink href="/pengajuan-cuti">Ajukan Cuti</SidebarLink></li>
              <li><SidebarLink href="/pengajuan-dinas">Ajukan Dinas</SidebarLink></li>
              <li><SidebarLink href="/status-pengajuan">Status Pengajuan Saya</SidebarLink></li>
            </ul>
          </div>
        )}

        {/* --- MENU VERIFIKATOR --- */}
        {isVerificator && (
          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">
              Verifikasi
            </h3>
            <ul className="space-y-1">
              <li><SidebarLink href="/verifikasi/cuti">Verifikasi Cuti</SidebarLink></li>
              <li><SidebarLink href="/verifikasi/dinas">Verifikasi Dinas</SidebarLink></li>
            </ul>
          </div>
        )}

        {/* --- MENU SUPERVISOR --- */}
        {isSupervisor && (
          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">
              Persetujuan
            </h3>
            <ul className="space-y-1">
              <li><SidebarLink href="/persetujuan/cuti">Persetujuan Cuti</SidebarLink></li>
              <li><SidebarLink href="/persetujuan/dinas">Persetujuan Dinas</SidebarLink></li>
            </ul>
          </div>
        )}
        
        {/* --- MENU ADMIN --- */}
        {isAdmin && (
          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">
              Admin
            </h3>
            <ul className="space-y-1">
              <li><SidebarLink href="/admin/manajemen-pegawai">Manajemen Pegawai</SidebarLink></li>
              <li><SidebarLink href="/admin/buat-akun">Buat Akun Pegawai</SidebarLink></li>
            </ul>
          </div>
        )}

      </nav>
    </aside>
  )
}