import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Plan Your Journey | European Night Train Platform',
  description: 'Find routes and connections to your chosen destination. Start by selecting a destination on the Dream page.',
};

export default function ConnectIndexPage() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-[60vh] flex items-center">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Plan Your Journey</h1>
        <p className="text-gray-600 mb-8">
          This page shows train connections for a specific destination. First choose your destination on the Dream page, then we’ll show available routes and options.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/dream" className="inline-flex items-center bg-bot-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-bot-dark-green transition-colors">
            ✨ Choose a Destination
          </Link>
          <Link href="/" className="inline-flex items-center bg-white border px-6 py-3 rounded-lg font-semibold hover:shadow-sm transition-all">
            ← Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

