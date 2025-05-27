import React, { useEffect, useState } from 'react';
import API from '../api';

const Dashboard = () => {
  const [status, setStatus] = useState({});

  const fetchStatus = async () => {
    const res = await API.get("/status");
    setStatus(res.data);
  };

  useEffect(() => {
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Soil Moisture Level: {status.moisture}</h2>
      <p>Status: {status.moisture < 30 ? "Dry" : "Moist/Wet"}</p>
      <p>Pump: {status.pump_status ? "ON" : "OFF"}</p>
      <p>Last Irrigation: {status.last_irrigation}</p>
    </div>
  );
};

export default Dashboard;
