// const firebaseConfig = {
//   apiKey: 'YOUR_FIREBASE_API_KEY',
//   authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
//   projectId: 'YOUR_PROJECT_ID',
//   storageBucket: 'YOUR_PROJECT_ID.appspot.com',
//   messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
//   appId: 'YOUR_APP_ID'
// };

const firebaseConfig = {
  apiKey: "AIzaSyAsabsUD5Rj0ISDWPsx-4SJk2_aVOTiV70",
  authDomain: "mssnoaustech-ab06a.firebaseapp.com",
  projectId: "mssnoaustech-ab06a",
  storageBucket: "mssnoaustech-ab06a.firebasestorage.app",
  messagingSenderId: "532301052478",
  appId: "1:532301052478:web:98d9c0fe5c75c57ec5af6f",
  measurementId: "G-8DLBB4C6PK"
};

// IMPORTANT:
// Replace the placeholder values above with your real Firebase configuration.
// Use the values from Firebase Console > Project Settings > Your apps > Web app.
// Enable Email/Password authentication in Firebase Console > Authentication > Sign-in method.

if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
}

window.hasFirebaseConfig = Object.values(firebaseConfig).every((value) => !String(value).startsWith('YOUR_'));
