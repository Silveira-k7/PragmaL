import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Filter, Trash2, Calendar, Clock, User, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';

export const ReservationList = () => {
  const { 
    rooms, 
    blocks, 
    getAllReservations, 
    deleteReservation,
    currentPage,
    itemsPerPage,
    totalItems,
    setPage,
    setItemsPerPage
  } = useStore();
  const { isAdmin } = useAuth();
  
  const [filters, setFilters] = useState({
    search: '',
    block: '',
    room: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);

  // Memoized filtered reservations para performance
  const filteredReservations = useMemo(() => {
    setLoading(true);
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
    
    setLoading(false);
    return filtered;
  }, [filters, rooms, getAllReservations]);

  // Paginação
  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReservations.slice(startIndex, endIndex);
  }, [filteredReservations, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

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
    setPage(1);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Memoized room options para performance
  const roomOptions = useMemo(() => {
    return rooms
      .filter((room) => !filters.block || room.block_id === filters.block)
      .map((room) => {
        const block = blocks.find(b => b.id === room.block_id);
        return {
          id: room.id,
          name: `${block?.name} - ${room.name}`
        };
      });
  }, [rooms, blocks, filters.block]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Lista de Agendamentos</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>Filtrados: <span className="font-semibold text-blue-600">{filteredReservations.length}</span></span>
          <span>•</span>
          <span>Total: <span className="font-semibold text-green-600">{totalItems}</span></span>
        </div>
      </div>

      {/* Filtros otimizados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filtros
          </h3>
          <div className="flex items-center gap-4">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpar filtros
            </button>
          </div>
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
                placeholder="Professor ou disciplina"
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
              disabled={roomOptions.length === 0}
            >
              <option value="">Todas as salas</option>
              {roomOptions.slice(0, 100).map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
              {roomOptions.length > 100 && (
                <option disabled>... e mais {roomOptions.length - 100} salas</option>
              )}
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

      {/* Lista de Agendamentos com paginação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Agendamentos ({filteredReservations.length})
            </h3>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Carregando...
              </div>
            )}
          </div>

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
            <>
              <div className="space-y-3">
                <AnimatePresence>
                  {paginatedReservations.map((reservation, index) => {
                    const room = rooms.find((r) => r.id === reservation.room_id);
                    const block = blocks.find((b) => b.id === room?.block_id);
                    
                    return (
                      <motion.div
                        key={reservation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.02 }}
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

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredReservations.length)} de {filteredReservations.length} agendamentos
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};