"use client";

import React, { useEffect, useState } from "react";

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation for Desktop
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1.5;
      });
    }, 30); // Reach 100% in ~2 seconds

    // Total display time 3.5s
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "#063A64" }} // Deep blue matching the provided images
    >
      {/* ==================== DESKTOP VIEW ==================== */}
      <div className="hidden md:flex flex-col items-center justify-center w-full h-full relative selection:bg-transparent">
        {/* Adjusted vertical position slightly upward to match image center */}
        <div className="flex flex-col items-center -translate-y-6">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3 mb-10 pl-2">
            {/* Desktop custom R Logo */}
            <svg viewBox="0 0 100 100" className="w-[85px] h-[85px]" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 20 15 h 16 v 75 h -16 z" fill="white" rx="3" />
              <path d="M 28 23 h 35 a 22 22 0 0 1 0 44 h -8" stroke="white" strokeWidth="16" />
              <polygon points="57,46 39,67 57,88" fill="white" />
              <path d="M 52 67 l 16 28 h 18 l -16 -28 z" fill="white" />
            </svg>
            <h1 className="text-[52px] font-bold text-white tracking-wide" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Rozgaar360
            </h1>
          </div>

          {/* Glowing Progress Capsule */}
          <div className="w-[320px] h-[22px] rounded-full border-[1.5px] border-cyan-200/80 shadow-[0_0_12px_rgba(255,255,255,0.7),inset_0_0_8px_rgba(255,255,255,0.3)] p-[3px] bg-transparent overflow-hidden mb-5">
            <div 
              className="h-full bg-white rounded-full transition-all duration-75 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-white font-light tracking-widest text-[19px] opacity-90">
            Loading...
          </p>
        </div>
      </div>

      {/* ==================== MOBILE VIEW ==================== */}
      <div className="flex md:hidden flex-col items-center justify-between w-full h-full py-[15vh] px-4 relative selection:bg-transparent">
        
        {/* Top spacer to push content into center and bottom */}
        <div className="flex-[0.8]"></div>

        {/* Center Mobile Logo Section */}
        <div className="flex flex-col items-center">
          <div className="relative w-[150px] h-[150px] flex items-center justify-center">
            {/* Outer Circular Arrows */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="rotate(0 50 50)">
                <path d="M 90 60 A 42 42 0 0 0 16 26" stroke="white" strokeWidth="6" strokeLinecap="round" />
                <polygon points="28,21 11,20 18,36" fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              </g>
              <g transform="rotate(180 50 50)">
                <path d="M 90 60 A 42 42 0 0 0 16 26" stroke="white" strokeWidth="6" strokeLinecap="round" />
                <polygon points="28,21 11,20 18,36" fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              </g>
            </svg>

            {/* Inner R and 360° */}
            <svg viewBox="0 0 100 100" className="w-[65px] h-[65px]" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 20 15 h 16 v 75 h -16 z" fill="white" rx="3" />
              <path d="M 28 23 h 35 a 22 22 0 0 1 0 44 h -8" stroke="white" strokeWidth="16" />
              <polygon points="57,46 39,67 57,88" fill="white" />
              <path d="M 52 67 l 16 28 h 18 l -16 -28 z" fill="white" />
              {/* 360 text embedded inside the bowl gap */}
              <text x="60" y="47" dominantBaseline="middle" textAnchor="middle" fill="white" className="font-bold text-[19px] tracking-tighter">360°</text>
            </svg>
          </div>

          <h2 className="text-[44px] font-bold text-white tracking-wide mt-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Rozgaar360
          </h2>
        </div>

        {/* Bottom Spacer and Spinner */}
        <div className="flex-1 flex flex-col justify-end items-center pb-8">
          {/* Mobile Spinner matching Image 2 */}
          <svg className="animate-spin w-[50px] h-[50px] text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
            <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
