// src/Weather.js
import React, { useState, useEffect } from 'react';

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const API_KEY = "e13b35e98c4d9355cc32fd45d04dd9b2";

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const data = await res.json();
        if (data.cod !== 200) throw new Error(data.message);

        setWeather({
          location: data.name,
          temperature: data.main.temp,
          humidity: data.main.humidity,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
        });
      } catch (err) {
        setError('Failed to fetch weather');
        console.error(err);
      }
    };

    const fetchLocationFromIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const { latitude, longitude } = data;
        fetchWeather(latitude, longitude);
      } catch (err) {
        setError("Failed to get location from IP");
        console.error(err);
      }
    };

    // Try GPS location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (geoError) => {
          console.warn("Geolocation failed, falling back to IP location:", geoError);
          fetchLocationFromIP();
        }
      );
    } else {
      fetchLocationFromIP();
    }
  }, []);

  if (error) return <div className="weather-error">{error}</div>;

  return (
    <div className="weather-data">
      {weather ? (
        <>
          <div className="weather-location">{weather.location}</div>
          <div className="weather-temp">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt="weather"
            />
            {weather.temperature}°C
          </div>
          <div className="weather-humidity">Humidity: {weather.humidity}%</div>
          <div className="weather-desc">{weather.description}</div>
        </>
      ) : (
        <div className="weather-loading">Loading weather...</div>
      )}
    </div>
  );
};

export default Weather;
