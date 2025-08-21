'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OfflineQueueItem } from '@/types';

interface OfflineQueueProps {
  language?: 'en' | 'de' | 'fr';
  onQueueUpdate?: (queueSize: number) => void;
}

const translations = {
  en: {
    title: "Offline Queue",
    subtitle: "Submissions waiting to sync",
    pending: "Waiting",
    syncing: "Syncing...",
    failed: "Failed",
    completed: "Synced",
    retry: "Retry",
    retryAll: "Retry All",
    clear: "Clear",
    empty: "No items in queue",
    syncWhenOnline: "Items will sync automatically when back online",
    itemsWaiting: "items waiting",
    lastTry: "Last attempt"
  },
  de: {
    title: "Offline-Warteschlange",
    subtitle: "Übermittlungen warten auf Synchronisation",
    pending: "Wartend",
    syncing: "Synchronisiert...",
    failed: "Fehlgeschlagen",
    completed: "Synchronisiert",
    retry: "Erneut versuchen",
    retryAll: "Alle erneut versuchen",
    clear: "Löschen",
    empty: "Keine Elemente in der Warteschlange",
    syncWhenOnline: "Elemente werden automatisch synchronisiert wenn online",
    itemsWaiting: "Elemente wartend",
    lastTry: "Letzter Versuch"
  },
  fr: {
    title: "File d'attente hors ligne",
    subtitle: "Soumissions en attente de synchronisation",
    pending: "En attente",
    syncing: "Synchronisation...",
    failed: "Échoué",
    completed: "Synchronisé",
    retry: "Réessayer",
    retryAll: "Tout réessayer",
    clear: "Effacer",
    empty: "Aucun élément en file",
    syncWhenOnline: "Les éléments se synchroniseront automatiquement une fois en ligne",
    itemsWaiting: "éléments en attente",
    lastTry: "Dernière tentative"
  }
};

export default function OfflineQueue({ 
  language = 'en', 
  onQueueUpdate 
}: OfflineQueueProps) {
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isExpanded, setIsExpanded] = useState(false);
  const t = translations[language];

  // Load queue from localStorage
  useEffect(() => {
    const loadQueue = () => {
      try {
        const stored = localStorage.getItem('interviewQueue');
        if (stored) {
          const parsedQueue = JSON.parse(stored) as OfflineQueueItem[];
          setQueue(parsedQueue);
          onQueueUpdate?.(parsedQueue.filter(item => item.status !== 'completed').length);
        }
      } catch (error) {
        console.error('Error loading queue:', error);
      }
    };
    
    loadQueue();
    
    // Listen for storage changes (from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'interviewQueue') {
        loadQueue();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [onQueueUpdate]);

  // Track online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && queue.some(item => item.status === 'pending' || item.status === 'failed')) {
      processQueue();
    }
  }, [isOnline, queue]);

  const updateQueue = (updatedQueue: OfflineQueueItem[]) => {
    setQueue(updatedQueue);
    localStorage.setItem('interviewQueue', JSON.stringify(updatedQueue));
    onQueueUpdate?.(updatedQueue.filter(item => item.status !== 'completed').length);
  };

  const processQueue = async () => {
    if (!isOnline) return;
    
    const itemsToSync = queue.filter(item => 
      item.status === 'pending' || (item.status === 'failed' && item.retryCount < 3)
    );

    for (const item of itemsToSync) {
      await syncItem(item);
      // Add small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const syncItem = async (item: OfflineQueueItem) => {
    const updatedQueue = queue.map(queueItem => 
      queueItem.id === item.id 
        ? { ...queueItem, status: 'syncing' as const }
        : queueItem
    );
    updateQueue(updatedQueue);

    try {
      const response = await fetch('/api/interview/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Success - mark as completed
      const successQueue = queue.map(queueItem => 
        queueItem.id === item.id 
          ? { ...queueItem, status: 'completed' as const }
          : queueItem
      );
      updateQueue(successQueue);

      // Remove completed items after a delay
      setTimeout(() => {
        const cleanedQueue = queue.filter(queueItem => queueItem.id !== item.id);
        updateQueue(cleanedQueue);
      }, 5000);

    } catch (error) {
      console.error(`Sync failed for item ${item.id}:`, error);
      
      // Mark as failed and increment retry count
      const failedQueue = queue.map(queueItem => 
        queueItem.id === item.id 
          ? { 
              ...queueItem, 
              status: 'failed' as const,
              retryCount: queueItem.retryCount + 1
            }
          : queueItem
      );
      updateQueue(failedQueue);
    }
  };

  const retryItem = (itemId: string) => {
    const item = queue.find(q => q.id === itemId);
    if (item && isOnline) {
      syncItem(item);
    }
  };

  const retryAll = () => {
    if (isOnline) {
      processQueue();
    }
  };

  const clearCompleted = () => {
    const filteredQueue = queue.filter(item => item.status !== 'completed');
    updateQueue(filteredQueue);
  };

  const clearAll = () => {
    updateQueue([]);
  };

  const pendingCount = queue.filter(item => 
    item.status === 'pending' || item.status === 'failed'
  ).length;

  const getStatusColor = (status: OfflineQueueItem['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OfflineQueueItem['status']) => {
    switch (status) {
      case 'pending': return t.pending;
      case 'syncing': return t.syncing;
      case 'failed': return t.failed;
      case 'completed': return t.completed;
      default: return status;
    }
  };

  if (queue.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
        <div className="text-green-600 text-sm font-medium">{t.empty}</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-medium text-gray-900">{t.title}</span>
          {pendingCount > 0 && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              {pendingCount}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200"
          >
            <div className="p-4">
              {/* Status message */}
              {!isOnline && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">{t.syncWhenOnline}</p>
                </div>
              )}

              {/* Action buttons */}
              {pendingCount > 0 && (
                <div className="mb-4 flex space-x-2">
                  <button
                    onClick={retryAll}
                    disabled={!isOnline}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t.retryAll}
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                  >
                    {t.clear}
                  </button>
                </div>
              )}

              {/* Queue items */}
              <div className="space-y-2">
                {queue.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">
                          {item.data.dreamerName}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className="text-gray-700 truncate">
                          {item.data.destinationCity}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                        {item.retryCount > 0 && (
                          <span>• {t.lastTry}: {item.retryCount}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                      {item.status === 'failed' && isOnline && (
                        <button
                          onClick={() => retryItem(item.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          {t.retry}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}