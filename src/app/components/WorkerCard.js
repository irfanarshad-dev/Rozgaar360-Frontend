'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, MessageCircle, CheckCircle } from 'lucide-react';

export default function WorkerCard({ worker, animationDelay = 0 }) {
  const router = useRouter();
  const { t } = useTranslation(['home', 'common']);

  const getSkillTranslationKey = (skill = '') => {
    const normalized = skill.toLowerCase().replace(/[^a-z]/g, '');
    const skillMap = {
      plumber: 'plumber',
      electrician: 'electrician',
      carpenter: 'carpenter',
      tailor: 'tailor',
      painter: 'painter',
      cleaner: 'cleaner',
      mechanic: 'mechanic',
      cook: 'cook',
      chef: 'cook',
      driver: 'driver',
      acrepair: 'acRepair',
      acrepair: 'acRepair',
      actechnician: 'acRepair'
    };

    return skillMap[normalized] || null;
  };

  const translatedSkill = (() => {
    const skillKey = getSkillTranslationKey(worker.skill || '');
    if (skillKey) {
      return t(`home:skills.${skillKey}`, { defaultValue: worker.skill });
    }

    return worker.skill || t('common:skill');
  })();

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
      className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-transparent to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 transition-all duration-500 pointer-events-none" />
      
      <div className="relative p-5">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar with verified badge */}
          <div className="relative flex-shrink-0">
            <div className="relative h-14 w-14 rounded-xl overflow-hidden ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
              <Image
                src={worker.profilePicture || '/user.png'}
                alt={worker.name}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>
            {worker.verified && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center ring-2 ring-white">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          {/* Name and Skill */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
              {worker.name}
            </h3>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-blue-700">
                {translatedSkill}
              </span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{worker.city || '-'}</span>
        </div>

        {/* Rating Section */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${
                  index < Math.round(rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {reviewCount} {t('common:reviews')}
          </span>
        </div>

        {/* Experience Badge */}
        {worker.experience && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-medium text-gray-700">
              {worker.experience === 1
                ? t('home:featured.experienceOne', { count: worker.experience })
                : t('home:featured.experienceOther', { count: worker.experience })}
            </span>
          </div>
        )}

        {worker.verified && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-xs font-medium text-emerald-700 border border-emerald-100">
              <CheckCircle className="h-3.5 w-3.5" />
              {t('common:verified')}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/profile/${worker.id}`}
            className="flex-1 text-center px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
          >
            {t('home:featured.viewProfile')}
          </Link>
          <button 
            onClick={handleContact}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{t('common:contact')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
