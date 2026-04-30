import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA7dI-ohE77ZHWmQLcozyfbS5kEEORD19Y",
  authDomain: "franchise-tracker-c09b9.firebaseapp.com",
  databaseURL: "https://franchise-tracker-c09b9-default-rtdb.firebaseio.com",
  projectId: "franchise-tracker-c09b9",
  storageBucket: "franchise-tracker-c09b9.firebasestorage.app",
  messagingSenderId: "925622690513",
  appId: "1:925622690513:web:d66a0348a39cf084531bf0",
  measurementId: "G-1027BHMGJP",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);