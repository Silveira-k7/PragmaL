import React from 'react';
import { Wifi, WifiOff, CloudOff, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOffline } from '../hooks/useOffline';

export const OfflineIndicator = () => {
  const { isOnline, isOffline, wasOffline } = useOffline();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>Modo Offline - Dados salvos localmente</span>
            <CloudOff className="w-4 h-4" />
          </div>
        </motion.div>
      )}
      
      {isOnline && wasOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
          onAnimationComplete={() => {
            setTimeout(() => {
              // Remove o indicador após 3 segundos
            }, 3000);
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Conexão restaurada - Sincronizando dados...</span>
            <Wifi className="w-4 h-4" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};