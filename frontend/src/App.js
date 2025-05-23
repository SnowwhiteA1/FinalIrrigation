import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ref, update, onValue } from 'firebase/database';
import { database } from './firebase';
import './App.css';
import Weather from './Weather';

// Chart.js imports
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [moisturePercent, setMoisturePercentage] = useState(null);
  const [moistureHistory, setMoistureHistory] = useState([]); // New: history of moisture %
  const [error, setError] = useState(null);
  const [pumpStatus, setPumpStatus] = useState(false);
  const [lastIrrigation, setLastIrrigation] = useState(null);
  const [autoMode, setAutoMode] = useState(false);
  const [willRain, setWillRain] = useState(false);
  const [irrigationHistory, setIrrigationHistory] = useState([]);

  const [systemStatus, setSystemStatus] = useState({
    nodemcu: false,
    sensor: false,
    pump: false
  });

  // Firebase listeners
  useEffect(() => {
    const moistureRef = ref(database, '/Sensor/MoisturePercent');
    const lastIrrigationRef = ref(database, '/Pump/last_irrigation');
    const nodemcuRef = ref(database, '/Sensor/nodemcu_status');
    const pumpStatusRef = ref(database, '/Pump/status');

    const unsubscribeMoisture = onValue(moistureRef, (snapshot) => {
      const val = snapshot.val();
      if (typeof val === 'number') {
        setMoisturePercentage(val);
        setSystemStatus(prev => ({ ...prev, sensor: true }));
        setError(null);

        // Update moisture history with timestamp
        setMoistureHistory(prev => {
          const newEntry = { time: Date.now(), value: val };
          // Keep last 20 entries max to avoid memory issues
          const updated = [...prev, newEntry].slice(-20);
          return updated;
        });

      } else {
        setMoisturePercentage(null);
        setSystemStatus(prev => ({ ...prev, sensor: false }));
        setError('Moisture data unavailable');
      }
    }, () => {
      setMoisturePercentage(null);
      setSystemStatus(prev => ({ ...prev, sensor: false }));
      setError('Failed to read moisture data');
    });

    const unsubscribeLastIrrigation = onValue(lastIrrigationRef, (snapshot) => {
      const val = snapshot.val();
      setLastIrrigation(val);
      if (val) {
        setIrrigationHistory(prev => {
          if (prev.length && prev[prev.length - 1].time === val) return prev;
          return [...prev, { time: val, value: 1 }];
        });
      }
    });

    const unsubscribeNodemcu = onValue(nodemcuRef, (snapshot) => {
      const status = snapshot.val();
      setSystemStatus(prev => ({
        ...prev,
        nodemcu: status === 'connected' || status === true
      }));
    });

    const unsubscribePumpStatus = onValue(pumpStatusRef, (snapshot) => {
      const status = snapshot.val();
      const isOn = typeof status === 'string' && status.toLowerCase() === 'on';
      setPumpStatus(isOn);
      setSystemStatus(prev => ({ ...prev, pump: isOn }));
    });

    return () => {
      unsubscribeMoisture();
      unsubscribeLastIrrigation();
      unsubscribeNodemcu();
      unsubscribePumpStatus();
    };
  }, []);

  // Auto mode listener
  useEffect(() => {
    const autoRef = ref(database, '/Sensor/auto_mode');
    const unsubscribeAuto = onValue(autoRef, (snapshot) => {
      setAutoMode(!!snapshot.val());
    });
    return () => unsubscribeAuto();
  }, []);

  // Toggle auto irrigation mode
  const toggleAutoMode = () => {
    const newAutoMode = !autoMode;

    if (newAutoMode && willRain) {
      alert("Auto mode disabled because rain is forecasted.");
      return;
    }

    update(ref(database, '/Sensor'), {
      auto_mode: newAutoMode,
      pump: newAutoMode ? 'ON' : 'OFF'
    }).then(() => {
      setAutoMode(newAutoMode);
    }).catch(err => {
      console.error('Failed to toggle auto mode:', err);
    });
  };

  // Manual pump control
  const setPump = (status) => {
    const isOn = status === 'ON';
    const now = new Date().toLocaleString();

    update(ref(database, '/Pump'), {
      status: status.toLowerCase(),
      last_irrigation: isOn ? now : lastIrrigation
    }).then(() => {
      setPumpStatus(isOn);
      if (isOn) setLastIrrigation(now);
    }).catch((error) => {
      console.error('Error updating pump status:', error);
    });
  };

  // Chart data for moisture history
  const moistureChartData = {
    labels: moistureHistory.map(entry => new Date(entry.time).toLocaleTimeString()),
    datasets: [{
      label: "Soil Moisture (%)",
      data: moistureHistory.map(entry => entry.value),
      borderColor: "rgb(54, 162, 235)",
      backgroundColor: "rgba(54, 162, 235, 0.4)",
      tension: 0.3,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 7,
    }]
  };

  const moistureChartOptions = {
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 10, callback: val => `${val}%` },
        grid: { drawTicks: true, drawBorder: true },
      },
      x: {
        grid: { drawTicks: false, drawBorder: false }
      }
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}% at ${context.label}`
        }
      }
    },
    maintainAspectRatio: false,
  };

  // Chart data for irrigation history (kept as original)
  const irrigationChartData = {
    labels: irrigationHistory.map(entry => new Date(entry.time).toLocaleString()),
    datasets: [{
      label: "Irrigation Events",
      data: irrigationHistory.map(() => 1),
      borderColor: "rgb(75, 192, 192)",
      tension: 0.2,
      fill: false,
      pointRadius: 5,
      pointHoverRadius: 8,
    }]
  };

  const irrigationChartOptions = {
    scales: {
      y: {
        min: 0,
        max: 2,
        ticks: { stepSize: 1, callback: () => "" },
        grid: { drawTicks: false, drawBorder: false },
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Irrigation Event at ${context.label}`
        }
      }
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">SMART IRRIGATION SYSTEM</h1>
      <div className="dashboard-grid">
        <div className="left-column">
          <div className="card moisture-card">
            <h3>CURRENT MOISTURE</h3>
            <div className="moisture-display">
              <div className="moisture-circle" style={{ width: 100, height: 100 }}>
                <CircularProgressbar
                  value={moisturePercent || 0}
                  text={moisturePercent !== null ? `${moisturePercent}%` : 'N/A'}
                  styles={buildStyles({
                    pathColor: moisturePercent > 30 ? '#4CAF50' : '#F44336',
                    textSize: '16px',
                    textColor: '#000',
                    trailColor: '#eee'
                  })}
                />
              </div>
              <p style={{ textAlign: 'center', marginTop: 10 }}>
                {moisturePercent !== null
                  ? moisturePercent < 50 ? 'Dry' : 'Moist'
                  : error || 'N/A'}
              </p>
            </div>
            <div className="timestamp">
              <div>{new Date().toLocaleDateString()}</div>
              <div>{new Date().toLocaleTimeString()}</div>
            </div>
          </div>

         <div className="card moisture-history-card" style={{ height: 500, marginTop: 20 }}>
  <h3>LAST IRRIGATION</h3>
  <div className="last-irrigation-time">{lastIrrigation || 'N/A'}</div>
  {moistureHistory.length > 0 ? (
    <div style={{ height: '100%' }}>
      <Line data={moistureChartData} options={{ 
        ...moistureChartOptions,
        maintainAspectRatio: false 
      }} />
    </div>
  ) : (
    <p>No moisture data available yet.</p>
  )}
</div>


        </div>

        <div className="right-column">
          <div className="card pump-control-card">
            <h3>PUMP CONTROL</h3>
            <div className="auto-mode-toggle">
              <label>Automatic Mode</label>
              <label className="switch">
                <input type="checkbox" checked={autoMode} onChange={toggleAutoMode} />
                <span className="slider"></span>
              </label>
            </div>

            {!autoMode && (
              <div className="pump-buttons">
                <button onClick={() => setPump('ON')}>TURN ON</button>
                <button onClick={() => setPump('OFF')}>TURN OFF</button>
              </div>
            )}

            <div>
              <p>Pump is currently: <strong>{pumpStatus ? 'ON' : 'OFF'}</strong></p>
            </div>
          </div>

          <div className="card temperature-card">
            <h3>TEMPERATURE STATUS</h3>
            <Weather setWillRain={setWillRain} />
          </div>

          <div className="card system-status-card">
            <h3>SYSTEM STATUS</h3>
            <ul className="status-list">
              <li>
                <span className={`status-dot ${systemStatus.nodemcu ? 'green' : 'red'}`}></span>
                NodeMCU: {systemStatus.nodemcu ? 'Connected' : 'Disconnected'}
              </li>
              <li>
                <span className={`status-dot ${systemStatus.sensor ? 'green' : 'red'}`}></span>
                Sensor: {systemStatus.sensor ? 'Online' : 'Offline'}
              </li>
              <li>
                <span className={`status-dot ${systemStatus.pump ? 'green' : 'red'}`}></span>
                Pump: {systemStatus.pump ? 'On' : 'Off'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
