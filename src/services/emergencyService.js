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


const emergenciesCollection = collection(db, 'emergencies');


export const addEmergencyReport = async (reportData) => {
  try {
    const docRef = await addDoc(emergenciesCollection, {
      ...reportData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding emergency report:', error);
    throw error;
  }
};


export const getEmergencyReports = async () => {
  try {
    const q = query(emergenciesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Get emergency reports by user ID
export const getUserEmergencyReports = async (userId) => {
  try {
    const q = query(
      emergenciesCollection, 
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

// Update emergency report status
export const updateEmergencyStatus = async (reportId, newStatus) => {
  try {
    const reportRef = doc(db, 'emergencies', reportId);
    await updateDoc(reportRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Get a single emergency report by ID
export const getEmergencyById = async (reportId) => {
  try {
    const reportRef = doc(db, 'emergencies', reportId);
    const reportDoc = await getDoc(reportRef);
    
    if (reportDoc.exists()) {
      return {
        id: reportDoc.id,
        ...reportDoc.data()
      };
    } else {
      throw new Error('Emergency report not found');
    }
  } catch (error) {
    throw error;
  }
};

// Subscribe to real-time updates for all emergency reports
export const subscribeToEmergencies = (callback) => {
  const q = query(emergenciesCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const emergencies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(emergencies);
  });
};

// Subscribe to real-time updates for a specific emergency report
export const subscribeToEmergency = (reportId, callback) => {
  const reportRef = doc(db, 'emergencies', reportId);
  return onSnapshot(reportRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data()
      });
    } else {
      callback(null);
    }
  });
};
