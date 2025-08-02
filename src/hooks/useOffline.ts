import { useState, useEffect } from 'react';

interface OfflineState {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
}

export const useOffline = (): OfflineState => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Mostrar notificação de reconexão
        console.log('Conexão restaurada!');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      console.log('Conexão perdida - Modo offline ativado');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline
  };
};