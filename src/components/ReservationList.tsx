import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Filter, Trash2, Calendar, Clock, User, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';

export const ReservationList = () => {
  const { rooms, blocks, getAllReservations, deleteReservation } = useStore();
  const { isAdmin } = useAuth();
  const [filteredReservations, setFilteredReservations] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    block: '',
    room: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const allReservations = getAllReservations();
    let filtered = [...allReservations];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (res) =>
          res.teacher_name.toLowerCase().includes(searchLower) ||
          res.purpose.toLowerCase().includes(searchLower)
      );
    }

    if (filters.room) {
      filtered = filtered.filter((res) => res.room_id === filters.room);
    }

    if (filters.block) {
      const roomsInBlock = rooms.filter((room) => room.block_id === filters.block);
      filtered = filtered.filter((res) =>
        roomsInBlock.some((room) => room.id === res.room_id)
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(
        (res) => new Date(res.start_time) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (res) => new Date(res.end_time) <= new Date(filters.endDate)
      );
    }

    // Ordenar por data mais recente
    filtered.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

    setFilteredReservations(filtered);
  }, [filters, rooms, getAllReservations]);

  const handleDeleteReservation = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      await deleteReservation(id);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      block: '',
      room: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Lista de Agendamentos</h2>
        </div>
        <div className="text-sm text-slate-600">
          Total: <span className="font-semibold text-blue-600">{filteredReservations.length}</span> agendamentos
        </div>
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filtros
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpar filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pesquisar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Professor ou finalidade"
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bloco
            </label>
            <select
              value={filters.block}
              onChange={(e) => setFilters({ ...filters, block: e.target.value, room: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os blocos</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sala
            </label>
            <select
              value={filters.room}
              onChange={(e) => setFilters({ ...filters, room: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as salas</option>
              {rooms
                .filter((room) => !filters.block || room.block_id === filters.block)
                .map((room) => {
                  const block = blocks.find(b => b.id === room.block_id);
                  return (
                    <option key={room.id} value={room.id}>
                      {block?.name} - {room.name}
                    </option>
                  );
                })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Lista de Agendamentos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Agendamentos ({filteredReservations.length})
          </h3>

          {filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum agendamento encontrado</p>
              <p className="text-gray-400 text-sm">
                {Object.values(filters).some(f => f) 
                  ? 'Tente ajustar os filtros para ver mais resultados'
                  : 'Ainda não há agendamentos no sistema'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredReservations.map((reservation, index) => {
                  const room = rooms.find((r) => r.id === reservation.room_id);
                  const block = blocks.find((b) => b.id === room?.block_id);
                  
                  return (
                    <motion.div
                      key={reservation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <h4 className="font-semibold text-slate-800">
                                {block?.name} - {room?.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Clock className="w-4 h-4" />
                              {format(new Date(reservation.start_time), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                              {' - '}
                              {format(new Date(reservation.end_time), "HH:mm")}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700">{reservation.teacher_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">{reservation.purpose}</span>
                            </div>
                          </div>
                        </div>
                        
                        {isAdmin() && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteReservation(reservation.id)}
                            className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Excluir agendamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};