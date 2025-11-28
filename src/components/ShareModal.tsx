'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { 
  SHARE_PLATFORMS, 
  shareToPlatform, 
  isNativeShareAvailable,
  type ExportStats,
  type SharePlatform 
} from '@/lib/export-utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ExportStats;
}

export function ShareModal({ isOpen, onClose, stats }: ShareModalProps) {
  const [isSharing, setIsSharing] = useState<SharePlatform | null>(null);
  const [shareResult, setShareResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleShare = async (platform: SharePlatform) => {
    setIsSharing(platform);
    setShareResult(null);

    try {
  const result = await shareToPlatform(stats, platform);
      setShareResult({
        type: result.success ? 'success' : 'error',
        message: result.message,
      });

      // Auto-close modal after successful share (except for downloads/copies that need feedback)
      if (result.success && !['download', 'copy', 'instagram'].includes(platform)) {
        setTimeout(() => {
          onClose();
          setShareResult(null);
        }, 1500);
      }
    } catch {
      setShareResult({
        type: 'error',
        message: 'Une erreur est survenue',
      });
    } finally {
      setIsSharing(null);
    }
  };

  // Filter platforms: show native share on mobile if available
  const showNativeShare = isNativeShareAvailable();
  const platforms = showNativeShare 
    ? [{ id: 'native' as SharePlatform, name: 'Partage rapide', icon: '📲', color: '#000', bgColor: '#f3f4f6' }, ...SHARE_PLATFORMS]
    : SHARE_PLATFORMS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Partager ma progression</h2>
                    <p className="text-sm text-white/80">Choisis où partager</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Preview card mini */}
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                    🎯
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {stats.userName || 'Ma progression'}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="font-medium text-indigo-600">{stats.totalXp} XP</span>
                      <span>•</span>
                      <span className="font-medium text-green-600">{stats.successRate}%</span>
                      <span>•</span>
                      <span className="font-medium text-orange-600">🔥 {stats.currentStreak}j</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share platforms grid */}
              <div className="p-4 max-h-[50vh] overflow-y-auto">
                <div className="grid grid-cols-3 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => handleShare(platform.id)}
                      disabled={isSharing !== null}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100`}
                      style={{ backgroundColor: platform.bgColor }}
                    >
                      {isSharing === platform.id ? (
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: platform.color }} />
                      ) : (
                        <span className="text-3xl">{platform.icon}</span>
                      )}
                      <span 
                        className="text-xs font-medium text-center leading-tight"
                        style={{ color: platform.color }}
                      >
                        {platform.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Result message */}
              <AnimatePresence>
                {shareResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mx-4 mb-4 p-3 rounded-xl flex items-center gap-2 ${
                      shareResult.type === 'success'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {shareResult.type === 'success' ? (
                      <Check className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{shareResult.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer tip */}
              <div className="px-6 py-3 bg-gray-50 border-t text-center">
                <p className="text-xs text-gray-500">
                  💡 Une image stylée de ta progression sera partagée
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
