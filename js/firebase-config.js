// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-analytics.js';

// Firebase configuration
const firebaseConfig = {
  // These should be replaced with actual Firebase project credentials
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return !firebaseConfig.apiKey.includes('your-') && 
         !firebaseConfig.projectId.includes('your-') &&
         !firebaseConfig.authDomain.includes('your-project');
};

let app, db, analytics;

// Initialize Firebase only if properly configured
if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    analytics = getAnalytics(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase not configured. Using fallback mode.');
}

// Export the initialized services
export { db, analytics, app };