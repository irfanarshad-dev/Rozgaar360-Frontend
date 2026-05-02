'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import WorkerCard from '../components/WorkerCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import Pagination from '../components/ui/Pagination';
import api from '@/lib/axios';
import { CITIES, SKILLS } from '@/lib/constants';
import { MapPin, Search, RefreshCw, SlidersHorizontal, X } from 'lucide-react';
import DashboardLayout from '@/app/components/ui/DashboardLayout';

export default function Recommendations() {
  const { t } = useTranslation(['recommendations']);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', skill: '', search: '', lat: '', lng: '', radiusKm: 5 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const workersPerPage = 9;
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchRecommendations = useCallback(async (overrideFilters = null, page = 1) => {
    setLoading(true);
    const activeFilters = overrideFilters || filtersRef.current;
    
    const params = {};
    if (activeFilters.city) params.city = activeFilters.city;
    if (activeFilters.skill) params.skill = activeFilters.skill;
    if (activeFilters.lat && activeFilters.lng) {
      params.lat = activeFilters.lat;
      params.lng = activeFilters.lng;
      params.radiusKm = activeFilters.radiusKm || 5;
    }

    try {
      await new Promise(r => setTimeout(r, 600));
      const response = await api.get('/api/recommendations', { params, timeout: 5000 });
      let data = response.data || [];
      
      if (activeFilters.search) {
        const q = activeFilters.search.toLowerCase();
        data = data.filter(w => 
          w.name?.toLowerCase().includes(q) || 
          w.skill?.toLowerCase().includes(q) || 
          w.city?.toLowerCase().includes(q)
        );
      }

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
    setShowFilters(false);
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
    setShowFilters(false);
  };

  const handlePageChange = (page) => {
    fetchRecommendations(null, page);
  };

  const hasActiveFilters = filters.city || filters.skill || filters.search || (filters.lat && filters.lng);

  return (
    <DashboardLayout role="customer" contentClassName="">
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl">
          {/* Top Bar - Mobile Optimized */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8 sm:py-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                  Find Workers
                </h1>
                <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                  Browse skilled professionals
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                <span className="text-sm sm:text-base font-bold text-gray-900">{loading ? '...' : totalWorkers}</span>
                <span className="text-[10px] sm:text-xs text-gray-600 hidden xs:inline">workers</span>
              </div>
              
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="px-4 pb-3 sm:px-6 lg:px-8 sm:pb-4">
            <form onSubmit={handleSearchSubmit}>
              {/* Main Search Input - Always Visible */}
              <div className="mb-2.5 sm:mb-3">
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Search by name..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                  />
                  {filters.search && (
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, search: '' })}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile: Collapsible Filters */}
              <div className="sm:hidden">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-gray-400" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {[filters.city, filters.skill, filters.lat && filters.lng].filter(Boolean).length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {showFilters ? 'Hide' : 'Show'}
                  </span>
                </button>

                {showFilters && (
                  <div className="mt-2.5 space-y-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <select
                          name="city"
                          value={filters.city}
                          onChange={handleFilterChange}
                          className="flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 focus:outline-none focus:ring-0"
                        >
                          <option value="">All Cities</option>
                          {CITIES.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Skill</label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white">
                        <SlidersHorizontal className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <select
                          name="skill"
                          value={filters.skill}
                          onChange={handleFilterChange}
                          className="flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 focus:outline-none focus:ring-0"
                        >
                          <option value="">All Skills</option>
                          {SKILLS.map((skill) => (
                            <option key={skill} value={skill}>{skill}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop: Inline Filters */}
              <div className="hidden sm:flex gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus-within:border-blue-500 transition-all">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <select
                      name="city"
                      value={filters.city}
                      onChange={handleFilterChange}
                      className="flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 focus:outline-none focus:ring-0"
                    >
                      <option value="">All Cities</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus-within:border-blue-500 transition-all">
                    <SlidersHorizontal className="h-4 w-4 text-gray-400" />
                    <select
                      name="skill"
                      value={filters.skill}
                      onChange={handleFilterChange}
                      className="flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 focus:outline-none focus:ring-0"
                    >
                      <option value="">All Skills</option>
                      {SKILLS.map((skill) => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Location & Active Filters */}
              <div className="flex items-center justify-between mt-2.5 sm:mt-3">
                <button
                  type="button"
                  onClick={handleLocationSearch}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700 hover:bg-blue-100 active:bg-blue-200 transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Near me</span>
                </button>

                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {filters.search && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[10px] font-medium text-blue-700">
                        {filters.search.length > 10 ? filters.search.substring(0, 10) + '...' : filters.search}
                      </span>
                    )}
                    {filters.city && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-[10px] font-medium text-green-700">
                        {filters.city}
                      </span>
                    )}
                    {filters.skill && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[10px] font-medium text-purple-700">
                        {filters.skill}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Content - Mobile Optimized */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 sm:py-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : workers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
              {workers.map((worker, index) => (
                <WorkerCard key={worker.id} worker={worker} animationDelay={index * 45} />
              ))}
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </>
        ) : (
          <div className="max-w-sm mx-auto mt-12 sm:mt-16">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm text-center">
              <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No workers found</h3>
              <p className="text-sm text-gray-500 mb-5 sm:mb-6">Try adjusting your search filters</p>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}
