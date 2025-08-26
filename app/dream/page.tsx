"use client";
import Link from 'next/link';
import { useState } from 'react';
import { QrCode, MapPin, Calendar, Link2 } from 'lucide-react';
import { EVENT_DATE_DISPLAY, EVENT_TIME_DISPLAY } from '@/lib/event';

interface QRResult {
  id: string;
  qrCodeDataUrl: string;
  url: string;
  stationCode: string;
  expiresAt: string;
}

export default function DreamIndexPage() {
  const [stationCode, setStationCode] = useState('BERLIN-HBF');
  const [stationName, setStationName] = useState('Berlin Hauptbahnhof');
  const [language, setLanguage] = useState<'en'|'de'|'fr'>('en');
  const [volunteerId, setVolunteerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QRResult | null>(null);

  const generateQR = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const params = new URLSearchParams({
        station: stationCode,
        name: stationName,
        lang: language,
        event: '2025-09-26',
      });
      if (volunteerId.trim()) params.set('volunteer', volunteerId.trim());
      const res = await fetch(`/api/qr/generate?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to generate');
      setResult(data as QRResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Where would you like to wake up?</h1>
          <p className="text-lg text-gray-600">
            Use interview mode to collect dreams at stations. Generate a QR code that links directly to the on-device interview.
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/80 border">
            <Calendar className="h-4 w-4" /> {EVENT_DATE_DISPLAY} • {EVENT_TIME_DISPLAY}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Generator */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <QrCode className="h-5 w-5" /> Generate Interview QR
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station Code</label>
                <input
                  value={stationCode}
                  onChange={(e) => setStationCode(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bot-green focus:border-transparent"
                  placeholder="e.g., BERLIN-HBF"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station Name</label>
                <div className="relative">
                  <input
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-bot-green focus:border-transparent"
                    placeholder="Berlin Hauptbahnhof"
                  />
                  <MapPin className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-bot-green focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volunteer ID (optional)</label>
                  <input
                    value={volunteerId}
                    onChange={(e) => setVolunteerId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-bot-green focus:border-transparent"
                    placeholder="e.g., V123"
                  />
                </div>
              </div>

              <button
                onClick={generateQR}
                disabled={loading || !stationCode || !stationName}
                className="w-full bg-bot-green text-white py-3 rounded-lg font-semibold hover:bg-bot-dark-green disabled:opacity-50"
              >
                {loading ? 'Generating…' : 'Generate QR Code'}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3" role="alert">{error}</div>
              )}

              {result && (
                <div className="mt-4 text-center">
                  <img src={result.qrCodeDataUrl} alt="Interview QR Code" className="mx-auto rounded border" />
                  <div className="mt-3 space-x-3">
                    <a href={result.qrCodeDataUrl} download={`interview-${stationCode}.png`} className="inline-block px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Download</a>
                    <a href={result.url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white border hover:bg-gray-50">
                      <Link2 className="h-4 w-4" /> Open Interview
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Expires: {new Date(result.expiresAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How Interview Mode Works</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Print or display the QR code at your station.</li>
              <li>Participants scan it with their phone to open interview mode.</li>
              <li>They answer “Where would you like to wake up?” and submit.</li>
              <li>Responses feed into the map and impact dashboard.</li>
            </ol>
            <div className="mt-6 p-4 rounded-lg bg-bot-blue/10 border border-bot-blue/20">
              <p className="text-sm text-gray-800">
                Prefer to run interviews directly? Use <Link href="/interview" className="underline">Interview Mode</Link> on your device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
