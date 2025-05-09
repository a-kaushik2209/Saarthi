import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { saveAs } from 'file-saver';


export const generateReport = async (emergencies, volunteers, donations) => {
  try {

    const reportData = {
      generatedAt: new Date().toLocaleString(),
      summary: {
        totalEmergencies: emergencies.length,
        activeEmergencies: emergencies.filter(e => e.status === 'pending' || e.status === 'inProgress').length,
        resolvedEmergencies: emergencies.filter(e => e.status === 'resolved').length,
        totalVolunteers: volunteers.length,
        activeVolunteers: volunteers.filter(v => v.status === 'active').length,
        totalDonations: donations.length,
        donationAmount: donations.reduce((sum, donation) => sum + (donation.amount || 0), 0)
      },
      emergenciesByType: getEmergenciesByType(emergencies),
      emergenciesByLocation: getEmergenciesByLocation(emergencies),
      resourceUtilization: calculateResourceUtilization(emergencies, volunteers, donations)
    };


    const emergenciesCSV = generateCSV(emergencies, [
      { key: 'id', header: 'ID' },
      { key: 'type', header: 'Type' },
      { key: 'severity', header: 'Severity' },
      { key: 'status', header: 'Status' },
      { key: 'location', header: 'Location' },
      { key: 'description', header: 'Description' },
      { key: 'userName', header: 'Reported By' },
      { key: 'createdAt', header: 'Reported At', formatter: (val) => formatDate(val) }
    ]);

    // Generate CSV for volunteers
    const volunteersCSV = generateCSV(volunteers, [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'skills', header: 'Skills', formatter: (val) => Array.isArray(val) ? val.join(', ') : val },
      { key: 'status', header: 'Status' },
      { key: 'location', header: 'Location' },
      { key: 'availability', header: 'Availability' }
    ]);

    // Generate text report
    const textReport = generateTextReport(reportData);

    // Save files
    saveAs(new Blob([textReport], { type: 'text/plain;charset=utf-8' }), 'saarthi_summary_report.txt');
    saveAs(new Blob([emergenciesCSV], { type: 'text/csv;charset=utf-8' }), 'saarthi_emergencies.csv');
    saveAs(new Blob([volunteersCSV], { type: 'text/csv;charset=utf-8' }), 'saarthi_volunteers.csv');

    return {
      success: true,
      message: 'Report generated successfully',
      files: ['saarthi_summary_report.txt', 'saarthi_emergencies.csv', 'saarthi_volunteers.csv']
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      message: 'Failed to generate report: ' + error.message
    };
  }
};

// Helper function to get emergencies by type
const getEmergenciesByType = (emergencies) => {
  const types = {};
  
  emergencies.forEach(emergency => {
    const type = emergency.type || 'Unknown';
    if (!types[type]) {
      types[type] = 0;
    }
    types[type]++;
  });
  
  return Object.entries(types).map(([type, count]) => ({ type, count }));
};

// Helper function to get emergencies by location
const getEmergenciesByLocation = (emergencies) => {
  const locations = {};
  
  emergencies.forEach(emergency => {
    const location = emergency.location ? emergency.location.split(',')[0].trim() : 'Unknown';
    if (!locations[location]) {
      locations[location] = 0;
    }
    locations[location]++;
  });
  
  return Object.entries(locations).map(([location, count]) => ({ location, count }));
};

// Helper function to calculate resource utilization
const calculateResourceUtilization = (emergencies, volunteers, donations) => {
  // Calculate medical resources
  const medicalEmergencies = emergencies.filter(e => e.type === 'Medical' || e.description?.toLowerCase().includes('medical')).length;
  const medicalVolunteers = volunteers.filter(v => v.skills?.includes('Medical')).length;
  const medicalUtilization = medicalVolunteers > 0 ? Math.min(100, Math.round((medicalEmergencies / medicalVolunteers) * 100)) : 0;
  
  // Calculate food resources
  const foodEmergencies = emergencies.filter(e => e.type === 'Food' || e.description?.toLowerCase().includes('food')).length;
  const foodDonations = donations.filter(d => d.type === 'Food').length;
  const foodUtilization = foodDonations > 0 ? Math.min(100, Math.round((foodEmergencies / foodDonations) * 100)) : 0;
  
  // Calculate shelter resources
  const shelterEmergencies = emergencies.filter(e => e.type === 'Shelter' || e.description?.toLowerCase().includes('shelter')).length;
  const shelterDonations = donations.filter(d => d.type === 'Shelter').length;
  const shelterUtilization = shelterDonations > 0 ? Math.min(100, Math.round((shelterEmergencies / shelterDonations) * 100)) : 0;
  
  // Calculate transport resources
  const transportEmergencies = emergencies.filter(e => e.type === 'Transport' || e.description?.toLowerCase().includes('transport')).length;
  const transportVolunteers = volunteers.filter(v => v.skills?.includes('Transport')).length;
  const transportUtilization = transportVolunteers > 0 ? Math.min(100, Math.round((transportEmergencies / transportVolunteers) * 100)) : 0;
  
  return [
    { type: 'Medical', utilization: medicalUtilization },
    { type: 'Food', utilization: foodUtilization },
    { type: 'Shelter', utilization: shelterUtilization },
    { type: 'Transport', utilization: transportUtilization }
  ];
};

// Helper function to generate CSV
const generateCSV = (data, columns) => {
  if (!data || data.length === 0) {
    return '';
  }
  
  // Create header row
  const header = columns.map(col => col.header).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      const formattedValue = col.formatter ? col.formatter(value) : value;
      // Escape commas and quotes
      return formattedValue !== undefined && formattedValue !== null 
        ? `"${String(formattedValue).replace(/"/g, '""')}"` 
        : '';
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
};

// Helper function to generate text report
const generateTextReport = (reportData) => {
  const { generatedAt, summary, emergenciesByType, emergenciesByLocation, resourceUtilization } = reportData;
  
  let report = `SAARTHI EMERGENCY RESPONSE SYSTEM - SUMMARY REPORT\n`;
  report += `Generated: ${generatedAt}\n\n`;
  
  report += `SUMMARY\n`;
  report += `========\n`;
  report += `Total Emergencies: ${summary.totalEmergencies}\n`;
  report += `Active Emergencies: ${summary.activeEmergencies}\n`;
  report += `Resolved Emergencies: ${summary.resolvedEmergencies}\n`;
  report += `Total Volunteers: ${summary.totalVolunteers}\n`;
  report += `Active Volunteers: ${summary.activeVolunteers}\n`;
  report += `Total Donations: ${summary.totalDonations}\n`;
  report += `Total Donation Amount: ${summary.donationAmount}\n\n`;
  
  report += `EMERGENCIES BY TYPE\n`;
  report += `===================\n`;
  emergenciesByType.forEach(({ type, count }) => {
    report += `${type}: ${count}\n`;
  });
  report += '\n';
  
  report += `EMERGENCIES BY LOCATION\n`;
  report += `======================\n`;
  emergenciesByLocation.forEach(({ location, count }) => {
    report += `${location}: ${count}\n`;
  });
  report += '\n';
  
  report += `RESOURCE UTILIZATION\n`;
  report += `===================\n`;
  resourceUtilization.forEach(({ type, utilization }) => {
    report += `${type}: ${utilization}%\n`;
  });
  
  return report;
};

// Helper function to format date
const formatDate = (dateValue) => {
  if (!dateValue) return '';
  
  try {
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleString();
  } catch (error) {
    return String(dateValue);
  }
};

// Function to get nearby resources for a location
export const getNearbyResources = async (lat, lng, radius = 10) => {
  try {
    // Get all volunteers
    const volunteersRef = collection(db, 'volunteers');
    const volunteersSnapshot = await getDocs(volunteersRef);
    const volunteers = [];
    
    volunteersSnapshot.forEach(doc => {
      const volunteer = { id: doc.id, ...doc.data() };
      if (volunteer.locationDetails?.coordinates) {
        // Calculate distance (simple approximation)
        const distance = calculateDistance(
          lat, 
          lng, 
          volunteer.locationDetails.coordinates.lat, 
          volunteer.locationDetails.coordinates.lng
        );
        
        if (distance <= radius) {
          volunteers.push({
            ...volunteer,
            distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
          });
        }
      }
    });
    
    // Sort by distance
    volunteers.sort((a, b) => a.distance - b.distance);
    
    return volunteers;
  } catch (error) {
    console.error('Error getting nearby resources:', error);
    return [];
  }
};

// Helper function to calculate distance between two points (haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};
