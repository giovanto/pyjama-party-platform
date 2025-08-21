export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bot-green/10 via-bot-light-green/10 to-bot-blue/10 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-bot-green/20">
          <div className="text-6xl mb-6">🚂</div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            You&apos;re Offline
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            No internet connection detected. Some features may not be available, 
            but you can still browse previously loaded content.
          </p>
          
          <div className="bg-bot-green/10 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-bot-dark-green mb-2">
              Available Offline:
            </h3>
            <ul className="text-sm text-bot-dark-green space-y-1">
              <li>• View cached dream routes</li>
              <li>• Browse event information</li>
              <li>• Access about pages</li>
            </ul>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-bot-green text-white py-3 px-6 rounded-xl font-semibold hover:bg-bot-dark-green transition-colors duration-300"
          >
            Try Again
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            Your connection will be restored automatically when back online.
          </p>
        </div>
      </div>
    </div>
  );
}