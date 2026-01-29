// e:\Main_pro\fundtracer\frontend\lib\firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "YOUr-API-KEY-HERE",
  authDomain: "fundtracer-eca34.firebaseapp.com",
  projectId: "fundtracer-eca34",
  storageBucket: "fundtracer-eca34.firebasestorage.app",
  messagingSenderId: "722879610325",
  appId: "1:722879610325:web:27ad8748b369d26e4b915c",
  measurementId: "G-6GHMKQ0P1X"
}

// Initialize Firebase (prevent multiple initializations)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, analytics };
