import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD95L2vSsorIZ35_mWg3oYEyhmZZtnfX-4",
  authDomain: "smart-irrigation-system-fd89c.firebaseapp.com",
  databaseURL: "https://smart-irrigation-system-fd89c-default-rtdb.firebaseio.com",
  projectId: "smart-irrigation-system-fd89c",
  storageBucket: "smart-irrigation-system-fd89c.appspot.com",
  messagingSenderId: "544764187274",
  appId: "1:544764187274:web:0caa03b402d7d01e6c9373",
  measurementId: "G-TM2F455QPN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database ,ref ,onValue };