// src/Dashboard.js
import React, { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import App from './App'; // full dashboard

function Dashboard() {
  const [showSplash, setShowSplash] = useState(true);

  const handleFinish = () => setShowSplash(false);

  return showSplash ? <SplashScreen onFinish={handleFinish} /> : <App />;
}

export default Dashboard;
