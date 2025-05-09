import { db } from '../firebase';
import { doc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';


const OPENCAGE_API_KEY = '3366a9930d2241e1b21342805b9027bf';


export const getAddressFromCoords = async (lat, lng) => {
  try {

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}&language=en&pretty=1`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      

      const { components, formatted } = result;
      

      await storeGeocodingResult(lat, lng, result);
      
      return {
        formattedAddress: formatted,
        components,
        coords: { lat, lng },
        confidence: result.confidence
      };
    } else {

      return getFallbackAddress(lat, lng);
    }
  } catch (error) {
    console.error('Error in geocoding:', error);

    return getFallbackAddress(lat, lng);
  }
};


export const getFallbackAddress = (lat, lng) => {

  const delhiAreas = [
    { name: 'Rohini', lat: 28.7041, lng: 77.1025, radius: 0.05, pincode: '110085' },
    { name: 'Saket', lat: 28.5214, lng: 77.2159, radius: 0.04, pincode: '110017' },
    { name: 'Laxmi Nagar', lat: 28.6304, lng: 77.2812, radius: 0.03, pincode: '110092' },
    { name: 'Janakpuri', lat: 28.6289, lng: 77.0817, radius: 0.04, pincode: '110058' },
    { name: 'Connaught Place', lat: 28.6139, lng: 77.2090, radius: 0.02, pincode: '110001' },
    { name: 'Dwarka', lat: 28.5823, lng: 77.0549, radius: 0.06, pincode: '110075' },
    { name: 'Vasant Kunj', lat: 28.5399, lng: 77.1538, radius: 0.05, pincode: '110070' },
    { name: 'Nehru Place', lat: 28.5535, lng: 77.2588, radius: 0.03, pincode: '110019' },
    { name: 'ITO', lat: 28.6304, lng: 77.2177, radius: 0.02, pincode: '110002' },
    { name: 'Yamuna Bank', lat: 28.6253, lng: 77.2731, radius: 0.04, pincode: '110092' },
    { name: 'Noida Sector 15', lat: 28.5355, lng: 77.3910, radius: 0.05, pincode: '201301' },
    { name: 'Faridabad', lat: 28.4089, lng: 77.3178, radius: 0.08, pincode: '121001' }
  ];
  

  let closestArea = null;
  let minDistance = Number.MAX_VALUE;
  
  delhiAreas.forEach(area => {
    const distance = calculateDistance(lat, lng, area.lat, area.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestArea = area;
    }
  });
  

  if (closestArea && minDistance <= closestArea.radius) {
    return {
      formattedAddress: `${closestArea.name}, Delhi - ${closestArea.pincode}`,
      components: {
        neighbourhood: closestArea.name,
        city: 'Delhi',
        postcode: closestArea.pincode,
        country: 'India'
      },
      coords: { lat, lng },
      confidence: 7
    };
  }
  

  return {
    formattedAddress: `Delhi, India (Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)})`,
    components: {
      city: 'Delhi',
      country: 'India'
    },
    coords: { lat, lng },
    confidence: 5
  };
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Store geocoding result in Firestore for future reference
const storeGeocodingResult = async (lat, lng, result) => {
  try {
    const locationRef = doc(db, 'geocoding_cache', `${lat.toFixed(5)}_${lng.toFixed(5)}`);
    await setDoc(locationRef, {
      latitude: lat,
      longitude: lng,
      formattedAddress: result.formatted,
      components: result.components,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error storing geocoding result:', error);
  }
};

// Get cached geocoding result if available
export const getCachedGeocodingResult = async (lat, lng) => {
  try {
    const locationQuery = query(
      collection(db, 'geocoding_cache'),
      where('latitude', '>=', lat - 0.0001),
      where('latitude', '<=', lat + 0.0001),
      orderBy('latitude')
    );
    
    const querySnapshot = await getDocs(locationQuery);
    
    // Filter results to find closest match
    let closestResult = null;
    let minDistance = Number.MAX_VALUE;
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const distance = calculateDistance(lat, lng, data.latitude, data.longitude);
      if (distance < minDistance && distance < 0.05) { // Within 50 meters
        minDistance = distance;
        closestResult = data;
      }
    });
    
    if (closestResult) {
      return {
        formattedAddress: closestResult.formattedAddress,
        components: closestResult.components,
        coords: { lat, lng },
        confidence: 9, // High confidence for cached results
        cached: true
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached geocoding result:', error);
    return null;
  }
};

// Get high-accuracy position using browser geolocation
export const getHighAccuracyPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};
