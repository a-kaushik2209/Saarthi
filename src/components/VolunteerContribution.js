import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getVolunteerByUserId } from '../services/volunteerService';

function VolunteerContribution({ setPage, profile }) {
  const [contributionType, setContributionType] = useState('emergency_response');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [locationError, setLocationError] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [durationError, setDurationError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [volunteerInfo, setVolunteerInfo] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {

    const checkVolunteerStatus = async () => {
      setCheckingStatus(true);
      try {
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          const existingVolunteer = await getVolunteerByUserId(userId);
          if (existingVolunteer) {
            setVolunteerInfo(existingVolunteer);
          }
        }
      } catch (error) {
        console.error('Error checking volunteer status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };
    
    checkVolunteerStatus();
    

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLocationError('');
    setDurationError('');
    
    try {
      const userId = auth.currentUser ? auth.currentUser.uid : null;
      
      if (!userId) {
        throw new Error('You must be logged in to record a contribution.');
      }
      
      if (!description || !location || !date) {
        throw new Error('Please provide all required information');
      }
      
      // Validate location (should not be only numbers)
      if (/^[0-9\s]+$/.test(location)) {
        setLocationError('Please enter a valid location name');
        throw new Error('Please enter a valid location name');
      }
      
      // Validate duration if provided
      if (duration) {
        // Duration should contain numbers and valid time units
        const durationRegex = /^\s*\d+\s*(hour|hours|hr|hrs|day|days|week|weeks|month|months|min|mins|minutes)\s*$/i;
        if (!durationRegex.test(duration)) {
          setDurationError('Please enter a valid duration (e.g., "3 hours", "2 days")');
          throw new Error('Please enter a valid duration format');
        }
      }
      
      // Get contribution type display name
      const contributionTypeDisplay = getContributionTypeDisplay(contributionType);
      
      // Create a contribution entry
      const contributionEntry = {
        id: `C${Date.now().toString(36)}`,
        type: contributionTypeDisplay,
        details: description,
        location: location,
        date: new Date(date).toLocaleDateString(),
        duration: duration,
        createdAt: new Date()
      };
      
      // Update user's profile with contribution
      const userRef = doc(db, 'users', userId);
      
      // Get current user document
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      // Update the user document with contribution
      await updateDoc(userRef, {
        // Add the contribution to the contributions array
        contributions: userData.contributions ? arrayUnion(contributionEntry) : [contributionEntry]
      });
      
      setSubmitted(true);

      // Give time to see the success animation
      setTimeout(() => setPage('profile'), 2500);
    } catch (error) {
      console.error('Error recording contribution:', error);
      setError(error.message || 'Failed to record contribution. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getContributionTypeDisplay = (type) => {
    const types = {
      'emergency_response': 'Emergency Response',
      'food_distribution': 'Food Distribution',
      'medical_support': 'Medical Support',
      'shelter_management': 'Shelter Management',
      'transport': 'Transportation',
      'search_rescue': 'Search & Rescue',
      'other': 'Other Volunteer Work'
    };
    return types[type] || 'Volunteer Contribution';
  };

  if (checkingStatus) {
    return (
      <div className="card fade-in">
        <h2 style={{ textAlign: 'center' }}>Record Volunteer Contribution</h2>
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,153,0,0.3)', borderRadius: '50%', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: '#aaa' }}>Checking volunteer status...</p>
        </div>
      </div>
    );
  }
  
  if (!volunteerInfo) {
    return (
      <div className="card fade-in">
        <h2 style={{ textAlign: 'center' }}>Record Volunteer Contribution</h2>
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <div style={{ 
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#252525',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            fontSize: '40px'
          }}>
            ⚠️
          </div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Not Registered as Volunteer</h3>
          <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>You need to register as a volunteer before recording contributions.</p>
          <button 
            onClick={() => setPage('volunteer')} 
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
            Register as Volunteer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <h2 style={{ textAlign: 'center' }}>Record Volunteer Contribution</h2>
      {submitted ? (
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
          <h3 style={{ color: 'var(--primary)', marginTop: '1.5rem', animation: 'fadeIn 0.5s' }}>Contribution Recorded!</h3>
          <p style={{ color: '#aaa', marginTop: '0.5rem', animation: 'fadeIn 0.5s 0.2s both' }}>Thank you for your service to the community.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Contribution Type:</label>
            <select 
              value={contributionType} 
              onChange={e => setContributionType(e.target.value)} 
              style={{ marginTop: 4 }}
              disabled={loading}
            >
              <option value="emergency_response">Emergency Response</option>
              <option value="food_distribution">Food Distribution</option>
              <option value="medical_support">Medical Support</option>
              <option value="shelter_management">Shelter Management</option>
              <option value="transport">Transportation</option>
              <option value="search_rescue">Search & Rescue</option>
              <option value="other">Other Volunteer Work</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Description:</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
              style={{ marginTop: 4, minHeight: '80px' }} 
              placeholder="Describe your contribution"
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Location:</label>
            <input 
              type="text" 
              value={location} 
              onChange={e => {
                setLocation(e.target.value);
                setLocationError('');
              }} 
              required 
              style={{ 
                marginTop: 4,
                borderColor: locationError ? '#e53935' : undefined
              }} 
              placeholder="Where did you volunteer?"
              disabled={loading}
            />
            {locationError && (
              <div style={{ color: '#e53935', fontSize: '12px', marginTop: '4px' }}>
                {locationError}
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Date:</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              required 
              style={{ marginTop: 4 }} 
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 500 }}>Duration (optional):</label>
            <input 
              type="text" 
              value={duration} 
              onChange={e => {
                setDuration(e.target.value);
                setDurationError('');
              }} 
              style={{ 
                marginTop: 4,
                borderColor: durationError ? '#e53935' : undefined
              }} 
              placeholder="e.g. 3 hours, 2 days"
              disabled={loading}
            />
            {durationError && (
              <div style={{ color: '#e53935', fontSize: '12px', marginTop: '4px' }}>
                {durationError}
              </div>
            )}
          </div>
          
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
              cursor: loading ? 'wait' : 'pointer',
              background: 'var(--primary)',
              color: 'black',
              border: 'none',
              padding: '12px',
              borderRadius: '8px'
            }}
            disabled={loading}
          >
            {loading ? 'Recording...' : 'Record Contribution'}
          </button>
        </form>
      )}
    </div>
  );
}

export default VolunteerContribution;
