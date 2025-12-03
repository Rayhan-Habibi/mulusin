"use client";

import { Clock, MapPin, BarChart2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler, // Import Filler untuk area di bawah grafik
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

// Data Grafik (Disesuaikan dengan gambar: Biru, Menanjak)
const chartData = {
  labels: ['Agu', 'Sep', 'Okt', 'Nov'],
  datasets: [
    {
      label: 'Jumlah Laporan',
      data: [2, 4, 5, 12], // Data dummy sesuai kurva di gambar
      borderColor: '#3b82f6', // Warna Biru (Blue-500)
      backgroundColor: 'rgba(59, 130, 246, 0.1)', // Biru transparan di bawah garis
      tension: 0.4, // Membuat garis melengkung (smooth)
      fill: true,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
    },
  ],
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Hilangkan legend
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
      }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6', borderDash: [5, 5] },
            ticks: { stepSize: 3, font: { size: 12 } },
            border: { display: false } 
        },
        x: {
            grid: { display: false },
            border: { display: true, color: '#e5e7eb' }
        }
    }
};

export default function TimelineKerusakanPage() {
  return (
    <div className="p-8 space-y-6 bg-base-100 min-h-screen">
      
      {/* Header */}
      <div className="flex items-start gap-4 mb-2">
        <Clock className="text-purple-600 mt-1" size={32} />
        <div>
            <h1 className="text-2xl font-bold text-base-content">Timeline Kerusakan</h1>
            <p className="text-gray-500">Riwayat dan tracking per lokasi kerusakan</p>
        </div>
      </div>

      {/* Filter Lokasi (Full Width Card) */}
      <div className="card bg-white border border-base-200 shadow-sm p-6">
        <label className="label pt-0">
          <span className="label-text font-medium text-gray-600">Pilih Lokasi</span>
        </label>
        <div className="relative">
            <select className="select select-bordered w-full bg-gray-50 text-base-content font-medium focus:outline-none focus:border-primary">
            <option>Jl. Sudirman, Tanah Abang - R001</option>
            <option>Jl. Gatot Subroto - R002</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (2/3 Layar) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detail Lokasi Card */}
          <div className="card bg-white border border-base-200 shadow-sm">
            <div className="card-body flex flex-col md:flex-row gap-6">
                {/* Gambar Lokasi */}
                <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
                    <Image 
                        src="https://images.unsplash.com/photo-1598409395914-871d87e04f05?q=80&w=2070&auto=format&fit=crop" 
                        alt="Damage Location" 
                        fill
                        className="object-cover"
                    />
                </div>
                
                {/* Info Text */}
                <div className="flex-1 py-2">
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin size={18} className="text-gray-500" />
                        <h2 className="text-lg font-semibold text-base-content">Jl. Sudirman, Tanah Abang</h2>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 pl-7">R001</p>
                    
                    <div className="flex gap-2 mb-6 pl-7">
                        <span className="badge badge-error bg-red-100 text-red-600 border-0 font-medium px-3 py-3">Parah</span>
                        <span className="badge badge-warning bg-orange-100 text-orange-600 border-0 font-medium px-3 py-3">Menunggu</span>
                    </div>

                    {/* Mini Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Total Laporan</p>
                            <p className="text-lg font-bold text-blue-600">12x</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Severity Score</p>
                            <p className="text-lg font-bold text-red-500">120</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Jenis</p>
                            <p className="text-lg font-bold text-base-content">Pothole</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Grafik Card */}
          <div className="card bg-white border border-base-200 shadow-sm">
            <div className="card-body">
                <h3 className="font-semibold text-base-content flex items-center gap-2 mb-6">
                    <BarChart2 size={18} className="text-blue-500"/> Grafik Jumlah Laporan
                </h3>
                <div className="h-64 w-full">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN (1/3 Layar) - TIMELINE */}
        <div className="lg:col-span-1">
            <div className="card bg-white border border-base-200 shadow-sm h-full">
                <div className="card-body">
                    <h3 className="font-semibold text-base-content mb-6">Riwayat Perbaikan</h3>
                    
                    {/* Custom Vertical Timeline */}
                    <div className="relative pl-4 border-l-2 border-gray-100 space-y-10">
                        
                        {/* Item 1 */}
                        <div className="relative">
                            {/* Icon */}
                            <div className="absolute -left-[25px] bg-orange-100 text-orange-600 p-1.5 rounded-full border-4 border-white">
                                <AlertCircle size={18} />
                            </div>
                            <div className="pl-4">
                                <p className="font-medium text-base-content text-sm">Kerusakan dilaporkan (3 kali)</p>
                                <p className="text-xs text-gray-400 mb-3">2025-11-17</p>
                                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-100">
                                    <Image src="https://images.unsplash.com/photo-1598409395914-871d87e04f05?q=80&w=2070&auto=format&fit=crop" alt="bukti" fill className="object-cover"/>
                                </div>
                            </div>
                        </div>

                         {/* Item 2 */}
                         <div className="relative">
                            {/* Icon */}
                            <div className="absolute -left-[25px] bg-green-100 text-green-600 p-1.5 rounded-full border-4 border-white">
                                <CheckCircle size={18} />
                            </div>
                            <div className="pl-4">
                                <p className="font-medium text-base-content text-sm">Perbaikan selesai</p>
                                <p className="text-xs text-gray-400 mb-3">2025-11-10</p>
                                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-100">
                                    <Image src="https://images.unsplash.com/photo-1533750058933-4f9cf956e18f?q=80&w=2070&auto=format&fit=crop" alt="bukti" fill className="object-cover"/>
                                </div>
                            </div>
                        </div>

                         {/* Item 3 */}
                         <div className="relative">
                            {/* Icon */}
                            <div className="absolute -left-[25px] bg-orange-100 text-orange-600 p-1.5 rounded-full border-4 border-white">
                                <AlertCircle size={18} />
                            </div>
                            <div className="pl-4">
                                <p className="font-medium text-base-content text-sm">Kerusakan dilaporkan (5 kali)</p>
                                <p className="text-xs text-gray-400 mb-3">2025-11-04</p>
                                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-100">
                                    <Image src="https://images.unsplash.com/photo-1598409395914-871d87e04f05?q=80&w=2070&auto=format&fit=crop" alt="bukti" fill className="object-cover"/>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}