import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc 
} from "firebase/firestore";

// 1. Definisi Tipe Data
export interface RedemptionData {
  redemptionId: string; // ID Dokumen Firestore (untuk update)
  id: string;           // ID unik request (dari screenshot "7b69...")
  userId: string;
  cost: number;
  rewardName: string;
  timestamp: any;       // Timestamp Firestore
  type: string;
  status: string;       // "DIAJUKAN", "DISETUJUI", "DITOLAK"
}

// 2. Fungsi Fetch Data
export const getRedemption = async (): Promise<RedemptionData[]> => {
  try {
    const redemptionsCollection = collection(db, "redemptions"); 
    
    // PERBAIKAN 1: Ganti 'createdAt' jadi 'timestamp' sesuai screenshot
    const q = query(redemptionsCollection, orderBy("timestamp", "desc")); 
    
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
        redemptionId: doc.id, // Mapping Doc ID ke redemptionId
        ...doc.data(),
    })) as unknown as RedemptionData[];

    return data;
  } catch (error) {
    console.error("Error fetching redemption:", error);
    return [];
  }
};

// 3. Fungsi Update Status
export const updateRedemptionStatus = async (redemptionId: string, newStatus: string) => {
  try {
    // PERBAIKAN 2: Target collection 'redemptions', bukan 'reports'
    const redemptionRef = doc(db, "redemptions", redemptionId);
    
    await updateDoc(redemptionRef, {
      status: newStatus
    });
    
    return true; 
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};