"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Activity, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  MapPin, 
  TrendingUp, 
  CheckCircle,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { getReports, ReportData } from "@/services/reportService"; 
import Image from "next/image";
// Pastikan path import logo ini benar. Next.js biasanya akses public via '/'
// Jika file di public/logo.png -> src="/logo.png"
import Logo from "../../../public/logo.png"; 

const DashboardMap = dynamic(() => import("../../components/map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-500">
      Memuat Peta Real-time...
    </div>
  )
});

export default function DashboardPrioritasPage() {
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    pending: 0,
    resolved: 0
  });
  const [recentActivity, setRecentActivity] = useState<ReportData[]>([]);
  const [topRoads, setTopRoads] = useState<any[]>([]);
  const [mapReports, setMapReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReports();
        
        // 1. FILTER DATA (Buang Kecelakaan)
        const roadData = data.filter(item => {
            const type = (item.damageType || "").toLowerCase();
            const decoded = decodeURIComponent(type.replace(/\+/g, ' '));
            return !decoded.includes('kecelakaan');
        });

        processDashboardData(roadData);

      } catch (error) {
        console.error("Gagal memuat dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processDashboardData = (data: ReportData[]) => {
    // A. Statistik
    const total = data.length;
    const critical = data.filter(r => (r.severity || "").toLowerCase().includes('parah') || (r.severity || "").toLowerCase().includes('high')).length;
    const pending = data.filter(r => r.status === 'PENDING').length;
    const resolved = data.filter(r => r.status === 'DISETUJUI').length;

    setStats({ total, critical, pending, resolved });

    // B. Recent Activity
    setRecentActivity(data.slice(0, 5));

    // C. Peta Data
    const mapPoints = data.map((r) => {
        const s = (r.severity || "").toLowerCase();
        let sevText = "Ringan";
        if (s.includes('parah') || s.includes('berat')) sevText = "Parah";
        else if (s.includes('sedang')) sevText = "Sedang";

        return {
            id: r.reportId,
            lat: r.latitude,
            lng: r.longitude,
            description: decodeURIComponent((r.damageType || "").replace(/\+/g, ' ')),
            severity: sevText
        };
    });
    setMapReports(mapPoints);

    // D. Top Priority Roads (Grouping Logic)
    const roadGroups: { [key: string]: { count: number, severitySum: number } } = {};
    
    data.forEach(r => {
        const rawAddress = r.address || "Lokasi Tidak Diketahui";
        // Ambil nama jalan utama (sebelum koma pertama)
        const roadName = rawAddress.split(',')[0].trim(); 

        if (!roadGroups[roadName]) {
            roadGroups[roadName] = { count: 0, severitySum: 0 };
        }
        roadGroups[roadName].count += 1;
        
        const s = (r.severity || "").toLowerCase();
        const weight = s.includes('parah') ? 3 : s.includes('sedang') ? 2 : 1;
        roadGroups[roadName].severitySum += weight;
    });

    const sortedRoads = Object.keys(roadGroups).map(name => {
        const item = roadGroups[name];
        const avgScore = item.severitySum / item.count;
        
        let avgLabel = "Ringan";
        if (avgScore > 2.5) avgLabel = "Parah";
        else if (avgScore > 1.5) avgLabel = "Sedang";

        let status = "Aman";
        if (item.count > 5 || avgLabel === "Parah") status = "Kritis";
        else if (item.count > 2) status = "Perlu Perhatian";

        return { name, reports: item.count, avgSeverity: avgLabel, status };
    })
    .sort((a, b) => b.reports - a.reports)
    .slice(0, 3);

    setTopRoads(sortedRoads);
  };

  // Helper Format Waktu Relative
  // FIX: Kita pindahkan logic ini ke komponen kecil atau pastikan client-only render
  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} detik lalu`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    return `${Math.floor(diffInHours / 24)} hari lalu`;
  };

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-screen text-gray-500">
        <div className="flex flex-col items-center gap-2">
            <div className="loading loading-spinner loading-lg"></div>
            <p>Mengambil Data Real-time...</p>
        </div>
    </div>;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 bg-gray-50/50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {/* FIX: Gunakan path relatif root untuk logo di public */}
           
            Dashboard Prioritas
          </h1>
          <p className="text-gray-500 mt-1">Pantauan real-time kondisi infrastruktur jalan (Data Live).</p>
        </div>
        <div className="flex gap-3">
            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                System Online
            </span>
            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm flex items-center gap-2">
                <Clock size={12} />
                Live Update
            </span>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Laporan" value={stats.total} icon={BarChart3} trend="Active" color="blue" />
        <StatCard title="Kondisi Kritis" value={stats.critical} icon={AlertTriangle} trend="Perlu Tindakan" color="red" alert={stats.critical > 0} />
        <StatCard title="Perlu Validasi" value={stats.pending} icon={Clock} color="orange" />
        <StatCard title="Disetujui" value={stats.resolved} icon={CheckCircle} color="green" />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
        
        {/* LEFT: MAP */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin size={18} className="text-orange-500" />
                    Peta Sebaran Kerusakan
                </h3>
                <Link href="/admin/peta" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                    Buka Fullscreen <ArrowRight size={12} />
                </Link>
            </div>
            <div className="flex-1 relative bg-gray-100">
                <DashboardMap reports={mapReports} />
            </div>
        </div>

        {/* RIGHT: LIST */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
            
            {/* TOP PRIORITY */}
            <div className="p-4 border-b border-gray-100 bg-red-50/50">
                <h3 className="font-bold text-red-900 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-600" />
                    Jalan Prioritas Tertinggi
                </h3>
                <p className="text-xs text-red-600/80 mt-1">Berdasarkan jumlah & tingkat kerusakan</p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                
                {topRoads.length > 0 ? (
                    topRoads.map((road, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-red-100 bg-white hover:bg-red-50 transition cursor-pointer group">
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    road.status === 'Kritis' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200'
                                }`}>
                                    {road.status}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">{road.reports} Laporan</span>
                            </div>
                            <h4 className="font-bold text-gray-800 text-sm">{road.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">Rata-rata kerusakan: <span className="font-semibold">{road.avgSeverity}</span></p>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-xs text-gray-400">Belum ada data prioritas yang cukup.</div>
                )}

                <div className="border-t border-gray-100 my-2"></div>
                
                <h4 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">Aktivitas Terbaru</h4>

                {/* RECENT ACTIVITY */}
                {recentActivity.map((item) => (
                    <div key={item.reportId} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-700 line-clamp-1">{item.address}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                                {decodeURIComponent((item.damageType || "").replace(/\+/g, ' '))} • 
                                {/* FIX: Hydration Error (suppressHydrationWarning) */}
                                <span suppressHydrationWarning>{getTimeAgo(item.createdAt)}</span>
                            </p>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            (item.severity || "").toLowerCase().includes('parah') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {item.severity || "Unknown"}
                        </span>
                    </div>
                ))}

            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50">
                <Link href="/admin/laporanjalan" className="block w-full py-2 text-center text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition">
                    Kelola Semua Laporan
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}

// STAT CARD (Sama)
function StatCard({ title, value, icon: Icon, color, trend, alert }: any) {
    const colors: any = {
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      red: "bg-red-50 text-red-600 border-red-100",
      orange: "bg-orange-50 text-orange-600 border-orange-100",
      green: "bg-green-50 text-green-600 border-green-100",
    };
    const activeColor = colors[color] || colors.blue;
  
    return (
      <div className={`bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${alert ? 'ring-1 ring-red-500' : ''}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
            {trend && (
                <p className="text-xs font-medium text-gray-600 flex items-center gap-1 mt-1 bg-gray-50 w-fit px-1.5 py-0.5 rounded">
                    <TrendingUp size={10} /> {trend}
                </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${activeColor} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
        </div>
      </div>
    );
  }