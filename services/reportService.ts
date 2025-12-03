import { db, storage } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { point } from "leaflet";


// 1. Definisi Tipe Data (Sesuaikan dengan data dari Android)
export interface ReportData {
  reportId: string;
  imageBase64: string;      // URL foto dari Firebase Storage
  address: string;  // Lokasi (Text)
  damageType: string;    // Jenis kerusakan
  latitude: number;
  longitude: number;
  severity?: string;     // Opsional (jika ada)
  description?: string;
  createdAt: any;
  status: string;
  userId: string;
  userName: string;
  aiConfidence: number; 
  workStatus?: string; // Status Lapangan (Sedang Diperbaiki/Diperbaiki)
  finishedImageBase64?: string;
  points: number;     
}



// 2. Fungsi Fetch Data
export const getReports = async (): Promise<ReportData[]> => {
  try {
    // Ganti 'reports' dengan nama collection yang kamu pakai di Android
    const reportsCollection = collection(db, "reports"); 
    
    // Opsional: Urutkan berdasarkan waktu terbaru
    const q = query(reportsCollection, orderBy("createdAt", "desc")); 
    
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as unknown as ReportData[];

    return data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
};

export const updateReportStatus = async (reportId: string, newStatus: string) => {
  try {
    // Referensi ke dokumen spesifik berdasarkan reportId
    const reportRef = doc(db, "reports", reportId);
    
    // Update field 'status'
    await updateDoc(reportRef, {
      status: newStatus
    });
    
    return true; // Berhasil
  } catch (error) {
    console.error("Error updating status:", error);
    throw error; // Lempar error biar bisa ditangkap di UI
  }
};
export const updateWorkStatus = async (reportId: string, newWorkStatus: string, imageUrl?: string) => {
  try {
    const reportRef = doc(db, "reports", reportId);
    
    const updateData: any = {
      workStatus: newWorkStatus // Ganti statusPengerjaan -> workStatus
    };

    if (imageUrl) {
      updateData.finishedImage = imageUrl; // Ganti Image -> finishedImage
    }

    await updateDoc(reportRef, updateData);
    return true;
  } catch (error) {
    console.error("Error updating work status:", error);
    throw error;
  }
};

export const updatePoint = async (reportId: string, newPoint: number) => {
  try {
    // Referensi ke dokumen spesifik berdasarkan reportId
    const reportRef = doc(db, "reports", reportId);
    
    // Update field 'status'
    await updateDoc(reportRef, {
      points: newPoint
    });
    
    return true; // Berhasil
  } catch (error) {
    console.error("Error updating point:", error);
    throw error; // Lempar error biar bipontsa ditangkap di UI
  }
};

// 3. Upload Gambar (Tetap sama)
export const uploadEvidenceImage = async (file: File, reportId: string): Promise<string> => {
  // 3. Hapus baris: const storage = getStorage(); 
  // Kita pakai variable 'storage' yang diimport langsung dari @/lib/firebase
  
  const storageRef = ref(storage, `evidence/${reportId}_${Date.now()}_${file.name}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

