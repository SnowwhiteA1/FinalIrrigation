import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [moisture, setMoisture] = useState(45); // mock value
  const [pumpStatus, setPumpStatus] = useState(false);
  const [lastIrrigation, setLastIrrigation] = useState('2025-05-16 10:00');

  useEffect(() => {
    // Simulate changing moisture every 5 seconds
    const interval = setInterval(() => {
      const newMoisture = Math.floor(Math.random() * 100);
      setMoisture(newMoisture);
      if (newMoisture < 30) {
        setPumpStatus(true);
        setLastIrrigation(new Date().toLocaleString());
      } else {
        setPumpStatus(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>🌱 Smart Irrigation Dashboard</h1>

      <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px' }}>
        <h2>Soil Moisture: {moisture}%</h2>
        <p>Status: {moisture < 30 ? '🔴 Dry' : '🟢 Moist/Wet'}</p>
        <p>Pump: {pumpStatus ? '💧 ON' : '❌ OFF'}</p>
        <p>Last Irrigation: {lastIrrigation}</p>
      </div>
    </div>
  );
}

export default App;
