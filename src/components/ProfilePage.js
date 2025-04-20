import React, { useState } from 'react';

function ProfilePage({ setPage, profile }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!profile) {
    return (
      <div className="card fade-in" style={{ maxWidth: 480, margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>👤</div>
        <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>No Profile Found</h2>
        <p style={{ color: '#aaa', marginBottom: '30px' }}>You need to create a profile to access your personal dashboard and contribute to emergency response efforts.</p>
        <button 
          onClick={() => setPage('volunteer')} 
          style={{ 
            width: '100%',
            background: 'var(--primary)',
            color: 'black',
            padding: '12px',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Create Your Profile
        </button>
      </div>
    );
  }
  
  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '1rem auto' }}>
      {/* Profile Header */}
      <div className="card" style={{ padding: '30px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: '150px', 
          height: '150px', 
          background: 'var(--primary)', 
          opacity: 0.1, 
          borderRadius: '0 0 0 100%' 
        }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: '#252525', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '30px',
            border: '2px solid var(--primary)'
          }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          
          <div>
            <h2 style={{ margin: '0', color: 'var(--primary)' }}>{profile.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
              <span style={{ 
                background: '#252525', 
                padding: '4px 10px', 
                borderRadius: '20px', 
                fontSize: '14px',
                color: '#ddd'
              }}>
                {profile.role}
              </span>
              <span style={{ color: '#aaa', fontSize: '14px' }}>ID: {profile.id}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('overview')} 
          style={{ 
            background: activeTab === 'overview' ? 'var(--primary)' : '#252525',
            color: activeTab === 'overview' ? 'black' : '#ddd',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            flex: 1
          }}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('contributions')} 
          style={{ 
            background: activeTab === 'contributions' ? 'var(--primary)' : '#252525',
            color: activeTab === 'contributions' ? 'black' : '#ddd',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            flex: 1
          }}
        >
          Contributions
        </button>
        <button 
          onClick={() => setActiveTab('reports')} 
          style={{ 
            background: activeTab === 'reports' ? 'var(--primary)' : '#252525',
            color: activeTab === 'reports' ? 'black' : '#ddd',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            flex: 1
          }}
        >
          Reports
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="card" style={{ padding: '30px' }}>
        {activeTab === 'overview' && (
          <div className="fade-in">
            <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>Account Overview</h3>
            
            <div style={{ 
              background: '#252525', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <div style={{ color: '#aaa', fontSize: '14px' }}>Name</div>
                <div style={{ fontSize: '16px', marginTop: '5px' }}>{profile.name}</div>
              </div>
              <div>
                <div style={{ color: '#aaa', fontSize: '14px' }}>Role</div>
                <div style={{ fontSize: '16px', marginTop: '5px' }}>{profile.role}</div>
              </div>
              <div>
                <div style={{ color: '#aaa', fontSize: '14px' }}>User ID</div>
                <div style={{ fontSize: '16px', marginTop: '5px' }}>{profile.id}</div>
              </div>
              <div>
                <div style={{ color: '#aaa', fontSize: '14px' }}>Password</div>
                <div style={{ fontSize: '16px', marginTop: '5px', letterSpacing: '2px' }}>••••••••</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1, background: '#252525', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary)' }}>Contributions</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {profile.contributions ? profile.contributions.length : 0}
                </div>
                <div style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>Total contributions</div>
              </div>
              <div style={{ flex: 1, background: '#252525', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary)' }}>Reports</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {profile.reports ? profile.reports.length : 0}
                </div>
                <div style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>Emergency reports</div>
              </div>
            </div>
            
            <div style={{ 
              background: '#252525', 
              padding: '15px 20px', 
              borderRadius: '8px', 
              fontSize: '14px',
              color: '#aaa',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>
                <b style={{ color: 'var(--primary)' }}>Note:</b> Your profile information is used to track your contributions and emergency reports in the Saarthi system.
              </span>
            </div>
          </div>
        )}
        
        {activeTab === 'contributions' && (
          <div className="fade-in">
            <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>Your Contributions</h3>
            
            {profile.contributions && profile.contributions.length > 0 ? (
              <div>
                {profile.contributions.map((c, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      background: '#252525', 
                      padding: '15px 20px', 
                      borderRadius: '8px', 
                      marginBottom: '15px',
                      borderLeft: '4px solid var(--primary)',
                      animation: 'fadeIn 0.5s',
                      animationDelay: `${i * 0.1}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{c.type}</span>
                      <span style={{ color: '#aaa', fontSize: '13px' }}>{c.date}</span>
                    </div>
                    <div style={{ marginTop: '8px', color: '#ddd' }}>{c.details}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 20px', 
                background: '#252525', 
                borderRadius: '8px',
                color: '#aaa'
              }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>🤝</div>
                <h4 style={{ color: 'var(--primary)', margin: '0 0 10px 0' }}>No Contributions Yet</h4>
                <p style={{ maxWidth: '400px', margin: '0 auto 20px auto', fontSize: '14px' }}>
                  You haven't made any contributions yet. Start by volunteering or donating to emergency response efforts.
                </p>
                <button 
                  onClick={() => setPage('volunteer')} 
                  style={{ 
                    background: 'var(--primary)',
                    color: 'black',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  Volunteer Now
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="fade-in">
            <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>Your Emergency Reports</h3>
            
            {profile.reports && profile.reports.length > 0 ? (
              <div>
                {profile.reports.map((r, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      background: '#252525', 
                      padding: '15px 20px', 
                      borderRadius: '8px', 
                      marginBottom: '15px',
                      borderLeft: '4px solid #e53935',
                      animation: 'fadeIn 0.5s',
                      animationDelay: `${i * 0.1}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#e53935', fontWeight: 600 }}>Emergency Report</span>
                      <span style={{ color: '#aaa', fontSize: '13px' }}>{r.date}</span>
                    </div>
                    <div style={{ marginTop: '8px', color: '#ddd' }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 20px', 
                background: '#252525', 
                borderRadius: '8px',
                color: '#aaa'
              }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>🚨</div>
                <h4 style={{ color: 'var(--primary)', margin: '0 0 10px 0' }}>No Reports Submitted</h4>
                <p style={{ maxWidth: '400px', margin: '0 auto 20px auto', fontSize: '14px' }}>
                  You haven't submitted any emergency reports yet. Use the Report Emergency feature when needed.
                </p>
                <button 
                  onClick={() => setPage('report')} 
                  style={{ 
                    background: '#e53935',
                    color: 'white',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Report Emergency
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
