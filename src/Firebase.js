// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA4iPDle_TwtUyb2Qs018LUkLDvS1jVmU0',
  authDomain: 'realtor-efed5.firebaseapp.com',
  projectId: 'realtor-efed5',
  storageBucket: 'realtor-efed5.appspot.com',
  messagingSenderId: '1040905484289',
  appId: '1:1040905484289:web:6465b84a124e0c91ace800',
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
