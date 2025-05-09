import React, { useState, useEffect } from 'react';
import { calculateDistance } from '../services/locationService';
import GoogleMapView from './GoogleMapView';


const areaCoordinates = {
  'Connaught Place': { lat: 28.6139, lng: 77.209, position: { top: '35%', left: '50%' } },
  'Rohini': { lat: 28.7041, lng: 77.1025, position: { top: '20%', left: '30%' } },
  'Noida': { lat: 28.5355, lng: 77.391, position: { top: '60%', left: '70%' } },
  'Old India': { lat: 28.4089, lng: 77.3178, position: { top: '70%', left: '35%' } },
  'ITO': { lat: 28.6304, lng: 77.2177, position: { top: '40%', left: '55%' } },
  'Nehru Place': { lat: 28.5535, lng: 77.2588, position: { top: '50%', left: '65%' } },
  'Yamuna Bank': { lat: 28.6253, lng: 77.2731, position: { top: '45%', left: '60%' } },
  'Dwarka': { lat: 28.5823, lng: 77.0549, position: { top: '55%', left: '25%' } },
  'Saket': { lat: 28.5214, lng: 77.2159, position: { top: '65%', left: '45%' } },
  'Vasant Kunj': { lat: 28.5399, lng: 77.1538, position: { top: '60%', left: '40%' } },
  'Laxmi Nagar': { lat: 28.6304, lng: 77.2812, position: { top: '42%', left: '62%' } },
  'Janakpuri': { lat: 28.6289, lng: 77.0817, position: { top: '38%', left: '28%' } },
  'Faridabad': { lat: 28.4089, lng: 77.3178, position: { top: '75%', left: '58%' } },
  'Default': { lat: 28.6139, lng: 77.209, position: { top: '50%', left: '50%' } }
};


const componentToArea = {
  'rohini': 'Rohini',
  'saket': 'Saket',
  'laxmi nagar': 'Laxmi Nagar',
  'janakpuri': 'Janakpuri',
  'connaught place': 'Connaught Place',
  'dwarka': 'Dwarka',
  'vasant kunj': 'Vasant Kunj',
  'nehru place': 'Nehru Place',
  'ito': 'ITO',
  'yamuna bank': 'Yamuna Bank',
  'noida': 'Noida',
  'faridabad': 'Faridabad',
  'old india': 'Old India'
};

function getColorClass(severity) {
  if (severity === 'high') return 'priority-high';
  if (severity === 'mid' || severity === 'medium') return 'priority-mid';
  return 'priority-low';
}


function getEmergencyIcon(type) {
  switch(type) {
    case 'fire':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
      );
    case 'flood':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 16.5a6 6 0 0 0 12 0"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="M6 16h.01"></path>
          <path d="M18 16h.01"></path>
          <path d="M10 8l-2 2"></path>
          <path d="M14 8l2 2"></path>
          <path d="M12 2v4"></path>
        </svg>
      );
    case 'medical':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2h8"></path>
          <path d="M9 2v4"></path>
          <path d="M15 2v4"></path>
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
          <path d="M10 11h4"></path>
          <path d="M12 9v4"></path>
        </svg>
      );
    case 'accident':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
          <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
          <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5"></path>
        </svg>
      );
    case 'crime':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1v22"></path>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      );
    case 'structural':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18"></path>
          <path d="M9 8h1"></path>
          <path d="M9 12h1"></path>
          <path d="M9 16h1"></path>
          <path d="M14 8h1"></path>
          <path d="M14 12h1"></path>
          <path d="M14 16h1"></path>
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <path d="M12 9v4"></path>
          <path d="M12 17h.01"></path>
        </svg>
      );
  }
}


function getPositionForLocation(emergency) {

  if (emergency.locationDetails && emergency.locationDetails.coordinates) {
    const { lat, lng } = emergency.locationDetails.coordinates;
    

    if (emergency.locationDetails.components) {
      const components = emergency.locationDetails.components;
      

      const neighborhood = components.neighbourhood || components.suburb || '';
      const neighborhoodLower = neighborhood.toLowerCase();
      

      for (const [key, value] of Object.entries(componentToArea)) {
        if (neighborhoodLower.includes(key)) {
          return {
            ...areaCoordinates[value],
            area: value,
            precision: 'high'
          };
        }
      }
      

      let closestArea = null;
      let minDistance = Number.MAX_VALUE;
      
      Object.entries(areaCoordinates).forEach(([areaName, areaData]) => {
        if (areaName !== 'Default') {
          const distance = calculateDistance(lat, lng, areaData.lat, areaData.lng);
          if (distance < minDistance) {
            minDistance = distance;
            closestArea = { name: areaName, data: areaData };
          }
        }
      });
      
      if (closestArea && minDistance < 5) { // Within 5km
        return {
          ...closestArea.data,
          area: closestArea.name,
          precision: 'medium',
          distance: minDistance.toFixed(2)
        };
      }
    }
  }
  

  const location = emergency.location || '';
  const areaNames = Object.keys(areaCoordinates);
  const matchedArea = areaNames.find(area => 
    location && location.toLowerCase().includes(area.toLowerCase())
  );
  
  if (matchedArea) {
    return {
      ...areaCoordinates[matchedArea],
      area: matchedArea,
      precision: 'low'
    };
  }
  

  return {
    ...areaCoordinates['Default'],
    area: location && location.split(',')[0] || 'Unknown Location',
    precision: 'unknown'
  };
}

function PriorityMap({ emergencies = [] }) {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [alerts, setAlerts] = useState([]);
  

  useEffect(() => {
    try {
      if (emergencies && emergencies.length > 0) {
        const processedAlerts = emergencies.map((emergency, index) => {
          try {

            const locationData = getPositionForLocation(emergency);
            

            let reportedTime = 'Unknown';
            if (emergency.createdAt) {

              const date = emergency.createdAt.toDate ? 
                emergency.createdAt.toDate() : 
                new Date(emergency.createdAt);
              reportedTime = date.toLocaleString();
            } else if (emergency.timestamp) {

              const date = new Date(emergency.timestamp);
              reportedTime = date.toLocaleString();
            }
        
            return {
              id: emergency.id || `emergency-${index}`,
              lat: emergency.locationDetails?.coordinates?.lat || locationData.lat,
              lng: emergency.locationDetails?.coordinates?.lng || locationData.lng,
              position: {
                lat: emergency.locationDetails?.coordinates?.lat || locationData.lat,
                lng: emergency.locationDetails?.coordinates?.lng || locationData.lng
              },
              count: 1, // Default count is 1 per emergency
              desc: emergency.description || 'Emergency alert',
              area: locationData.area,
              severity: emergency.severity || 'mid',
              type: emergency.type || 'general', // Ensure type property is included
              status: emergency.status || 'pending',
              reportedTime,
              userName: emergency.userName || 'Anonymous',
              locationPrecision: locationData.precision || 'low',
              locationComponents: emergency.locationDetails?.components
            };
          } catch (error) {
            console.error('Error processing emergency:', error);
            // Return a fallback emergency with default values
            return {
              id: emergency.id || `emergency-${index}`,
              lat: areaCoordinates['Default'].lat,
              lng: areaCoordinates['Default'].lng,
              position: {
                lat: areaCoordinates['Default'].lat,
                lng: areaCoordinates['Default'].lng
              },
              count: 1,
              desc: emergency.description || 'Emergency alert',
              area: 'Unknown Location',
              severity: emergency.severity || 'mid',
              type: emergency.type || 'general', // Ensure type property is included
              status: emergency.status || 'pending',
              reportedTime: 'Unknown',
              userName: emergency.userName || 'Anonymous',
              locationPrecision: 'unknown',
              locationComponents: null
            };
          }
      });
      
        // Group alerts by area and combine counts
        const groupedAlerts = [];
        const alertsByArea = {};
        
        processedAlerts.forEach(alert => {
          if (!alertsByArea[alert.area]) {
            alertsByArea[alert.area] = {
              ...alert,
              count: 1
            };
            groupedAlerts.push(alertsByArea[alert.area]);
          } else {
            alertsByArea[alert.area].count += 1;
            // Use the highest severity
            if (alert.severity === 'high' && alertsByArea[alert.area].severity !== 'high') {
              alertsByArea[alert.area].severity = 'high';
            }
          }
        });
        
        setAlerts(groupedAlerts);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error processing emergencies:', error);
      setAlerts([]);
    }
  }, [emergencies]);

  const handleMarkerClick = (alert) => {
  
    const safeAlert = {
      ...alert,

      id: alert.id || `alert-${Date.now()}`,
      lat: alert.lat || 0,
      lng: alert.lng || 0,
      position: alert.position || { lat: alert.lat || 0, lng: alert.lng || 0 },
      desc: alert.desc || 'Emergency alert',
      area: alert.area || 'Unknown Location',
      severity: alert.severity || 'mid',
      type: alert.type || 'general',
      status: alert.status || 'pending',
      count: alert.count || 1,
      reportedTime: alert.reportedTime || 'Unknown',
      userName: alert.userName || 'Anonymous',
      locationPrecision: alert.locationPrecision || 'unknown'
    };
    
    setSelectedAlert(safeAlert);
    setShowDetails(true);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div className="card fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>India Priority Map</h2>
        
        {/* Google Maps integration */}
        <div style={{ position: 'relative', height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
          <GoogleMapView 
            emergencies={emergencies} 
            onMarkerClick={handleMarkerClick} 
          />
          
          {alerts.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(37, 37, 37, 0.85)',
              padding: '20px',
              borderRadius: '8px',
              color: '#ccc',
              textAlign: 'center',
              zIndex: 10,
              maxWidth: '80%',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p style={{ marginTop: '15px', fontWeight: 'bold' }}>No emergency alerts</p>
              <p style={{ fontSize: '14px', color: '#aaa', maxWidth: '100%', textAlign: 'center', marginTop: '10px' }}>
                The map is showing your current location. When emergencies are reported, they will appear as markers.
              </p>
            </div>
          )}
        </div>

        {/* Alert details popup */}
        {showDetails && selectedAlert && (
          <div 
            className="scale-in" 
            style={{ 
              padding: '20px', 
              background: 'rgba(25,25,25,0.95)', 
              borderRadius: 12, 
              marginBottom: 20,
              border: `2px solid var(--${getColorClass(selectedAlert.severity).replace('priority-', '')})`,
              boxShadow: `0 8px 25px var(--${getColorClass(selectedAlert.severity).replace('priority-', '')}), 0 0 15px rgba(0,0,0,0.5)`,
              animation: 'scaleIn 0.3s forwards, glow 3s infinite 0.3s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary)', fontWeight: 700 }}>{selectedAlert.area}</h3>
              <button 
                onClick={() => setShowDetails(false)}
                style={{ 
                  padding: '4px 8px', 
                  minWidth: 'auto', 
                  margin: 0, 
                  background: 'transparent',
                  color: '#fff',
                  fontSize: '20px',
                  border: '2px solid var(--primary)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                ×
              </button>
            </div>
            <p style={{ margin: '10px 0 15px 0', color: '#f0f0f0', lineHeight: 1.5 }}>{selectedAlert.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span className={`priority-dot ${getColorClass(selectedAlert.severity)} pulse`} style={{ marginRight: 8, width: '12px', height: '12px' }} />
                <span style={{ color: '#f0f0f0' }}><b style={{ color: 'var(--primary)' }}>{selectedAlert.count}</b> reports</span>
                <span style={{ color: '#aaa', fontSize: 14, marginLeft: 15 }}>Status: <b style={{ color: selectedAlert.status === 'pending' ? 'var(--high)' : selectedAlert.status === 'inProgress' ? 'var(--mid)' : 'var(--low)' }}>{selectedAlert.status === 'pending' ? 'Active' : selectedAlert.status === 'inProgress' ? 'In Progress' : 'Resolved'}</b></span>
              </span>
              <span style={{ color: '#aaa', fontSize: 14, fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                {selectedAlert.lat !== undefined && selectedAlert.lng !== undefined ? 
                  `${selectedAlert.lat.toFixed(6)}, ${selectedAlert.lng.toFixed(6)}` : 
                  'Coordinates unavailable'}
                {selectedAlert.locationPrecision && (
                  <span style={{ marginLeft: '5px', fontSize: '10px', color: selectedAlert.locationPrecision === 'high' ? '#4caf50' : selectedAlert.locationPrecision === 'medium' ? '#ff9800' : '#e53935' }}>
                    [{selectedAlert.locationPrecision} precision]
                  </span>
                )}
              </span>
            </div>
          </div>
        )}


        
        <div style={{ 
          background: '#252525',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          border: '1px solid #333'
        }} className="slide-in-right">
          <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary)', fontWeight: 700 }}>Active Alerts</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {alerts.map((alert) => (
              <li 
                key={alert.id} 
                className={`fade-in ${selectedAlert?.id === alert.id ? 'glow' : ''}`}
                style={{ 
                  margin: '0.8rem 0', 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '12px 15px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: selectedAlert?.id === alert.id ? 'rgba(255,143,0,0.15)' : '#1a1a1a',
                  transition: 'all 0.3s',
                  border: selectedAlert?.id === alert.id ? `1px solid var(--${getColorClass(alert.severity).replace('priority-', '')})` : '1px solid #333',
                  boxShadow: selectedAlert?.id === alert.id ? `0 0 15px rgba(255,143,0,0.2)` : '0 2px 5px rgba(0,0,0,0.2)',
                  animationDelay: `${alert.id * 0.1}s`,
                  transform: selectedAlert?.id === alert.id ? 'translateX(5px)' : 'none'
                }}
                onClick={() => handleMarkerClick(alert)}
                onMouseOver={(e) => {
                  if (selectedAlert?.id !== alert.id) {
                    e.currentTarget.style.background = '#252525';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedAlert?.id !== alert.id) {
                    e.currentTarget.style.background = '#1a1a1a';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={`priority-dot ${getColorClass(alert.severity)} ${selectedAlert?.id === alert.id ? 'pulse' : ''}`} style={{ width: '12px', height: '12px' }} />
                  <span style={{ 
                    marginLeft: 8, 
                    color: selectedAlert?.id === alert.id ? 'var(--primary)' : '#aaa',
                    background: selectedAlert?.id === alert.id ? 'rgba(255,143,0,0.1)' : 'rgba(0,0,0,0.2)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {getEmergencyIcon(alert.type)}
                    {alert.type}
                  </span>
                </div>
                <span style={{ fontWeight: 600, marginLeft: 12, color: selectedAlert?.id === alert.id ? 'var(--primary)' : '#f0f0f0' }}>{alert.desc}</span>
                <span style={{ 
                  marginLeft: 'auto', 
                  fontSize: 13, 
                  color: selectedAlert?.id === alert.id ? 'var(--primary)' : '#aaa',
                  background: selectedAlert?.id === alert.id ? 'rgba(255,143,0,0.1)' : 'rgba(0,0,0,0.2)',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontWeight: selectedAlert?.id === alert.id ? 600 : 400
                }}>{alert.count} reports</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PriorityMap;
