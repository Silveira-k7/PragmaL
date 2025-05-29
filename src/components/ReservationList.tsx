import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Filter, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ReservationList = () => {
  const { rooms, blocks, reservations, deleteReservation } = useStore();
  const [filteredReservations, setFilteredReservations] = useState(reservations);
  const [filters, setFilters] = useState({
    search: '',
    block: '',
    room: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    let filtered = [...reservations];

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

    setFilteredReservations(filtered);
  }, [filters, reservations, rooms]);

  const handleDeleteReservation = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      await deleteReservation(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Filter className="w-5 h-5" /> Filtros
        </h2>
        
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
                className="pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bloco
            </label>
            <select
              value={filters.block}
              onChange={(e) => setFilters({ ...filters, block: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as salas</option>
              {rooms
                .filter((room) => !filters.block || room.block_id === filters.block)
                .map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">
          Agendamentos ({filteredReservations.length})
        </h2>

        <div className="space-y-4">
          {filteredReservations.map((reservation) => {
            const room = rooms.find((r) => r.id === reservation.room_id);
            const block = blocks.find((b) => b.id === room?.block_id);
            
            return (
              <div
                key={reservation.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {block?.name} - {room?.name}
                    </h4>
                    <p className="text-gray-600">{reservation.teacher_name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(reservation.start_time), "dd 'de' MMMM', às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteReservation(reservation.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                    title="Excluir agendamento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">{reservation.purpose}</p>
              </div>
            );
          })}

          {filteredReservations.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nenhum agendamento encontrado com os filtros selecionados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}