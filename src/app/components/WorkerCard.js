'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MapPin, Star } from 'lucide-react';

export default function WorkerCard({ worker, animationDelay = 0 }) {
  const router = useRouter();
  const { t } = useTranslation(['common']);

  const handleContact = () => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : {};
    const route = user.role === 'worker' ? '/worker/chat' : '/customer/chat';
    router.push(`${route}?workerId=${worker.id}`);
  };

  const rating = Number(worker.rating) || 0;
  const reviewCount = Number(worker.reviewCount) || 0;

  return (
    <div
      className="recommendation-card rounded-xl border border-gray-100 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-start gap-3">
        <img
          src={worker.profilePicture || '/default-avatar.png'}
          alt={worker.name}
          className="h-9 w-9 rounded-full bg-gray-100 object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium text-gray-900">{worker.name}</h3>
            </div>

            <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              {worker.skill || t('common:skill')}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{worker.city || '-'}</span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-0.5 text-yellow-400">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-3.5 w-3.5 ${index < Math.round(rating) ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span>({reviewCount} {t('common:reviews')})</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/profile/${worker.id}`}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-blue-300 hover:bg-white"
        >
          {t('common:viewProfile')}
        </Link>
        <button 
          onClick={handleContact}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          {t('common:contact')}
        </button>
      </div>
    </div>
  );
}