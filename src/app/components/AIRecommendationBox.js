'use client';
import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight, User, Star, CheckCircle2, MessageSquare, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function AIRecommendationBox({ sharedLocation, requestSharedLocation }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [useLocation, setUseLocation] = useState(false);
  const router = useRouter();
  const { t } = useTranslation('home');

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    const performSearch = async (lat, lng) => {
      try {
        const params = { query };
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 overflow-hidden">
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200 flex-shrink-0">
              <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{t('aiBox.title')}</h3>
              <p className="text-gray-500 text-xs sm:text-sm">{t('aiBox.subtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleAISearch} className="space-y-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('aiBox.placeholder')}
              className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-4 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all min-h-[140px] resize-none"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <label htmlFor="ai-location" className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  id="ai-location"
                  checked={useLocation}
                  onChange={(e) => setUseLocation(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium">{t('aiBox.nearMe')}</span>
              </label>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-3 rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 min-w-[120px]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{t('aiBox.searchButton', { defaultValue: 'Search' })}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 text-red-600 rounded-2xl text-xs sm:text-sm flex items-center gap-2 border border-red-100 animate-fadeIn">
              <span className="font-bold flex-shrink-0">!</span> <span>{error}</span>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="bg-slate-50 p-4 sm:p-6 md:p-8 lg:p-10 border-t border-gray-100">
            <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
              <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 text-blue-500" />
              {t('aiBox.resultsTitle')}
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6">
              {results.map((worker) => (
                <div 
                  key={worker.id} 
                  className="w-full min-w-0 bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-sm border border-slate-200 md:hover:border-blue-200 md:hover:shadow-md transition-all flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6"
                >
                  <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-[16px] sm:rounded-[24px] overflow-hidden flex-shrink-0 bg-gray-100 relative">
                    <img 
                      src={worker.profilePicture || '/user.png'} 
                      alt={worker.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg uppercase tracking-tight truncate">
                            {worker.name}
                          </h5>
                          {worker.verified && (
                            <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <p className="text-blue-600 text-xs sm:text-sm font-semibold truncate">{worker.skill} · {worker.city}{typeof worker.distanceKm === 'number' ? ` · ${worker.distanceKm}km` : ''}</p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end flex-shrink-0">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 sm:py-1 rounded-lg">
                          <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-amber-700 font-bold text-xs">{worker.rating || 'New'}</span>
                        </div>
                        <span className="text-gray-400 text-[10px] mt-0.5 sm:mt-1 font-medium">{t('aiBox.reviewCount', { count: worker.reviewCount || 0 })}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 border border-blue-100/50 mb-3 sm:mb-4">
                      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed italic line-clamp-2 sm:line-clamp-none">
                        &quot;{worker.aiReason}&quot;
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button 
                        onClick={() => router.push(`/profile/${worker.id}`)}
                        className="flex-1 bg-gray-900 hover:bg-black text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <User className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> <span className="hidden sm:inline">{t('aiBox.viewProfile')}</span><span className="sm:hidden">View</span>
                      </button>
                      <button 
                        onClick={() => {
                          const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                          const user = userStr ? JSON.parse(userStr) : {};
                          const route = user.role === 'worker' ? '/worker/chat' : '/customer/chat';
                          router.push(`${route}?recipientId=${worker.id}`);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all shadow-md shadow-blue-100 flex items-center justify-center min-h-[40px]"
                      >
                        <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-center justify-center border-l border-gray-100 pl-4 ml-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-black text-blue-600 leading-none">{worker.matchScore}%</div>
                      <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5 md:mt-1">{t('aiBox.match')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs text-gray-400">{t('aiBox.disclaimer')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
