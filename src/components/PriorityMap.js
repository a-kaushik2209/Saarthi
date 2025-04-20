import React, { useState } from 'react';

const mockAlerts = [
  { id: 1, lat: 28.6139, lng: 77.209, count: 8, desc: 'Major fire, Connaught Place', area: 'Connaught Place' },
  { id: 2, lat: 28.7041, lng: 77.1025, count: 4, desc: 'Flooding, North Delhi', area: 'Rohini' },
  { id: 3, lat: 28.5355, lng: 77.391, count: 1, desc: 'Medical emergency, Noida border', area: 'Noida Sector 15' },
  { id: 4, lat: 28.4089, lng: 77.3178, count: 7, desc: 'Building collapse, Faridabad', area: 'Faridabad' },
  { id: 5, lat: 28.6304, lng: 77.2177, count: 6, desc: 'Gas leak, ITO area', area: 'ITO' },
  { id: 6, lat: 28.5535, lng: 77.2588, count: 3, desc: 'Traffic accident, Nehru Place', area: 'Nehru Place' }
];

function getColorClass(count) {
  if (count >= 6) return 'priority-high';
  if (count >= 3) return 'priority-mid';
  return 'priority-low';
}

function PriorityMap() {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleMarkerClick = (alert) => {
    setSelectedAlert(alert);
    setShowDetails(true);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div className="card fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Delhi Priority Map</h2>
        
        {/* Map container with relative positioning for markers */}
        <div style={{ position: 'relative', marginBottom: 20, overflow: 'hidden', borderRadius: 12 }} className="glow">
          {/* Delhi Map as SVG - directly embedded for reliability */}
          <div style={{ 
            width: '100%', 
            height: '400px',
            background: '#1a1a1a',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid var(--primary)',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            zIndex: 2
          }}>
            {/* Delhi outline SVG */}
            <svg 
              viewBox="0 0 800 600" 
              style={{ 
                width: '100%', 
                height: '100%', 
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              <path 
                d="M400,100 C500,120 550,200 580,300 C600,380 550,450 500,500 C450,550 350,580 250,500 C180,450 150,350 200,250 C250,150 320,90 400,100 Z" 
                fill="#252525" 
                stroke="var(--primary)" 
                strokeWidth="3"
              />
              <text x="400" y="300" textAnchor="middle" fill="#555" fontSize="24" fontWeight="bold">Delhi</text>
              
              {/* District boundaries */}
              <path d="M350,200 L450,250 L400,350 L300,300 Z" fill="#222" stroke="#444" strokeWidth="1" />
              <path d="M450,250 L550,300 L500,400 L400,350 Z" fill="#222" stroke="#444" strokeWidth="1" />
              <path d="M400,350 L500,400 L450,500 L350,450 Z" fill="#222" stroke="#444" strokeWidth="1" />
              <path d="M300,300 L400,350 L350,450 L250,400 Z" fill="#222" stroke="#444" strokeWidth="1" />
              
              {/* Rivers */}
              <path d="M300,150 C350,200 400,250 380,350 C360,450 300,500 250,550" fill="none" stroke="#334" strokeWidth="5" opacity="0.6" />
              
              {/* Main roads */}
              <path d="M250,300 L550,300" fill="none" stroke="#444" strokeWidth="2" />
              <path d="M400,150 L400,450" fill="none" stroke="#444" strokeWidth="2" />
            </svg>
          </div>
          
          {/* Alert markers */}
          {mockAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`priority-dot ${getColorClass(alert.count)} pulse`}
              style={{
                position: 'absolute',
                top: alert.id === 1 ? '35%' : 
                     alert.id === 2 ? '20%' : 
                     alert.id === 3 ? '60%' : 
                     alert.id === 4 ? '70%' : 
                     alert.id === 5 ? '40%' : 
                     alert.id === 6 ? '50%' : '50%',
                left: alert.id === 1 ? '50%' : 
                      alert.id === 2 ? '30%' : 
                      alert.id === 3 ? '70%' : 
                      alert.id === 4 ? '35%' : 
                      alert.id === 5 ? '55%' : 
                      alert.id === 6 ? '65%' : '50%',
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: `0 0 0 4px var(--${getColorClass(alert.count).replace('priority-', '')}), 0 0 0 6px rgba(255,255,255,0.3)`,
                transition: 'transform 0.3s, box-shadow 0.3s',
                animation: `pulse 1.5s infinite ${alert.id * 0.2}s, float 3s infinite ${alert.id * 0.3}s`
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.3)';
                e.currentTarget.style.boxShadow = `0 0 0 4px var(--${getColorClass(alert.count).replace('priority-', '')}), 0 0 15px 5px var(--${getColorClass(alert.count).replace('priority-', '')})`;  
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 0 0 4px var(--${getColorClass(alert.count).replace('priority-', '')}), 0 0 0 6px rgba(255,255,255,0.3)`;
              }}
              onClick={() => handleMarkerClick(alert)}
              title={alert.desc}
            />
          ))}
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
              border: `2px solid var(--${getColorClass(selectedAlert.count).replace('priority-', '')})`,
              boxShadow: `0 8px 25px var(--${getColorClass(selectedAlert.count).replace('priority-', '')}), 0 0 15px rgba(0,0,0,0.5)`,
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
                <span className={`priority-dot ${getColorClass(selectedAlert.count)} pulse`} style={{ marginRight: 8, width: '12px', height: '12px' }} />
                <span style={{ color: '#f0f0f0' }}><b style={{ color: 'var(--primary)' }}>{selectedAlert.count}</b> reports</span>
              </span>
              <span style={{ color: '#aaa', fontSize: 14, fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                {selectedAlert.lat.toFixed(4)}, {selectedAlert.lng.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '1.5rem', 
          marginBottom: '1.5rem', 
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          background: '#252525',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          border: '1px solid #333'
        }} className="slide-in-left">
          <span style={{ fontWeight: 700, color: 'var(--primary)', marginRight: '5px' }}>Legend:</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="priority-dot priority-high pulse" style={{ marginRight: '5px' }} /> 
            <span>High Priority</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="priority-dot priority-mid pulse" style={{ marginRight: '5px' }} /> 
            <span>Medium Priority</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="priority-dot priority-low pulse" style={{ marginRight: '5px' }} /> 
            <span>Low Priority</span>
          </div>
        </div>
        
        <div style={{ 
          background: '#252525',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          border: '1px solid #333'
        }} className="slide-in-right">
          <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary)', fontWeight: 700 }}>Active Alerts</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {mockAlerts.map((alert) => (
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
                  border: selectedAlert?.id === alert.id ? `1px solid var(--${getColorClass(alert.count).replace('priority-', '')})` : '1px solid #333',
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
                <span className={`priority-dot ${getColorClass(alert.count)} ${selectedAlert?.id === alert.id ? 'pulse' : ''}`} style={{ width: '12px', height: '12px' }} />
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
