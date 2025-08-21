'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeRequest, QRCodeResponse, Station } from '@/types';

interface QRGeneratorProps {
  language?: 'en' | 'de' | 'fr';
  onGenerated?: (qrCode: QRCodeResponse) => void;
}

const translations = {
  en: {
    title: "QR Code Generator",
    subtitle: "Generate station-specific QR codes for volunteer interviews",
    station: "Station",
    stationPlaceholder: "Search for a station...",
    volunteerId: "Volunteer ID (optional)",
    volunteerPlaceholder: "volunteer@example.com",
    eventDate: "Event Date",
    generate: "Generate QR Code",
    generating: "Generating...",
    download: "Download QR Code",
    copy: "Copy URL",
    preview: "Preview",
    instructions: "Instructions",
    instructionsText: [
      "1. Print this QR code on a sign or flyer",
      "2. Place it at your station for easy scanning",
      "3. When scanned, it pre-fills the station information",
      "4. Volunteers can immediately start collecting dreams"
    ],
    expires: "Expires",
    scanUrl: "Scan URL",
    copied: "Copied!",
    error: "Error generating QR code"
  },
  de: {
    title: "QR-Code Generator",
    subtitle: "Stationsspezifische QR-Codes für Freiwilligen-Interviews generieren",
    station: "Bahnhof",
    stationPlaceholder: "Nach Bahnhof suchen...",
    volunteerId: "Freiwilligen-ID (optional)",
    volunteerPlaceholder: "freiwilliger@example.de",
    eventDate: "Veranstaltungsdatum",
    generate: "QR-Code generieren",
    generating: "Generiert...",
    download: "QR-Code herunterladen",
    copy: "URL kopieren",
    preview: "Vorschau",
    instructions: "Anweisungen",
    instructionsText: [
      "1. Drucken Sie diesen QR-Code auf ein Schild oder Flyer",
      "2. Platzieren Sie ihn an Ihrem Bahnhof zum einfachen Scannen",
      "3. Beim Scannen werden die Bahnhofsinformationen vorausgefüllt",
      "4. Freiwillige können sofort mit dem Sammeln von Träumen beginnen"
    ],
    expires: "Läuft ab",
    scanUrl: "Scan-URL",
    copied: "Kopiert!",
    error: "Fehler beim Generieren des QR-Codes"
  },
  fr: {
    title: "Générateur de Code QR",
    subtitle: "Générer des codes QR spécifiques aux gares pour les interviews de bénévoles",
    station: "Gare",
    stationPlaceholder: "Rechercher une gare...",
    volunteerId: "ID Bénévole (optionnel)",
    volunteerPlaceholder: "benevole@example.fr",
    eventDate: "Date d'événement",
    generate: "Générer le Code QR",
    generating: "Génération...",
    download: "Télécharger le Code QR",
    copy: "Copier l'URL",
    preview: "Aperçu",
    instructions: "Instructions",
    instructionsText: [
      "1. Imprimez ce code QR sur un panneau ou flyer",
      "2. Placez-le à votre gare pour un scan facile",
      "3. Quand scanné, il pré-remplit les informations de la gare",
      "4. Les bénévoles peuvent immédiatement commencer à collecter des rêves"
    ],
    expires: "Expire",
    scanUrl: "URL de Scan",
    copied: "Copié !",
    error: "Erreur lors de la génération du code QR"
  }
};

export default function QRGenerator({
  language = 'en',
  onGenerated
}: QRGeneratorProps) {
  const [formData, setFormData] = useState<QRCodeRequest>({
    stationCode: '',
    stationName: '',
    language,
    volunteerId: '',
    eventDate: '2025-09-26'
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCode, setQrCode] = useState<QRCodeResponse | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  const searchStations = async (query: string) => {
    if (query.length < 2) {
      setStations([]);
      return;
    }

    try {
      const response = await fetch(`/api/stations/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setStations(data.stations || []);
      }
    } catch (error) {
      console.error('Station search error:', error);
    }
  };

  const handleStationInput = (value: string) => {
    setFormData(prev => ({ ...prev, stationName: value }));
    setShowSuggestions(true);
    searchStations(value);
  };

  const selectStation = (station: Station) => {
    const stationName = `${station.name}, ${station.city}, ${station.country}`;
    const stationCode = station.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    setFormData(prev => ({
      ...prev,
      stationName,
      stationCode
    }));
    setShowSuggestions(false);
    setStations([]);
  };

  const generateQRCode = async () => {
    if (!formData.stationName || !formData.stationCode) {
      setError('Please select a station');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const qrCodeData = await response.json();
      setQrCode(qrCodeData);
      onGenerated?.(qrCodeData);

    } catch (error) {
      setError(error instanceof Error ? error.message : t.error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode.qrCodeDataUrl;
    link.download = `qr-code-${formData.stationCode}-${formData.eventDate}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Form */}
      <div className="space-y-6 mb-8">
        {/* Station Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.station} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.stationName}
            onChange={(e) => handleStationInput(e.target.value)}
            onFocus={() => setShowSuggestions(formData.stationName.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bot-green focus:border-transparent"
            placeholder={t.stationPlaceholder}
          />
          
          {showSuggestions && stations.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
              {stations.map((station) => (
                <button
                  key={station.id || `${station.lat}-${station.lng}`}
                  type="button"
                  onClick={() => selectStation(station)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{station.name}</div>
                  <div className="text-sm text-gray-600">{station.city}, {station.country}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volunteer ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.volunteerId}
          </label>
          <input
            type="text"
            value={formData.volunteerId}
            onChange={(e) => setFormData(prev => ({ ...prev, volunteerId: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bot-green focus:border-transparent"
            placeholder={t.volunteerPlaceholder}
          />
        </div>

        {/* Event Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.eventDate}
          </label>
          <input
            type="date"
            value={formData.eventDate}
            onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bot-green focus:border-transparent"
          />
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as 'en' | 'de' | 'fr' }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bot-green focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <motion.button
          onClick={generateQRCode}
          disabled={isGenerating || !formData.stationName}
          className="w-full bg-gradient-to-r from-bot-green to-bot-dark-green text-white py-4 px-6 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGenerating ? (
            <>
              <span className="animate-spin mr-2">⭐</span>
              {t.generating}
            </>
          ) : (
            t.generate
          )}
        </motion.button>
      </div>

      {/* QR Code Result */}
      {qrCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t pt-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t.preview}</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code Image */}
            <div className="text-center">
              <img
                src={qrCode.qrCodeDataUrl}
                alt="QR Code"
                className="mx-auto mb-4 border border-gray-300 rounded-lg shadow-sm"
                style={{ maxWidth: '200px', height: 'auto' }}
              />
              <div className="space-y-2">
                <button
                  onClick={downloadQRCode}
                  className="w-full px-4 py-2 bg-bot-green text-white rounded-lg hover:bg-bot-dark-green transition-colors"
                >
                  {t.download}
                </button>
                <button
                  onClick={() => copyToClipboard(qrCode.url)}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    copySuccess 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {copySuccess ? t.copied : t.copy}
                </button>
              </div>
            </div>

            {/* Information */}
            <div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">{t.scanUrl}:</label>
                  <div className="text-sm font-mono bg-gray-100 p-2 rounded border break-all">
                    {qrCode.url}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">{t.expires}:</label>
                  <div className="text-sm text-gray-800">
                    {new Date(qrCode.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">{t.instructions}</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  {t.instructionsText.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}