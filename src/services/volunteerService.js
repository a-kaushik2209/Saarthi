import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  where,
  getDoc
} from 'firebase/firestore';


const volunteersCollection = collection(db, 'volunteers');
const donationsCollection = collection(db, 'donations');


export const registerVolunteer = async (volunteerData) => {
  try {
    const docRef = await addDoc(volunteersCollection, {
      ...volunteerData,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Create a volunteer (used by VolunteerSignup component)
export const createVolunteer = async (volunteerData) => {
  try {
    // Check if volunteer with this userId already exists
    if (volunteerData.userId) {
      const existingVolunteer = await getVolunteerByUserId(volunteerData.userId);
      if (existingVolunteer) {
        throw new Error('You are already registered as a volunteer');
      }
    }
    
    // Add the volunteer to Firestore
    const docRef = await addDoc(volunteersCollection, {
      ...volunteerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...volunteerData
    };
  } catch (error) {
    console.error('Error creating volunteer:', error);
    throw error;
  }
};

// Get all volunteers
export const getAllVolunteers = async () => {
  try {
    const q = query(volunteersCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Get volunteer by user ID
export const getVolunteerByUserId = async (userId) => {
  try {
    const q = query(
      volunteersCollection, 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Update volunteer status
export const updateVolunteerStatus = async (volunteerId, newStatus) => {
  try {
    const volunteerRef = doc(db, 'volunteers', volunteerId);
    await updateDoc(volunteerRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Add a donation
export const addDonation = async (donationData) => {
  try {
    const docRef = await addDoc(donationsCollection, {
      ...donationData,
      status: 'received',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Get all donations
export const getAllDonations = async () => {
  try {
    const q = query(donationsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Get donations by user ID
export const getUserDonations = async (userId) => {
  try {
    const q = query(
      donationsCollection, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Subscribe to real-time updates for volunteers
export const subscribeToVolunteers = (callback) => {
  const q = query(volunteersCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const volunteers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(volunteers);
  });
};

// Subscribe to real-time updates for donations
export const subscribeToDonations = (callback) => {
  const q = query(donationsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const donations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(donations);
  });
};
