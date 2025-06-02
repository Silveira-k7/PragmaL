import React, { useState } from 'react';
import { LayoutDashboard, CalendarDays, Building2, Menu, X, Clock, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { BlockList } from './components/BlockList';
import { ReservationCalendar } from './components/ReservationCalendar';
import { ReservationList } from './components/ReservationList';
import { Auth } from './components/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type View = 'calendar' | 'list' | 'manage' | 'new-reservation';

function AppContent() {
  const { user, userRole, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) {
    return <Auth />;
  }

  const menuItems = [
    { id: 'calendar', label: 'Visualizar Calendário', icon: CalendarDays, roles: ['admin', 'monitor'] },
    { id: 'new-reservation', label: 'Novo Agendamento', icon: Clock, roles: ['admin', 'monitor'] },
    { id: 'list', label: 'Lista de Agendamentos', icon: LayoutDashboard, roles: ['admin', 'monitor'] },
    { id: 'manage', label: 'Gerenciar Blocos e Salas', icon: Building2, roles: ['admin'] },
  ].filter(item => item.roles.includes(userRole!));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`bg-white border-r border-slate-200 fixed h-full z-40 
              ${isSidebarOpen ? 'w-64' : 'w-0'} md:w-64 transition-all duration-300`}
          >
            <div className="p-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">PRAGMA</h1>
              <p className="text-sm text-slate-500 mb-2">Programa de Reservas para</p>
              <p className="text-sm text-slate-500 mb-8">Gestão Modular de Ambientes</p>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCurrentView(item.id as View);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        currentView === item.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </motion.button>
                  );
                })}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  Sair
                </motion.button>
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'ml-0'
        } p-8 pt-16 md:pt-8`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'calendar' && <ReservationCalendar viewMode="calendar" />}
            {currentView === 'new-reservation' && <ReservationCalendar viewMode="form" />}
            {currentView === 'list' && <ReservationList />}
            {currentView === 'manage' && userRole === 'admin' && <BlockList />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;