'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface StationSuggestion {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
}

interface PyjamaPartyFormData {
  stationName: string;
  city: string;
  country: string;
  organizerName: string;
  organizerEmail: string;
  description: string;
  expectedAttendees: number;
  partyDate: string;
}

interface PyjamaPartyFormProps {
  onSubmit?: (data: PyjamaPartyFormData) => Promise<void>;
  className?: string;
}

export default function PyjamaPartyForm({ onSubmit, className = '' }: PyjamaPartyFormProps) {
  const [formData, setFormData] = useState<PyjamaPartyFormData>({
    stationName: '',
    city: '',
    country: '',
    organizerName: '',
    organizerEmail: '',
    description: '',
    expectedAttendees: 1,
    partyDate: '2025-09-26T19:00:00.000Z'
  });

  const [stationSuggestions, setStationSuggestions] = useState<StationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PyjamaPartyFormData, string>>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const searchStations = async (query: string): Promise<StationSuggestion[]> => {
    if (query.length < 2) return [];
    
    try {
      const response = await fetch(`/api/stations/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.stations || [];
    } catch {
      return [];
    }
  };

  const handleInputChange = async (field: keyof PyjamaPartyFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    if (field === 'stationName' && typeof value === 'string') {
      const suggestions = await searchStations(value);
      setStationSuggestions(suggestions);
      setShowSuggestions(value.length > 0);
    }
  };

  const selectStation = (station: StationSuggestion) => {
    setFormData(prev => ({ 
      ...prev, 
      stationName: station.name,
      city: station.city,
      country: station.country
    }));
    setShowSuggestions(false);
    setStationSuggestions([]);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PyjamaPartyFormData, string>> = {};

    if (!formData.stationName.trim()) newErrors.stationName = 'Station name is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.organizerName.trim()) newErrors.organizerName = 'Organizer name is required';
    // Email is optional, but if provided, must be valid
    if (formData.organizerEmail.trim() && !/\S+@\S+\.\S+/.test(formData.organizerEmail)) {
      newErrors.organizerEmail = 'Please enter a valid email';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.expectedAttendees < 1) newErrors.expectedAttendees = 'Expected attendees must be at least 1';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        const response = await fetch('/api/pyjama-parties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create pyjama party');
        }
      }

      // Show success message
      setShowSuccess(true);
      
      // Refresh map to show new submission
      if (typeof window !== 'undefined') {
        const windowWithRefresh = window as Window & { refreshDreamMap?: () => void };
        if (windowWithRefresh.refreshDreamMap) {
          windowWithRefresh.refreshDreamMap();
        }
      }
      
      // Reset form
      setFormData({
        stationName: '',
        city: '',
        country: '',
        organizerName: '',
        organizerEmail: '',
        description: '',
        expectedAttendees: 1,
        partyDate: '2025-09-26T19:00:00.000Z'
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 8000);
    } catch (error) {
      console.error('Error creating pyjama party:', error);
      setErrors({ organizerEmail: error instanceof Error ? error.message : 'Failed to create pyjama party' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`pyjama-party-form bg-gradient-to-br from-bot-blue via-white to-bot-green rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 border-4 border-bot-blue ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-bot-dark mb-6 sm:mb-8 text-center leading-tight">
        🎪 Organize a Pyjama Party at Your Station
      </h2>
      
      <div className="bg-gradient-to-r from-bot-green/10 to-bot-blue/10 rounded-xl p-4 mb-6 border border-bot-green/20">
        <h3 className="font-bold text-bot-dark mb-2">September 26th, 2025 • 19:00-20:00 CEST</h3>
        <p className="text-sm text-gray-700">
          Join the synchronized European pyjama party movement! Organize your local station event 
          and connect with thousands of climate activists across Europe.
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <label htmlFor="stationName" className="block text-sm font-medium text-bot-dark mb-1">
            Which train station? <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="stationName"
            value={formData.stationName}
            onChange={(e) => handleInputChange('stationName', e.target.value)}
            onFocus={() => setShowSuggestions(formData.stationName.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-blue/50 focus:border-bot-blue bg-white transition-all duration-200 ${
              errors.stationName ? 'border-red-500' : 'border-bot-blue hover:border-bot-dark-blue shadow-lg hover:shadow-xl'
            }`}
            placeholder="Berlin Hauptbahnhof, Milano Centrale, Amsterdam Centraal..."
            required
          />
          {errors.stationName && <p className="text-red-500 text-sm mt-1">{errors.stationName}</p>}
          
          {showSuggestions && stationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
              {stationSuggestions.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => selectStation(station)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{station.name}</div>
                  <div className="text-sm text-gray-600">{station.city}, {station.country}</div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <label htmlFor="city" className="block text-sm font-medium text-bot-dark mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-blue/50 focus:border-bot-blue bg-white transition-all duration-200 ${
                errors.city ? 'border-red-500' : 'border-bot-blue hover:border-bot-dark-blue shadow-lg hover:shadow-xl'
              }`}
              placeholder="Berlin"
              required
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <label htmlFor="country" className="block text-sm font-medium text-bot-dark mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-blue/50 focus:border-bot-blue bg-white transition-all duration-200 ${
                errors.country ? 'border-red-500' : 'border-bot-blue hover:border-bot-dark-blue shadow-lg hover:shadow-xl'
              }`}
              placeholder="Germany"
              required
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <label htmlFor="organizerName" className="block text-sm font-medium text-bot-dark mb-1">
            Your name (as organizer) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="organizerName"
            value={formData.organizerName}
            onChange={(e) => handleInputChange('organizerName', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-blue/50 focus:border-bot-blue bg-white transition-all duration-200 ${
              errors.organizerName ? 'border-red-500' : 'border-bot-blue hover:border-bot-dark-blue shadow-lg hover:shadow-xl'
            }`}
            placeholder="Your full name"
            required
          />
          {errors.organizerName && <p className="text-red-500 text-sm mt-1">{errors.organizerName}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <label htmlFor="organizerEmail" className="block text-sm font-medium text-bot-dark mb-1">
            Email for coordination (optional)
          </label>
          <input
            type="email"
            id="organizerEmail"
            value={formData.organizerEmail}
            onChange={(e) => handleInputChange('organizerEmail', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-blue/50 focus:border-bot-blue bg-white transition-all duration-200 ${
              errors.organizerEmail ? 'border-red-500' : 'border-bot-blue hover:border-bot-dark-blue shadow-lg hover:shadow-xl'
            }`}
            placeholder="your.email@example.com (optional)"
          />
          <p className="text-xs text-bot-blue mt-1">
            Optional: You&apos;ll receive Discord invite, Party Kit, and coordination updates if provided
          </p>
          {errors.organizerEmail && <p className="text-red-500 text-sm mt-1">{errors.organizerEmail}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <label htmlFor="expectedAttendees" className="block text-sm font-medium text-bot-dark mb-1">
            How many people do you expect?
          </label>
          <input
            type="number"
            id="expectedAttendees"
            value={formData.expectedAttendees}
            onChange={(e) => handleInputChange('expectedAttendees', parseInt(e.target.value) || 1)}
            min="1"
            max="100"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-blue/50 focus:border-bot-blue bg-white transition-all duration-200 ${
              errors.expectedAttendees ? 'border-red-500' : 'border-bot-blue hover:border-bot-dark-blue shadow-lg hover:shadow-xl'
            }`}
            placeholder="5"
          />
          {errors.expectedAttendees && <p className="text-red-500 text-sm mt-1">{errors.expectedAttendees}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <label htmlFor="description" className="block text-sm font-medium text-bot-dark mb-1">
            Describe your pyjama party plan <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-blue/50 focus:border-bot-blue bg-white transition-all duration-200 resize-none ${
              errors.description ? 'border-red-500' : 'border-bot-blue hover:border-bot-dark-blue shadow-lg hover:shadow-xl'
            }`}
            placeholder="Tell us about your vision for the pyjama party: activities, atmosphere, how you'll connect with other participants..."
            required
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </motion.div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-bot-blue via-bot-green to-bot-blue text-white py-5 sm:py-6 px-8 rounded-2xl hover:from-bot-dark-blue hover:via-bot-dark-green hover:to-bot-dark-blue focus:outline-none focus:ring-6 focus:ring-bot-blue/40 focus:ring-offset-4 disabled:opacity-50 disabled:cursor-not-allowed font-black text-xl sm:text-2xl shadow-2xl transition-all duration-300 transform hover:shadow-3xl border-2 border-bot-blue/30"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {isSubmitting ? (
            <>
              <span className="inline-block animate-spin mr-2">🎪</span>
              Creating Your Pyjama Party...
            </>
          ) : (
            <>
              🎉 Organize Pyjama Party
            </>
          )}
        </motion.button>
      </div>

      <p className="text-xs text-gray-500 mt-6 text-center leading-relaxed">
        <span className="text-bot-blue font-medium">September 26th coordination</span> - join thousands across Europe for climate action
      </p>
      
      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-6 bg-bot-blue text-white p-4 rounded-lg shadow-lg"
        >
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">Pyjama party created! 🎉</h3>
            <p className="text-sm">
              Your pyjama party is now registered for September 26th. You&apos;ll receive coordination 
              materials and Discord invite soon!
            </p>
          </div>
        </motion.div>
      )}
    </motion.form>
  );
}