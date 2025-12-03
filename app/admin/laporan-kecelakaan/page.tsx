'use client';

import { getReports, ReportData } from '@/services/reportService';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LaporanKecelakaanPage() {

   const [reports, setReports] = useState<ReportData[]>([]);
   const [loading, setLoading] = useState(true);
  
    // Fetch Data
    useEffect(() => {
      const fetchData = async () => {
        try {
          const data = await getReports();
          setReports(data);
        } catch (error) {
          console.error("Gagal ambil data:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

    // Helper: Format Tanggal
    const formatDate = (timestamp: any) => {
        if (!timestamp) return "-";
        const date = timestamp.seconds 
            ? new Date(timestamp.seconds * 1000) 
            : new Date(timestamp);
        
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    // Helper: Badge Severity
    const getSeverityBadge = (severity: string | undefined) => {
        const s = severity?.toLowerCase() || "";
        if (s.includes('berat') || s.includes('fatal') || s.includes('parah')) return "badge-error";
        if (s.includes('sedang') || s.includes('medium')) return "badge-warning";
        return "badge-info"; 
    };

    // --- LOGIC UTAMA: Filter hanya data kecelakaan ---
    // Kita simpan di variabel ini agar bisa dipakai di Statistik DAN Tabel
    const accidentReports = reports.filter((item) => {
        const type = (item.damageType || "").toLowerCase();
        const decodedType = decodeURIComponent(type.replace(/\+/g, ' '));
        return decodedType.includes('kecelakaan');
    });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-50 rounded-full">
            <AlertTriangle className="text-red-600" size={32} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-base-content">Laporan Kecelakaan</h1>
            <p className="text-gray-500 mt-1">Data kecelakaan yang terjadi di area monitoring</p>
        </div>
      </div>

      {/* Statistik Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {/* Total Kecelakaan: Sekarang mengambil length dari accidentReports */}
         <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">
            <p className="text-sm text-gray-500">Total Kecelakaan</p>
            <h3 className="text-3xl font-bold text-red-600">
                {loading ? "..." : accidentReports.length}
            </h3>
          </div>
        </div>
        {/* Sisanya masih mock/hardcode (Fatal, Berat, Ringan) sesuai request */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">
            <p className="text-sm text-gray-500">Fatal</p>
            <h3 className="text-3xl font-bold text-gray-700">0</h3>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">
            <p className="text-sm text-gray-500">Berat</p>
            <h3 className="text-3xl font-bold text-orange-500">2</h3>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">
            <p className="text-sm text-gray-500">Ringan</p>
            <h3 className="text-3xl font-bold text-yellow-500">1</h3>
          </div>
        </div>
      </div>

      {/* Tabel Data Kecelakaan */}
      <div className="card bg-base-100 shadow-md border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="table w-full">
            <thead className="bg-base-200/50 text-base-content font-semibold">
                <tr>
                <th className="py-4 pl-6">ID</th>
                <th className='min-w-[200px]'>Waktu</th>
                <th>Lokasi</th>
                <th>Deskripsi</th>
                <th className="pr-6 text-right">Severity</th>
                </tr>
            </thead>
            <tbody>
                
                {loading ? (
                    <tr><td colSpan={5} className="text-center py-4">Memuat data...</td></tr>
                ) : (
                    // MENGGUNAKAN accidentReports YANG SUDAH DI-FILTER
                    accidentReports.map((item) => (
                        <tr key={item.reportId} className="hover:bg-base-50 border-b border-base-100">
                            <td className="pl-6 font-medium">{item.reportId}</td>
                            
                            <td className="text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-gray-400" />
                                    {formatDate(item.createdAt)}
                                </div>
                            </td>

                            <td>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span className="truncate max-w-[200px]">{item.address || "Lokasi tidak ada"}</span>
                                </div>
                            </td>

                            <td className="max-w-xs text-gray-600 truncate">
                                {item.description || "Tidak ada deskripsi"}
                            </td>

                            <td className="pr-6 text-right">
                                <span className={`badge ${getSeverityBadge(item.severity)} text-white font-medium py-3 px-4 border-0`}>
                                    {item.severity || "Unknown"}
                                </span>
                            </td>
                        </tr>
                    ))
                )}

                {!loading && accidentReports.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">Tidak ada data kecelakaan ditemukan</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Alert Box Korelasi */}
      <div className="alert bg-red-50 border border-red-100 shadow-sm flex items-start gap-4 p-6">
        <AlertTriangle className="text-red-600 mt-1" size={24} />
        <div>
            <h3 className="font-bold text-red-900 text-lg">Korelasi dengan Kerusakan Jalan</h3>
            <p className="text-red-700 mt-1">
                Data di atas disinkronisasi secara real-time. Pastikan prioritas perbaikan dilakukan pada lokasi dengan frekuensi kecelakaan tinggi.
            </p>
        </div>
      </div>
    </div>
  );
}