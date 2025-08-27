'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { QRGenerator } from '@/components/qr';

const translations = {
  en: {
    title: "Volunteer Coordination Center",
    subtitle: "September 26th Pajama Party - Dream Route Collection",
    welcome: "Welcome, Volunteer Coordinator!",
    description: "Set up your station for maximum impact on the European Pajama Party day. Use this center to generate QR codes, coordinate with volunteers, and track your station's progress.",
    quickStart: "Quick Start",
    startSession: "Start Collection Session",
    generateQr: "Generate Station QR Code",
    bulkQr: "Bulk QR Generation",
    guidelines: "Volunteer Guidelines",
    support: "Get Support",
    stats: "View Statistics",
    sections: {
      session: {
        title: "Start Your Session",
        description: "Ready to start collecting dream routes? Set up your collection session with station-specific parameters.",
        stationCode: "Station Code",
        stationCodePlaceholder: "e.g., amsterdam-central",
        volunteerName: "Volunteer Name/Email",
        volunteerPlaceholder: "your.email@example.com",
        language: "Interface Language",
        targetSubmissions: "Target Submissions",
        startButton: "Start Interview Session",
        demo: "Try Demo Mode"
      },
      qr: {
        title: "QR Code Generation",
        description: "Generate QR codes for your station that volunteers and travelers can scan to quickly start the interview process.",
        single: "Generate Single QR Code",
        bulk: "Generate Multiple QR Codes",
        bulkDescription: "Perfect for event coordinators managing multiple stations"
      },
      guidelines: {
        title: "Collection Guidelines",
        items: [
          "🎯 Target: 30 seconds per submission",
          "🗣️ Be friendly and encouraging",
          "📱 Help with technology when needed",
          "🌍 Emphasize the climate impact",
          "🤝 Connect travelers with similar routes",
          "📊 Track your progress regularly",
          "🔄 Use offline mode when needed",
          "🎉 Celebrate each contribution!"
        ]
      },
      tips: {
        title: "Pro Tips for Maximum Impact",
        items: [
          "Set up near information boards or waiting areas",
          "Have backup power for devices",
          "Create a welcoming atmosphere with decorations",
          "Use the volunteer dashboard to track progress",
          "Encourage travelers to share on social media",
          "Have printed QR codes as backup",
          "Coordinate with station staff if possible",
          "Take photos of the setup (with permission)"
        ]
      }
    },
    footer: {
      emergency: "Emergency Support",
      technical: "Technical Issues",
      coordination: "Event Coordination",
      resources: "Resources & Downloads"
    }
  },
  de: {
    title: "Freiwilligen-Koordinationszentrum",
    subtitle: "26. September Pyjama-Party - Traumrouten-Sammlung",
    welcome: "Willkommen, Freiwilliger Koordinator!",
    description: "Richten Sie Ihren Bahnhof für maximale Wirkung am Tag der Europäischen Pyjama-Party ein. Verwenden Sie dieses Zentrum, um QR-Codes zu generieren, mit Freiwilligen zu koordinieren und den Fortschritt Ihres Bahnhofs zu verfolgen.",
    quickStart: "Schnellstart",
    startSession: "Sammelsession starten",
    generateQr: "Bahnhof QR-Code generieren",
    bulkQr: "Bulk QR-Generierung",
    guidelines: "Freiwilligen-Richtlinien",
    support: "Support erhalten",
    stats: "Statistiken anzeigen",
    sections: {
      session: {
        title: "Starten Sie Ihre Session",
        description: "Bereit, Traumrouten zu sammeln? Richten Sie Ihre Sammelsession mit bahnhofsspezifischen Parametern ein.",
        stationCode: "Bahnhofscode",
        stationCodePlaceholder: "z.B. amsterdam-central",
        volunteerName: "Freiwilliger Name/E-Mail",
        volunteerPlaceholder: "ihre.email@example.de",
        language: "Oberflächensprache",
        targetSubmissions: "Ziel-Übermittlungen",
        startButton: "Interview-Session starten",
        demo: "Demo-Modus ausprobieren"
      },
      qr: {
        title: "QR-Code Generierung",
        description: "Generieren Sie QR-Codes für Ihren Bahnhof, die Freiwillige und Reisende scannen können, um den Interview-Prozess schnell zu starten.",
        single: "Einzelnen QR-Code generieren",
        bulk: "Mehrere QR-Codes generieren",
        bulkDescription: "Perfekt für Veranstaltungskoordinatoren, die mehrere Bahnhöfe verwalten"
      },
      guidelines: {
        title: "Sammel-Richtlinien",
        items: [
          "🎯 Ziel: 30 Sekunden pro Übermittlung",
          "🗣️ Seien Sie freundlich und ermutigend",
          "📱 Helfen Sie bei der Technik wenn nötig",
          "🌍 Betonen Sie die Klimawirkung",
          "🤝 Verbinden Sie Reisende mit ähnlichen Routen",
          "📊 Verfolgen Sie regelmäßig Ihren Fortschritt",
          "🔄 Verwenden Sie Offline-Modus wenn nötig",
          "🎉 Feiern Sie jeden Beitrag!"
        ]
      },
      tips: {
        title: "Profi-Tipps für maximale Wirkung",
        items: [
          "Positionieren Sie sich in der Nähe von Infotafeln oder Wartebereichen",
          "Haben Sie Backup-Strom für Geräte",
          "Schaffen Sie eine einladende Atmosphäre mit Dekoration",
          "Verwenden Sie das Freiwilligen-Dashboard zur Fortschrittsverfolgung",
          "Ermutigen Sie Reisende zum Teilen in sozialen Medien",
          "Haben Sie gedruckte QR-Codes als Backup",
          "Koordinieren Sie mit Bahnhofspersonal wenn möglich",
          "Machen Sie Fotos vom Setup (mit Erlaubnis)"
        ]
      }
    },
    footer: {
      emergency: "Notfall-Support",
      technical: "Technische Probleme",
      coordination: "Event-Koordination",
      resources: "Ressourcen & Downloads"
    }
  },
  fr: {
    title: "Centre de Coordination des Bénévoles",
    subtitle: "Pajama Party du 26 septembre - Collecte de Routes de Rêve",
    welcome: "Bienvenue, Coordinateur Bénévole !",
    description: "Configurez votre gare pour un impact maximal le jour de la Pajama Party Européenne. Utilisez ce centre pour générer des codes QR, coordonner avec les bénévoles, et suivre les progrès de votre gare.",
    quickStart: "Démarrage Rapide",
    startSession: "Démarrer la Session de Collecte",
    generateQr: "Générer le Code QR de la Gare",
    bulkQr: "Génération QR en Masse",
    guidelines: "Directives pour Bénévoles",
    support: "Obtenir de l'Aide",
    stats: "Voir les Statistiques",
    sections: {
      session: {
        title: "Démarrez Votre Session",
        description: "Prêt à commencer la collecte des routes de rêve ? Configurez votre session de collecte avec des paramètres spécifiques à la gare.",
        stationCode: "Code de Gare",
        stationCodePlaceholder: "ex. amsterdam-central",
        volunteerName: "Nom/Email du Bénévole",
        volunteerPlaceholder: "votre.email@example.fr",
        language: "Langue de l'Interface",
        targetSubmissions: "Soumissions Cibles",
        startButton: "Démarrer la Session d'Interview",
        demo: "Essayer le Mode Démo"
      },
      qr: {
        title: "Génération de Code QR",
        description: "Générez des codes QR pour votre gare que les bénévoles et voyageurs peuvent scanner pour démarrer rapidement le processus d'interview.",
        single: "Générer un Code QR Simple",
        bulk: "Générer Plusieurs Codes QR",
        bulkDescription: "Parfait pour les coordinateurs d'événements gérant plusieurs gares"
      },
      guidelines: {
        title: "Directives de Collecte",
        items: [
          "🎯 Objectif : 30 secondes par soumission",
          "🗣️ Soyez amical et encourageant",
          "📱 Aidez avec la technologie au besoin",
          "🌍 Soulignez l'impact climatique",
          "🤝 Connectez les voyageurs avec des routes similaires",
          "📊 Suivez régulièrement vos progrès",
          "🔄 Utilisez le mode hors ligne au besoin",
          "🎉 Célébrez chaque contribution !"
        ]
      },
      tips: {
        title: "Conseils Pro pour un Impact Maximum",
        items: [
          "Installez-vous près des panneaux d'information ou zones d'attente",
          "Ayez une alimentation de secours pour les appareils",
          "Créez une atmosphère accueillante avec des décorations",
          "Utilisez le tableau de bord bénévole pour suivre les progrès",
          "Encouragez les voyageurs à partager sur les réseaux sociaux",
          "Ayez des codes QR imprimés en secours",
          "Coordonnez avec le personnel de gare si possible",
          "Prenez des photos de l'installation (avec permission)"
        ]
      }
    },
    footer: {
      emergency: "Support d'Urgence",
      technical: "Problèmes Techniques",
      coordination: "Coordination d'Événement",
      resources: "Ressources & Téléchargements"
    }
  }
};

export default function VolunteerPage() {
  const [language, setLanguage] = useState<'en' | 'de' | 'fr'>('en');
  const [sessionData, setSessionData] = useState({
    stationCode: '',
    volunteerName: '',
    language: 'en' as 'en' | 'de' | 'fr',
    targetSubmissions: 50
  });
  const [showQRGenerator, setShowQRGenerator] = useState(false);

  const t = translations[language];

  const handleStartSession = () => {
    if (!sessionData.stationCode.trim()) {
      alert('Please enter a station code');
      return;
    }

    // Generate session URL with parameters
    const url = new URL('/interview', window.location.origin);
    url.searchParams.set('station', sessionData.stationCode);
    url.searchParams.set('lang', sessionData.language);
    url.searchParams.set('volunteer', sessionData.volunteerName);
    url.searchParams.set('target', sessionData.targetSubmissions.toString());
    
    window.open(url.toString(), '_blank');
  };

  const handleDemoMode = () => {
    const url = new URL('/interview', window.location.origin);
    url.searchParams.set('station', 'demo-station');
    url.searchParams.set('lang', language);
    url.searchParams.set('volunteer', 'demo-volunteer');
    
    window.open(url.toString(), '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bot-green/5 via-white to-bot-blue/5">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-bot-green/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
            
            {/* Language Selector */}
            <div className="flex space-x-2">
              {(['en', 'de', 'fr'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    language === lang 
                      ? 'bg-bot-green text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-bot-green to-bot-dark-green text-white rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">{t.welcome}</h2>
          <p className="text-lg opacity-90 mb-6">{t.description}</p>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => document.getElementById('session-setup')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-bot-green px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {t.startSession}
            </button>
            <button
              onClick={() => setShowQRGenerator(true)}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              {t.generateQr}
            </button>
            <Link
              href="/impact"
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              {t.stats}
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Session Setup */}
          <div className="lg:col-span-2">
            <div id="session-setup" className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t.sections.session.title}</h3>
              <p className="text-gray-600 mb-6">{t.sections.session.description}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.sections.session.stationCode}
                  </label>
                  <input
                    type="text"
                    value={sessionData.stationCode}
                    onChange={(e) => setSessionData(prev => ({ ...prev, stationCode: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bot-green focus:border-transparent"
                    placeholder={t.sections.session.stationCodePlaceholder}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.sections.session.volunteerName}
                  </label>
                  <input
                    type="text"
                    value={sessionData.volunteerName}
                    onChange={(e) => setSessionData(prev => ({ ...prev, volunteerName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bot-green focus:border-transparent"
                    placeholder={t.sections.session.volunteerPlaceholder}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.sections.session.language}
                    </label>
                    <select
                      value={sessionData.language}
                      onChange={(e) => setSessionData(prev => ({ ...prev, language: e.target.value as 'en' | 'de' | 'fr' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bot-green focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.sections.session.targetSubmissions}
                    </label>
                    <input
                      type="number"
                      value={sessionData.targetSubmissions}
                      onChange={(e) => setSessionData(prev => ({ ...prev, targetSubmissions: parseInt(e.target.value) || 50 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bot-green focus:border-transparent"
                      min="1"
                      max="200"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <motion.button
                    onClick={handleStartSession}
                    className="flex-1 bg-gradient-to-r from-bot-green to-bot-dark-green text-white py-3 px-6 rounded-lg font-medium hover:from-bot-dark-green hover:to-bot-green transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t.sections.session.startButton}
                  </motion.button>
                  
                  <button
                    onClick={handleDemoMode}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t.sections.session.demo}
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code Generator */}
            {showQRGenerator && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <QRGenerator language={language} />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guidelines */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.sections.guidelines.title}</h3>
              <ul className="space-y-2 text-sm">
                {t.sections.guidelines.items.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>

            {/* Pro Tips */}
            <div className="bg-bot-green/5 border border-bot-green/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.sections.tips.title}</h3>
              <ul className="space-y-2 text-sm">
                {t.sections.tips.items.map((item, index) => (
                  <li key={index} className="text-gray-700">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">{t.footer.emergency}</h4>
              <p className="text-sm text-gray-600">volunteer-emergency@back-on-track.eu</p>
              <p className="text-sm text-gray-600">+31 20 123 4567</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">{t.footer.technical}</h4>
              <p className="text-sm text-gray-600">tech-support@back-on-track.eu</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">{t.footer.coordination}</h4>
              <p className="text-sm text-gray-600">coordinators@back-on-track.eu</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">{t.footer.resources}</h4>
              <Link href="/resources" className="text-sm text-bot-green hover:underline">
                Download Volunteer Kit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}