import { Metadata } from 'next';
import { DreamCounter, GrowthChart, PopularRoutes, StationReadiness, DataExport } from '@/components/dashboard';
import { BarChart3, TrendingUp, MapPin, Database, Users, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Impact Dashboard | Back-on-Track Movement',
  description: 'Real-time analytics and impact metrics for the European Night Train advocacy movement.',
  robots: 'noindex,nofollow', // Keep dashboard private
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <section className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <BarChart3 className="h-8 w-8 inline mr-3 text-bot-green" />
                Impact Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time insights into our European Night Train advocacy movement
              </p>
            </div>
            <DataExport />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Dreams Counter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Dreams</p>
                <DreamCounter />
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Station Readiness */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Stations Ready</p>
                <StationReadiness compact />
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Growth Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">7-Day Growth</p>
                <div className="text-2xl font-bold text-gray-900">+12.5%</div>
              </div>
              <div className="p-3 bg-bot-green/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-bot-green" />
              </div>
            </div>
          </div>

          {/* Active Participants */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Users</p>
                <div className="text-2xl font-bold text-gray-900">2,847</div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Growth Trends</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>Last 30 days</span>
              </div>
            </div>
            <GrowthChart />
          </div>

          {/* Popular Routes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Popular Routes</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Database className="h-4 w-4" />
                <span>Most requested</span>
              </div>
            </div>
            <PopularRoutes />
          </div>
        </div>

        {/* Station Readiness Full */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Station Readiness Overview</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>September 26 preparation</span>
            </div>
          </div>
          <StationReadiness />
        </div>

        {/* Footer Notice */}
        <div className="mt-12 bg-gradient-to-r from-bot-green/10 to-bot-blue/10 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-600">
            <strong>Privacy Note:</strong> All analytics data is anonymized and automatically deleted after 30 days 
            in compliance with GDPR. This dashboard helps us understand the movement's impact while respecting privacy.
          </p>
        </div>
      </div>
    </div>
  );
}