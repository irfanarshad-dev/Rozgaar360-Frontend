"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    // Progress bar animation for Desktop
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 1.5, 100);
        if (next >= 100 && progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        return next;
      });
    }, 30); // Reach 100% in ~2 seconds

    // Total display time 3.5s
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3500);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* ==================== DESKTOP VIEW ==================== */}
      <div className="hidden md:flex flex-col items-center justify-center w-full h-full relative selection:bg-transparent">
        {/* Adjusted vertical position slightly upward to match image center */}
        <div className="flex flex-col items-center -translate-y-6">
          
          {/* Logo Section */}
          <div className="mb-10 flex items-center space-x-3">
            <Image
              src="/assests/Logo/Rozgaar360-logo.png"
              alt="Rozgaar360"
              width={500}
              height={145}
              priority
              className="h-24 w-auto object-contain"
            />
            <h1 className="text-[52px] font-bold tracking-wide text-gray-900" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Rozgaar<span className="text-blue-600">360</span>
            </h1>
          </div>

          {/* Glowing Progress Capsule */}
          <div className="w-[320px] h-[22px] rounded-full border-[1.5px] border-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.35),inset_0_0_8px_rgba(59,130,246,0.15)] p-[3px] bg-blue-50 overflow-hidden mb-5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-75 ease-linear shadow-[0_0_8px_rgba(37,99,235,0.6)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-black font-light tracking-widest text-[19px] opacity-90">
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
          <Image
            src="/assests/Logo/Rozgaar360-logo.png"
            alt="Rozgaar360"
            width={390}
            height={115}
            priority
            className="h-20 w-auto object-contain"
          />
          <h2 className="text-[44px] font-bold tracking-wide text-gray-900 mt-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Rozgaar<span className="text-blue-600">360</span>
          </h2>
        </div>

        {/* Bottom Spacer and Spinner */}
        <div className="flex-1 flex flex-col justify-end items-center pb-8">
          {/* Mobile Spinner matching Image 2 */}
          <svg className="animate-spin w-[50px] h-[50px] text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
            <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
