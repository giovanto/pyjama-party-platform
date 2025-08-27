'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface RouteStats {
  route_id: string;
  from_station: string;
  to_station: string;
  dreamer_count: number;
  total_demand: number;
  priority_score: number;
  distance_km: number;
  potential_co2_savings: number;
  travel_time_estimated: string;
  existing_alternatives: string[];
  advocacy_score: number;
}

interface StationStats {
  station_name: string;
  country: string;
  total_routes: number;
  inbound_demand: number;
  outbound_demand: number;
  readiness_level: 'low' | 'medium' | 'high' | 'critical';
  infrastructure_score: number;
  policy_recommendations: string[];
}

interface AdvocacyData {
  route?: RouteStats;
  station?: StationStats;
  comparative_analysis: {
    flight_time: string;
    flight_cost_range: string;
    flight_co2_kg: number;
    current_rail_options: string[];
    night_train_advantage: string[];
  };
  policy_impact: {
    economic_benefits: string[];
    environmental_impact: string;
    social_benefits: string[];
    implementation_barriers: string[];
  };
  call_to_action: {
    target_authorities: string[];
    key_messages: string[];
    supporting_data: Record<string, string | number>;
  };
}

interface RouteAdvocacyPopupProps {
  routeId?: string;
  stationId?: string;
  coordinates: [number, number];
  onClose: () => void;
  onExport?: (data: AdvocacyData) => void;
}

/**
 * RouteAdvocacyPopup - Policy-ready statistics and advocacy data
 * 
 * Features:
 * - Comprehensive route/station demand statistics
 * - Environmental impact calculations
 * - Policy recommendations and call-to-action
 * - Export functionality for advocacy materials
 * - Comparative analysis with existing transport
 */
export default function RouteAdvocacyPopup({
  routeId,
  stationId,
  coordinates,
  onClose,
  onExport
}: RouteAdvocacyPopupProps) {
  const [advocacyData, setAdvocacyData] = useState<AdvocacyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  // Fetch advocacy data for route or station
  const fetchAdvocacyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/analytics/advocacy';
      const params = new URLSearchParams();
      
      if (routeId) {
        params.append('route_id', routeId);
      } else if (stationId) {
        params.append('station_id', stationId);
      }

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch advocacy data');
      }

      const data = await response.json();
      setAdvocacyData(data);

      // Track analytics
      trackEvent('advocacy_popup_viewed', {
        type: routeId ? 'route' : 'station',
        id: routeId || stationId || 'unknown'
      });

    } catch (err) {
      console.error('Error fetching advocacy data:', err);
      
      // Generate mock data for demonstration
      const mockData = generateMockAdvocacyData();
      setAdvocacyData(mockData);
      setError('Using sample data - API integration pending');
    } finally {
      setLoading(false);
    }
  }, [routeId, stationId, trackEvent]);

  // Generate mock advocacy data for demonstration
  const generateMockAdvocacyData = useCallback((): AdvocacyData => {
    if (routeId) {
      // Mock route data
      return {
        route: {
          route_id: routeId,
          from_station: 'Berlin, Germany',
          to_station: 'Vienna, Austria',
          dreamer_count: 147,
          total_demand: 1250,
          priority_score: 92,
          distance_km: 678,
          potential_co2_savings: 89.5,
          travel_time_estimated: '11h 30m',
          existing_alternatives: ['Flight: 1h 25m', 'Day train: 8h 45m (1 transfer)'],
          advocacy_score: 88
        },
        comparative_analysis: {
          flight_time: '1h 25m',
          flight_cost_range: '€89-€340',
          flight_co2_kg: 142.3,
          current_rail_options: ['Day trains with 1-2 transfers', 'Limited overnight options'],
          night_train_advantage: ['Door-to-door convenience', 'Hotel cost savings', '89% CO₂ reduction', 'No transfer stress']
        },
        policy_impact: {
          economic_benefits: [
            '€2.4M potential annual revenue',
            '340 direct & indirect jobs',
            'Reduced airport congestion costs',
            'Tourism sector boost'
          ],
          environmental_impact: '12,400 tons CO₂ savings annually',
          social_benefits: [
            'Accessible travel for mobility-impaired',
            'Reduced travel stress',
            'City center connectivity',
            'Weather-independent travel'
          ],
          implementation_barriers: [
            'Track capacity allocation',
            'Cross-border ticketing systems',
            'Rolling stock investment',
            'Crew scheduling coordination'
          ]
        },
        call_to_action: {
          target_authorities: [
            'German Federal Ministry of Transport',
            'Austrian Federal Railways (ÖBB)',
            'European Commission DG MOVE',
            'Berlin Senate Transport Department'
          ],
          key_messages: [
            'High demonstrated public demand (1,250+ interested travelers)',
            'Significant environmental benefits align with EU climate goals',
            'Economic viability supported by strong demand projections',
            'Enhances EU rail network connectivity'
          ],
          supporting_data: {
            'Total interested travelers': 1250,
            'Annual CO₂ savings potential': '12,400 tons',
            'Advocacy score': 88,
            'Revenue potential': '€2.4M annually'
          }
        }
      };
    } else {
      // Mock station data
      return {
        station: {
          station_name: 'Berlin Hauptbahnhof',
          country: 'Germany',
          total_routes: 23,
          inbound_demand: 890,
          outbound_demand: 1160,
          readiness_level: 'high',
          infrastructure_score: 87,
          policy_recommendations: [
            'Expand night train platform capacity',
            'Improve cross-border customs facilities',
            'Enhance late-night public transport connections',
            'Develop integrated ticketing systems'
          ]
        },
        comparative_analysis: {
          flight_time: 'Various',
          flight_cost_range: '€65-€450',
          flight_co2_kg: 0,
          current_rail_options: ['Limited night train services', 'Strong day train network'],
          night_train_advantage: ['Central location advantage', 'No transfer to city needed', 'Multiple route potential']
        },
        policy_impact: {
          economic_benefits: [
            'Hub development potential: €15M investment return',
            '1,200+ direct jobs in rail services',
            'Tourism revenue increase: €8.2M annually',
            'Reduced urban air pollution costs'
          ],
          environmental_impact: '45,000 tons CO₂ savings annually from hub expansion',
          social_benefits: [
            'Enhanced European connectivity',
            'Reduced noise pollution vs. aviation',
            'Economic accessibility for families',
            'Cultural exchange facilitation'
          ],
          implementation_barriers: [
            'Platform allocation conflicts',
            'International service coordination',
            'Infrastructure upgrade financing',
            'Staff training for international services'
          ]
        },
        call_to_action: {
          target_authorities: [
            'German Federal Ministry of Transport',
            'DB Station&Service AG',
            'Berlin Senate for Environment & Transport',
            'European Railway Agency'
          ],
          key_messages: [
            'Strategic hub position for European night train network',
            'High readiness level for service expansion',
            'Strong public demand across 23 potential routes',
            'Model station for sustainable transport policy'
          ],
          supporting_data: {
            'Total route demand': 2050,
            'Infrastructure readiness': '87%',
            'Annual CO₂ savings potential': '45,000 tons',
            'Economic impact': '€15M ROI'
          }
        }
      };
    }
  }, [routeId]);

  // Handle export functionality
  const handleExport = useCallback(async () => {
    if (!advocacyData) return;

    try {
      // Track export event
      trackEvent('advocacy_data_exported', {
        type: routeId ? 'route' : 'station',
        id: routeId || stationId || 'unknown'
      });

      // Generate exportable content
      const exportContent = {
        timestamp: new Date().toISOString(),
        data: advocacyData,
        source: 'Pajama Party Platform - Dream Route Analytics',
        export_url: window.location.href
      };

      // Option 1: JSON download
      const blob = new Blob([JSON.stringify(exportContent, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `advocacy-data-${routeId || stationId}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Option 2: Call parent export handler if provided
      onExport?.(advocacyData);

    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [advocacyData, trackEvent, routeId, stationId, onExport]);

  // Share to social media
  const handleSocialShare = useCallback((platform: 'twitter' | 'linkedin' | 'facebook') => {
    if (!advocacyData) return;

    const data = advocacyData.route || advocacyData.station;
    if (!data) return;

    let shareText = '';
    let shareUrl = window.location.href;

    if (advocacyData.route) {
      shareText = `🚂 ${advocacyData.route.dreamer_count} people want a night train from ${advocacyData.route.from_station} to ${advocacyData.route.to_station}! Potential CO₂ savings: ${advocacyData.route.potential_co2_savings}kg per trip. #NightTrains #SustainableTravel`;
    } else if (advocacyData.station) {
      shareText = `🚉 ${advocacyData.station.station_name} could be a major night train hub with ${advocacyData.station.total_routes} potential routes and ${advocacyData.station.inbound_demand + advocacyData.station.outbound_demand} interested travelers! #RailRevolution`;
    }

    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    let socialUrl = '';
    
    switch (platform) {
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
    }

    if (socialUrl) {
      window.open(socialUrl, '_blank', 'width=600,height=400');
      
      trackEvent('advocacy_social_share', {
        platform,
        type: routeId ? 'route' : 'station',
        id: routeId || stationId || 'unknown'
      });
    }
  }, [advocacyData, trackEvent, routeId, stationId]);

  // Initialize data on mount
  useEffect(() => {
    fetchAdvocacyData();
  }, [fetchAdvocacyData]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-xl border p-6 min-w-80 max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <h3 className="font-bold text-lg">Loading Advocacy Data...</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Fetching demand statistics and policy recommendations
        </p>
      </div>
    );
  }

  if (!advocacyData) {
    return (
      <div className="bg-white rounded-lg shadow-xl border p-6 min-w-80 max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-red-600">Data Unavailable</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <p className="text-gray-600 text-sm">
          Unable to load advocacy data. Please try again later.
        </p>
      </div>
    );
  }

  const data = advocacyData.route || advocacyData.station;

  return (
    <div className="bg-white rounded-lg shadow-xl border max-w-2xl max-h-96 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">
              {advocacyData.route ? '🚂 Route Advocacy Data' : '🚉 Station Hub Analysis'}
            </h3>
            <p className="text-blue-100 text-sm">
              {advocacyData.route 
                ? `${advocacyData.route.from_station} → ${advocacyData.route.to_station}`
                : advocacyData.station?.station_name
              }
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-400/30 rounded text-yellow-100 text-xs">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto max-h-80">
        {/* Key Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {advocacyData.route && (
            <>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="text-2xl font-bold text-green-700">{advocacyData.route.dreamer_count}</div>
                <div className="text-xs text-green-600">Dreamers</div>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{advocacyData.route.advocacy_score}%</div>
                <div className="text-xs text-blue-600">Advocacy Score</div>
              </div>
              <div className="bg-amber-50 p-3 rounded border border-amber-200">
                <div className="text-2xl font-bold text-amber-700">{advocacyData.route.potential_co2_savings}kg</div>
                <div className="text-xs text-amber-600">CO₂ Savings/Trip</div>
              </div>
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">{advocacyData.route.travel_time_estimated}</div>
                <div className="text-xs text-purple-600">Travel Time</div>
              </div>
            </>
          )}
          
          {advocacyData.station && (
            <>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="text-2xl font-bold text-green-700">{advocacyData.station.total_routes}</div>
                <div className="text-xs text-green-600">Potential Routes</div>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{advocacyData.station.infrastructure_score}%</div>
                <div className="text-xs text-blue-600">Infrastructure Ready</div>
              </div>
              <div className="bg-amber-50 p-3 rounded border border-amber-200">
                <div className="text-2xl font-bold text-amber-700">{advocacyData.station.inbound_demand + advocacyData.station.outbound_demand}</div>
                <div className="text-xs text-amber-600">Total Demand</div>
              </div>
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <div className="text-2xl font-bold text-purple-700 capitalize">{advocacyData.station.readiness_level}</div>
                <div className="text-xs text-purple-600">Readiness Level</div>
              </div>
            </>
          )}
        </div>

        {/* Environmental Impact */}
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-800 mb-2">🌱 Environmental Impact</h4>
          <div className="bg-green-50 p-3 rounded border border-green-200 text-sm">
            <p className="text-green-800 font-medium">{advocacyData.policy_impact.environmental_impact}</p>
            <p className="text-green-600 text-xs mt-1">vs. equivalent flights</p>
          </div>
        </div>

        {/* Key Messages for Policymakers */}
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-800 mb-2">🎯 Key Policy Messages</h4>
          <div className="space-y-2">
            {advocacyData.call_to_action.key_messages.slice(0, 3).map((message, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-gray-700">{message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Benefits */}
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-800 mb-2">💰 Economic Benefits</h4>
          <div className="text-xs text-gray-600">
            {advocacyData.policy_impact.economic_benefits.slice(0, 2).map((benefit, index) => (
              <div key={index} className="mb-1">• {benefit}</div>
            ))}
          </div>
        </div>

        {/* Target Authorities */}
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-800 mb-2">🏛️ Contact Authorities</h4>
          <div className="flex flex-wrap gap-1">
            {advocacyData.call_to_action.target_authorities.slice(0, 2).map((authority, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-700">
                {authority}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t bg-gray-50 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            📊 Export Data
          </button>
          
          <button
            onClick={() => handleSocialShare('twitter')}
            className="px-3 py-1 bg-sky-500 text-white text-xs rounded hover:bg-sky-600 transition-colors"
          >
            Share on Twitter
          </button>
          
          <button
            onClick={() => handleSocialShare('linkedin')}
            className="px-3 py-1 bg-blue-700 text-white text-xs rounded hover:bg-blue-800 transition-colors"
          >
            Share on LinkedIn
          </button>
          
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}