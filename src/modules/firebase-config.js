/**
 * Firebase Configuration Module
 * Handles Firebase initialization and exports auth, db, and provider instances
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCu6cbaEw4BzXvF8rGx94h6WHarEFH9Z-k",
  authDomain: "coursesprogress-5658f.firebaseapp.com",
  projectId: "coursesprogress-5658f",
  storageBucket: "coursesprogress-5658f.firebasestorage.app",
  messagingSenderId: "572695866101",
  appId: "1:572695866101:web:bb6dc8058387358b7773bc",
  measurementId: "G-XD8W9V1XPE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
