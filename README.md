# Saarthi: Unified Emergency Response System

## Overview
Saarthi is a unified, inclusive, and priority-based emergency response and coordination system. This application provides real-time emergency management with Firebase integration:
- Real-time emergency reporting with location detection
- Priority-based visualization with interactive map
- Authenticated volunteer/donor sign-up
- Live dashboard with real-time updates
- User authentication and profile management

## Tech Stack
- **Frontend**: React (create-react-app), HTML/CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Maps**: Google Maps API integration
- **Location**: OpenCage Geocoding API

## Firebase Setup
1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password) and Firestore Database
3. Create a `.env` file in the project root with your Firebase credentials:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

## How to Run
1. Ensure you have Node.js and npm installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Features
- **User Authentication**: Secure signup and login with Firebase Authentication
- **Real-time Data**: Live updates of emergencies, volunteers, and donations
- **Location Detection**: Automatic location detection for emergency reporting
- **Interactive Map**: Priority-based visualization of emergency reports
- **Profile Management**: User profiles with contribution tracking
- **Dashboard**: Real-time analytics and resource management
- **Responsive Design**: Works on desktop and mobile devices

## Security
- Firebase Authentication for secure user management
- Environment variables for API key protection
- Protected routes for authenticated features

This application uses Firebase as a real-time backend for data storage and authentication. Future enhancements could include SMS/IVR integration for emergency notifications and additional reporting channels.

---

## Business Model & Go-To-Market (for judges)
- Freemium model: Public free, paid analytics for NGOs/authorities
- Telecom/phone partnerships for auto-SOS
- Pilot in disaster-prone areas

---

For queries, contact the Saarthi team.
