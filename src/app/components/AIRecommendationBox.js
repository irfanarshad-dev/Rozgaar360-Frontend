'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Loader2, ArrowRight, User, Star, CheckCircle2, MessageSquare, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

const SKILL_TRANSLATION_KEYS = {
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
  actechician: 'acRepair',
  actechnician: 'acRepair',
};

function getSkillTranslationKey(skill = '') {
  const normalized = String(skill).toLowerCase().replace(/[^a-z]/g, '');
  return SKILL_TRANSLATION_KEYS[normalized] || null;
}

export default function AIRecommendationBox({ sharedLocation, requestSharedLocation }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [useLocation, setUseLocation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 3;
  const router = useRouter();
  const { t, i18n } = useTranslation('home');

  const isUrdu = i18n.language?.toLowerCase().startsWith('ur');
  const resultsLabel = t('aiBox.matches', { count: results.length });

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentPage(1);

    const performSearch = async (lat, lng) => {
      try {
        const params = { query, language: i18n.language };
        if (lat && lng) {
          params.lat = lat;
          params.lng = lng;
          params.radiusKm = 5;
        }
        const res = await api.get('/api/recommendations/ai', { params });
        setResults(res.data || []);
        if (res.data?.length === 0) {
          setError(t('aiBox.noRelatedWorkers'));
        }
      } catch (err) {
        console.error(err);
        setError(t('aiBox.unavailable'));
      } finally {
        setLoading(false);
      }
    };

    if (!useLocation) {
      performSearch();
      return;
    }

    let location = sharedLocation;
    if (!location && requestSharedLocation) {
      location = await requestSharedLocation();
    }

    if (location?.lat && location?.lng) {
      performSearch(location.lat, location.lng);
      return;
    }

    setError(t('aiBox.locationDenied'));
    performSearch();
  };

  // Pagination logic
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.getElementById('ai-results')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="p-5 sm:p-6 lg:p-8 border-b border-gray-100">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                {t('aiBox.title')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('aiBox.subtitle')}
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleAISearch} className="space-y-4">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('aiBox.placeholder')}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px] resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={useLocation}
                  onChange={(e) => setUseLocation(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{t('aiBox.nearMe')}</span>
              </label>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 text-white font-semibold text-sm shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_1px_2px_0_rgba(0,0,0,0.05)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_4px_8px_0_rgba(0,0,0,0.1)] active:shadow-[0_0_0_0_rgba(255,255,255,0.2)_inset,0_1px_2px_0_rgba(0,0,0,0.05)_inset] transition-all duration-150 active:translate-y-[1px] border border-blue-700/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('aiBox.searching', { defaultValue: isUrdu ? 'تلاش جاری ہے...' : 'Searching...' })}</span>
                  </>
                ) : (
                  <>
                    <span>{t('aiBox.searchButton', { defaultValue: 'Search' })}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <span className="font-bold flex-shrink-0">!</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div id="ai-results" className="p-5 sm:p-6 lg:p-8 bg-gray-50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  {t('aiBox.resultsTitle')}
                </h4>
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{results.length}</span> {resultsLabel}
              </div>
            </div>

            <div className="space-y-3">
              {currentResults.map((worker, index) => (
                <div 
                  key={worker.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-300 animate-fadeInUp"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden ring-2 ring-gray-100">
                        <Image
                          src={worker.profilePicture || '/user.png'}
                          alt={worker.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {worker.verified && (
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center ring-2 ring-white">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                            {worker.name}
                          </h5>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 font-medium text-blue-700">
                              {(() => {
                                const skillKey = getSkillTranslationKey(worker.skill || '');
                                return skillKey ? t(`popularServices.${skillKey}.title`, { defaultValue: worker.skill }) : (worker.skill || t('aiBox.skillFallback', { defaultValue: 'Skill' }));
                              })()}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />
                              {worker.city}
                            </span>
                            {typeof worker.distanceKm === 'number' && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-blue-600 font-medium">{worker.distanceKm}km</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-amber-700">{worker.rating || 'New'}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {t('aiBox.reviewCount', { count: worker.reviewCount || 0 })}
                          </span>
                        </div>
                      </div>

                      {/* AI Reason */}
                      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2.5 mb-3 border border-blue-100">
                        <div className="absolute top-1.5 left-1.5">
                          <Sparkles className="w-3 h-3 text-blue-400" />
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed pl-5 line-clamp-2" dir={isUrdu ? 'rtl' : 'ltr'}>
                          {worker.aiReason}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                          onClick={() => router.push(`/profile/${worker.id}`)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-[0.98]"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>{t('common:viewProfile')}</span>
                        </button>
                        <button 
                          onClick={() => {
                            const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                            const user = userStr ? JSON.parse(userStr) : {};
                            const route = user.role === 'worker' ? '/worker/chat' : '/customer/chat';
                            router.push(`${route}?recipientId=${worker.id}`);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-b from-blue-600 to-blue-700 text-white font-semibold text-xs shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_2px_4px_0_rgba(0,0,0,0.1)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_4px_8px_0_rgba(0,0,0,0.15)] transition-all active:translate-y-[1px] border border-blue-700/50"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{t('common:contact')}</span>
                        </button>
                      </div>

                      {/* Match Score - Mobile */}
                      <div className="sm:hidden mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <div className="text-center">
                            <span className="text-xl font-black text-blue-600">{worker.matchScore}%</span>
                            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide ml-1">{t('aiBox.match')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Match Score - Desktop */}
                    <div className="hidden sm:flex flex-col items-center justify-center border-l border-gray-200 pl-4 ml-4 flex-shrink-0 min-w-[80px]">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-20" />
                        <div className="relative text-2xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {worker.matchScore}%
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 mt-1">
                        <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {t('aiBox.match')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`inline-flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg font-semibold text-sm transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Results Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(endIndex, results.length)}</span> of <span className="font-semibold text-gray-900">{results.length}</span> results
              </p>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">{t('aiBox.disclaimer')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
