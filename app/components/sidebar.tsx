"use client"; // 👈 WAJIB: Agar bisa pakai usePathname

import Link from "next/link";
import { usePathname } from "next/navigation"; // 👈 Import hook ini
import { 
  LayoutDashboard, 
  MapPin, 
  AlertTriangle, 
  Map as MapIcon, 
  Clock, 
  Users, 
  Medal, 
  Settings 
} from "lucide-react";
import Image from "next/image";

const Sidebar = () => {
  const pathname = usePathname(); // 👈 Ambil URL saat ini (misal: "/dashboard")

  // Data Menu (Biar kodingan HTML-nya tidak panjang)
  const menuItems = [
    { name: "Dashboard Prioritas", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Laporan Jalan", href: "/admin/laporan-jalan", icon: MapPin },
    { name: "Laporan Kecelakaan", href: "/admin/laporan-kecelakaan", icon: AlertTriangle },
    { name: "Proses Perbaikan", href: "/admin/manajemen-petugas", icon: Users },
    { name: "Peta & Layer", href: "/admin/peta", icon: MapIcon },
    { name: "Reward & Poin", href: "/admin/reward", icon: Medal },
  ];

  return (
    <aside className="h-screen w-60 bg-base-100 border-r border-base-200 flex flex-col sticky top-0">
      
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex justiify-between w-full content-center items-center gap-2">
          <Image alt="Logo" src="/logo2.png" width={60} height={60} className="object-contain justify-center max-w" /> 
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Mulusin</h1>
            <p className="text-sm text-gray-500">Admin</p>
          </div>
          
        </div>
      </div>

      <div className="divider my-0 px-6"></div>

      {/* Menu Loop */}
      <ul className="menu flex-1 p-4 gap-2 text-base-content font-medium">
        
        {menuItems.map((item) => {
          // Cek apakah URL sekarang sama dengan href menu ini
          // Kita pakai .startsWith agar sub-halaman (misal /petugas/detail) tetap aktif
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={`py-3 transition-colors duration-200 ${
                  isActive 
                    ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600 rounded-r-none" // Style AKTIF
                    : "hover:bg-base-200 text-gray-600" // Style NON-AKTIF
                }`}
              >
                <item.icon size={20} className={isActive ? "text-blue-600" : ""} />
                {item.name}
              </Link>
            </li>
          );
        })}

        <div className="mt-auto"></div>

        {/* Settings (Manual karena biasanya terpisah di bawah) */}
        <li>
          <Link 
            href="/admin/settings" 
            className={`py-3 ${pathname === "/settings" ? "bg-blue-50 text-blue-600" : "hover:bg-base-200"}`}
          >
            <Settings size={20} />
            Pengaturan Sistem
          </Link>
        </li>

      </ul>
    </aside>
  );
};

export default Sidebar;