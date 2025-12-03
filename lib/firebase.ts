import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBQdhQU2hJNCbVbEJWi5Ew5x7IizbXvdcU",
  authDomain: "mulusin-41256.firebaseapp.com",
  projectId: "mulusin-41256",
  storageBucket: "mulusin-41256.firebasestorage.app",
  messagingSenderId: "998778383392",
  appId: "1:998778383392:web:aaeb70f0716e6a4c5a6045",
  measurementId: "G-LLDHZETNKZ"
};

 // <--- TAMBAHKAN IN

// 1. Initialize Firebase
// Cek apakah firebase sudah di-init sebelumnya (untuk mencegah error hot-reload di Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore (Database)
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// 3. Initialize Analytics (Hanya berjalan di sisi client/browser)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

// 4. Export agar bisa dipakai di file lain
export { app, db, analytics, auth, storage };