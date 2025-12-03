"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MapPin, Clock, Play, CheckCircle, 
  Loader2, UploadCloud, Image as ImageIcon 
} from 'lucide-react';
// Import reportService yang baru (tanpa uploadEvidenceImage)
import { getReports, updateWorkStatus, ReportData } from '@/services/reportService';

export default function ManajemenPetugasPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State UI
  const [processingId, setProcessingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedReportIdForUpload, setSelectedReportIdForUpload] = useState<string | null>(null);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReports();
        setReports(data); 
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  // --- LOGIC 1: TOMBOL MULAI PENGERJAAN ---
  const handleStartWork = async (id: string) => {
    try {
      setProcessingId(id);
      await updateWorkStatus(id, "Sedang Diperbaiki");
      
      setReports(prev => prev.map(r => 
        r.reportId === id ? { ...r, workStatus: "Sedang Diperbaiki" } : r
      ));
      
    } catch (error) {
      alert("Gagal update status.");
    } finally {
      setProcessingId(null);
    }
  };

  // --- LOGIC 2: TRIGGER UPLOAD ---
  const triggerFileUpload = (id: string) => {
    setSelectedReportIdForUpload(id);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // --- HELPER: CONVERT FILE TO BASE64 ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // --- LOGIC 3: HANDLE FILE & FINISH ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedReportIdForUpload) return;

    // VALIDASI UKURAN (PENTING! Firestore limit 1MB)
    // Kita batasi 700KB biar aman dengan metadata
    if (file.size > 700 * 1024) {
        alert("File terlalu besar! Karena pake Firestore, maksimal 700KB. Tolong kompres dulu.");
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    try {
      setProcessingId(selectedReportIdForUpload);
      
      // 1. Ubah File jadi String Panjang (Base64)
      const base64String = await fileToBase64(file);
      
      // 2. Simpan String itu ke Firestore langsung
      await updateWorkStatus(selectedReportIdForUpload, "DIPERBAIKI", base64String);

      // 3. Update UI Lokal
      setReports(prev => prev.map(r => 
        r.reportId === selectedReportIdForUpload 
        ? { ...r, workStatus: "DIPERBAIKI", finishedImageBase64: base64String } 
        : r
      ));

      alert("Pengerjaan Selesai!");

    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data.");
    } finally {
      setProcessingId(null);
      setSelectedReportIdForUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="text-blue-600 w-8 h-8" />
          <h1 className="text-2xl font-bold text-gray-900">Proses Perbaikan</h1>
        </div>
        <p className="text-gray-500 ml-11">Monitor progres pengerjaan lapangan</p>
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">ID</th>
                <th className="p-4 min-w-[150px]">Waktu</th>
                <th className="p-4 min-w-[200px]">Lokasi</th>
                <th className="p-4 min-w-[400px]">Update Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan={4} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : (
                // Filter hanya DISETUJUI
                reports
                .filter((item) => item.status === "DISETUJUI") 
                .map((item) => {
                    const workStatus = item.workStatus || "Belum Dimulai";
                    const isProcessing = processingId === item.reportId;
                    const isStarted = workStatus === "Sedang Diperbaiki";
                    const isFinished = workStatus === "DIPERBAIKI";

                    return (
                        <tr key={item.reportId} className="hover:bg-gray-50 transition-colors">
                        
                        <td className="p-4 pl-6 font-medium text-gray-900">
                            {item.reportId || item.reportId.substring(0,6)}
                        </td>

                        <td className="p-4 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-gray-400" />
                                {formatDate(item.createdAt)}
                            </div>
                        </td>

                        <td className="p-4 text-gray-700">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-gray-400 shrink-0" />
                                <span className="line-clamp-2">{item.address || "Lokasi tidak tersedia"}</span>
                            </div>
                        </td>

                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                
                                {/* LABEL STATUS */}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border w-[140px] text-center
                                    ${workStatus === 'Belum Dimulai' ? 'bg-gray-100 text-gray-600 border-gray-200' : ''}
                                    ${workStatus === 'Sedang Diperbaiki' ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse' : ''}
                                    ${workStatus === 'Diperbaiki' ? 'bg-green-50 text-green-600 border-green-200' : ''}
                                `}>
                                    {workStatus}
                                </span>

                                {/* BUTTON 1: MULAI */}
                                <button 
                                    onClick={() => handleStartWork(item.reportId)}
                                    disabled={isStarted || isFinished || isProcessing}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                        ${isStarted || isFinished 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                        }
                                    `}
                                >
                                    {isProcessing && !isStarted && !isFinished ? <Loader2 size={14} className="animate-spin"/> : <Play size={14} />}
                                    Mulai Pengerjaan
                                </button>

                                {/* BUTTON 2: SELESAI (UPLOAD & SAVE TO FIRESTORE) */}
                                <button 
                                    onClick={() => triggerFileUpload(item.reportId)}
                                    disabled={!isStarted || isFinished || isProcessing}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                        ${isStarted && !isFinished
                                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm cursor-pointer' 
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed grayscale'
                                        }
                                    `}
                                >
                                    {isProcessing && isStarted ? <Loader2 size={14} className="animate-spin"/> : <UploadCloud size={14} />}
                                    Pengerjaan Selesai
                                </button>

                                {/* Indikator Gambar */}
                                {isFinished && (
                                    <div className="text-green-600" title="Bukti tersimpan">
                                        <CheckCircle size={20} />
                                    </div>
                                )}

                            </div>
                        </td>

                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}