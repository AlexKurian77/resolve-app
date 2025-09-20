// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth,initializeAuth,getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBI1B04ncUuu5VpXP48KTeKxWYsXXZM_Kc",
  authDomain: "resolve-app-3ee3d.firebaseapp.com",
  projectId: "resolve-app-3ee3d",
  storageBucket: "resolve-app-3ee3d.firebasestorage.app",
  messagingSenderId: "473284279604",
  appId: "1:473284279604:web:10161a3536e6bb936af961"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
// Firestore
const db = getFirestore(app);

// Export
export { auth, db };
