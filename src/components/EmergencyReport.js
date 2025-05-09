import React, { useState, useEffect } from 'react';
import { addEmergencyReport } from '../services/emergencyService';
import { getHighAccuracyPosition, getAddressFromCoords, getCachedGeocodingResult } from '../services/locationService';

function EmergencyReport({ setPage, profile }) {
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [autoLoc, setAutoLoc] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');


  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
    const detectLocation = async () => {
      setLocLoading(true);
      try {

        const position = await getHighAccuracyPosition();
        const lat = position.latitude;
        const lng = position.longitude;
        

        const coordsString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        

        let addressData = await getCachedGeocodingResult(lat, lng);
        

        if (!addressData) {
          addressData = await getAddressFromCoords(lat, lng);
        }
        
        if (addressData) {
          setLocation(addressData.formattedAddress);
          setLocationData(addressData);
          

          console.log(`Location detected with confidence: ${addressData.confidence}/10`);
          if (addressData.cached) {
            console.log('Using cached location data');
          }
        } else {
          setLocation(coordsString);
        }
        
        setAutoLoc(true);
      } catch (error) {
        console.error('Error detecting location:', error);
        setLocError(
          error.code === 1 
            ? 'Location access denied. Please enable location services or enter manually.' 
            : 'Could not detect location. Please enter manually.'
        );
      } finally {
        setLocLoading(false);
      }
    };
    
    detectLocation();
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      if (!location || !desc) {
        throw new Error('Please provide both location and description');
      }
      
      // Create emergency report data with enhanced location information
      const reportData = {
        location,
        description: desc,
        userId: profile ? profile.uid : 'anonymous',
        userName: profile ? profile.displayName : 'Anonymous User',
        severity: 'high', // Default severity
        type: 'general', // Default type
        status: 'pending',
        autoDetectedLocation: autoLoc,
        // Add detailed location data if available
        locationDetails: locationData ? {
          coordinates: locationData.coords,
          components: locationData.components,
          confidence: locationData.confidence
        } : null,
        createdAt: new Date()
      };
      
      // Add to Firebase
      await addEmergencyReport(reportData);
      
      // Show success message
      setSubmitted(true);
      
      // Redirect after delay
      setTimeout(() => setPage('landing'), 2000);
    } catch (error) {
      console.error('Error submitting emergency report:', error);
      setError(error.message || 'Failed to submit emergency report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card fade-in">
      <h2 style={{ textAlign: 'center' }}>Report Emergency</h2>
      {submitted ? (
        <div style={{ textAlign: 'center', margin: '2rem 0', animation: 'scaleIn 0.5s' }}>
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
            animation: 'pulse 1.5s infinite'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: 24, marginTop: 20 }}>Alert Sent Successfully!</div>
          <div style={{ color: '#aaa', fontSize: 16, marginTop: 10, maxWidth: '80%', margin: '10px auto' }}>Emergency services have been notified and help is on the way to your location.</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px',
            marginTop: '20px',
            background: '#252525',
            padding: '12px 20px',
            borderRadius: '8px',
            maxWidth: 'fit-content',
            margin: '20px auto'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Estimated arrival time: 8-10 minutes</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Location:
            </label>
            <div style={{ 
              position: 'relative',
              marginTop: '8px'
            }}>
              <input
                type="text"
                value={location}
                onChange={e => {
                  setLocation(e.target.value);
                  setAutoLoc(false);
                  setLocationData(null); // Clear detailed location data when manually editing
                }}
                placeholder="Enter location"
                required
                style={{
                  paddingLeft: autoLoc ? '35px' : '12px',
                  transition: 'all 0.3s',
                  borderColor: autoLoc ? 'var(--primary)' : '#444',
                  boxShadow: autoLoc ? '0 0 0 1px var(--primary)' : 'none'
                }}
              />
              {autoLoc && (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="var(--primary)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 8v4l2 2"></path>
                </svg>
              )}
            </div>
            {locLoading && (
              <div style={{ 
                fontSize: 14, 
                color: '#aaa', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                marginTop: '8px'
              }}>
                <svg className="rotate" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                Detecting your location...
              </div>
            )}
            {locError && <div style={{ fontSize: 14, color: '#e53935', marginTop: '8px' }}>{locError}</div>}
            {autoLoc && (
              <div style={{ fontSize: 14, color: 'var(--primary)', marginTop: '8px' }}>
                ✓ Address detected automatically
                {locationData && locationData.confidence && (
                  <span style={{ marginLeft: '5px', fontSize: '12px', color: '#aaa' }}>
                    (Accuracy: {locationData.confidence}/10)
                  </span>
                )}
              </div>
            )}
            {autoLoc && locationData && locationData.components && (
              <div style={{ fontSize: 12, color: '#aaa', marginTop: '4px' }}>
                {locationData.components.neighbourhood && `${locationData.components.neighbourhood}, `}
                {locationData.components.city || locationData.components.state_district || ''}
                {locationData.components.postcode && ` - ${locationData.components.postcode}`}
              </div>
            )}
          </div>
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Description:
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Describe the emergency situation in detail"
              required
              style={{ 
                marginTop: '8px',
                minHeight: '120px',
                transition: 'all 0.3s',
                borderColor: desc ? 'var(--primary)' : '#444',
                boxShadow: desc ? '0 0 0 1px var(--primary)' : 'none'
              }}
            />  
          </div>
          {error && (
            <div style={{ 
              color: '#e53935', 
              marginBottom: '15px', 
              background: 'rgba(229, 57, 53, 0.1)', 
              padding: '10px', 
              borderRadius: '4px',
              border: '1px solid rgba(229, 57, 53, 0.3)'
            }}>
              {error}
            </div>
          )}
          <button 
            type="submit" 
            disabled={submitting}
            style={{ 
              width: '100%', 
              fontWeight: 700, 
              fontSize: 18,
              background: 'var(--primary)',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              color: '#000',
              cursor: submitting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(255, 153, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              opacity: submitting ? 0.7 : 1
            }}
            className="glow-hover"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13"></path>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
            </svg>
            Send Emergency Alert
          </button>
        </form>
      )}
    </div>
  );
}

export default EmergencyReport;
