import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, DEFAULT_CENTER, DEFAULT_ZOOM, MAP_STYLES } from '../services/mapsConfig';


const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px',
  border: '2px solid var(--primary)',
  boxShadow: '0 0 20px rgba(0,0,0,0.5)'
};


const markerIcons = {
  high: {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
    fillColor: '#e53935', // Red for high priority
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#ffffff',
    scale: 1.5,
  },
  mid: {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
    fillColor: '#ff9800', // Orange for medium priority
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#ffffff',
    scale: 1.5,
  },
  low: {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
    fillColor: '#4caf50', // Green for low priority
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#ffffff',
    scale: 1.5,
  }
};

// Get circle color based on severity
const getCircleColor = (severity) => {
  switch (severity) {
    case 'high':
      return '#e53935';
    case 'mid':
      return '#ff9800';
    default:
      return '#4caf50';
  }
};

function GoogleMapView({ emergencies = [], onMarkerClick }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });
  
  // State for user's current location
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  const [map, setMap] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const mapRef = useRef(null);

  // Process emergencies into map-friendly format
  useEffect(() => {
    if (emergencies && emergencies.length > 0) {
      const processedAlerts = emergencies.map(emergency => {
        // Get coordinates from location details if available
        const coordinates = emergency.locationDetails?.coordinates || 
          { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng };
        
        // Format timestamp
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
          id: emergency.id,
          position: {
            lat: parseFloat(coordinates.lat),
            lng: parseFloat(coordinates.lng)
          },
          title: emergency.description || 'Emergency Alert',
          severity: emergency.severity || 'mid',
          status: emergency.status || 'pending',
          location: emergency.location || 'Unknown Location',
          reportedTime,
          userName: emergency.userName || 'Anonymous',
          count: 1
        };
      });
      
      // Group alerts by location (within 100 meters)
      const groupedAlerts = [];
      const alertsByLocation = {};
      
      processedAlerts.forEach(alert => {
        // Generate a location key based on rounded coordinates (for grouping nearby alerts)
        const locationKey = `${alert.position.lat.toFixed(3)},${alert.position.lng.toFixed(3)}`;
        
        if (!alertsByLocation[locationKey]) {
          alertsByLocation[locationKey] = {
            ...alert,
            count: 1
          };
          groupedAlerts.push(alertsByLocation[locationKey]);
        } else {
          alertsByLocation[locationKey].count += 1;
          // Use the highest severity
          if (alert.severity === 'high' && alertsByLocation[locationKey].severity !== 'high') {
            alertsByLocation[locationKey].severity = 'high';
          }
        }
      });
      
      setAlerts(groupedAlerts);
    } else {
      setAlerts([]);
    }
  }, [emergencies]);

  const onLoad = useCallback(function callback(map) {
    mapRef.current = map;
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    mapRef.current = null;
    setMap(null);
  }, []);

  const handleMarkerClick = (alert) => {
    setSelectedEmergency(alert);
    if (onMarkerClick) {
      onMarkerClick(alert);
    }
  };

  // Fit map bounds to include all markers or center on user location
  useEffect(() => {
    if (map && window.google) {
      try {
        if (alerts.length > 0) {
          // If we have alerts, fit bounds to include all of them
          const bounds = new window.google.maps.LatLngBounds();
          alerts.forEach(alert => {
            bounds.extend(alert.position);
          });
          map.fitBounds(bounds);
          
          // Don't zoom in too far
          const listener = window.google.maps.event.addListenerOnce(map, 'idle', () => {
            if (map.getZoom() > 15) {
              map.setZoom(15);
            }
          });
          
          return () => {
            window.google.maps.event.removeListener(listener);
          };
        } else if (userLocation) {
          // If no alerts but we have user location, center on that
          map.setCenter(userLocation);
          map.setZoom(13); // Closer zoom for user location
        }
      } catch (error) {
        console.error('Error setting map view:', error);
      }
    }
  }, [map, alerts, userLocation]);

  // Get user's current location
  useEffect(() => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(error.message);
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setLocationLoading(false);
    }
  }, []);

  // Handle loading error
  if (loadError) {
    return (
      <div style={{ 
        ...containerStyle, 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#1a1a1a',
        color: '#e53935',
        padding: '20px'
      }}>
        <p>Error loading Google Maps</p>
        <p style={{ fontSize: '14px', color: '#aaa', maxWidth: '80%', textAlign: 'center', marginTop: '10px' }}>
          Please check your API key and internet connection.
        </p>
      </div>
    );
  }
  
  return isLoaded ? (
    <div style={{ position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true
        }}
      >
        {alerts.map((alert) => (
          <React.Fragment key={alert.id}>
            {/* Pulse effect circle */}
            <Circle
              center={alert.position}
              radius={500}
              options={{
                strokeColor: getCircleColor(alert.severity),
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: getCircleColor(alert.severity),
                fillOpacity: 0.15,
                clickable: false,
                draggable: false,
                editable: false,
                visible: true,
                zIndex: 1
              }}
            />
            
            {/* Marker */}
            <Marker
              position={alert.position}
              icon={markerIcons[alert.severity]}
              animation={window.google.maps.Animation.DROP}
              onClick={() => handleMarkerClick(alert)}
              label={alert.count > 1 ? {
                text: alert.count.toString(),
                color: '#ffffff',
                fontWeight: 'bold'
              } : null}
              options={{
                optimized: true,
                zIndex: alert.severity === 'high' ? 3 : alert.severity === 'mid' ? 2 : 1
              }}
            />
          </React.Fragment>
        ))}
        
        {/* Show user's current location if available */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            animation={window.google.maps.Animation.BOUNCE}
            title="Your current location"
          />
        )}

        {selectedEmergency && (
          <InfoWindow
            position={selectedEmergency.position}
            onCloseClick={() => setSelectedEmergency(null)}
          >
            <div style={{ 
              color: '#000', 
              padding: '5px', 
              maxWidth: '300px',
              fontFamily: 'Arial, sans-serif'
            }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                color: selectedEmergency.severity === 'high' ? '#e53935' : 
                       selectedEmergency.severity === 'mid' ? '#ff9800' : '#4caf50',
                fontWeight: 'bold'
              }}>
                {selectedEmergency.title}
              </h3>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Location:</strong> {selectedEmergency.location}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Status:</strong> {
                  selectedEmergency.status === 'pending' ? 'Active' : 
                  selectedEmergency.status === 'inProgress' ? 'In Progress' : 'Resolved'
                }
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Reported:</strong> {selectedEmergency.reportedTime}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Reported by:</strong> {selectedEmergency.userName}
              </p>
              {selectedEmergency.count > 1 && (
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  color: '#e53935' 
                }}>
                  {selectedEmergency.count} reports in this area
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {/* Map legend */}
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        left: '10px', 
        background: 'rgba(0,0,0,0.7)', 
        padding: '10px', 
        borderRadius: '5px',
        zIndex: 10
      }}>
        <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>Priority Levels</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: '#e53935', 
            marginRight: '5px' 
          }}></div>
          <span style={{ color: '#fff', fontSize: '12px' }}>High</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: '#ff9800', 
            marginRight: '5px' 
          }}></div>
          <span style={{ color: '#fff', fontSize: '12px' }}>Medium</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: '#4caf50', 
            marginRight: '5px' 
          }}></div>
          <span style={{ color: '#fff', fontSize: '12px' }}>Low</span>
        </div>
      </div>
    </div>
  ) : (
    <div style={{ 
      ...containerStyle, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#1a1a1a'
    }}>
      <div className="loading-spinner"></div>
      <p style={{ color: 'var(--primary)', marginLeft: '10px' }}>Loading Map...</p>
    </div>
  );
}

export default React.memo(GoogleMapView);
