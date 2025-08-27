'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEventTracker } from '@/hooks/useAnalytics';

interface ExportData {
  dreamsCount?: any;
  popularRoutes?: any;
  growthChart?: any;
  stationReadiness?: any;
}

interface DataExportProps {
  className?: string;
  data?: ExportData;
  title?: string;
}

export default function DataExport({ 
  className = '',
  data = {},
  title = 'Export Dashboard Data'
}: DataExportProps) {
  const { trackDataExport } = useEventTracker();
  const [isExporting, setIsExporting] = React.useState<string | null>(null);

  const formatDataForExport = (exportType: 'csv' | 'json') => {
    const timestamp = new Date().toISOString();
    const exportData = {
      exportedAt: timestamp,
      source: 'Pajama Party Platform - Public Impact Dashboard',
      description: 'Advocacy data for night train movement across Europe',
      ...data
    };

    if (exportType === 'json') {
      return JSON.stringify(exportData, null, 2);
    }

    // Convert to CSV format
    const csvRows: string[] = [];
    
    // Add metadata
    csvRows.push('# Pajama Party Platform - Public Impact Dashboard');
    csvRows.push(`# Exported at: ${timestamp}`);
    csvRows.push('# Data for night train advocacy across Europe');
    csvRows.push('');

    // Dreams count data
    if (data.dreamsCount) {
      csvRows.push('=== DREAMS COUNT ===');
      csvRows.push('Metric,Value');
      csvRows.push(`Total Dreams,${data.dreamsCount.totalDreams}`);
      csvRows.push(`Participation Signups,${data.dreamsCount.participationSignups}`);
      csvRows.push(`Today Dreams,${data.dreamsCount.todayDreams}`);
      csvRows.push(`Participation Rate,${data.dreamsCount.metrics?.participationRate}%`);
      csvRows.push('');
    }

    // Popular routes data
    if (data.popularRoutes?.popularRoutes) {
      csvRows.push('=== POPULAR ROUTES ===');
      csvRows.push('Rank,From,To,Dream Count,Percentage');
      data.popularRoutes.popularRoutes.forEach((route: any, index: number) => {
        csvRows.push(`${index + 1},"${route.from}","${route.to}",${route.dreamCount},${route.percentage}%`);
      });
      csvRows.push('');
    }

    // Station readiness data
    if (data.stationReadiness) {
      const { readyStations, buildingStations, emergingStations } = data.stationReadiness;
      
      if (readyStations?.length > 0) {
        csvRows.push('=== READY STATIONS ===');
        csvRows.push('Station,Participants,Organizers,Total Interest,Participation Rate,Has Organizer');
        readyStations.forEach((station: any) => {
          csvRows.push(`"${station.station}",${station.participants},${station.organizers},${station.totalInterest},${station.participationRate}%,${station.hasOrganizer}`);
        });
        csvRows.push('');
      }
    }

    return csvRows.join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (exportType: 'csv' | 'json') => {
    setIsExporting(exportType);
    trackDataExport(exportType, 'dashboard-data');

    try {
      // If no local data, fetch fresh data from APIs
      let exportData = data;
      
      if (Object.keys(data).length === 0) {
        const [dreamsRes, routesRes, stationsRes] = await Promise.all([
          fetch('/api/impact/dreams-count'),
          fetch('/api/impact/routes-popular'),
          fetch('/api/impact/stations-ready')
        ]);

        exportData = {
          dreamsCount: dreamsRes.ok ? await dreamsRes.json() : null,
          popularRoutes: routesRes.ok ? await routesRes.json() : null,
          stationReadiness: stationsRes.ok ? await stationsRes.json() : null,
        };
      }

      const content = formatDataForExport(exportType);
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const filename = `pajama-party-dashboard-${timestamp}.${exportType}`;
      const mimeType = exportType === 'json' ? 'application/json' : 'text/csv';
      
      downloadFile(content, filename, mimeType);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📊</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Download data for advocacy and analysis</p>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CSV Export */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('csv')}
          disabled={isExporting !== null}
          className="group relative overflow-hidden bg-gradient-to-r from-bot-green to-bot-dark-green text-white p-6 rounded-xl font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-3">
              <span className="text-3xl">📈</span>
            </div>
            <div className="text-lg font-bold mb-2">Export as CSV</div>
            <div className="text-sm opacity-90 mb-3">
              Structured data for spreadsheet analysis
            </div>
            <div className="text-xs opacity-75">
              • Easy to import into Excel/Google Sheets
              <br />
              • Perfect for creating custom charts
              <br />
              • Includes metadata and timestamps
            </div>
            
            {isExporting === 'csv' && (
              <div className="mt-3 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="ml-2 text-sm">Preparing download...</span>
              </div>
            )}
          </div>
          
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-bot-dark-green to-bot-green opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </motion.button>

        {/* JSON Export */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('json')}
          disabled={isExporting !== null}
          className="group relative overflow-hidden bg-gradient-to-r from-bot-blue to-bot-green text-white p-6 rounded-xl font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-3">
              <span className="text-3xl">💻</span>
            </div>
            <div className="text-lg font-bold mb-2">Export as JSON</div>
            <div className="text-sm opacity-90 mb-3">
              Raw data for developers and analysis tools
            </div>
            <div className="text-xs opacity-75">
              • Machine-readable format
              <br />
              • Preserves data structure
              <br />
              • Perfect for APIs and automation
            </div>
            
            {isExporting === 'json' && (
              <div className="mt-3 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="ml-2 text-sm">Preparing download...</span>
              </div>
            )}
          </div>
          
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-bot-green to-bot-blue opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </motion.button>
      </div>

      {/* Usage Information */}
      <div className="mt-6 p-4 bg-bot-green/5 rounded-lg border border-bot-green/20">
        <div className="flex items-start gap-3">
          <span className="text-lg">📋</span>
          <div>
            <div className="font-medium text-bot-dark-green mb-2">Data Usage Guidelines</div>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• This data is public and can be used for advocacy purposes</p>
              <p>• All personal information has been anonymized</p>
              <p>• Data is updated every 5-10 minutes</p>
              <p>• Attribution: "Source: Pajama Party Platform (back-on-track.eu)" appreciated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      {Object.keys(data).length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Current data includes:{' '}
          {Object.keys(data).map((key, index) => (
            <span key={key}>
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              {index < Object.keys(data).length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}