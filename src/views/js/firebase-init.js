// Importar Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyB-BICWbcKpiP8ImeVBWYVh3eFmrS8mPWY",
  authDomain: "vive-aguachica.firebaseapp.com",
  projectId: "vive-aguachica",
  storageBucket: "vive-aguachica.firebasestorage.app",
  messagingSenderId: "551401519520",
  appId: "1:551401519520:web:c7d816f408135fc0f48cc5",
  measurementId: "G-N5E7BKDWWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage }; 