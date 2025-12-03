"use client";

import React, { useEffect, useState } from 'react';
import { 
  Clock, Gift, History, CheckCircle, XCircle, Award
} from 'lucide-react';
// Import dari service yang sudah diperbaiki
import { getRedemption, updateRedemptionStatus, RedemptionData } from '@/services/redemptionService';

export default function RewardPage() {
  const [redemptions, setRedemptions] = useState<RedemptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); 

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRedemption();
        setRedemptions(data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- LOGIC UPDATE STATUS ---
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if(!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    try {
      await updateRedemptionStatus(id, newStatus);
      
      // Update UI Optimistic (Tanpa reload page)
      setRedemptions(prev => prev.map(item => 
        item.redemptionId === id ? { ...item, status: newStatus } : item
      ));
      
      alert("Status berhasil diperbarui");
    } catch (error) {
      alert("Gagal update status");
    }
  };

  // --- HELPER: FORMAT TANGGAL ---
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    // Handle Firestore Timestamp object (seconds)
    const date = timestamp.seconds 
        ? new Date(timestamp.seconds * 1000) 
        : new Date(timestamp);
    
    return date.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  // --- DYNAMIC STATS (Hitung dari data asli) ---
  const stats = [
    { label: 'Total Permintaan', value: redemptions.length, color: 'text-blue-600' },
    { label: 'Diajukan', value: redemptions.filter(r => r.status === 'DIAJUKAN').length, color: 'text-orange-500' },
    { label: 'Disetujui', value: redemptions.filter(r => r.status === 'DISETUJUI').length, color: 'text-green-600' },
    { label: 'Ditolak', value: redemptions.filter(r => r.status === 'DITOLAK').length, color: 'text-red-500' },
  ];

  // --- TAB CONTENT: PERMINTAAN PENUKARAN ---
  const RequestsView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="p-4">ID Transaksi</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Reward</th>
                <th className="p-4 min-w-[100px]">Biaya</th>
                <th className="p-4 min-w-[150px]">Tanggal</th>
                <th className="p-4">Status</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan={7} className="p-6 text-center text-gray-500">Memuat data...</td></tr>
              ) : redemptions.map((req) => (
                <tr key={req.redemptionId} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900" title={req.redemptionId}>
                    {/* Tampilkan 8 karakter pertama ID agar rapi */}
                    {req.redemptionId.substring(0, 8)}...
                  </td>
                  <td className="p-4 text-xs text-gray-500">{req.userId}</td>
                  <td className="p-4 text-gray-700 font-medium">{req.rewardName}</td>
                  <td className="p-4">
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">
                      {req.cost} pts
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{formatDate(req.timestamp)}</td>
                  
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase border ${
                      req.status === 'DIAJUKAN' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                      req.status === 'DISETUJUI' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    {req.status === 'DIAJUKAN' ? (
                      <div className="flex gap-2">
                        <button 
                            onClick={() => handleStatusUpdate(req.redemptionId, 'DISETUJUI')}
                            className="p-1 text-green-600 hover:bg-green-100 rounded border border-green-200 transition"
                            title="Terima"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                            onClick={() => handleStatusUpdate(req.redemptionId, 'DITOLAK')}
                            className="p-1 text-red-600 hover:bg-red-100 rounded border border-red-200 transition"
                            title="Tolak"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs italic">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 2. Tab Content: Daftar Reward (Static Mock Data for UI display)
  const RewardsView = () => (
    <div>
        {/* ... (Bagian Reward List kamu tidak ada yang perlu diubah logika datanya, bisa pakai kode lama) ... */}
        {/* Masukkan kode RewardsView lama kamu di sini jika ingin menampilkannya */}
        <div className="p-10 text-center text-gray-400 bg-white rounded-xl border">
            Fitur Manajemen Reward (Statis)
        </div>
    </div>
  );

  // 3. Tab Content: Riwayat (Filter dari data asli yang sudah selesai)
  const HistoryView = () => {
    const historyData = redemptions.filter(r => r.status !== 'DIAJUKAN');
    
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="font-medium text-gray-900 mb-4">Log Transaksi Reward</h3>
        <div className="space-y-4">
            {historyData.length === 0 ? <p className="text-gray-500 text-sm">Belum ada riwayat.</p> : 
            historyData.map((log) => (
            <div key={log.redemptionId} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                <p className="font-medium text-gray-900">{log.rewardName}</p>
                <p className="text-xs text-gray-500">{log.userId} • {formatDate(log.timestamp)}</p>
                </div>
                <div className="text-right">
                <p className="font-medium text-gray-900">{log.cost} pts</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${
                    log.status === 'DISETUJUI' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {log.status}
                </span>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Award className="text-yellow-500 w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-900">Reward & Poin</h1>
          </div>
          <p className="text-gray-500 ml-11">Kelola reward dan proses penukaran poin user</p>
        </div>

        {/* TABS */}
        <div className="bg-gray-200/50 p-1 rounded-lg inline-flex mb-8">
          {['requests', 'rewards', 'history'].map(tab => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {tab === 'requests' ? 'Permintaan' : tab === 'rewards' ? 'Daftar Reward' : 'Riwayat'}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'requests' && <RequestsView />}
          {activeTab === 'rewards' && <RewardsView />}
          {activeTab === 'history' && <HistoryView />}
        </div>

      </div>
    </div>
  );
}