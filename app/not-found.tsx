import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bot-blue/5 via-white to-bot-green/5">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-bot-dark mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link 
          href="/" 
          className="bg-bot-green text-white px-6 py-3 rounded-lg hover:bg-bot-dark-green transition-colors inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}