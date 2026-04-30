'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import WorkerCard from '../components/WorkerCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import Pagination from '../components/ui/Pagination';
import api from '@/lib/axios';
import { CITIES, SKILLS } from '@/lib/constants';
import { MapPin, Search, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/app/components/ui/DashboardLayout';

export default function Recommendations() {
  const { t } = useTranslation(['recommendations']);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', skill: '', search: '', lat: '', lng: '', radiusKm: 5 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const workersPerPage = 9; // 3x3 grid
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchRecommendations = useCallback(async (overrideFilters = null, page = 1) => {
    setLoading(true);
    const activeFilters = overrideFilters || filtersRef.current;
    
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

      // Calculate pagination
      const total = data.length;
      const pages = Math.ceil(total / workersPerPage) || 1;
      const startIndex = (page - 1) * workersPerPage;
      const endIndex = startIndex + workersPerPage;
      const paginatedData = data.slice(startIndex, endIndex);

      setTotalWorkers(total);
      setTotalPages(pages);
      setCurrentPage(page);
      setWorkers(paginatedData);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setWorkers([]);
      setTotalWorkers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [workersPerPage]);

  const clearFilters = () => {
    const empty = { city: '', skill: '', search: '', lat: '', lng: '', radiusKm: 5 };
    setFilters(empty);
    setCurrentPage(1);
    fetchRecommendations(empty, 1);
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
          setCurrentPage(1);
          fetchRecommendations(newFilters, 1);
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
    fetchRecommendations(initialFilters, 1);
  }, [fetchRecommendations]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRecommendations(null, 1);
  };

  const handlePageChange = (page) => {
    fetchRecommendations(null, page);
  };

  const hasActiveFilters = filters.city || filters.skill || filters.search || (filters.lat && filters.lng);

  return (
    <DashboardLayout role="customer">
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm animate-scaleIn sm:p-8">
          <div className="flex flex-col gap-5">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-medium tracking-tight text-gray-900 sm:text-[28px]">{t('recommendations:heroTitle')}</h1>
              <p className="mt-2 text-sm text-gray-500 sm:text-[15px]">
                {t('recommendations:heroSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
                <div className="flex-1">
                  <label className="sr-only" htmlFor="search">Search name</label>
                  <div className="flex h-full items-center rounded-lg border border-transparent px-3 py-2.5 transition focus-within:border-blue-200 focus-within:bg-white">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                    <input
                      id="search"
                      type="text"
                      name="search"
                      placeholder={t('recommendations:searchName')}
                      value={filters.search}
                      onChange={handleFilterChange}
                      className="w-full border-0 bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="sr-only" htmlFor="city">City</label>
                  <div className="flex h-full items-center rounded-lg border border-transparent px-3 py-2.5 transition focus-within:border-blue-200 focus-within:bg-white">
                    <MapPin className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                    <select
                      id="city"
                      name="city"
                      value={filters.city}
                      onChange={handleFilterChange}
                      className="w-full border-0 bg-transparent p-0 text-sm text-gray-900 outline-none focus:ring-0"
                    >
                      <option value="">{t('recommendations:allCities')}</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="sr-only" htmlFor="skill">Skill</label>
                  <div className="flex h-full items-center rounded-lg border border-transparent px-3 py-2.5 transition focus-within:border-blue-200 focus-within:bg-white">
                    <div className="mr-2 h-4 w-4 shrink-0 rounded-full bg-blue-50" />
                    <select
                      id="skill"
                      name="skill"
                      value={filters.skill}
                      onChange={handleFilterChange}
                      className="w-full border-0 bg-transparent p-0 text-sm text-gray-900 outline-none focus:ring-0"
                    >
                      <option value="">{t('recommendations:allSkills')}</option>
                      {SKILLS.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:flex-row">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 md:min-w-[110px]"
                  >
                    {t('recommendations:searchButton')}
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 pb-1">
                  <button
                    type="button"
                    onClick={handleLocationSearch}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 transition hover:text-blue-700"
                    title={t('recommendations:nearMe')}
                  >
                  <MapPin className="h-3.5 w-3.5" />
                    {t('recommendations:useCurrentLocation')}
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-blue-600"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t('recommendations:clearFiltersButton')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-base font-medium text-gray-800">
            {t('recommendations:workersFoundLabel')}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{loading ? '...' : totalWorkers}</span>
            {totalWorkers > workersPerPage && (
              <span className="text-xs text-gray-400">
                (Showing {((currentPage - 1) * workersPerPage) + 1}-{Math.min(currentPage * workersPerPage, totalWorkers)})
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="font-medium text-gray-400">{t('recommendations:activeFilters')}</span>
              {filters.search && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{t('recommendations:nameFilter')}: {filters.search}</span>}
              {filters.city && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{t('recommendations:cityFilter')}: {filters.city}</span>}
              {filters.skill && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{t('recommendations:skillFilter')}: {filters.skill}</span>}
              {filters.lat && filters.lng && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{t('recommendations:nearbyFilter', { km: filters.radiusKm || 5 })}</span>}
            </div>
          )}
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : workers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {workers.map((worker, index) => (
                  <WorkerCard key={worker.id} worker={worker} animationDelay={index * 45} />
                ))}
              </div>
              
              {/* Pagination Component */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </>
          ) : (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-sm animate-scaleIn sm:px-8">
              <div className="mx-auto h-20 w-20 rounded-2xl bg-gray-100" />
              <h3 className="mt-6 text-sm font-medium text-gray-800">{t('recommendations:noWorkersTitle')}</h3>
              <p className="mt-2 text-xs text-gray-400">{t('recommendations:noWorkersMessageShort')}</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                {t('recommendations:clearFiltersButton')}
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.recommendation-card) {
          animation: fadeUp 0.45s ease both;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
    </DashboardLayout>
  );
}