"use client";
import { DreamForm } from '@/components/forms';
import QRGenerator from '@/components/qr/QRGenerator';
import Link from 'next/link';

export default function DreamIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-bot-green/5 to-bot-blue/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Share Your Dream Route</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Where would you travel by night train? Your input helps build the advocacy case.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <DreamForm mode="dream_only" />
        </div>

        {/* Share & Interview */}
        <div className="mt-16 grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Generate an Interview QR</h2>
            <p className="text-gray-600 mb-4">Print or share a QR so friends and family can add their dream quickly.</p>
            <QRGenerator />
          </div>
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Run Interview Mode</h2>
            <p className="text-gray-600 mb-4">Open the on-device, fast interview experience to collect dreams at a station.</p>
            <Link href="/interview" className="inline-flex items-center bg-bot-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-bot-dark-green transition-colors">
              🎤 Open Interview Mode
            </Link>
            <p className="text-xs text-gray-500 mt-3">Tip: Use the QR above to pre-fill station information. To organize a pajama party, use the form on the <Link href="/pyjama-party" className="underline">Event page</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
