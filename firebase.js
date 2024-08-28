// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAisJMuRGjIs2kkenCq2KJP2JmlF-16Lyw",
  authDomain: "flashcards-xx.firebaseapp.com",
  projectId: "flashcards-xx",
  storageBucket: "flashcards-xx.appspot.com",
  messagingSenderId: "134027747519",
  appId: "1:134027747519:web:46c15bb3eb7751af66660a",
  measurementId: "G-J4GRFSC206"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db}