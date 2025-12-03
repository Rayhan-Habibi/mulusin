// components/RoadMap.tsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat"; // Import plugin heatmap

// --- 1. FIX ICON MARKER (Sama seperti sebelumnya) ---
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const customIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- 2. KOMPONEN CUSTOM HEATMAP ---
// Kita butuh akses ke instance map menggunakan hook useMap()
const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    // Format points untuk heatmap: [lat, lng, intensity]
    // Intensity opsional, kita set default 0.5 atau ambil dari data
    const heat = (L as any).heatLayer(points, {
      radius: 50, // Seberapa besar radius "bara api"-nya
      blur: 10,   // Seberapa blur pinggirannya
      maxZoom: 17,
    });

    heat.addTo(map);

    // Cleanup function: Hapus layer saat komponen di-unmount atau data berubah
    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);

  return null; // Komponen ini tidak merender JSX, hanya logic Leaflet
};

// --- TIPE DATA DARI FIREBASE (Contoh) ---
type RoadReport = {
  id: string;
  lat: number;
  lng: number;
  description: string;
  severity: string; // 1-10 (misal tingkat kerusakan)
};

interface RoadMapProps {
  reports: RoadReport[];
}

// --- 3. MAIN COMPONENT ---
export default function RoadMap({ reports }: RoadMapProps) {
  // State untuk Toggle
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  // Transform data untuk Heatmap: [lat, lng, intensity]
  // Kita pakai 'severity' sebagai intensity, atau default 1
  const heatmapPoints = reports.map((r) => [r.lat, r.lng, 1] as [number, number, number]);

  return (
    <div className="relative">
      {/* --- CONTROLS / TOGGLE BUTTONS --- */}
      <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-md flex flex-col gap-2 border border-gray-200">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Layer Control</h4>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={showHeatmap} 
            onChange={(e) => setShowHeatmap(e.target.checked)}
            className="form-checkbox h-4 w-4 text-orange-600 rounded"
          />
          <span className="text-sm font-medium">🔥 Heatmap</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={showMarkers} 
            onChange={(e) => setShowMarkers(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
          />
          <span className="text-sm font-medium">📍 Lokasi Presisi</span>
        </label>
      </div>

      {/* --- MAP CONTAINER --- */}
      <MapContainer
        center={[-0.94924, 100.35427]} // Default Padang
        zoom={13}
        style={{ height: "500px", width: "100%", borderRadius: "0.5rem" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Heatmap Layer jika toggle ON */}
        {showHeatmap && <HeatmapLayer points={heatmapPoints} />}

        {/* Render Markers jika toggle ON */}
        {showMarkers && reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.lat, report.lng]} 
            icon={customIcon}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm mb-1">Laporan #{report.id}</h3>
                <p className="text-xs text-gray-600">{report.description}</p>
                <span className="text-xs bg-red-100 text-red-600 px-1 rounded mt-1 inline-block">
                  Rusak Level: {report.severity}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}