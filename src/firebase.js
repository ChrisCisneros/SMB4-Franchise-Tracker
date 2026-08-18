import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDcfJuRgoUAcrZk04bGdoObCdxxjmXC5JA",
  authDomain: "smb4-franchise-tracker.firebaseapp.com",
  databaseURL: "https://smb4-franchise-tracker-default-rtdb.firebaseio.com",
  projectId: "smb4-franchise-tracker",
  storageBucket: "smb4-franchise-tracker.firebasestorage.app",
  messagingSenderId: "1088235770637",
  appId: "1:1088235770637:web:019375c9aabf376bb6d644",
  measurementId: "G-XMQRPHH2FV",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);