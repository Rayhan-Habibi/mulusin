// app/page.tsx
"use client";

import { getReports, ReportData } from "@/services/reportService";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Mock Data (Nanti ganti dengan data dari Firebase kamu)
const dummyReports = [
  { id: '1', lat: -0.94924, lng: 100.35427, description: 'Lubang besar di tengah jalan', severity: 8 },
  { id: '2', lat: -0.95000, lng: 100.35500, description: 'Aspal mengelupas', severity: 5 },
  { id: '3', lat: -0.94800, lng: 100.35300, description: 'Jalan bergelombang parah', severity: 7 },
  { id: '4', lat: -0.94930, lng: 100.35430, description: 'Retak rambut', severity: 3 }, 
  { id: '5', lat: -0.94920, lng: 100.35420, description: 'Banjir genangan', severity: 6 },
];

// Import Map secara Dynamic
const RoadMap = dynamic(() => import("../../components/map"), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Memuat Peta...</div>
});

export default function DashboardJalan() {

    const [reports, setReports] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(true);
    
      // Fetch Data saat halaman dibuka
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

      const mapReports = reports.filter((r) => r.status == "DISETUJUI").map((r) => ({
        id: r.reportId,
        lat: Number(r.latitude), 
        lng: Number(r.longitude),
        description: r.description || 'Tidak ada deskripsi',
        severity: r.severity || '5' ,
      }));


  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Peta Sebaran Jalan Rusak</h1>
      <p className="text-gray-500 mb-6">Visualisasi area rawan kerusakan menggunakan Heatmap & Marker.</p>
      
      <div className="border rounded-xl shadow-lg overflow-hidden">
        <RoadMap reports={mapReports} />
      </div>
    </div>
  );
}