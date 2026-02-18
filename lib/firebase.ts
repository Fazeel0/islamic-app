import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDigIbvHcsKqXpKQKJKi5DQVJwd7B_66y0",
  authDomain: "islamic-app-5b22c.firebaseapp.com",
  projectId: "islamic-app-5b22c",
  storageBucket: "islamic-app-5b22c.firebasestorage.app",
  messagingSenderId: "593570968843",
  appId: "1:593570968843:web:10a923e0c7ad502f891e0e",
  measurementId: "G-RR62JFSS8P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
