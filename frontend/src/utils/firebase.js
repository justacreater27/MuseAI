import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut,
         createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDOjV4YPjdKWz7RFQJpxN0-Lw5riEYboi4",
  authDomain: "museai-ec37f.firebaseapp.com",
  projectId:"museai-ec37f",
  storageBucket: "museai-ec37f.firebasestorage.app",
  messagingSenderId: "432438648758",
  appId: "1:432438648758:web:f2b34eda9eefb4773c6b17"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const signUpEmail = (email, pass) => createUserWithEmailAndPassword(auth, email, pass)
export const signInEmail = (email, pass) => signInWithEmailAndPassword(auth, email, pass)
export const logOut = () => signOut(auth)