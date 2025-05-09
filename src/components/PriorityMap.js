import React, { useState, useEffect } from 'react';
import { calculateDistance } from '../services/locationService';
import GoogleMapView from './GoogleMapView';


const areaCoordinates = {
  'Connaught Place': { lat: 28.6139, lng: 77.209, position: { top: '35%', left: '50%' } },
  'Rohini': { lat: 28.7041, lng: 77.1025, position: { top: '20%', left: '30%' } },
  'Noida': { lat: 28.5355, lng: 77.391, position: { top: '60%', left: '70%' } },
  'Old Delhi': { lat: 28.4089, lng: 77.3178, position: { top: '70%', left: '35%' } },
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
  'old delhi': 'Old Delhi'
};

function getColorClass(severity) {
  if (severity === 'high') return 'priority-high';
  if (severity === 'mid' || severity === 'medium') return 'priority-mid';
  return 'priority-low';
}

// Get position for a location with enhanced precision
function getPositionForLocation(emergency) {
  // If we have precise location details from the API
  if (emergency.locationDetails && emergency.locationDetails.coordinates) {
    const { lat, lng } = emergency.locationDetails.coordinates;
    
    // If we have components, use them to find the area
    if (emergency.locationDetails.components) {
      const components = emergency.locationDetails.components;
      
      // Try to match neighborhood or suburb first
      const neighborhood = components.neighbourhood || components.suburb || '';
      const neighborhoodLower = neighborhood.toLowerCase();
      
      // Check if we have a direct mapping for this neighborhood
      for (const [key, value] of Object.entries(componentToArea)) {
        if (neighborhoodLower.includes(key)) {
          return {
            ...areaCoordinates[value],
            area: value,
            precision: 'high'
          };
        }
      }
      
      // If no direct neighborhood match, try to find the closest area by coordinates
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
  
  // Fallback to text-based matching if no precise coordinates
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
  
  // Default position if no match
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
  
  // Process emergencies into alerts format with enhanced location precision
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
    setSelectedAlert(alert);
    setShowDetails(true);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div className="card fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Delhi Priority Map</h2>
        
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
                {selectedAlert.lat.toFixed(6)}, {selectedAlert.lng.toFixed(6)}
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
                <span className={`priority-dot ${getColorClass(alert.severity)} ${selectedAlert?.id === alert.id ? 'pulse' : ''}`} style={{ width: '12px', height: '12px' }} />
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
