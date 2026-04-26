'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import WorkerCard from '../components/WorkerCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import api from '@/lib/axios';
import { CITIES, SKILLS } from '@/lib/constants';
import { MapPin, Search, Filter, SlidersHorizontal, Users, RefreshCw, Briefcase } from 'lucide-react';
import DashboardLayout from '@/app/components/ui/DashboardLayout';

export default function Recommendations() {
  const { t } = useTranslation(['recommendations']);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', skill: '', search: '', lat: '', lng: '', radiusKm: 5 });
  const [showFilters, setShowFilters] = useState(false);

  const fetchRecommendations = async (overrideFilters = null) => {
    setLoading(true);
    const activeFilters = overrideFilters || filters;
    
    // Construct query parameters
    const params = {};
    if (activeFilters.city) params.city = activeFilters.city;
    if (activeFilters.skill) params.skill = activeFilters.skill;
    if (activeFilters.lat && activeFilters.lng) {
      params.lat = activeFilters.lat;
      params.lng = activeFilters.lng;
      params.radiusKm = activeFilters.radiusKm || 5;
    }

    try {
      // Small artificial delay for smooth shimmer effect transition
      await new Promise(r => setTimeout(r, 600));
      const response = await api.get('/api/recommendations', { params, timeout: 5000 });
      let data = response.data || [];
      
      // Client-side generic search filter (since backend only supports exact skill/city)
      if (activeFilters.search) {
        const q = activeFilters.search.toLowerCase();
        data = data.filter(w => 
          w.name?.toLowerCase().includes(q) || 
          w.skill?.toLowerCase().includes(q) || 
          w.city?.toLowerCase().includes(q)
        );
      }

      setWorkers(data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    const empty = { city: '', skill: '', search: '', lat: '', lng: '', radiusKm: 5 };
    setFilters(empty);
    fetchRecommendations(empty);
  };

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        position => {
          const newFilters = {
            ...filters,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radiusKm: 5,
          };
          setFilters(newFilters);
          fetchRecommendations(newFilters);
        },
        error => {
          console.error("Location error:", error);
          alert(t('recommendations:locationError'));
          setLoading(false);
        }
      );
    } else {
      alert(t('recommendations:geolocationUnsupported'));
    }
  };

  useEffect(() => {
    // Check if there are query parameters in URL mapping to defaults
    const urlParams = new URLSearchParams(window.location.search);
    const initialSkill = urlParams.get('skill') || '';
    const initialCity = urlParams.get('city') || '';
    
    const initialFilters = { city: initialCity, skill: initialSkill, search: '', lat: '', lng: '', radiusKm: 5 };
    setFilters(initialFilters);
    fetchRecommendations(initialFilters);
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecommendations();
    setShowFilters(false);
  };

  return (
    <DashboardLayout role="customer">
    <div className="min-h-screen bg-surface">
      
      {/* ── Page Hero ── */}
      <div className="bg-slate-900 pt-8 pb-14 px-4 relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 z-0 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <Badge variant="info" className="mb-4 bg-blue-500/20 text-blue-300 border-blue-400/30">
            {t('recommendations:professionalNetwork')}
          </Badge>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-3">
            {t('recommendations:pageTitlePrefix')} <span className="text-blue-400">{t('recommendations:pageTitleHighlight')}</span>
          </h1>
          <p className="text-blue-100/70 text-sm md:text-base max-w-2xl mx-auto">
            {t('recommendations:pageSubtitle')}
          </p>
        </div>
      </div>

      {/* ── Sticky Filter Bar ── */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 -mt-8 relative z-20 mb-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-2 sm:p-3">
          
          <div className="flex items-center justify-between lg:hidden mb-2 px-2 pt-1">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" /> {t('recommendations:filters')}
            </h3>
            <button onClick={() => setShowFilters(!showFilters)} className="p-2 bg-gray-50 rounded-lg text-gray-600">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          <form 
            onSubmit={handleSearchSubmit} 
            className={`grid gap-3 lg:grid-cols-4 lg:gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}
          >
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="search"
                placeholder={t('recommendations:searchName')}
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-[15px]"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute w-5 h-5 text-gray-400 left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer text-[15px]"
              >
                <option value="">{t('recommendations:allCities')}</option>
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            <div className="relative">
              <Briefcase className="absolute w-5 h-5 text-gray-400 left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                name="skill"
                value={filters.skill}
                onChange={handleFilterChange}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer text-[15px]"
              >
                <option value="">{t('recommendations:allSkills')}</option>
                {SKILLS.map(skill => <option key={skill} value={skill}>{skill}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={handleLocationSearch} className="flex-1" title={t('recommendations:nearMe')}>
                <MapPin className="w-4 h-4 text-blue-600" />
              </Button>
              <Button type="submit" variant="primary" className="flex-[3] font-bold">
                {t('recommendations:searchButton')}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 pb-14">
        
        {/* Active Filters Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="text-gray-900 font-semibold text-base sm:text-lg flex items-center gap-2">
            {t('recommendations:workersFound')} <Badge variant="neutral" className="bg-gray-200 !text-gray-700">{loading ? '...' : workers.length}</Badge>
          </div>
          
          {(filters.city || filters.skill || filters.search || (filters.lat && filters.lng)) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">{t('recommendations:activeFilters')}:</span>
              {filters.skill && <Badge variant="info">{t('recommendations:skillFilter')}: {filters.skill}</Badge>}
              {filters.city && <Badge variant="warning">{t('recommendations:cityFilter')}: {filters.city}</Badge>}
              {filters.search && <Badge variant="purple">{t('recommendations:searchFilter')}: {filters.search}</Badge>}
              {filters.lat && filters.lng && <Badge variant="info">{t('recommendations:nearbyFilter', { km: filters.radiusKm || 5 })}</Badge>}
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 ml-1">
                <RefreshCw className="w-3.5 h-3.5" /> {t('recommendations:clearFilters')}
              </button>
            </div>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : workers.length > 0 ? (
          /* Results Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {workers.map(worker => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center max-w-2xl mx-auto mt-8 animate-scaleIn shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('recommendations:noWorkersTitle')}</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {t('recommendations:noWorkersMessage')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="outline" onClick={clearFilters}>
                {t('recommendations:clearAllFilters')}
              </Button>
              <Link href="/register">
                <Button variant="primary">{t('recommendations:beFirstToJoin')}</Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
    </DashboardLayout>
  );
}