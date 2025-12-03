"use client";

import { useEffect, useState } from "react";
import { updatePoint, updateReportStatus } from "@/services/reportService"; 
import { 
  X, MapPin, Activity, AlertCircle, 
  Check, StopCircleIcon, Coins // Import Icon Coins
} from "lucide-react";

export interface ReportData {
  id: string;
  imageSrc: string;
  location: string;
  totalReports: number;
  lastUpdate: string;
  severityScore: string;
  damageType: string;
  aiConfidence: number;
  aiSeverity: string;
  status: string;
}

interface ReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReportData | null; 
}

export default function PopUpJalan({ isOpen, onClose, data }: ReportDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [point, setPoint] = useState<number>(5); // Default 5 Poin

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Fungsi Gabungan untuk Validasi + Poin (Lebih Aman)
  const handleValidationProcess = async () => {
    if (!data?.id) return;
    
    try {
      setIsLoading(true);
      
      // 1. Update Status dulu
      await updateReportStatus(data.id, "DISETUJUI");
      
      // 2. Update Poin kemudian
      await updatePoint(data.id, point);
      
      alert(`Laporan DISETUJUI dan User mendapat ${point} poin.`);
      onClose(); 
      window.location.reload(); 
      
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memproses data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!data?.id) return;
    try {
      setIsLoading(true); 
      await updateReportStatus(data.id, newStatus); 
      alert(`Laporan berhasil diubah menjadi: ${newStatus}`);
      onClose(); 
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert("Gagal mengupdate status.");
    } finally {
      setIsLoading(false); 
    }
  };

  // Logic Disabled
  const currentStatus = data?.status?.toUpperCase(); 
  const isFinished = currentStatus === "DISETUJUI" || currentStatus === "DITOLAK";
  const isActionDisabled = isLoading || isFinished;

  if (!data && isOpen) return null; 

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 shrink-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Detail Laporan</h2>
            <p className="text-sm text-gray-500 mt-1">{data?.id || "-"}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        {data && (
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
            
            <div className="relative h-48 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <img src={data.imageSrc} alt="Kondisi Jalan" className="object-cover w-full h-full"/>
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                {data.damageType}
              </div>
            </div>

            <div>
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">{data.location}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <span>{data.totalReports} laporan</span> • <span>Terakhir: {data.lastUpdate}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Jenis kerusakan</p>
                  <p className="text-xl font-bold text-red-600 flex items-center gap-1">
                    {data.severityScore} <Activity size={14} />
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-lg font-bold text-gray-800">{data.status}</p>
                </div>
              </div>
            </div>

            {/* CARD ACTION */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Validasi Laporan</h3>
              
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-full shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <div className="inline-block px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 text-xs font-bold rounded-full mb-1">
                    {data.status}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {isFinished 
                      ? "Laporan ini sudah selesai diproses dan tidak dapat diubah." 
                      : "Pilih jumlah poin reward dan validasi laporan."}
                  </p>
                </div>
              </div>

              {/* --- PILIHAN POIN (Hanya Muncul Jika Belum Selesai) --- */}
              {!isActionDisabled && (
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                    <Coins size={14} className="text-yellow-600"/>
                    PILIH POIN REWARD
                  </label>
                  <div className="flex gap-2">
                    {[5, 10, 20].map((value) => (
                      <button
                        key={value}
                        onClick={() => setPoint(value)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all duration-200 ${
                          point === value
                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500" // Active Style
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700" // Inactive Style
                        }`}
                      >
                        +{value} Poin
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* --- TOMBOL VALIDASI --- */}
              <button 
                onClick={handleValidationProcess}
                disabled={isActionDisabled} 
                className={`w-full flex justify-center items-center gap-2 py-3 text-sm font-medium rounded-lg transition-all duration-200 
                  ${isActionDisabled 
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none" 
                    : "bg-[#0F172A] text-white hover:bg-slate-800 shadow-lg shadow-gray-200 hover:shadow-xl"
                  }`}
              >
                <Check size={18} className={currentStatus === "DISETUJUI" ? "text-green-600" : ""} />
                {currentStatus === "DISETUJUI" 
                  ? "Sudah Divalidasi" 
                  : `Validasi & Kirim ${point} Poin`}
              </button>

              {/* --- TOMBOL TOLAK --- */}
              <button 
                onClick={() => handleStatusChange("DITOLAK")}
                disabled={isActionDisabled}
                className={`mt-2 w-full flex justify-center items-center gap-2 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActionDisabled
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none opacity-70"
                    : "border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm"
                  }`}
              >
                <StopCircleIcon size={18} className={currentStatus === "DITOLAK" ? "text-red-600" : ""} />
                {currentStatus === "DITOLAK" ? "Sudah Ditolak" : "Tolak Laporan"}
              </button>

            </div>

          </div>
        )}
      </div>
    </>
  );
}