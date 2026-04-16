'use client';
import { Suspense } from 'react';
import CallbackContent from './CallbackContent';

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
