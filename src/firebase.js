import { initializeApp } from 'firebase/app';
import { getAuth, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDaqv_Ws7C22H3-9URK3HyEDdSpvZcL2YQ",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "saarthi-64edf.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "saarthi-64edf",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "saarthi-64edf.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "586856287324",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:586856287324:web:7a1214575521d4df3f6a99",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-Z75G6C6LX6"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set session persistence instead of default localStorage persistence
// This ensures each browser window/tab has its own independent session
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log('Firebase auth persistence set to browserSessionPersistence');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

const db = getFirestore(app);


let analytics = null;
try {

  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.error('Analytics initialization error:', error);

  analytics = {
    logEvent: () => {}
  };
}

export { auth, db, analytics };
