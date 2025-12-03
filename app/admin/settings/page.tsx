"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  signOut, 
  updateProfile, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; 
import { 
  Settings, User as UserIcon, Bell, Shield, LogOut, 
  Save, Globe, Moon, Camera, Loader2
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  
  // State User & Loading
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State Form Profil
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  // State Form Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // State Preferensi (Disimpan di Firestore)
  const [notifications, setNotifications] = useState({
    emailAlert: true,
    pushNotif: true,
    criticalOnly: false
  });

  // 1. Fetch User Data saat Load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
        setEmail(currentUser.email || "");

        // Ambil data preferensi tambahan dari Firestore jika ada
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.preferences) setNotifications(data.preferences);
          }
        } catch (e) {
          console.error("Gagal memuat preferensi user");
        }
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // 2. Logic Logout
  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar?")) return;
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      alert("Gagal logout.");
    }
  };

  // 3. Logic Simpan Profil & Preferensi
  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // A. Update Auth Profile (Display Name)
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName: displayName });
      }

      // B. Simpan Data Tambahan ke Firestore (Agar data persisten)
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        displayName,
        email,
        preferences: notifications,
        lastUpdated: new Date()
      }, { merge: true }); // merge: true agar tidak menimpa data lain

      alert("Profil dan pengaturan berhasil disimpan!");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  // 4. Logic Ubah Password
  const handleChangePassword = async () => {
    if (!user) return;
    if (!currentPassword || !newPassword) {
      alert("Mohon isi password saat ini dan password baru.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password baru minimal 6 karakter.");
      return;
    }

    setSaving(true);
    try {
      // Re-autentikasi user (Wajib untuk operasi sensitif)
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update Password
      await updatePassword(user, newPassword);
      
      alert("Password berhasil diubah!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        alert("Password saat ini salah.");
      } else if (error.code === 'auth/too-many-requests') {
        alert("Terlalu banyak percobaan gagal. Coba lagi nanti.");
      } else {
        alert("Gagal mengubah password: " + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat Pengaturan...</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      
      {/* HEADER PAGE */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="text-blue-600 w-8 h-8" />
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
        </div>
        <p className="text-gray-500 ml-11">Kelola preferensi akun dan konfigurasi aplikasi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- KOLOM KIRI: PROFIL --- */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card Profil */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="px-6 pb-6 relative">
              <div className="relative -mt-12 w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md group cursor-pointer">
                {/* Avatar */}
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <UserIcon size={40} />
                </div>
                {/* Overlay Tombol Kamera (Mock UI) */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                </div>
              </div>
              
              <div className="mt-4">
                <h2 className="text-xl font-bold text-gray-900">{displayName || "Admin User"}</h2>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Nama Lengkap</label>
                    <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Masukkan nama..."
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <input 
                        type="email" 
                        value={email}
                        disabled
                        className="mt-1 w-full p-2 border border-gray-200 bg-gray-100 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                    />
                </div>
                <button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-blue-400"
                >
                    {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>

          {/* Card Logout */}
          <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Logout</h3>
            <p className="text-sm text-gray-500 mb-4">Akhiri sesi Anda di perangkat ini.</p>
            <button 
                onClick={handleLogout}
                className="w-full py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
                <LogOut size={18} />
                Keluar
            </button>
          </div>

        </div>

        {/* --- KOLOM KANAN: PREFERENSI & KEAMANAN --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Notifikasi */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <Bell size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Notifikasi</h3>
                    <p className="text-sm text-gray-500">Atur preferensi pemberitahuan laporan.</p>
                </div>
            </div>

            <div className="space-y-4 divide-y divide-gray-100">
                <ToggleItem 
                    title="Notifikasi Email" 
                    desc="Terima ringkasan laporan harian via email."
                    checked={notifications.emailAlert}
                    onChange={() => setNotifications(p => ({...p, emailAlert: !p.emailAlert}))}
                />
                <ToggleItem 
                    title="Push Notification" 
                    desc="Notifikasi realtime saat ada laporan masuk."
                    checked={notifications.pushNotif}
                    onChange={() => setNotifications(p => ({...p, pushNotif: !p.pushNotif}))}
                />
                <ToggleItem 
                    title="Hanya Laporan Kritis" 
                    desc="Hanya beri notifikasi jika severity level 'Parah'."
                    checked={notifications.criticalOnly}
                    onChange={() => setNotifications(p => ({...p, criticalOnly: !p.criticalOnly}))}
                />
            </div>
            
            {/* Tombol Simpan Khusus Notifikasi (Opsional, sudah dihandle tombol simpan profil) */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                <span className="text-xs text-gray-400 italic mr-2">*Klik tombol Simpan di profil untuk menyimpan ini</span>
            </div>
          </div>

          {/* Card Keamanan */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <Shield size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Keamanan & Password</h3>
                    <p className="text-sm text-gray-500">Update kata sandi akun administrator.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Password Saat Ini</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition" 
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Password Baru</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition" 
                    />
                </div>
            </div>
            <div className="mt-6 text-right">
                <button 
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-green-700 hover:border-green-300 transition shadow-sm disabled:opacity-50"
                >
                    {saving ? "Memproses..." : "Update Password"}
                </button>
            </div>
          </div>

          {/* Card Preferensi Sistem */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Globe size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Preferensi Sistem</h3>
                    <p className="text-sm text-gray-500">Bahasa dan tampilan aplikasi.</p>
                </div>
            </div>

            <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                    <Globe size={18} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Bahasa</span>
                </div>
                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2 outline-none">
                    <option>Bahasa Indonesia</option>
                    <option>English (US)</option>
                </select>
            </div>
            <div className="flex items-center justify-between py-2 mt-2">
                <div className="flex items-center gap-3">
                    <Moon size={18} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Mode Gelap</span>
                </div>
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded font-medium">Coming Soon</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENT: TOGGLE SWITCH ---
function ToggleItem({ title, desc, checked, onChange }: any) {
    return (
        <div className="flex items-center justify-between py-4">
            <div>
                <h4 className="text-sm font-medium text-gray-900">{title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );
}