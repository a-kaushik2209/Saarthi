import React, { useState, useEffect } from 'react';
import { createVolunteer, getVolunteerByUserId } from '../services/volunteerService';
import { auth, db } from '../firebase';
import { getHighAccuracyPosition, getAddressFromCoords } from '../services/locationService';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

function VolunteerSignup({ setPage, profile }) {
  const [name, setName] = useState(profile?.displayName || '');
  const [type, setType] = useState('volunteer');
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [availability, setAvailability] = useState('weekends');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);


  // Use a ref to track if we've already checked volunteer status
  const [statusChecked, setStatusChecked] = useState(false);

  useEffect(() => {
    if (profile?.location) {
      setLocation(profile.location);
    }
    
    // Only check volunteer status once when component mounts
    if (!statusChecked) {
      const checkVolunteerStatus = async () => {
        setCheckingStatus(true);
        try {
          if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            console.log('Checking volunteer status for user:', userId);
            const existingVolunteer = await getVolunteerByUserId(userId);
            if (existingVolunteer) {
              setAlreadyRegistered(true);
            }
          }
        } catch (error) {
          console.error('Error checking volunteer status:', error);
        } finally {
          setCheckingStatus(false);
          setStatusChecked(true); // Mark as checked
        }
      };
      
      checkVolunteerStatus();
    }
  }, [profile, statusChecked]);


  const detectLocation = async () => {
    setDetectingLocation(true);
    setError('');
    
    try {
      const position = await getHighAccuracyPosition();
      const coords = {
        lat: position.latitude,
        lng: position.longitude
      };
      setLocationCoords(coords);
      

      const addressInfo = await getAddressFromCoords(coords.lat, coords.lng);
      setLocation(addressInfo.formattedAddress);
    } catch (err) {
      console.error('Error detecting location:', err);
      setError('Could not detect your location. Please enter it manually.');
    } finally {
      setDetectingLocation(false);
    }
  };

  function generateId() {
    return 'V' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPhoneError('');
    
    try {
      const id = generateId();
      const userId = auth.currentUser ? auth.currentUser.uid : null;
      
      if (!userId) {
        throw new Error('You must be logged in to register as a volunteer. Please sign up or log in first.');
      }
      
      if (!name || !location) {
        throw new Error('Please provide your name and location');
      }
      
      // Validate phone number
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        setPhoneError('Please enter a valid 10-digit phone number');
        throw new Error('Please enter a valid 10-digit phone number');
      }
      
      // We'll skip the redundant check in the component since we've already checked once
      // and the service will check again

      const volunteerData = {
        id,
        name,
        type,
        skills: skills.length > 0 ? skills : [type],
        location,
        locationDetails: locationCoords ? {
          coordinates: locationCoords,
          formattedAddress: location
        } : null,
        phone,
        availability,
        status: 'active',
        userId,
        createdAt: new Date(),
        // Add flags for the optimized service function
        skipExistingCheck: false, // Still check for existing volunteer
        updateUserProfile: true    // Update user profile in the same function call
      };
      
      console.log('Creating volunteer with data:', { ...volunteerData, userId: 'REDACTED' });
      
      // Create volunteer record and update user profile in one service call
      const result = await createVolunteer(volunteerData);
      console.log('Volunteer created successfully');
      
      // No need for separate user profile update - it's handled in the service
      
      setSubmitted(true);

      // Give more time to see the success animation
      setTimeout(() => setPage('landing'), 2500);
    } catch (error) {
      console.error('Error registering volunteer:', error);
      
      if (error.message.includes('must be logged in')) {
        setError(error.message);
        setTimeout(() => setPage('login'), 3000);
      } else if (error.message.includes('already registered')) {
        // Don't show error message for already registered - we show a different UI
        setAlreadyRegistered(true);
      } else {
        setError(error.message || 'Failed to register. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in">
      <h2 style={{ textAlign: 'center' }}>Volunteer / Donor Signup</h2>
      {checkingStatus ? (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,153,0,0.3)', borderRadius: '50%', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: '#aaa' }}>Checking registration status...</p>
        </div>
      ) : alreadyRegistered ? (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <div style={{ 
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            fontSize: '40px'
          }}>
            ✓
          </div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>You're Already Registered!</h3>
          <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>You have already registered as a volunteer/donor with Saarthi.</p>
          <button 
            onClick={() => setPage('landing')} 
            style={{ 
              background: 'var(--primary)',
              color: 'black',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Return to Dashboard
          </button>
        </div>
      ) : submitted ? (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <div style={{ 
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 0 30px rgba(255, 153, 0, 0.5)',
            animation: 'pulse 1.5s infinite, scaleIn 0.5s'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3 style={{ color: 'var(--primary)', marginTop: '1.5rem', animation: 'fadeIn 0.5s' }}>Thank you for joining Saarthi!</h3>
          <p style={{ color: '#aaa', marginTop: '0.5rem', animation: 'fadeIn 0.5s 0.2s both' }}>Your registration has been successfully recorded.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Name:</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              style={{ marginTop: 4 }} 
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Role:</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value)} 
              style={{ marginTop: 4 }}
              disabled={loading}
            >
              <option value="volunteer">Volunteer</option>
              <option value="donor">Donor (Money)</option>
              <option value="donor-clothes">Donor (Clothes)</option>
              <option value="donor-food">Donor (Food)</option>
            </select>
          </div>
          
          {type === 'volunteer' && (
            <div style={{ marginBottom: '1.3rem' }}>
              <label style={{ fontWeight: 500 }}>Skills (select multiple):</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: 4 }}>
                {['Medical', 'Transport', 'Rescue', 'Food Distribution', 'Construction'].map(skill => (
                  <div key={skill} style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id={`skill-${skill}`}
                      checked={skills.includes(skill)}
                      onChange={() => {
                        if (skills.includes(skill)) {
                          setSkills(skills.filter(s => s !== skill));
                        } else {
                          setSkills([...skills, skill]);
                        }
                      }}
                      disabled={loading}
                    />
                    <label htmlFor={`skill-${skill}`} style={{ marginLeft: '5px' }}>{skill}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Location:</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                required 
                style={{ marginTop: 4, flex: 1 }} 
                placeholder="City, Area"
                disabled={loading || detectingLocation}
              />
              <button 
                type="button" 
                onClick={detectLocation}
                disabled={loading || detectingLocation}
                style={{ 
                  padding: '8px 10px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: detectingLocation ? 'wait' : 'pointer',
                  opacity: detectingLocation ? 0.7 : 1,
                  fontSize: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                {detectingLocation ? 'Detecting...' : 'Auto-detect'}
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Phone Number:</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={e => {
                // Only allow digits
                const value = e.target.value.replace(/[^0-9]/g, '');
                setPhone(value);
                setPhoneError('');
              }} 
              required 
              style={{ 
                marginTop: 4,
                borderColor: phoneError ? '#e53935' : undefined
              }} 
              placeholder="10-digit phone number"
              disabled={loading}
              maxLength={10}
              pattern="[0-9]{10}"
            />
            {phoneError && (
              <div style={{ color: '#e53935', fontSize: '12px', marginTop: '4px' }}>
                {phoneError}
              </div>
            )}
          </div>
          
          {type === 'volunteer' && (
            <div style={{ marginBottom: '1.3rem' }}>
              <label style={{ fontWeight: 500 }}>Availability:</label>
              <select 
                value={availability} 
                onChange={e => setAvailability(e.target.value)} 
                style={{ marginTop: 4 }}
                disabled={loading}
              >
                <option value="weekends">Weekends Only</option>
                <option value="evenings">Weekday Evenings</option>
                <option value="fulltime">Full-time</option>
                <option value="oncall">On-call (Emergency)</option>
              </select>
            </div>
          )}
          
          {error && (
            <div style={{ color: '#e53935', marginBottom: '1rem', fontSize: '14px' }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              fontWeight: 700, 
              fontSize: 18,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
      )}
    </div>
  );
}

export default VolunteerSignup;
