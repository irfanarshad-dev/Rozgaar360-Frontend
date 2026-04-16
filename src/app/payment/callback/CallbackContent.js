'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      const params = Object.fromEntries(searchParams.entries());
      
      if (Object.keys(params).length === 0) {
        console.log('No payment params found');
        setStatus('failed');
        return;
      }
      
      try {
        const res = await api.post('/api/payments/stripe/callback', params);
        setStatus(res.data.success ? 'success' : 'failed');
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('failed');
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold">Processing Payment...</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Payment Successful!</h1>
            <button onClick={() => router.push('/customer/bookings')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
              View Bookings
            </button>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Payment Failed</h1>
            <button onClick={() => router.push('/customer/bookings')} className="mt-4 bg-gray-600 text-white px-6 py-2 rounded-lg">
              Back to Bookings
            </button>
          </>
        )}
      </div>
    </div>
  );
}
