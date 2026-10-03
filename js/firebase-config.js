// Firebase Configuration
window.FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
  apiKey: "AIzaSyDemoKeyEduVerse2026",
  authDomain: "eduverse-app.firebaseapp.com",
  projectId: "eduverse-app",
  storageBucket: "eduverse-app.appspot.com",
  messagingSenderId: "100000000000",
  appId: "1:100000000000:web:1234567890abcdef"
};

try {
  if (typeof firebase !== 'undefined' && firebase.apps && !firebase.apps.length) {
    firebase.initializeApp(window.FIREBASE_CONFIG);
  }
} catch(e) {
  console.warn('Firebase auto-init skipped or already initialized:', e.message);
}
