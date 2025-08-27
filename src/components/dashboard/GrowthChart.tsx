'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useDashboardData, useEventTracker } from '@/hooks/useAnalytics';

interface GrowthChartData {
  chartData: Array<{
    date: string;
    formattedDate: string;
    dreams: number;
    participants: number;
    weekday: string;
    cumulativeDreams: number;
    cumulativeParticipants: number;
  }>;
  metrics: {
    totalDreams: number;
    totalParticipants: number;
    last7Days: number;
    weeklyGrowthRate: number;
    peakDay: {
      date: string;
      dreams: number;
    };
    averageDailyDreams: number;
    participationRate: number;
  };
  lastUpdated: string;
}

interface GrowthChartProps {
  className?: string;
  chartType?: 'daily' | 'cumulative';
  height?: number;
}

export default function GrowthChart({ 
  className = '',
  chartType = 'cumulative',
  height = 300 
}: GrowthChartProps) {
  const { trackDashboardView, trackChartInteraction } = useEventTracker();
  const { data, loading, error } = useDashboardData<GrowthChartData>('/api/impact/growth-chart', 60000); // 1 minute refresh
  const [viewType, setViewType] = React.useState<'cumulative' | 'daily'>(chartType);

  React.useEffect(() => {
    trackDashboardView('growth-chart');
  }, [trackDashboardView]);

  const handleViewTypeChange = (type: 'cumulative' | 'daily') => {
    setViewType(type);
    trackChartInteraction('growth-chart', `view-${type}`);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-2xl p-8 text-center ${className}`} role="alert">
        <div className="text-red-700 font-medium mb-1">Unable to load growth chart</div>
        <div className="text-sm text-red-600 mb-1">{error}</div>
        <div className="text-xs text-red-700">Check Supabase configuration.</div>
      </div>
    );
  }

  if (!data || !data.chartData.length) return null;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.formattedDate}</p>
          <p className="text-sm text-gray-600 mb-2">{data.weekday}</p>
          {viewType === 'daily' ? (
            <>
              <p className="text-sm text-bot-green">
                <span className="inline-block w-3 h-3 bg-bot-green rounded-full mr-2"></span>
                Dreams: {data.dreams}
              </p>
              <p className="text-sm text-bot-blue">
                <span className="inline-block w-3 h-3 bg-bot-blue rounded-full mr-2"></span>
                Participants: {data.participants}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-bot-green">
                <span className="inline-block w-3 h-3 bg-bot-green rounded-full mr-2"></span>
                Total Dreams: {data.cumulativeDreams}
              </p>
              <p className="text-sm text-bot-blue">
                <span className="inline-block w-3 h-3 bg-bot-blue rounded-full mr-2"></span>
                Total Participants: {data.cumulativeParticipants}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Movement Growth
          </h3>
          <p className="text-sm text-gray-600">30-day advocacy momentum</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleViewTypeChange('cumulative')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
              viewType === 'cumulative'
                ? 'bg-white text-bot-green shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Total
          </button>
          <button
            onClick={() => handleViewTypeChange('daily')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
              viewType === 'daily'
                ? 'bg-white text-bot-green shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <motion.div
            key={data.metrics.last7Days}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-bot-green mb-1"
          >
            {data.metrics.last7Days}
          </motion.div>
          <div className="text-xs text-gray-600">Last 7 days</div>
        </div>

        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${
            data.metrics.weeklyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {data.metrics.weeklyGrowthRate >= 0 ? '+' : ''}{data.metrics.weeklyGrowthRate}%
          </div>
          <div className="text-xs text-gray-600">Weekly growth</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-bot-blue mb-1">
            {data.metrics.averageDailyDreams}
          </div>
          <div className="text-xs text-gray-600">Avg per day</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-bot-dark-green mb-1">
            {data.metrics.participationRate}%
          </div>
          <div className="text-xs text-gray-600">Participation</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'daily' ? (
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="dreamsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="participantsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#9ca3af"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="dreams"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#dreamsGradient)"
              />
              <Area
                type="monotone"
                dataKey="participants"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#participantsGradient)"
              />
            </AreaChart>
          ) : (
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#9ca3af"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="cumulativeDreams"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#10B981' }}
              />
              <Line
                type="monotone"
                dataKey="cumulativeParticipants"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Peak Day Info */}
      <div className="mt-4 p-3 bg-bot-green/5 rounded-lg border border-bot-green/20">
        <div className="text-sm">
          <span className="font-medium text-bot-dark-green">Peak day:</span>{' '}
          <span className="text-gray-700">
            {data.metrics.peakDay.date} with {data.metrics.peakDay.dreams} dreams
          </span>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}
