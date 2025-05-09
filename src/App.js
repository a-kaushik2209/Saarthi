import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import EmergencyReport from './components/EmergencyReport';
import PriorityMap from './components/PriorityMap';
import VolunteerSignup from './components/VolunteerSignup';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import './App.css';
import './animations.css';
import { auth } from './firebase';
import { onAuthStateChange, getUserProfile } from './services/authService';
import { subscribeToEmergencies } from './services/emergencyService';
import { subscribeToVolunteers, subscribeToDonations } from './services/volunteerService';


const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);

const VolunteerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LoginIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
    <polyline points="10 17 15 12 10 7"></polyline>
    <line x1="15" y1="12" x2="3" y2="12"></line>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

function App() {
  const [page, setPage] = useState('landing');
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]); // store all signed up profiles
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMenuTooltip, setShowMenuTooltip] = useState(true);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [emergencies, setEmergencies] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [donations, setDonations] = useState([])

  const handleProfileSignup = (newProfile) => {
    setProfile(newProfile);
  };
  

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {

        try {

          const userProfile = await getUserProfile(user.uid);
          setProfile(userProfile);
          

          if (page === 'login') {
            setPage('landing');
          }
        } catch (error) {
          console.error('Error getting user profile:', error);

          if (error.message === 'User profile not found' && page !== 'volunteer') {
            setPage('volunteer');
          }
        }
      } else {

        setProfile(null);
      }
    });
    
    return () => unsubscribe();
  }, [page]);
  

  useEffect(() => {
    const unsubscribe = subscribeToEmergencies((data) => {
      setEmergencies(data);
    });
    
    return () => unsubscribe();
  }, []);
  

  useEffect(() => {
    const unsubscribeVolunteers = subscribeToVolunteers((data) => {
      setVolunteers(data);
    });
    
    const unsubscribeDonations = subscribeToDonations((data) => {
      setDonations(data);
    });
    
    return () => {
      unsubscribeVolunteers();
      unsubscribeDonations();
    };
  }, []);

  const handleNavigation = (targetPage) => {
    // Only profile page requires authentication
    const protectedPages = ['profile'];
    
    if (protectedPages.includes(targetPage) && !profile) {
      // Redirect to login if trying to access protected page without being logged in
      setPage('login');
    } else {
      setPage(targetPage);
    }
    
    setSidebarOpen(false);
    setShowMenuTooltip(false); // Hide tooltip after navigation
  };
  
  const handleLogout = async () => {
    try {
      setShowLogoutMessage(true);
      setSidebarOpen(false);
      
      // After showing message, wait 2 seconds then logout
      setTimeout(async () => {
        try {
          await auth.signOut();
          setProfile(null);
          setPage('landing');
          setShowLogoutMessage(false);
        } catch (error) {
          console.error('Error signing out:', error);
        }
      }, 2000);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="app-container">

      <div style={{ position: 'relative' }}>
        <button 
          className={`sidebar-toggle ${!sidebarOpen && 'pulse'}`}
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
            setShowMenuTooltip(false);
          }}
          aria-label="Toggle navigation"
          style={{
            background: sidebarOpen ? '#333' : 'var(--primary)',
            boxShadow: '0 0 15px rgba(255, 143, 0, 0.5)',
            animation: !sidebarOpen ? 'pulse 2s infinite' : 'none'
          }}
        >
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>


      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>


      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <div className="logo-text">Saarthi</div>
        </div>
        <nav>
          <div className={`nav-link ${page === 'landing' ? 'active' : ''}`} onClick={() => handleNavigation('landing')}>
            <HomeIcon /> <span>Home</span>
          </div>
          <div className={`nav-link ${page === 'report' ? 'active' : ''}`} onClick={() => handleNavigation('report')}>
            <AlertIcon /> <span>Report Emergency</span>
          </div>
          <div className={`nav-link ${page === 'map' ? 'active' : ''}`} onClick={() => handleNavigation('map')}>
            <MapIcon /> <span>Priority Map</span>
          </div>
          {profile && (
            <div className={`nav-link ${page === 'volunteer' ? 'active' : ''}`} onClick={() => handleNavigation('volunteer')}>
              <VolunteerIcon /> <span>Volunteer/Donate</span>
            </div>
          )}
          <div className={`nav-link ${page === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavigation('dashboard')}>
            <DashboardIcon /> <span>Dashboard</span>
          </div>
          {profile && (
            <>
              <div className={`nav-link ${page === 'profile' ? 'active' : ''}`} onClick={() => handleNavigation('profile')}>
                <ProfileIcon /> <span>My Profile</span>
              </div>
              <div className="nav-link" onClick={handleLogout} style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                <LogoutIcon /> <span>Logout</span>
              </div>
            </>
          )}
          {!profile && (
            <div className={`nav-link ${page === 'login' ? 'active' : ''}`} onClick={() => handleNavigation('login')}>
              <LoginIcon /> <span>Login/Signup</span>
            </div>
          )}
        </nav>
      </div>


      <div className="main-content">
        <div className="fade-in">
          {page === 'landing' && <LandingPage setPage={handleNavigation} profile={profile} showLogin={true} />}
          {page === 'report' && <EmergencyReport setPage={handleNavigation} profile={profile} />}
          {page === 'map' && <PriorityMap setPage={handleNavigation} emergencies={emergencies} />}
          {page === 'volunteer' && profile ? (
            <VolunteerSignup setPage={handleNavigation} profile={profile} />
          ) : page === 'volunteer' && !profile ? (
            <LoginPage setPage={handleNavigation} redirectAfterLogin="volunteer" />
          ) : null}
          {page === 'dashboard' && <Dashboard setPage={handleNavigation} profile={profile} emergencies={emergencies} volunteers={volunteers} donations={donations} />}
          {page === 'profile' && <ProfilePage setPage={handleNavigation} profile={profile} />}
          {page === 'login' && <LoginPage setPage={handleNavigation} />}
        </div>
      </div>
      

      {showLogoutMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#252525',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid var(--primary)'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Successfully logged out. Redirecting...</span>
        </div>
      )}
    </div>
  );
}

export default App;
