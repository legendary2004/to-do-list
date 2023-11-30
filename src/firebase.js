// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNvrfifXCe6LmVv8NJg56ZQ2SvRX7K-Ys",
  authDomain: "todo-list-60266.firebaseapp.com",
  projectId: "todo-list-60266",
  storageBucket: "todo-list-60266.appspot.com",
  messagingSenderId: "980750195284",
  appId: "1:980750195284:web:5a2f2e111fa9c731f5abc1",
  measurementId: "G-C7RV7GG49L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
