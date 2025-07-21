import React, { useState, useEffect } from 'react';
import './App.css';
import { database } from './firebase';
import { ref, onValue, set } from 'firebase/database';

function App() {
  const [sensorData, setSensorData] = useState({});
  const [deviceStatus, setDeviceStatus] = useState({});
  const [mode, setMode] = useState('manual');

  useEffect(() => {
    const sensorRef = ref(database, 'sensor_data');
    const statusRef = ref(database, 'device_status');
    const modeRef = ref(database, 'control_states/auto_mode');

    const unsubSensor = onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        setSensorData(snapshot.val());
      }
    });

    const unsubStatus = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setDeviceStatus(snapshot.val());
      }
    });

    const unsubMode = onValue(modeRef, (snapshot) => {
      if (snapshot.exists()) {
        setMode(snapshot.val() ? 'auto' : 'manual');
      }
    });

    return () => {
      unsubSensor();
      unsubStatus();
      unsubMode();
    };
  }, []);

  const toggleDevice = (deviceKey, currentValue) => {
    const deviceRef = ref(database, `device_status/${deviceKey}`);
    set(deviceRef, !currentValue);
  };

  const toggleMode = () => {
    const modeRef = ref(database, 'control_states/auto_mode');
    const newMode = mode === 'auto' ? false : true;
    set(modeRef, newMode);
  };

  return (
    <div className="app-container">
      <h1>Smart Irrigation Dashboard</h1>

      <div className="dashboard-section">
        <h2>Sensor Readings</h2>
        <div className="card">
          <p><strong>Soil Moisture A:</strong> {sensorData.soil_moisture ?? 'Loading...'}%</p>
          <p><strong>Soil Moisture B:</strong> {sensorData.soil_moisture1 ?? 'Loading...'}%</p>
          <p><strong>Temperature:</strong> {sensorData.temperature ?? 'Loading...'}°C</p>
          <p><strong>Humidity:</strong> {sensorData.humidity ?? 'Loading...'}%</p>
          <p><strong>Soil A Dry:</strong> {sensorData.soil_dry ? 'Yes' : 'No'}</p>
          <p><strong>Soil B Dry:</strong> {sensorData.soil_dry2 ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Device Status</h2>
        <div className="card">
          <p><strong>Pump 1:</strong> {deviceStatus.pump1 ? 'On' : 'Off'}</p>
          <p><strong>Pump 2:</strong> {deviceStatus.pump2 ? 'On' : 'Off'}</p>
          <p><strong>Fan:</strong> {deviceStatus.fan ? 'On' : 'Off'}</p>
          <p><strong>Inside Light:</strong> {deviceStatus.inside_light ? 'On' : 'Off'}</p>
          <p><strong>Outside Light:</strong> {deviceStatus.outside_light ? 'On' : 'Off'}</p>
          <p><strong>Garage Door:</strong> {deviceStatus.garage_door === 1 ? 'Open' : 'Closed'}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Control Panel</h2>
        <div className="card">
          <div className="control-item">
            <label>MODE: {mode.toUpperCase()}</label>
            <input
              type="checkbox"
              checked={mode === 'auto'}
              onChange={toggleMode}
            />
          </div>
          {Object.entries(deviceStatus).map(([key, value]) => (
            <div key={key} className="control-item">
              <label>{key.replace(/_/g, ' ').toUpperCase()}</label>
              <input
                type="checkbox"
                checked={!!value}
                onChange={() => toggleDevice(key, value)}
                disabled={mode === 'auto'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
