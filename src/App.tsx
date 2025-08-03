import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { OfflineIndicator } from './components/OfflineIndicator';

function App() {
  const { user, loading } = useAuth();

  // Registrar Service Worker
  React.useEffect(() => {
    if ('serviceWorker' in navigator && !import.meta.env.DEV) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
        })
        .catch((error) => {
          // Only log in production, ignore in development
          if (!import.meta.env.DEV) {
            console.error('Erro ao registrar Service Worker:', error);
          }
        });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <OfflineIndicator />
      {user ? <Dashboard /> : <Auth />}
    </>
  );
}

export default App;