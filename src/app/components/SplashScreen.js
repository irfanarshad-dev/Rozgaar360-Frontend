"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const hideTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const hasShownInitial = useRef(false);

  const startAnimation = (duration = 1200) => {
    setProgress(0);
    setIsVisible(true);
    setIsFadingOut(false);

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    // Smooth progress animation
    const increment = 100 / (duration / 16); // 60fps
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 100);
        if (next >= 100 && progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        return next;
      });
    }, 16);

    // Start fade out before hiding
    fadeTimerRef.current = setTimeout(() => {
      setIsFadingOut(true);
    }, duration - 400);

    // Hide completely
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsFadingOut(false);
    }, duration);
  };

  useEffect(() => {
    if (!hasShownInitial.current) {
      hasShownInitial.current = true;
      startAnimation(2000); // Initial load: 2 seconds
    }

    const handleLanguageChange = () => startAnimation(800); // Language change: 0.8 seconds
    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-500 ease-out ${
        isFadingOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
      style={{ 
        backgroundColor: "#ffffff",
        pointerEvents: isVisible ? 'auto' : 'none',
        display: isVisible ? 'block' : 'none'
      }}
    >
      {/* ==================== DESKTOP VIEW ==================== */}
      <div className="hidden md:flex flex-col items-center justify-center w-full h-full relative selection:bg-transparent">
        <div className="flex flex-col items-center -translate-y-6 animate-fadeIn">
          
          {/* Logo Section */}
          <div className="mb-10 flex items-center space-x-3 transform transition-transform duration-300">
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
              className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"
              style={{ 
                width: `${progress}%`,
                transition: 'width 0.1s linear'
              }}
            ></div>
          </div>
          
          <p className="text-black font-light tracking-widest text-[19px] opacity-90 animate-pulse">
            Loading...
          </p>
        </div>
      </div>

      {/* ==================== MOBILE VIEW ==================== */}
      <div className="flex md:hidden flex-col items-center justify-between w-full h-full py-[15vh] px-4 relative selection:bg-transparent overflow-hidden">
        
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 animate-gradient-shift"></div>
        
        {/* Floating Circles Animation */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-40 animate-float-slow"></div>
        <div className="absolute bottom-32 right-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30 animate-float-slower"></div>
        
        {/* Top spacer to push content into center and bottom */}
        <div className="flex-[0.8]"></div>

        {/* Center Mobile Logo Section */}
        <div className="flex flex-col items-center relative z-10">
          <div className="animate-scale-in">
            <Image
              src="/assests/Logo/Rozgaar360-logo.png"
              alt="Rozgaar360"
              width={390}
              height={115}
              priority
              className="h-20 w-auto object-contain drop-shadow-lg"
            />
          </div>
          <h2 
            className="text-[44px] font-bold tracking-wide text-gray-900 mt-6 animate-slide-up" 
            style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif',
              animationDelay: '200ms',
              animationFillMode: 'backwards'
            }}
          >
            Rozgaar<span className="text-blue-600 animate-pulse-slow">360</span>
          </h2>
        </div>

        {/* Bottom Spacer and Dot Loader */}
        <div className="flex-1 flex flex-col justify-end items-center pb-8 relative z-10">
          <div className="flex items-end gap-2.5" aria-label="Loading" role="status">
            <span
              className="h-3 w-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50 animate-bounce-smooth"
              style={{ animationDuration: '1s', animationDelay: '0ms' }}
            />
            <span
              className="h-3 w-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/50 animate-bounce-smooth"
              style={{ animationDuration: '1s', animationDelay: '150ms' }}
            />
            <span
              className="h-3 w-3 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-700/50 animate-bounce-smooth"
              style={{ animationDuration: '1s', animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
