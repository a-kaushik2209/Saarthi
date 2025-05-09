import React, { useState, useEffect } from 'react';
import { createVolunteer } from '../services/volunteerService';
import { auth } from '../firebase';
import { getHighAccuracyPosition, getAddressFromCoords } from '../services/locationService';

function VolunteerSignup({ setPage, profile }) {
  const [name, setName] = useState(profile?.displayName || '');
  const [type, setType] = useState('volunteer');
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState(null);
  const [phone, setPhone] = useState('');
  const [availability, setAvailability] = useState('weekends');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);


  useEffect(() => {
    if (profile?.location) {
      setLocation(profile.location);
    }
  }, [profile]);


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
    
    try {
      const id = generateId();
      const userId = auth.currentUser ? auth.currentUser.uid : null;
      
      if (!userId) {
        throw new Error('You must be logged in to register as a volunteer. Please sign up or log in first.');
      }
      
      if (!name || !location) {
        throw new Error('Please provide your name and location');
      }
      

      await createVolunteer({
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
        createdAt: new Date()
      });
      
      setSubmitted(true);

      setTimeout(() => setPage('landing'), 1500);
    } catch (error) {
      console.error('Error registering volunteer:', error);
      
      if (error.message.includes('must be logged in')) {

        setError(error.message);
        setTimeout(() => setPage('login'), 3000);
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
      {submitted ? (
        <div style={{ color: '#43a047', fontWeight: 'bold', fontSize: 20, textAlign: 'center', margin: '2rem 0', animation: 'fadeIn 1.2s' }}>
          Thank you for joining Saarthi!
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
              onChange={e => setPhone(e.target.value)} 
              required 
              style={{ marginTop: 4 }} 
              placeholder="Your contact number"
              disabled={loading}
            />
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
