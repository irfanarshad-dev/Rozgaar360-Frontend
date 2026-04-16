'use client'
import React from 'react'
import Link from 'next/link'

const notFoundPage = () => {
  return (
    <div className="flex items-center justify-center bg-white px-4 py-16">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        <div className="relative">
          <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-9xl md:text-[12rem] font-black text-gray-100 blur-sm">
            404
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-md mx-auto">
            The page you&apos;re looking for seems to have vanished into the digital void.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/" 
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Go Home
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transform hover:scale-105 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
        
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  )
}

export default notFoundPage;    
