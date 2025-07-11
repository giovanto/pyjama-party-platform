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
  dreamerName: string;
  from: string;
  to: string;
  email: string;
  why: string;
  // Two-tier engagement system
  tier: 'dreamer' | 'participant';
  pyjamaPartyInterest: boolean;
  participationLevel: 'dream_only' | 'organize_party' | 'join_party';
}

interface DreamFormProps {
  onSubmit?: (data: DreamFormData) => Promise<void>;
  className?: string;
}

export default function DreamForm({ onSubmit, className = '' }: DreamFormProps) {
  const [formData, setFormData] = useState<DreamFormData>({
    dreamerName: '',
    from: '',
    to: '',
    email: '',
    why: '',
    tier: 'dreamer',
    pyjamaPartyInterest: false,
    participationLevel: 'dream_only'
  });

  const [fromSuggestions, setFromSuggestions] = useState<StationSuggestion[]>([]);
  const [toSuggestions, setToSuggestions] = useState<StationSuggestion[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<DreamFormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showTierTwo, setShowTierTwo] = useState(false);

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
    if (!formData.dreamerName.trim()) newErrors.dreamerName = 'Name is required';
    
    // Email validation based on tier
    if (formData.tier === 'participant' || formData.pyjamaPartyInterest) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required for pyjama party participation';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    } else if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
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

      // Show success message
      setShowSuccess(true);
      setSuccessMessage(`🌟 Thank you ${formData.dreamerName}! Your dream route is now on the map. Check below to see all European dreams for sustainable travel.`);
      
      // Refresh the map with new data
      if (typeof window !== 'undefined' && (window as unknown as { refreshDreamMap?: () => void }).refreshDreamMap) {
        (window as unknown as { refreshDreamMap: () => void }).refreshDreamMap();
      }
      
      // Reset form
      setFormData({ 
        dreamerName: '', 
        from: '', 
        to: '', 
        email: '', 
        why: '',
        tier: 'dreamer',
        pyjamaPartyInterest: false,
        participationLevel: 'dream_only'
      });
      setShowTierTwo(false);
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 8000);
    } catch (error) {
      console.error('Error submitting dream:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`dream-form bg-gradient-to-br from-bot-green via-white to-bot-light-green rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 border-4 border-bot-green ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-bot-dark mb-6 sm:mb-8 text-center leading-tight">
        Where would you like to wake up tomorrow?
      </h2>

      <div className="space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <label htmlFor="dreamerName" className="block text-sm font-medium text-bot-dark mb-1">
            What&apos;s your name? (First name is enough)
          </label>
          <input
            type="text"
            id="dreamerName"
            value={formData.dreamerName}
            onChange={(e) => handleInputChange('dreamerName', e.target.value)}
            className={`w-full px-4 py-4 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-green/50 focus:border-bot-green bg-white transition-all duration-200 text-lg sm:text-base ${
              errors.dreamerName ? 'border-red-500 ring-4 ring-red-500/20' : 'border-bot-green hover:border-bot-dark-green shadow-lg hover:shadow-xl'
            }`}
            placeholder="Maria, João, Emma, Lars..."
            required
          />
          <p className="text-xs text-bot-blue mt-1">We&apos;ll use this to connect you with fellow travelers from your area</p>
          {errors.dreamerName && <p className="text-red-500 text-sm mt-1">{errors.dreamerName}</p>}
        </motion.div>

        <motion.div 
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <label htmlFor="from" className="block text-sm font-medium text-bot-dark mb-1">
            Which station represents you?
          </label>
          <input
            type="text"
            id="from"
            value={formData.from}
            onChange={(e) => handleInputChange('from', e.target.value)}
            onFocus={() => setShowFromSuggestions(formData.from.length > 0)}
            onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-green/50 focus:border-bot-green bg-white transition-all duration-200 ${
              errors.from ? 'border-red-500' : 'border-bot-green hover:border-bot-dark-green shadow-lg hover:shadow-xl'
            }`}
            placeholder="Amsterdam Central, Milano Centrale, Berlin Hbf..."
          />
          <p className="text-xs text-bot-blue mt-1">We&apos;ll use this to connect you with fellow travelers from your area</p>
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
        </motion.div>

        <motion.div 
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <label htmlFor="to" className="block text-sm font-medium text-bot-dark mb-1">
            Where would you like to wake up?
          </label>
          <input
            type="text"
            id="to"
            value={formData.to}
            onChange={(e) => handleInputChange('to', e.target.value)}
            onFocus={() => setShowToSuggestions(formData.to.length > 0)}
            onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-green/50 focus:border-bot-green bg-white transition-all duration-200 ${
              errors.to ? 'border-red-500' : 'border-bot-green hover:border-bot-dark-green shadow-lg hover:shadow-xl'
            }`}
            placeholder="Barcelona beach sunrise, Prague castle view, Stockholm archipelago..."
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
        </motion.div>

        {/* Two-Tier Engagement System */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-bot-green/10 to-bot-blue/10 rounded-xl p-6 border-2 border-bot-green/20">
            <h3 className="text-lg font-bold text-bot-dark mb-4">🎉 Join the September 26th Pyjama Party?</h3>
            <p className="text-sm text-gray-700 mb-4">
              After sharing your dream route, you can join thousands across Europe for synchronized pyjama parties at train stations!
            </p>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="participationLevel"
                  value="dream_only"
                  checked={formData.participationLevel === 'dream_only'}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      participationLevel: e.target.value as 'dream_only' | 'organize_party' | 'join_party',
                      pyjamaPartyInterest: false,
                      tier: 'dreamer'
                    }));
                    setShowTierTwo(false);
                  }}
                  className="w-4 h-4 text-bot-green border-2 border-bot-green focus:ring-bot-green"
                />
                <div>
                  <span className="font-medium text-bot-dark">🗺️ Just share my dream route</span>
                  <p className="text-xs text-gray-600">Add to the map, no email required</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="participationLevel"
                  value="join_party"
                  checked={formData.participationLevel === 'join_party'}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      participationLevel: e.target.value as 'dream_only' | 'organize_party' | 'join_party',
                      pyjamaPartyInterest: true,
                      tier: 'participant'
                    }));
                    setShowTierTwo(true);
                  }}
                  className="w-4 h-4 text-bot-green border-2 border-bot-green focus:ring-bot-green"
                />
                <div>
                  <span className="font-medium text-bot-dark">🎉 Join a pyjama party at my station</span>
                  <p className="text-xs text-gray-600">Get Discord invite + Party Kit access</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="participationLevel"
                  value="organize_party"
                  checked={formData.participationLevel === 'organize_party'}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      participationLevel: e.target.value as 'dream_only' | 'organize_party' | 'join_party',
                      pyjamaPartyInterest: true,
                      tier: 'participant'
                    }));
                    setShowTierTwo(true);
                  }}
                  className="w-4 h-4 text-bot-green border-2 border-bot-green focus:ring-bot-green"
                />
                <div>
                  <span className="font-medium text-bot-dark">🎪 Organize a pyjama party at my station</span>
                  <p className="text-xs text-gray-600">Lead the event + get organizer resources</p>
                </div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Tier 2: Email Collection */}
        {showTierTwo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-bot-blue/10 to-bot-green/10 rounded-xl p-6 border-2 border-bot-blue/20">
              <h4 className="text-lg font-bold text-bot-dark mb-3">✨ Activate Your Participation</h4>
              <p className="text-sm text-gray-700 mb-4">
                Join the Back-on-Track Action Group coordination! We&apos;ll send you:
              </p>
              <ul className="text-sm text-gray-700 mb-4 space-y-1">
                <li>📧 Discord invite for September 26th coordination</li>
                <li>📋 Party Kit PDF with organizing resources</li>
                <li>🤝 Connection with other participants at your station</li>
                <li>📢 Updates on station permissions and event details</li>
              </ul>
              
              <label htmlFor="email" className="block text-sm font-medium text-bot-dark mb-1">
                Email for pyjama party coordination <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-blue/50 focus:border-bot-blue bg-white transition-all duration-200 ${
                  errors.email ? 'border-red-500' : 'border-bot-blue hover:border-bot-dark-blue shadow-lg hover:shadow-xl'
                }`}
                placeholder="your.email@example.com"
                required={formData.pyjamaPartyInterest}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              
              <p className="text-xs text-bot-blue mt-2">
                Privacy-first: Used only for September 26th coordination, never spam
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <label htmlFor="why" className="block text-sm font-medium text-bot-dark mb-1">
            Why does this route matter to you?
          </label>
          <textarea
            id="why"
            value={formData.why}
            onChange={(e) => handleInputChange('why', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-bot-green/50 focus:border-bot-green bg-white transition-all duration-200 resize-none ${
              errors.why ? 'border-red-500' : 'border-bot-green hover:border-bot-dark-green shadow-lg hover:shadow-xl'
            }`}
            placeholder="Tell us about your connection to this route, why it&apos;s important for sustainability, or how it would impact your travel..."
          />
          {errors.why && <p className="text-red-500 text-sm mt-1">{errors.why}</p>}
        </motion.div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-bot-green via-bot-light-green to-bot-green text-white py-6 sm:py-5 lg:py-6 px-8 rounded-2xl hover:from-bot-dark-green hover:via-bot-green hover:to-bot-dark-green focus:outline-none focus:ring-6 focus:ring-bot-light-green/40 focus:ring-offset-4 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg sm:text-xl lg:text-2xl shadow-2xl transition-all duration-300 transform hover:shadow-3xl border-2 border-bot-green/30 min-h-[56px]"
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {isSubmitting ? (
            <>
              <span className="inline-block animate-spin mr-2">🌍</span>
              {formData.participationLevel === 'dream_only' ? 'Sharing Your Dream...' : 'Joining the Movement...'}
            </>
          ) : (
            <>
              {formData.participationLevel === 'dream_only' && '🗺️ Add my dream to the map'}
              {formData.participationLevel === 'join_party' && '🎉 Join pyjama party + add dream'}
              {formData.participationLevel === 'organize_party' && '🎪 Organize pyjama party + add dream'}
            </>
          )}
        </motion.button>
      </div>

      <p className="text-xs text-gray-500 mt-6 text-center leading-relaxed">
        <span className="text-bot-green font-medium">Privacy-first</span> - your data is automatically deleted after 30 days
      </p>
      
      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-6 bg-bot-green text-white p-4 rounded-lg shadow-lg"
        >
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">Your dream is on the map! 🌟</h3>
            <p className="text-sm">{successMessage}</p>
            <div className="mt-3">
              <p className="text-xs opacity-90">
                We&apos;ll connect you with fellow travelers from your station. 
                Join the movement for sustainable European transport!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.form>
  );
}