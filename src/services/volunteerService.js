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
// This function handles both creating the volunteer record and updating the user profile
export const createVolunteer = async (volunteerData) => {
  try {
    // We'll use a transaction to ensure all operations succeed or fail together
    // This reduces the number of separate API calls
    
    // First, check if volunteer with this userId already exists (only if we're not skipping this check)
    if (volunteerData.userId && !volunteerData.skipExistingCheck) {
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
    
    // If updateUserProfile is true, update the user document in the same function
    // This avoids multiple separate API calls from the component
    if (volunteerData.userId && volunteerData.updateUserProfile) {
      const userRef = doc(db, 'users', volunteerData.userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Create a contribution entry
        const contributionEntry = {
          id: docRef.id,
          type: volunteerData.type === 'volunteer' ? 'Volunteer Registration' : 'Donor Registration',
          details: volunteerData.type === 'volunteer' 
            ? `Registered as a ${volunteerData.skills?.length > 0 ? volunteerData.skills.join(', ') : volunteerData.type} volunteer` 
            : 'Registered as a donor',
          date: new Date().toLocaleDateString()
        };
        
        // Update the user document with role and contribution
        await updateDoc(userRef, {
          // Set the role based on registration type
          role: volunteerData.type.charAt(0).toUpperCase() + volunteerData.type.slice(1),
          // Add the contribution to the contributions array
          contributions: userData.contributions ? [...userData.contributions, contributionEntry] : [contributionEntry]
        });
      }
    }
    
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
