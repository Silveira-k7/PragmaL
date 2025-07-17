import React, { useState } from 'react';
import { LayoutDashboard, CalendarDays, Building2, Menu, X, Clock, LogOut, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { BlockList } from './BlockList';
import { ReservationCalendar } from './ReservationCalendar';
import { ReservationList } from './ReservationList';
import { UserManagement } from './UserManagement';

type View = 'calendar' | 'list' | 'manage' | 'new-reservation' | 'users';

export const Dashboard = () => {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout, isAdmin } = useAuth();

  const menuItems = [
    { id: 'calendar', label: 'Visualizar Calendário', icon: CalendarDays, roles: ['admin', 'user'] },
    { id: 'new-reservation', label: 'Novo Agendamento', icon: Clock, roles: ['admin'] },
    { id: 'list', label: 'Lista de Agendamentos', icon: LayoutDashboard, roles: ['admin', 'user'] },
    { id: 'manage', label: 'Gerenciar Blocos e Salas', icon: Building2, roles: ['admin'] },
    { id: 'users', label: 'Gerenciar Usuários', icon: Users, roles: ['admin'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen bg-slate-50">
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

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
              <p className="text-sm text-slate-500 mb-4">Gestão Modular de Ambientes</p>
              
              <div className="bg-slate-50 rounded-lg p-3 mb-6">
                <p className="text-sm font-medium text-slate-700">{user?.full_name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  isAdmin() ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isAdmin() ? 'Administrador' : 'Usuário'}
                </span>
              </div>

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
                  onClick={logout}
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
            {currentView === 'manage' && <BlockList />}
            {currentView === 'users' && <UserManagement />}
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
};