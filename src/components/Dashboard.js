import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import PriorityMap from './PriorityMap';
import { updateEmergencyStatus } from '../services/emergencyService';
import { generateReport } from '../services/reportService';
import { calculateDistance } from '../services/locationService';

function Dashboard({ setPage, profile, emergencies, volunteers, donations }) {
  const [activeTab, setActiveTab] = useState('overview');
  

  const [responseTrendData, setResponseTrendData] = useState({
    dates: [],
    times: [],
    points: ''
  });
  

  const [incidentsByType, setIncidentsByType] = useState([]);
  

  const [resourceUtilization, setResourceUtilization] = useState([]);
  

  

  const [reportStatus, setReportStatus] = useState({
    generating: false,
    success: null,
    message: ''
  });
  

  const [stats, setStats] = useState([
    { id: 1, title: 'Active Incidents', value: 0, change: '0%', positive: false },
    { id: 2, title: 'Volunteers Active', value: 0, change: '0%', positive: true },
    { id: 3, title: 'Resources Deployed', value: 0, change: '0%', positive: true },
    { id: 4, title: 'People Assisted', value: 0, change: '0%', positive: true }
  ]);
  

  useEffect(() => {
    if (emergencies && emergencies.length > 0) {

      const typeCount = {};
      
      emergencies.forEach(emergency => {

        let type = 'Other';
        
        if (emergency.type) {
          type = emergency.type;
        } else if (emergency.description) {
          const desc = emergency.description.toLowerCase();
          if (desc.includes('flood')) type = 'Flooding';
          else if (desc.includes('fire')) type = 'Fire';
          else if (desc.includes('medical') || desc.includes('health') || desc.includes('injury')) type = 'Medical';
          else if (desc.includes('building') || desc.includes('collapse')) type = 'Building';
          else if (desc.includes('power') || desc.includes('electricity')) type = 'Power';
        }
        
        if (!typeCount[type]) typeCount[type] = 0;
        typeCount[type]++;
      });
      
      // Convert to array and sort by count
      const typesArray = Object.entries(typeCount).map(([type, count]) => ({ type, count }));
      typesArray.sort((a, b) => b.count - a.count);
      
      setIncidentsByType(typesArray.slice(0, 5));
    }
  }, [emergencies]);
  

  useEffect(() => {
    if (emergencies && volunteers && donations) {

      const medicalEmergencies = emergencies.filter(e => 
        e.type === 'Medical' || 
        (e.description && e.description.toLowerCase().includes('medical'))
      ).length;
      const medicalVolunteers = volunteers.filter(v => 
        v.skills && v.skills.includes('Medical')
      ).length;
      const medicalUtilization = medicalVolunteers > 0 ? 
        Math.min(100, Math.round((medicalEmergencies / medicalVolunteers) * 100)) : 75;
      

      const transportEmergencies = emergencies.filter(e => 
        e.type === 'Transport' || 
        (e.description && e.description.toLowerCase().includes('transport'))
      ).length;
      const transportVolunteers = volunteers.filter(v => 
        v.skills && v.skills.includes('Transport')
      ).length;
      const transportUtilization = transportVolunteers > 0 ? 
        Math.min(100, Math.round((transportEmergencies / transportVolunteers) * 100)) : 60;
      

      const foodEmergencies = emergencies.filter(e => 
        e.type === 'Food' || 
        (e.description && e.description.toLowerCase().includes('food'))
      ).length;
      const foodDonations = donations.filter(d => d.type === 'Food').length;
      const foodUtilization = foodDonations > 0 ? 
        Math.min(100, Math.round((foodEmergencies / foodDonations) * 100)) : 50;
      

      const shelterEmergencies = emergencies.filter(e => 
        e.type === 'Shelter' || 
        (e.description && e.description.toLowerCase().includes('shelter'))
      ).length;
      const shelterDonations = donations.filter(d => d.type === 'Shelter').length;
      const shelterUtilization = shelterDonations > 0 ? 
        Math.min(100, Math.round((shelterEmergencies / shelterDonations) * 100)) : 85;
      
      setResourceUtilization([
        { type: 'Medical', utilization: medicalUtilization },
        { type: 'Transport', utilization: transportUtilization },
        { type: 'Food', utilization: foodUtilization },
        { type: 'Shelter', utilization: shelterUtilization }
      ]);
    }
  }, [emergencies, volunteers, donations]);
  

  

  useEffect(() => {
    if (emergencies && emergencies.length > 0) {
      const sortedEmergencies = [...emergencies].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateA - dateB;
      });
      
      const emergenciesByDate = {};
      const now = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        emergenciesByDate[dateStr] = [];
      }
      
      sortedEmergencies.forEach(emergency => {
        const date = emergency.createdAt?.toDate ? 
          emergency.createdAt.toDate() : 
          new Date(emergency.createdAt || 0);
        
        const dateStr = date.toISOString().split('T')[0];
        if (emergenciesByDate[dateStr]) {
          emergenciesByDate[dateStr].push(emergency);
        }
      });
      
      const dates = Object.keys(emergenciesByDate).sort();
      const responseTimes = dates.map(date => {
        const dayEmergencies = emergenciesByDate[date];
        if (dayEmergencies.length === 0) return 45; 
        let totalTime = 0;
        dayEmergencies.forEach(emergency => {
          let baseTime = 0;
          if (emergency.severity === 'high') baseTime = 15;
          else if (emergency.severity === 'mid') baseTime = 30;
          else baseTime = 45;
          
          if (emergency.status === 'resolved') baseTime *= 0.8;
          else if (emergency.status === 'inProgress') baseTime *= 0.9;
          
          totalTime += baseTime;
        });
        
        return Math.round(totalTime / dayEmergencies.length);
      });
      
      const formattedDates = dates.map(date => {
        const d = new Date(date);
        return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
      });
      
      const points = responseTimes.map((time, index) => {
        const x = index * (300 / (dates.length - 1)); 
        const y = (time / Math.max(...responseTimes, 60)) * 140; 
        return `${x},${y}`;
      }).join(' ');
      
      setResponseTrendData({
        dates: formattedDates,
        times: responseTimes,
        points: points
      });
    }
  }, [emergencies]);
  
  useEffect(() => {
    if (emergencies && volunteers && donations) {
      const activeIncidents = emergencies.filter(e => e.status === 'pending' || e.status === 'inProgress').length;
      const activeVolunteers = volunteers.filter(v => v.status === 'active').length;
      const resourcesDeployed = Math.floor(donations.length * 0.7); 
      const peopleAssisted = Math.floor(donations.reduce((sum, donation) => sum + (donation.amount || 0), 0) / 100);
      
      setStats([
        { id: 1, title: 'Active Incidents', value: activeIncidents, change: `+${Math.floor(activeIncidents * 0.1)}%`, positive: false },
        { id: 2, title: 'Volunteers Active', value: activeVolunteers, change: `+${Math.floor(activeVolunteers * 0.2)}%`, positive: true },
        { id: 3, title: 'Resources Deployed', value: resourcesDeployed, change: `+${Math.floor(resourcesDeployed * 0.05)}%`, positive: true },
        { id: 4, title: 'People Assisted', value: peopleAssisted, change: `+${Math.floor(peopleAssisted * 0.15)}%`, positive: true }
      ]);
    }
  }, [emergencies, volunteers, donations]);

  const [incidents, setIncidents] = useState([]);
  
  useEffect(() => {
    if (emergencies && emergencies.length > 0) {
      const formattedIncidents = emergencies.map(emergency => {
        let reportedTime = 'Unknown';
        if (emergency.createdAt) {
          const date = emergency.createdAt.toDate ? 
            emergency.createdAt.toDate() : 
            new Date(emergency.createdAt);
          reportedTime = date.toLocaleString();
        }
        
        return {
          id: emergency.id,
          type: emergency.type || 'General Emergency',
          location: emergency.location || 'Unknown Location',
          priority: emergency.severity || 'mid',
          status: emergency.status === 'pending' ? 'Active' : 
                 emergency.status === 'inProgress' ? 'Contained' : 
                 emergency.status === 'resolved' ? 'Resolved' : 'Active',
          reported: reportedTime,
          description: emergency.description,
          userName: emergency.userName
        };
      });
      
      setIncidents(formattedIncidents);
    }
  }, [emergencies]);

  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all'
  });

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filters.priority !== 'all' && incident.priority !== filters.priority) return false;
    if (filters.status !== 'all' && incident.status !== filters.status) return false;
    return true;
  });


  const handleStatusChange = async (incidentId, newStatus) => {
    try {

      const backendStatus = 
        newStatus === 'Active' ? 'pending' :
        newStatus === 'Contained' ? 'inProgress' :
        newStatus === 'Resolved' ? 'resolved' : 'pending';
      

      await updateEmergencyStatus(incidentId, backendStatus);
      

      setIncidents(incidents.map(incident => 
        incident.id === incidentId ? { ...incident, status: newStatus } : incident
      ));
    } catch (error) {
      console.error('Error updating incident status:', error);
      alert('Failed to update incident status');
    }
  };


  const [showLoginPrompt, setShowLoginPrompt] = useState(!profile);

  return (
    <div className="dashboard-container">
      {showLoginPrompt && (
        <div style={{
          background: 'rgba(255, 153, 0, 0.1)',
          border: '1px solid var(--primary)',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ margin: '0 0 5px 0', color: 'var(--primary)', fontWeight: 'bold' }}>
              You're viewing the dashboard as a guest
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: '#aaa' }}>
              Log in to access all features and report emergencies
            </p>
          </div>
          <button 
            onClick={() => setPage('login')} 
            style={{
              background: 'var(--primary)',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 15px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Log In
          </button>
        </div>
      )}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Emergency Response Dashboard</h1>
          <p className="dashboard-subtitle">Real-time monitoring and coordination</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          Incidents
        </button>
        <button 
          className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          Map View
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>


      {activeTab === 'overview' && (
        <div className="fade-in">
          <h3 className="section-title">Key Statistics <span className="scroll-hint">(scroll →)</span></h3>
          <div className="stats-grid">
            {stats.map(stat => (
              <div key={stat.id} className="stat-card">
                <h3 className="stat-title">{stat.title}</h3>
                <div className="stat-value">{stat.value}</div>
                <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Incidents <span className="scroll-hint">(scroll →)</span></h2>
            </div>
            <div className="card-body">
              <div style={{ overflowX: 'auto' }}>
                <table className="incidents-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.slice(0, 5).map(incident => (
                    <tr key={incident.id}>
                      <td>{incident.type}</td>
                      <td>{incident.location}</td>
                      <td>
                        <span className={`priority-dot priority-${incident.priority}`}></span>
                        {incident.priority === 'high' ? 'High' : incident.priority === 'mid' ? 'Medium' : 'Low'}
                      </td>
                      <td>{incident.status}</td>
                      <td>{incident.reported}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Resource Allocation <span className="scroll-hint">(scroll →)</span></h2>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <div className="chart-content scrollable-container" style={{ display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
            
                  <div style={{ textAlign: 'center', minWidth: '100px', margin: '0 10px' }} className="scrollable-item">
                    <div style={{ height: '150px', width: '20px', background: 'linear-gradient(to top, #2196f3, #64b5f6)', borderRadius: '10px', display: 'inline-block', marginBottom: '10px' }}></div>
                    <div>Medical</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '150px' }} className="scrollable-item">
                    <div style={{ height: '100px', width: '20px', background: 'linear-gradient(to top, #ff9800, #ffb74d)', borderRadius: '10px', display: 'inline-block', marginBottom: '10px' }}></div>
                    <div>Food</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '150px' }} className="scrollable-item">
                    <div style={{ height: '180px', width: '20px', background: 'linear-gradient(to top, #4caf50, #81c784)', borderRadius: '10px', display: 'inline-block', marginBottom: '10px' }}></div>
                    <div>Shelter</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '150px' }} className="scrollable-item">
                    <div style={{ height: '80px', width: '20px', background: 'linear-gradient(to top, #e91e63, #f48fb1)', borderRadius: '10px', display: 'inline-block', marginBottom: '10px' }}></div>
                    <div>Transport</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '150px' }} className="scrollable-item">
                    <div style={{ height: '120px', width: '20px', background: 'linear-gradient(to top, #9c27b0, #ce93d8)', borderRadius: '10px', display: 'inline-block', marginBottom: '10px' }}></div>
                    <div>Rescue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="fade-in">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Incident Management</h2>
            </div>
            <div className="card-body">
              <div className="map-filters scrollable-container">
                <div className="filter-group scrollable-item">
                  <h3 className="filter-title">Priority Filter</h3>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-button ${filters.priority === 'all' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('priority', 'all')}
                    >
                      All
                    </button>
                    <button 
                      className={`filter-button ${filters.priority === 'high' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('priority', 'high')}
                    >
                      High
                    </button>
                    <button 
                      className={`filter-button ${filters.priority === 'mid' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('priority', 'mid')}
                    >
                      Medium
                    </button>
                    <button 
                      className={`filter-button ${filters.priority === 'low' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('priority', 'low')}
                    >
                      Low
                    </button>
                  </div>
                </div>
                
                <div className="filter-group">
                  <h3 className="filter-title">Status Filter</h3>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-button ${filters.status === 'all' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('status', 'all')}
                    >
                      All
                    </button>
                    <button 
                      className={`filter-button ${filters.status === 'Active' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('status', 'Active')}
                    >
                      Active
                    </button>
                    <button 
                      className={`filter-button ${filters.status === 'Contained' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('status', 'Contained')}
                    >
                      Contained
                    </button>
                    <button 
                      className={`filter-button ${filters.status === 'Resolved' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('status', 'Resolved')}
                    >
                      Resolved
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="incidents-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Reported</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map(incident => (
                    <tr key={incident.id}>
                      <td>{incident.type}</td>
                      <td>{incident.location}</td>
                      <td>
                        <span className={`priority-dot priority-${incident.priority}`}></span>
                        {incident.priority === 'high' ? 'High' : incident.priority === 'mid' ? 'Medium' : 'Low'}
                      </td>
                      <td>{incident.status}</td>
                      <td>{incident.reported}</td>
                      <td>
                        <button 
                          style={{ background: '#333', border: 'none', padding: '5px 10px', borderRadius: '4px', color: 'white', marginRight: '5px', cursor: 'pointer' }}
                          onClick={() => alert(`Details: ${incident.description || 'No additional details available'} - Reported by: ${incident.userName || 'Anonymous'}`)}
                        >
                          Details
                        </button>
                        <div className="status-dropdown" style={{ display: 'inline-block', position: 'relative' }}>
                          <select 
                            value={incident.status}
                            onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                            style={{ 
                              background: 'var(--primary)', 
                              border: 'none', 
                              padding: '5px 10px', 
                              borderRadius: '4px', 
                              color: 'black',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Active">Active</option>
                            <option value="Contained">Contained</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      )}


      {activeTab === 'map' && (
        <div className="fade-in">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Emergency Map View</h2>
            </div>
            <div className="card-body" style={{ padding: '15px' }}>

              <PriorityMap emergencies={emergencies.filter(emergency => {

                if (filters.priority !== 'all' && emergency.severity !== filters.priority) {
                  return false;
                }
                

                if (filters.status !== 'all' && emergency.status !== filters.status) {
                  return false;
                }
                
                return true;
              })} />
              
              <div className="map-filters" style={{ marginTop: '30px' }}>
                <div className="filter-group">
                  <h3 className="filter-title">Priority Level</h3>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-button ${filters.priority === 'all' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('priority', 'all')}
                    >
                      All
                    </button>
                    <button 
                      className={`filter-button ${filters.priority === 'high' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('priority', 'high')}
                    >
                      High
                    </button>
                    <button 
                      className={`filter-button ${filters.priority === 'mid' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('priority', 'mid')}
                    >
                      Medium
                    </button>
                    <button 
                      className={`filter-button ${filters.priority === 'low' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('priority', 'low')}
                    >
                      Low
                    </button>
                  </div>
                </div>
                
                <div className="filter-group">
                  <h3 className="filter-title">Status</h3>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-button ${filters.status === 'all' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('status', 'all')}
                    >
                      All
                    </button>
                    <button 
                      className={`filter-button ${filters.status === 'Active' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('status', 'Active')}
                    >
                      Active
                    </button>
                    <button 
                      className={`filter-button ${filters.status === 'Contained' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('status', 'Contained')}
                    >
                      Contained
                    </button>
                    <button 
                      className={`filter-button ${filters.status === 'Resolved' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('status', 'Resolved')}
                    >
                      Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

        </div>
      )}


      {activeTab === 'analytics' && (
        <div className="fade-in">
          <h3 className="section-title">Performance Metrics <span className="scroll-hint">(scroll →)</span></h3>
          <div className="analytics-grid">
            <div className="chart-container">
              <h3 className="chart-title">Incidents by Type</h3>
              <div className="chart-content scrollable-container" style={{ display: 'flex', alignItems: 'flex-end', height: '220px' }}>
                {incidentsByType.length > 0 ? (
                  incidentsByType.map((item, index) => {

                    const maxCount = Math.max(...incidentsByType.map(i => i.count));
                    const height = Math.max(40, Math.round((item.count / maxCount) * 180));
                    

                    const colors = [
                      { bg: 'linear-gradient(to top, #2196f3, #64b5f6)', shadow: 'rgba(33, 150, 243, 0.5)' },
                      { bg: 'linear-gradient(to top, #ff9800, #ffb74d)', shadow: 'rgba(255, 152, 0, 0.5)' },
                      { bg: 'linear-gradient(to top, #4caf50, #81c784)', shadow: 'rgba(76, 175, 80, 0.5)' },
                      { bg: 'linear-gradient(to top, #e91e63, #f06292)', shadow: 'rgba(233, 30, 99, 0.5)' },
                      { bg: 'linear-gradient(to top, #9c27b0, #ba68c8)', shadow: 'rgba(156, 39, 176, 0.5)' }
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={item.type} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px', margin: '0 10px' }} className="scrollable-item">
                        <div className="animated-bar" style={{ 
                          width: '50px', 
                          height: `${height}px`, 
                          background: color.bg, 
                          borderRadius: '4px 4px 0 0', 
                          boxShadow: `0 0 10px ${color.shadow}`, 
                          position: 'relative' 
                        }}>
                          <div style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', color: '#fff', fontSize: '14px' }}>{item.count}</div>
                        </div>
                        <div style={{ marginTop: '10px', color: '#ddd', fontSize: '13px', fontWeight: '500' }}>{item.type}</div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#aaa' }}>
                    No incident data available
                  </div>
                )}
              </div>
            </div>
            
            <div className="chart-container">
              <h3 className="chart-title">Response Time Trend (Last 7 Days)</h3>
              <div className="chart-content scrollable-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {responseTrendData.dates.length > 0 ? (
                  <svg width="100%" height="180" viewBox="0 0 300 180">

                    <line x1="0" y1="40" x2="300" y2="40" style={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '3,3' }} />
                    <line x1="0" y1="80" x2="300" y2="80" style={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '3,3' }} />
                    <line x1="0" y1="120" x2="300" y2="120" style={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '3,3' }} />
                    

                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2196f3" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#2196f3" stopOpacity="0.1" />
                    </linearGradient>
                    
                    <path
                      d={`M${responseTrendData.points} L300,170 L0,170 Z`}
                      fill="url(#areaGradient)"
                      className="chart-area"
                    />
                    
                    <polyline
                      points={responseTrendData.points}
                      style={{ fill: 'none', stroke: '#2196f3', strokeWidth: 3 }}
                      className="chart-line"
                    />
                    

                    {responseTrendData.dates.map((date, index) => {
                      const x = index * (300 / (responseTrendData.dates.length - 1));
                      const y = (responseTrendData.times[index] / Math.max(...responseTrendData.times, 60)) * 140;
                      return (
                        <g key={index}>
                          <circle cx={x} cy={y} r="4" fill="#fff" stroke="#2196f3" strokeWidth="2" />
                          <text x={x} y={y-10} textAnchor="middle" fill="#fff" fontSize="10">{responseTrendData.times[index]}m</text>
                        </g>
                      );
                    })}
                    
                    <line x1="0" y1="170" x2="300" y2="170" style={{ stroke: '#333', strokeWidth: 1 }} />
                    
                    {responseTrendData.dates.map((date, index) => {
                      const x = index * (300 / (responseTrendData.dates.length - 1));
                      return (
                        <text key={index} x={x} y="185" textAnchor="middle" style={{ fill: '#aaa', fontSize: '10px' }}>{date}</text>
                      );
                    })}
                    

                    <text x="5" y="40" style={{ fill: '#aaa', fontSize: '10px' }}>15m</text>
                    <text x="5" y="80" style={{ fill: '#aaa', fontSize: '10px' }}>30m</text>
                    <text x="5" y="120" style={{ fill: '#aaa', fontSize: '10px' }}>45m</text>
                  </svg>
                ) : (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                    Loading trend data...
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Resource Utilization <span className="scroll-hint">(scroll →)</span></h2>
            </div>
            <div className="card-body">
              <div className="scrollable-container" style={{ marginBottom: '30px' }}>
                {resourceUtilization.map((resource, index) => {


                  const circumference = 2 * Math.PI * 45;
                  const dashoffset = circumference * (1 - resource.utilization / 100);
                  

                  let color;
                  switch(resource.type) {
                    case 'Medical': color = '#2196f3'; break;
                    case 'Transport': color = '#ff9800'; break;
                    case 'Food': color = '#4caf50'; break;
                    case 'Shelter': color = '#e91e63'; break;
                    default: color = '#9c27b0';
                  }
                  
                  return (
                    <div key={resource.type} style={{ textAlign: 'center', minWidth: '150px' }} className="scrollable-item">
                      <svg width="120" height="120" viewBox="0 0 100 100" className="progress-circle">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke={color} 
                          strokeWidth="8" 
                          strokeDasharray={circumference} 
                          strokeDashoffset={dashoffset} 
                          className="progress-circle-value" 
                        />
                        <text x="50" y="45" textAnchor="middle" fill="white" fontSize="22" fontWeight="600">{resource.utilization}%</text>
                        <text x="50" y="65" textAnchor="middle" fill="#aaa" fontSize="12">Utilized</text>
                      </svg>
                      <div style={{ marginTop: '15px', color: '#fff', fontSize: '14px', fontWeight: '500' }}>{resource.type}</div>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>Generate Emergency Report</h3>
                <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={async () => {
                      setReportStatus({ generating: true, success: null, message: 'Generating report...' });
                      try {
                        const result = await generateReport(emergencies, volunteers, donations);
                        setReportStatus({ 
                          generating: false, 
                          success: result.success, 
                          message: result.message 
                        });
                      } catch (error) {
                        setReportStatus({ 
                          generating: false, 
                          success: false, 
                          message: 'Error generating report: ' + error.message 
                        });
                      }
                    }} 
                    disabled={reportStatus.generating}
                    style={{ 
                      padding: '8px 15px', 
                      background: 'var(--primary)', 
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: reportStatus.generating ? 'wait' : 'pointer',
                      opacity: reportStatus.generating ? 0.7 : 1
                    }}
                  >
                    {reportStatus.generating ? 'Generating...' : 'Generate Report'}
                  </button>
                  
                  {reportStatus.message && (
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '5px', 
                      color: reportStatus.success ? '#4caf50' : '#e53935',
                      fontSize: '12px'
                    }}>
                      {reportStatus.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
