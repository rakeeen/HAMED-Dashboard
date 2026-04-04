import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUIpBtWDuKbkIGkjIOP4F3wKVAmhWT3dc",
  authDomain: "hamed-web.firebaseapp.com",
  projectId: "hamed-web",
  storageBucket: "hamed-web.firebasestorage.app",
  messagingSenderId: "927863215454",
  appId: "1:927863215454:web:9b9438384ef20574b4ebcf"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
