'use client';
import { useState, useEffect } from 'react';
import WorkerCard from '../components/WorkerCard';
import api from '@/lib/axios';
import { CITIES, SKILLS } from '@/lib/constants';

export default function Recommendations() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ city: '', skill: '' });

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/recommendations', { 
        params: filters,
        timeout: 5000
      });
      setWorkers(response.data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Recommended Workers</h1>
          <p className="text-gray-600 mt-2">Find the best workers for your needs</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Cities</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              name="skill"
              value={filters.skill}
              onChange={handleFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Skills</option>
              {SKILLS.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>

            <button
              onClick={fetchRecommendations}
              className="bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl">Loading recommendations...</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map(worker => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}

        {!loading && workers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No workers found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}