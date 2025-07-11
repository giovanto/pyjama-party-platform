'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CriticalMassStation {
  stationName: string;
  city: string;
  country: string;
  attendees: number;
  status: string;
}

interface CriticalMassPanelProps {
  className?: string;
}

export default function CriticalMassPanel({ className = '' }: CriticalMassPanelProps) {
  const [stations, setStations] = useState<CriticalMassStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCriticalMassStations();
  }, []);

  const fetchCriticalMassStations = async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setStations(data.criticalMassStations || []);
    } catch (error) {
      console.error('Error fetching critical mass stations:', error);
      setError('Failed to load critical mass stations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`critical-mass-panel bg-white rounded-xl shadow-lg p-6 border border-bot-green/20 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`critical-mass-panel bg-white rounded-xl shadow-lg p-6 border border-red-200 ${className}`}>
        <h3 className="text-lg font-bold text-red-600 mb-2">⚠️ Error</h3>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className={`critical-mass-panel bg-gradient-to-br from-bot-green/10 to-bot-blue/10 rounded-xl shadow-lg p-6 border-2 border-bot-green/20 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎯</span>
        <h3 className="text-lg font-bold text-bot-dark">Critical Mass Stations</h3>
      </div>
      
      <p className="text-sm text-gray-700 mb-4">
        Stations with 2+ participants ready for September 26th pyjama parties
      </p>

      {stations.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-4xl mb-3 block">🎪</span>
          <p className="text-gray-600 text-sm">
            No critical mass stations yet. Be the first to organize a pyjama party!
          </p>
          <a 
            href="/organize" 
            className="inline-block mt-3 bg-bot-green text-white px-4 py-2 rounded-lg hover:bg-bot-dark-green transition-colors"
          >
            Organize Party
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {stations.map((station, index) => (
            <motion.div
              key={`${station.stationName}-${station.city}`}
              className="bg-white rounded-lg p-4 shadow-md border border-bot-green/20 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-bot-dark text-sm">
                    {station.stationName}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {station.city}, {station.country}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">👥</span>
                    <span className="font-bold text-bot-green text-lg">
                      {station.attendees}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs">
                      {station.status === 'planned' ? '✅' : '🔄'}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {station.status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          <div className="mt-4 pt-4 border-t border-bot-green/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Ready stations: {stations.length}
              </span>
              <span className="text-bot-green font-medium">
                Total participants: {stations.reduce((sum, s) => sum + s.attendees, 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}