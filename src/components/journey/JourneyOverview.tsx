'use client';

import Link from 'next/link';
import { PHASES } from '@/lib/phases';

interface JourneyOverviewProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function JourneyOverview({
  className = '',
  title = 'Your Journey to Action',
  subtitle = 'Discover the steps from a dream to coordinated activism'
}: JourneyOverviewProps) {
  return (
    <div className={`journey-overview ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PHASES.sort((a, b) => a.order - b.order).map((phase) => (
          <Link
            key={phase.id}
            href={phase.href}
            className={`group block rounded-xl border p-5 hover:shadow-md transition-all ${phase.bgColor} ${phase.borderColor} hover:border-current`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl" aria-hidden="true">{phase.icon}</div>
              <div>
                <div className={`text-sm font-semibold uppercase tracking-wide ${phase.color}`}>Step {phase.order}</div>
                <h3 className="text-lg font-bold text-gray-900">{phase.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                <span className={`inline-block mt-3 text-sm font-medium ${phase.color}`}>Go to {phase.name} →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

