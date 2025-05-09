import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';


export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    
    await updateProfile(user, { displayName });
    
    
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      createdAt: new Date(),
      contributions: [],
      reports: []
    });
    
    return user;
  } catch (error) {
    throw error;
  }
};


export const loginUser = async (email, password) => {
  try {
    // Ensure we're using session persistence for this login
    await setPersistence(auth, browserSessionPersistence);
    
    // Then sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in with session persistence');
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};


export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};


export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    throw error;
  }
};


export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
