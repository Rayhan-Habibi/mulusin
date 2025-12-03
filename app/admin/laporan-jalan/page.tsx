'use client';

import { Filter, X, Eye, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getReports, ReportData } from '../../../services/reportService';
import PopUpJalan from '@/app/components/popupJalan';

export default function LaporanJalanPage() {

  // 1. STATE MANAGEMENT
  const [reports, setReports] = useState<any[]>([]); // Data MENTAH dari API
  const [filteredReports, setFilteredReports] = useState<any[]>([]); // Data HASIL FILTER untuk Tabel
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // State untuk menyimpan nilai input Filter
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    damageType: 'all',
    status: 'all'
  });

  // 2. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReports();
        setReports(data);
        
        // Default: Tampilkan data yang BUKAN kecelakaan saat pertama load
        const defaultData = data.filter((item) => {
             const type = decodeURIComponent((item.damageType || "").replace(/\+/g, ' ')).toLowerCase();
             return !type.includes('kecelakaan');
        });
        setFilteredReports(defaultData);

      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 3. LOGIC FILTERING
  const applyFilter = () => {
    // Mulai dari data asli
    let result = [...reports];

    // A. Filter Wajib: Buang data 'Kecelakaan'
    result = result.filter((item) => {
      const type = decodeURIComponent((item.damageType || "").replace(/\+/g, ' ')).toLowerCase();
      return !type.includes('kecelakaan');
    });

    // B. Filter Tanggal
    if (filters.startDate) {
      const start = new Date(filters.startDate).setHours(0,0,0,0);
      result = result.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt.seconds * 1000).setHours(0,0,0,0);
        return itemDate >= start;
      });
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).setHours(23,59,59,999);
      result = result.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt.seconds * 1000).setHours(0,0,0,0);
        return itemDate <= end;
      });
    }

    // C. Filter Status
    if (filters.status !== 'all') {
      result = result.filter(item => {
        const s = (item.status || "").toUpperCase();
        if (filters.status === 'menunggu') return s === 'PENDING';
        if (filters.status === 'completed') return s === 'DISETUJUI' || s === 'DITOLAK'; 
        return s === filters.status.toUpperCase(); // 'DISETUJUI' matches 'DISETUJUI'
      });
    }

    // D. Filter Jenis Kerusakan
    if (filters.damageType !== 'all') {
        result = result.filter(item => {
            const rawType = item.damageType || "";
            const type = decodeURIComponent(rawType.replace(/\+/g, ' ')).toLowerCase();
            return type.includes(filters.damageType.toLowerCase());
        });
    }

    // Update tabel dengan hasil filter
    setFilteredReports(result);
  };

  // Fungsi Reset Filter
  const resetFilter = () => {
    setFilters({ startDate: '', endDate: '', damageType: 'all', status: 'all' });
    // Reset ke data awal (semua kecuali kecelakaan)
    const defaultData = reports.filter((item) => {
        const type = decodeURIComponent((item.damageType || "").replace(/\+/g, ' ')).toLowerCase();
        return !type.includes('kecelakaan');
    });
    setFilteredReports(defaultData);
  };

  // Helper Handle Input Change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-2">
      <h1 className="text-3xl text-black font-bold mb-2">Laporan Jalan</h1>
      <p className="text-gray-600 mb-8">Kelola dan monitor semua laporan kerusakan jalan</p>

      {/* --- FILTER SECTION --- */}
      <div className="card bg-base-100 shadow-md mb-8">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4 flex items-center gap-2">
            <Filter size={20} /> Filter Lanjutan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* Tanggal Mulai */}
            <div className="form-control">
              <label className="label"><span className="label-text">Tanggal Mulai</span></label>
              <input 
                type="date" 
                className="input input-bordered w-full" 
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            {/* Tanggal Akhir */}
            <div className="form-control">
              <label className="label"><span className="label-text">Tanggal Akhir</span></label>
              <input 
                type="date" 
                className="input input-bordered w-full"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* Jenis Kerusakan */}
            <div className="form-control">
              <label className="label"><span className="label-text">Jenis Kerusakan</span></label>
              <select 
                className="select select-bordered w-full"
                value={filters.damageType}
                onChange={(e) => handleFilterChange('damageType', e.target.value)}
              >
                <option value="all">Semua</option>
                <option value="pothole">Pothole</option>
                <option value="retak">Retak</option>
                <option value="longsor">Longsor Kecil</option>
              </select>
            </div>

            {/* Status Pengerjaan */}
            <div className="form-control">
              <label className="label"><span className="label-text">Status Pengerjaan</span></label>
              <select 
                className="select select-bordered w-full"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">Semua</option>
                <option value="menunggu">Menunggu</option>
                <option value="on-progress">Dalam Pengerjaan</option>
                <option value="completed">Selesai (Disetujui/Ditolak)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={applyFilter}>
              <Filter size={18} /> Apply Filter
            </button>
            <button className="btn btn-ghost" onClick={resetFilter}>
              <X size={18} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* --- STATISTIK RINGKASAN (DINAMIS SESUAI FILTER) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <p className="text-sm text-gray-500">Total Ditampilkan</p>
            <h3 className="text-3xl font-bold text-blue-600">{filteredReports.length}</h3>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <p className="text-sm text-gray-500">Menunggu</p>
            <h3 className="text-3xl font-bold text-orange-500">
              {filteredReports.filter(r => r.status === 'PENDING').length}
            </h3>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <p className="text-sm text-gray-500">Disetujui</p>
            <h3 className="text-3xl font-bold text-blue-500">
              {filteredReports.filter(r => r.status === 'DISETUJUI').length}
            </h3>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <p className="text-sm text-gray-500">Ditolak</p>
            <h3 className="text-3xl font-bold text-green-500">
              {filteredReports.filter(r => r.status === 'DITOLAK').length}
            </h3>
          </div>
        </div>
      </div>

      {/* --- TABEL LAPORAN --- */}
      <div className="overflow-x-auto bg-base-100 rounded-box shadow-md">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th className='min-w-[200px]'>Lokasi</th>
              <th>Jenis</th>
              <th>Laporan</th>
              <th className="min-w-[150px]" >Status</th>
              <th>AI Confidence</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-4">Memuat data...</td></tr>
            ) : filteredReports.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4 text-gray-500">Tidak ada data yang cocok dengan filter</td></tr>
            ) : (
                // Render dari filteredReports, BUKAN reports
                filteredReports.map((item) => (
                  <tr key={item.reportId}>
                    <td>{item.reportId}</td>
                    <td className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      <span>{item.address}</span>
                    </td>
                    <td>
                      {item.damageType ? decodeURIComponent(item.damageType.replace(/\+/g, ' ')) : "-"}
                    </td>
                    <td>1x</td>
                    <td>
                      <div className={`badge text-white ${item.status === "DISETUJUI" ? "badge-success" : item.status === "DITOLAK" ? "badge-error" : "badge-warning"}`}>
                        {item.status === "PENDING" ? "Menunggu" : item.status}
                      </div>
                    </td>
                    <td>{item.aiConfidence !== undefined && item.aiConfidence !== null 
                          ? `${item.aiConfidence} %` 
                          : '-'}
                    </td>
                      
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedReport(item)}>
                        <Eye size={18} /> Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      {/* --- POPUP DETAIL LAPORAN --- */}

      <PopUpJalan 
       isOpen={!!selectedReport}
       onClose={() => setSelectedReport(null)}
  
  // SOLUSI: Mapping data secara manual di sini
      data={selectedReport ? {
        id: selectedReport.reportId, // Ubah reportId jadi id
        location: selectedReport.address || "Lokasi tidak diketahui",
        imageSrc: selectedReport.imageBase64 
      ? `data:image/jpeg;base64,${selectedReport.imageBase64.replace(/\s/g, '')}` 
      : "https://placehold.co/600x400?text=No+Image", // Gabung lat/lng jadi string location
        totalReports: 1, // Hardcode atau ambil dari logika lain
        lastUpdate: new Date().toLocaleDateString("id-ID"), // Format tanggal
        severityScore: selectedReport.damageType 
                      ? decodeURIComponent(selectedReport.damageType.replace(/\+/g, ' ')) 
                      : "-", // Contoh logika skor
        damageType: selectedReport.description || "Tidak diketahui",
        aiConfidence: 85, // Mock data atau ambil dari field AI jika ada
        aiSeverity: "High",// Mock logic
        status: `${selectedReport.status}` // Sesuaikan dengan tipe literal di component ("Menunggu" | "Proses" | "Selesai")
      } : null}
/>

    </div>
  );
}