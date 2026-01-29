import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAocMvYTxbwbdqohPOPVMJvfWz2i3EtL-M",
  authDomain: "jobconnect-4ff9f.firebaseapp.com",
  projectId: "jobconnect-4ff9f",
  storageBucket: "jobconnect-4ff9f.firebasestorage.app",
  messagingSenderId: "481411641501",
  appId: "1:481411641501:web:43f366c87af7a490426474",
  measurementId: "G-85TGKY8FFW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Predefined job tags
export const JOB_TAGS = [
  "React", "Node.js", "Python", "Java", "Design", 
  "Marketing", "Sales", "Finance", "HR", "Engineering"
];

// Email configuration
export const EMAIL_SERVICE_ID = "service_z18p71f";
export const EMAIL_TEMPLATE_ID = "template_h4b83ry";
export const EMAIL_PUBLIC_KEY = "MMO8M5DjN5Yt5OK3W";
