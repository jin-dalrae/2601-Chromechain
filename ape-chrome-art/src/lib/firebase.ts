// ═══════════════════════════════════════════════════════════════════════════════
// 🔥 FIREBASE CONFIGURATION - CHROMECHAIN
// ═══════════════════════════════════════════════════════════════════════════════
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBAlSj0BIlbSExseQspmYTZ62Qzd837dB8",
    authDomain: "chromechain-a7902.firebaseapp.com",
    projectId: "chromechain-a7902",
    storageBucket: "chromechain-a7902.firebasestorage.app",
    messagingSenderId: "505793545937",
    appId: "1:505793545937:web:88f5e23b911604371967f0",
    measurementId: "G-S2228JFVWY"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
