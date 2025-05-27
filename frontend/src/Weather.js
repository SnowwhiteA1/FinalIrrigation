import React, { useEffect, useState } from "react";
import axios from "axios";


const Weather = ({ setWillRain }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  const API_KEY = "e13b35e98c4d9355cc32fd45d04dd9b2";

  const sendWeatherToBackend = async (data) => {
    try {
      await axios.post("http://localhost:5000/weather", data);
    } catch (error) {
      console.error("Error sending weather data to backend:", error);
    }
  };

  useEffect(() => {
    const fetchWeatherByLocation = async (latitude, longitude) => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        setWeather(response.data);
        setLoading(false);

        const weatherDescription = response.data.weather[0].description.toLowerCase();
        const mainWeather = response.data.weather[0].main.toLowerCase();
        const rainVolume = response.data.rain?.["1h"] || response.data.rain?.["3h"] || 0;

        const isRainLikely =
          mainWeather.includes("rain") ||
          weatherDescription.includes("rain") ||
          rainVolume > 0;

        setWillRain(isRainLikely);

        // Send weather data to backend
        const weatherPayload = {
          temperature: response.data.main.temp,
          description: response.data.weather[0].description,
          location: response.data.name,
          rain_status: isRainLikely,
          rain_volume: rainVolume,
        };
        await sendWeatherToBackend(weatherPayload);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setLocationError("Failed to fetch weather data.");
        setLoading(false);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByLocation(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationError("Location access denied or unavailable.");
            setLoading(false);
          }
        );
      } else {
        setLocationError("Geolocation is not supported by this browser.");
        setLoading(false);
      }
    };

    getLocation();
  }, [setWillRain]);

  if (loading) return <p>Loading weather...</p>;
  if (locationError) return <p>{locationError}</p>;
  if (!weather) return <p>No weather data available.</p>;

  const condition = weather.weather[0].main.toLowerCase();
  const description = weather.weather[0].description;
  const rainVolume = weather.rain?.["1h"] || weather.rain?.["3h"] || 0;
  const rainStatus = condition.includes("rain") || description.includes("rain") || rainVolume > 0;

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem", borderRadius: "8px" }}>
      <h3>Weather in {weather.name}</h3>
      <p><strong>Temperature:</strong> {weather.main.temp}°C</p>
      <p><strong>Condition:</strong> {description}</p>
      {rainStatus ? (
        <p style={{ color: "blue", fontWeight: "bold" }}>
          🌧️ Rain detected ({rainVolume > 0 ? `Volume: ${rainVolume} mm` : "based on forecast"})
        </p>
      ) : (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ☀️ No rain expected — Good weather
        </p>
      )}
    </div>
  );
};

export default Weather;
