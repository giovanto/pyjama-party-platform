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

interface DreamFormData {
  from: string;
  to: string;
  name: string;
  email: string;
  why: string;
}

interface DreamFormProps {
  onSubmit?: (data: DreamFormData) => Promise<void>;
  className?: string;
}

export default function DreamForm({ onSubmit, className = '' }: DreamFormProps) {
  const [formData, setFormData] = useState<DreamFormData>({
    from: '',
    to: '',
    name: '',
    email: '',
    why: ''
  });

  const [fromSuggestions, setFromSuggestions] = useState<StationSuggestion[]>([]);
  const [toSuggestions, setToSuggestions] = useState<StationSuggestion[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<DreamFormData>>({});

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

  const handleInputChange = async (field: keyof DreamFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    if (field === 'from') {
      const suggestions = await searchStations(value);
      setFromSuggestions(suggestions);
      setShowFromSuggestions(value.length > 0);
    } else if (field === 'to') {
      const suggestions = await searchStations(value);
      setToSuggestions(suggestions);
      setShowToSuggestions(value.length > 0);
    }
  };

  const selectStation = (field: 'from' | 'to', station: StationSuggestion) => {
    const stationName = `${station.name}, ${station.city}, ${station.country}`;
    setFormData(prev => ({ ...prev, [field]: stationName }));
    
    if (field === 'from') {
      setShowFromSuggestions(false);
      setFromSuggestions([]);
    } else {
      setShowToSuggestions(false);
      setToSuggestions([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DreamFormData> = {};

    if (!formData.from.trim()) newErrors.from = 'Departure station is required';
    if (!formData.to.trim()) newErrors.to = 'Destination station is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.why.trim()) newErrors.why = 'Please tell us why this route matters to you';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        const response = await fetch('/api/dreams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to submit dream');
        }
      }

      setFormData({ from: '', to: '', name: '', email: '', why: '' });
    } catch (error) {
      console.error('Error submitting dream:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`dream-form bg-white rounded-lg shadow-lg p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-bot-dark mb-6 text-center">
        Share Your Dream Route
      </h2>

      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
            From Station
          </label>
          <input
            type="text"
            id="from"
            value={formData.from}
            onChange={(e) => handleInputChange('from', e.target.value)}
            onFocus={() => setShowFromSuggestions(formData.from.length > 0)}
            onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bot-green ${
              errors.from ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Berlin Hauptbahnhof"
          />
          {errors.from && <p className="text-red-500 text-sm mt-1">{errors.from}</p>}
          
          {showFromSuggestions && fromSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
              {fromSuggestions.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => selectStation('from', station)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{station.name}</div>
                  <div className="text-sm text-gray-600">{station.city}, {station.country}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
            To Station
          </label>
          <input
            type="text"
            id="to"
            value={formData.to}
            onChange={(e) => handleInputChange('to', e.target.value)}
            onFocus={() => setShowToSuggestions(formData.to.length > 0)}
            onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bot-green ${
              errors.to ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Vienna Central Station"
          />
          {errors.to && <p className="text-red-500 text-sm mt-1">{errors.to}</p>}
          
          {showToSuggestions && toSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
              {toSuggestions.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => selectStation('to', station)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{station.name}</div>
                  <div className="text-sm text-gray-600">{station.city}, {station.country}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bot-green ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Your name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bot-green ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="why" className="block text-sm font-medium text-gray-700 mb-1">
            Why does this route matter to you?
          </label>
          <textarea
            id="why"
            value={formData.why}
            onChange={(e) => handleInputChange('why', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bot-green ${
              errors.why ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tell us about your connection to this route, why it's important for sustainability, or how it would impact your travel..."
          />
          {errors.why && <p className="text-red-500 text-sm mt-1">{errors.why}</p>}
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-bot-green text-white py-3 px-4 rounded-md hover:bg-bot-dark-green focus:outline-none focus:ring-2 focus:ring-bot-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? 'Sharing Your Dream...' : 'Share Your Dream Route'}
        </motion.button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        By submitting, you agree to join the movement for sustainable night trains in Europe.
        Your email will only be used for campaign updates.
      </p>
    </motion.form>
  );
}