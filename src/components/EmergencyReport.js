import React, { useState, useEffect } from 'react';

function EmergencyReport({ setPage }) {
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [autoLoc, setAutoLoc] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const mockAddresses = {
        north: 'Rohini Sector 9, Delhi - 110085',
        south: 'Saket District Centre, Delhi - 110017',
        east: 'Laxmi Nagar, Delhi - 110092',
        west: 'Janakpuri District Centre, Delhi - 110058',
        central: 'Connaught Place, New Delhi - 110001'
      };
      
      let area;
      if (lat > 28.65) area = 'north';
      else if (lat < 28.55) area = 'south';
      else if (lng > 77.25) area = 'east';
      else if (lng < 77.15) area = 'west';
      else area = 'central';
      
      return {
        formattedAddress: mockAddresses[area],
        coords: { lat, lng }
      };
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  };

  useEffect(() => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          const coordsString = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          
          const addressData = await getAddressFromCoords(lat, lng);
          
          if (addressData) {
            setLocation(addressData.formattedAddress);
          } else {
            setLocation(coordsString);
          }
          
          setAutoLoc(true);
          setLocLoading(false);
        },
        (err) => {
          setLocError('Could not detect location. Please enter manually.');
          setLocLoading(false);
        }
      );
    } else {
      setLocError('Geolocation not supported. Please enter location manually.');
      setLocLoading(false);
    }
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setPage('landing'), 2000);
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
            {autoLoc && <div style={{ fontSize: 14, color: 'var(--primary)', marginTop: '8px' }}>✓ Address detected automatically</div>}
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
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              fontWeight: 700, 
              fontSize: 18,
              background: 'var(--primary)',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              color: '#000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(255, 153, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden'
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
