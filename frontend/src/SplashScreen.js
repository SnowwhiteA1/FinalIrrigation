import React, { useEffect } from 'react';
import './SplashScreen.css';
import logo from './logo.webp'; // ✅ Import the image

function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <img src={logo} alt="Company Logo" className="splash-logo" /> {/* ✅ Use imported logo */}
      <p className="splash-description">
        Smart Irrigation System Dashboard by Jump Start Your Career
      </p>
    </div>
  );
}

export default SplashScreen;
