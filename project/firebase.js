const firebaseConfig = {
  apiKey: "AIzaSyA5FDinimLqrcN-BCNwRrI2T3gEx8i7NFY",
  authDomain: "accounting-program-f1c8e.firebaseapp.com",
  projectId: "accounting-program-f1c8e",
  storageBucket: "accounting-program-f1c8e.firebasestorage.app",
  messagingSenderId: "74226814921",
  appId: "1:74226814921:web:b6e56f20586f556b04e218"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
window.auth = firebase.auth();
window.googleProvider = new firebase.auth.GoogleAuthProvider();
