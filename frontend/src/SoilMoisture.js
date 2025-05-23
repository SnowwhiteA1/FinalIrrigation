import React, { useEffect, useState } from "react";
import { database, ref, onValue } from "./firebase";

function SoilMoisture() {
  const [moisture, setMoisture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const moistureRef = ref(database, "soilMoisture"); // path in your database
    const unsubscribe = onValue(moistureRef, (snapshot) => {
      const value = snapshot.val();
      setMoisture(value);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading moisture data...</div>;

  return (
    <div>
      <h2>Current Soil Moisture</h2>
      <p>{moisture !== null ? `${moisture} %` : "No data available"}</p>
    </div>
  );
}

export default SoilMoisture;
