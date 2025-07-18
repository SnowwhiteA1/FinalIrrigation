import React, { useState, useEffect, useRef } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './App.css';
import Weather from './Weather';
import SplashScreen from './SplashScreen';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

function App() {
  const [plantAMoisture, setPlantAMoisture] = useState(0);
  const [plantBMoisture, setPlantBMoisture] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [soilDry, setSoilDry] = useState(false);
  const [motion , Motion] = useState(false);
  const [garageDoor, GarageDoor] = useState(false);
  const [outsideLight, OutsideLight] = useState(false);
  const [insideLight, InsideLight] = useState(false);
  const [soilDry2, setSoilDry2] = useState(false);
  const [mode, setMode] = useState("manual");
  const [error, setError] = useState(null);
  const [cameraUrl, setCameraUrl] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [deviceStatus, setDeviceStatus] = useState({
    fan: false,
    pump1: false,
    pump2: false,
    light: false,
  });

  const recognitionRef = useRef(null);

  const mockIrrigationHistory = [
    { day: 'Mon', moisture: 20 },
    { day: 'Tue', moisture: 35 },
    { day: 'Wed', moisture: 30 },
    { day: 'Thu', moisture: 45 },
    { day: 'Fri', moisture: 40 },
  ];

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (command.includes("turn on pump one")) toggleDevice("pump1", true);
      else if (command.includes("turn off pump one")) toggleDevice("pump1", false);
      else if (command.includes("turn on pump two")) toggleDevice("pump2", true);
      else if (command.includes("turn off pump two")) toggleDevice("pump2", false);
      else if (command.includes("turn on fan")) toggleDevice("fan", true);
      else if (command.includes("turn off fan")) toggleDevice("fan", false);
      else if (command.includes("turn on light")) toggleDevice("light", true);
      else if (command.includes("turn off light")) toggleDevice("light", false);
      else if (command.includes("switch to manual")) updateMode("manual");
      else if (command.includes("switch to auto")) updateMode("auto");
    };

    recognition.onerror = (event) => console.error("Speech recognition error:", event.error);
    return recognition;
  };

  const updateMode = async (newMode) => {
    try {
      await fetch('http://localhost:5000/update-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });
      setMode(newMode);
    } catch (error) {
      console.error('Mode update failed:', error);
    }

    if (newMode === "auto") {
      const recognition = initializeSpeechRecognition();
      if (recognition) {
        recognition.start();
        recognitionRef.current = recognition;
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    } 
  };

  const toggleMode = () => updateMode(mode === "auto" ? "manual" : "auto");

  const toggleDevice = async (device, forceStatus = null) => {
  const newStatus = forceStatus !== null ? forceStatus : !deviceStatus[device];

  try {
    const res = await fetch('http://localhost:5000/update-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device, status: newStatus })
    });

    if (res.ok) {
      // Update state ONLY if backend accepted
      setDeviceStatus(prev => ({ ...prev, [device]: newStatus }));
      console.log(`✅ ${device} updated to ${newStatus} in Firebase`);
    } else {
      const err = await res.json();
      console.error("❌ Device update failed:", err);
    }
  } catch (error) {
    console.error(`❌ Failed to toggle ${device}:`, error);
  }
};


  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await fetch("http://localhost:5000/Sensor");
        if (!res.ok) throw new Error("Failed to fetch sensor data");
        const data = await res.json();

        console.log("Sensor Data:", data);  // ✅ DEBUGGING LOG

        setPlantAMoisture(data.soil_moisture ?? 0);
        setPlantBMoisture(data.soil_moisture1 ?? 0);
        setTemperature(data.temperature ?? 0);
        setHumidity(data.humidity ?? 0);
        setSoilDry(data.soil_dry ?? false);
        setSoilDry2(data.soil_dry2 ?? false);
        Motion(data.motion ?? false);
        GarageDoor(data.garage_door ?? false);
        OutsideLight(data.outside_light ?? false);
        setDeviceStatus({
          fan: data.fan ?? false,
          pump1: data.pump1 ?? false,
          pump2: data.pump2 ?? false,
          light: data.light ?? false
        });
        setMode(data.mode ?? "manual");
        setError(null);
      } catch (err) {
        console.error("Sensor data fetch failed:", err);
        setError("Could not load sensor data.");
      }
    };

    fetchSensorData(); // fetch once on load
    const interval = setInterval(fetchSensorData, 10000); // fetch every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Smart IoT Dashboard</h1>

      <div className="dashboard-section">
        <h2>Sensor Readings</h2>
        <div className="dashboard-card">
          <div className="dashboard-item">
            <h3>Plant A Moisture</h3>
            <CircularProgressbar value={plantAMoisture} text={`${plantAMoisture}%`}
              styles={buildStyles({ pathColor: plantAMoisture > 30 ? '#4CAF50' : '#F44336' })} />
          </div>
          <div className="dashboard-item">
            <h3>Plant B Moisture</h3>
            <CircularProgressbar value={plantBMoisture} text={`${plantBMoisture}%`}
              styles={buildStyles({ pathColor: plantBMoisture > 30 ? '#4CAF50' : '#F44336' })} />
          </div>
          <div className="dashboard-item">
            <h3>Temperature & Humidity</h3>
            <p>Temp: {temperature}°C</p>
            <p>Humidity: {humidity}%</p>
          </div>
          <div className="dashboard-item">
            <h3>Soil Status</h3>
            <p>Plant A: {soilDry ? "Dry" : "Moist"}</p>
            <p>Plant B: {soilDry2 ? "Dry" : "Moist"}</p>
          </div>
          <div className="dashboard-item">
            <h3>System Status </h3>
            <p>Motion Detected: {motion ? "Yes" : "No"}</p>
            <p>Garage Door: {garageDoor ? "Open" : "Closed"}</p>
            <p>Outside Light: {outsideLight ? "On" : "Off"}</p>
            <p>Inside Light: {insideLight ? "On" : "Off"}</p>
            
          </div>
          <div className="dashboard-item">
            <h3>Weather</h3>
            <Weather/>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Irrigation History</h2>
        <div className="dashboard-card">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockIrrigationHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="moisture" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Device Control</h2>
        <div className="dashboard-card">
          <div className="dashboard-item">
            <h3>Mode: {mode === "auto" ? "Automatic" : "Manual"}</h3>
            <label className="switch">
              <input type="checkbox" checked={mode === "auto"} onChange={toggleMode} />
              <span className="slider" />
            </label>
            {mode === "auto" && <p style={{ color: "#4CAF50" }}>🎙️ Speak your commands</p>}
          </div>
          {Object.entries(deviceStatus).map(([device, status]) => (
            <div className="dashboard-item" key={device}>
              <h3>{device.toUpperCase()}</h3>
              <p>Status: {status ? "ON" : "OFF"}</p>
              {mode === "manual" && (
                <label className="switch">
                  <input type="checkbox" checked={status} onChange={() => toggleDevice(device)} />
                  <span className="slider" />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Camera Feed</h2>
        <div className="dashboard-card" style={{ textAlign: 'center' }}>
          <input
            type="text"
            placeholder="Enter camera URL"
            value={cameraUrl}
            onChange={(e) => setCameraUrl(e.target.value)}
            style={{ padding: '10px', width: '70%' }}
          />
          <button onClick={() => setImageSrc(cameraUrl)} style={{ marginTop: '10px' }}>
            Load Feed
          </button>
          {imageSrc && (
            <img
              src={imageSrc}
              alt="Camera"
              width={800}
              onError={() => alert('Image load failed')}
              style={{ marginTop: '10px', borderRadius: '10px', border: '1px solid #ccc' }}
            />
          )}
        </div>
      </div>
      <div className="dashboard-section">
        <h2>Motion Sensor (PIR)</h2>
        </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default App;
