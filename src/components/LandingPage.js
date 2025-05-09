import React, { useState, useEffect } from 'react';
import GoogleMapView from './GoogleMapView';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

function LandingPage({ setPage, profile, showLogin }) {
  const [recentEmergencies, setRecentEmergencies] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  

  useEffect(() => {
    const fetchRecentEmergencies = async () => {
      try {
        setMapLoading(true);
        const emergenciesRef = collection(db, 'emergencies');
        const q = query(
          emergenciesRef,
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const emergencies = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.locationDetails && data.locationDetails.coordinates) {
            emergencies.push({
              id: doc.id,
              ...data
            });
          }
        });
        
        setRecentEmergencies(emergencies);
      } catch (error) {
        console.error('Error fetching emergencies:', error);
      } finally {
        setMapLoading(false);
      }
    };
    
    fetchRecentEmergencies();
  }, []);
  // Helper function for section animations
  const sectionStyle = (delay) => ({
    opacity: 0,
    animation: 'fadeIn 1s forwards',
    animationDelay: `${delay}s`,
    animationFillMode: 'forwards'
  });

  // Helper function for element animations
  const animateElement = (delay, duration = 0.5) => ({
    opacity: 0,
    transform: 'translateY(20px)',
    animation: `slideUpFade ${duration}s ease forwards`,
    animationDelay: `${delay}s`,
    animationFillMode: 'forwards'
  });

  return (
    <div style={{ padding: '0', overflow: 'hidden' }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative',
        padding: '80px 20px', 
        background: 'linear-gradient(135deg, var(--dark) 0%, #000 100%)',
        color: 'white',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Background animations */}
        <div className="pulse" style={{ position: 'absolute', top: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255, 143, 0, 0.03)', zIndex: 0 }}></div>
        <div className="pulse" style={{ position: 'absolute', bottom: '5%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255, 143, 0, 0.05)', zIndex: 0, animationDelay: '0.5s' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 5rem)', 
            fontWeight: 900, 
            marginBottom: 10,
            background: 'linear-gradient(45deg, var(--primary), var(--primary-light))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            letterSpacing: '-2px',
            marginBottom: '10px',
            animation: 'slideUpFade 1s ease-out'
          }}>Saarthi</h1>
          
          <div style={{ fontWeight: 600, fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', marginBottom: 30, opacity: 0.9, animation: 'slideUpFade 1s ease-out 0.2s forwards', opacity: 0 }}>
            Delhi's Unified Emergency Response System
          </div>
          
          <p style={{ fontSize: '1.2rem', margin: '0 auto 40px', lineHeight: 1.7, maxWidth: 700, opacity: 0, animation: 'slideUpFade 1s ease-out 0.4s forwards' }}>
            Connecting those in need with volunteers, NGOs, and authorities in real-time.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', opacity: 0, animation: 'slideUpFade 1s ease-out 0.6s forwards' }}>
            <button 
              onClick={() => setPage('report')} 
              style={{ 
                fontSize: 17,
                fontWeight: 700,
                padding: '12px 25px',
                minWidth: '200px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
              <span style={{ position: 'relative', zIndex: 2 }}>
              Report Emergency
              </span>
            </button>
            
            <button 
              onClick={() => setPage('volunteer')}
              style={{ 
                fontSize: 17,
                fontWeight: 700,
                background: 'rgba(255,255,255,0.15)',
                padding: '12px 25px',
                minWidth: '200px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
              <span style={{ position: 'relative', zIndex: 2 }}>
              Join as Volunteer
              </span>
            </button>
          </div>
        </div>
        
        {/* Down arrow animation */}
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          animation: 'bounce 2s infinite',
          cursor: 'pointer'
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 20px', background: '#181818', ...sectionStyle(0.7) }} className="testimonial-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 60, fontSize: '2.5rem', fontWeight: 800 }}>
            <span style={{ color: 'var(--primary)' }}>Key</span> Features
          </h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px' }}>
            {/* Feature 1 */}
            <div style={{ flex: '1 1 300px', maxWidth: '350px', padding: '20px', borderRadius: '12px', background: '#252525', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transition: 'all 0.4s ease', cursor: 'pointer', ...animateElement(0.4) }} className="feature-card">
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '30px', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 5px 15px rgba(255, 143, 0, 0.3)' }} className="icon-container">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>Priority-based Alerting</h3>
              <p style={{ color: '#ccc', lineHeight: 1.6 }}>Automatically escalates alerts based on the number of reports from the same location, ensuring critical emergencies get immediate attention.</p>
            </div>
            
            {/* Feature 2 */}
            <div style={{ flex: '1 1 300px', maxWidth: '350px', padding: '20px', borderRadius: '12px', background: '#252525', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transition: 'all 0.4s ease', cursor: 'pointer', ...animateElement(0.4) }} className="feature-card">
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '30px', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 5px 15px rgba(255, 143, 0, 0.3)' }} className="icon-container">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <h3 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>Multi-channel Access</h3>
              <p style={{ color: '#ccc', lineHeight: 1.6 }}>Access Saarthi via smartphone app, SMS (for non-smartphone users), and even IVR calls, ensuring everyone can report emergencies.</p>
            </div>
            
            {/* Feature 3 */}
            <div style={{ flex: '1 1 300px', maxWidth: '350px', padding: '20px', borderRadius: '12px', background: '#252525', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transition: 'all 0.4s ease', cursor: 'pointer', ...animateElement(0.4) }} className="feature-card">
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '30px', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 5px 15px rgba(255, 143, 0, 0.3)' }} className="icon-container">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </div>
              <h3 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>Volunteer Network</h3>
              <p style={{ color: '#ccc', lineHeight: 1.6 }}>Civilians can sign up as volunteers or donors (money, clothes, food) and receive verified requests for help from their local area.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '80px 20px', background: '#222222', ...sectionStyle(0.5) }} className="parallax-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 60, fontSize: '2.5rem', fontWeight: 800 }}>
            How <span style={{ color: 'var(--primary)' }}>Saarthi</span> Works
          </h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
            {/* Left side - Image */}
            <div style={{ flex: '1 1 400px', maxWidth: '500px' }}>
              <div style={{ 
                width: '100%', 
                height: '350px', 
                borderRadius: '12px', 
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
              }}>
                <GoogleMapView 
                  emergencies={recentEmergencies} 
                  onMarkerClick={() => {}} 
                />
                
                {mapLoading && (
                  <div style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'rgba(37, 37, 37, 0.7)',
                    color: 'white',
                    zIndex: 5
                  }}>
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="loading-spinner">
                          <line x1="12" y1="2" x2="12" y2="6"></line>
                          <line x1="12" y1="18" x2="12" y2="22"></line>
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                          <line x1="2" y1="12" x2="6" y2="12"></line>
                          <line x1="18" y1="12" x2="22" y2="12"></line>
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                        </svg>
                      </div>
                      <div>Loading map...</div>
                    </div>
                  </div>
                )}
                
                {recentEmergencies.length === 0 && !mapLoading && (
                  <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(37, 37, 37, 0.85)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    color: '#ccc',
                    textAlign: 'center',
                    zIndex: 10,
                    maxWidth: '80%',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>Map shows your current location</p>
                  </div>
                )}
                
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  padding: '10px', 
                  background: 'rgba(0,0,0,0.6)', 
                  color: 'white',
                  fontSize: '1.2rem', 
                  fontWeight: 700,
                  textAlign: 'center',
                  zIndex: 10
                }}>
                  Live Emergency Map
                </div>
              </div>
            </div>
            
            {/* Right side - Steps */}
            <div style={{ flex: '1 1 400px', maxWidth: '500px' }}>
              <div style={{ marginBottom: '25px', display: 'flex', gap: '15px' }}>
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>1</div>
                <div>
                  <h3 style={{ marginBottom: '8px', fontSize: '1.3rem' }}>Report an Emergency</h3>
                  <p style={{ color: '#ccc', lineHeight: 1.6 }}>Users report emergencies through the app, SMS, or call. Location is automatically detected or manually entered.</p>
                </div>
              </div>
              
              <div style={{ marginBottom: '25px', display: 'flex', gap: '15px' }}>
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>2</div>
                <div>
                  <h3 style={{ marginBottom: '8px', fontSize: '1.3rem' }}>Priority Assignment</h3>
                  <p style={{ color: '#ccc', lineHeight: 1.6 }}>Multiple reports from the same area increase priority. High-priority alerts are immediately escalated to authorities.</p>
                </div>
              </div>
              
              <div style={{ marginBottom: '25px', display: 'flex', gap: '15px' }}>
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>3</div>
                <div>
                  <h3 style={{ marginBottom: '8px', fontSize: '1.3rem' }}>Response Coordination</h3>
                  <p style={{ color: '#ccc', lineHeight: 1.6 }}>Nearby volunteers, NGOs, and authorities are notified based on the emergency type and priority level.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{ 
        padding: '80px 20px', 
        background: 'var(--dark)', 
        color: 'white',
        ...sectionStyle(0.7)
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 60, fontSize: '2.5rem', fontWeight: 800 }}>
            Making <span style={{ color: 'var(--primary)' }}>Delhi</span> Safer
          </h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px' }}>
            <div style={{ flex: '1 1 200px', maxWidth: '250px' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)' }}>15+</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>NGO Partners</div>
            </div>
            
            <div style={{ flex: '1 1 200px', maxWidth: '250px' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)' }}>1000+</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>Registered Volunteers</div>
            </div>
            
            <div style={{ flex: '1 1 200px', maxWidth: '250px' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)' }}>5000+</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>Emergencies Reported</div>
            </div>
            
            <div style={{ flex: '1 1 200px', maxWidth: '250px' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)' }}>98%</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.8 }}>Response Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ padding: '80px 20px', background: '#181818', ...sectionStyle(0.9) }} className="cta-section">
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 20, fontSize: '2.5rem', fontWeight: 800 }}>Ready to Help?</h2>
          <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: 40, lineHeight: 1.6 }}>Join our network of volunteers and be part of Delhi's emergency response system.</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            <button 
              onClick={() => setPage('volunteer')} 
              style={{ 
                fontSize: 18,
                fontWeight: 700,
                padding: '15px 30px',
              }}>
              Join as Volunteer
            </button>
            
            <button 
              onClick={() => setPage('map')} 
              style={{ 
                fontSize: 18,
                fontWeight: 700,
                background: 'var(--dark)',
                padding: '15px 30px',
              }}>
              View Emergency Map
            </button>
          </div>
          
          {profile && (
            <div style={{ marginTop: 20 }}>
              <button 
                onClick={() => setPage('profile')} 
                style={{ 
                  background: 'var(--primary-dark)',
                  fontSize: 16,
                  fontWeight: 600,
                  padding: '10px 20px',
                }}>
                View My Profile
              </button>
            </div>
          )}
          
          {showLogin && !profile && (
            <div style={{ marginTop: 20 }}>
              <button 
                onClick={() => setPage('login')} 
                style={{ 
                  background: 'transparent',
                  color: 'var(--primary)',
                  border: '2px solid var(--primary)',
                  fontSize: 16,
                  fontWeight: 600,
                  padding: '10px 20px',
                }}>
                Login
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '16px 10px', background: 'var(--dark)', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: 800, 
            marginBottom: 20,
            background: 'linear-gradient(45deg, var(--primary), var(--primary-light))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            display: 'inline-block'
          }}>Saarthi</div>
          
          <p style={{ opacity: 0.7, marginBottom: 20 }}>Delhi's Unified Emergency Response System</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: 10, flexWrap: 'wrap' }}>
            <a href="#" style={{ color: 'white', opacity: 0.7, textDecoration: 'none' }}>About</a>
            <a href="#" style={{ color: 'white', opacity: 0.7, textDecoration: 'none' }}>Contact</a>
            <a href="#" style={{ color: 'white', opacity: 0.7, textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'white', opacity: 0.7, textDecoration: 'none' }}>Terms of Service</a>
          </div>
          
          <div style={{ opacity: 0.5, fontSize: '0.9rem' }}>© 2025 Saarthi. All rights reserved.</div>
        </div>
      </footer>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
          40% { transform: translateY(-20px) translateX(-50%); }
          60% { transform: translateY(-10px) translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        }
        .feature-card:hover .icon-container {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 8px 20px rgba(255, 143, 0, 0.4);
        }
        .pulse {
          animation: pulse 3s infinite ease-in-out;
        }
        .parallax-section {
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
        }
        .testimonial-section {
          position: relative;
          overflow: hidden;
        }
        .testimonial-section::before {
          content: '';
          position: absolute;
          top: -50px;
          left: -50px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(255, 143, 0, 0.03);
          z-index: 0;
          animation: float 6s infinite ease-in-out;
        }
        .testimonial-section::after {
          content: '';
          position: absolute;
          bottom: -50px;
          right: -50px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(255, 143, 0, 0.03);
          z-index: 0;
          animation: float 8s infinite ease-in-out reverse;
        }
        .cta-section {
          position: relative;
          overflow: hidden;
        }
        .cta-section button {
          transition: all 0.3s ease;
        }
        .cta-section button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
