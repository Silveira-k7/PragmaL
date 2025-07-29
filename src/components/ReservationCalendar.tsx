import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, AlertCircle, Building2, DoorOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import 'react-calendar/dist/Calendar.css';

const TIME_SLOTS = [
  { start: '07:10', end: '08:00' },
  { start: '08:00', end: '08:50' },
  { start: '08:50', end: '09:40' },
  { start: '9:55', end: '10:45' },
  { start: '10:45', end: '11:35' },
  { start: '11:35', end: '12:25' },
  { start: '12:25', end: '13:15' },
  { start: '13:15', end: '14:05' },
  { start: '14:05', end: '14:55' },
  { start: '15:10', end: '16:00' },
  { start: '16:00', end: '16:50' },
  { start: '16:50', end: '17:40' },
  { start: '17:40', end: '18:30' },
  { start: '18:30', end: '19:20' },
  { start: '19:20', end: '20:05' },
  { start: '20:05', end: '20:50' },
  { start: '21:05', end: '21:50' },
  { start: '21:50', end: '22:35' },
];

interface ReservationCalendarProps {
  viewMode: 'calendar' | 'form';
}

export const ReservationCalendar: React.FC<ReservationCalendarProps> = ({ viewMode }) => {
  const { 
    blocks,
    rooms,
    getRoomsByBlock,
    reservations, 
    selectedDate, 
    setSelectedDate, 
    addReservation, 
    addSemesterReservations, 
    deleteReservation,
    loading,
    error,
    clearError
  } = useStore();
  
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSemesterSchedule, setIsSemesterSchedule] = useState(false);
  const [weeks, setWeeks] = useState(16);
  const [usePresetTime, setUsePresetTime] = useState(true);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Reset room selection when block changes
  React.useEffect(() => {
    setSelectedRoom('');
  }, [selectedBlock]);

  // Usar método otimizado para obter salas do bloco
  const availableRooms = useMemo(() => {
    if (!selectedBlock) return [];
    return getRoomsByBlock(selectedBlock).slice(0, 50); // Limitar para performance
  }, [selectedBlock, getRoomsByBlock]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !teacherName || !purpose) return;

    let finalStartTime, finalEndTime;
    if (usePresetTime && selectedTimeSlot) {
      const [start, end] = selectedTimeSlot.split('-');
      finalStartTime = start;
      finalEndTime = end;
    } else {
      if (!startTime || !endTime) return;
      finalStartTime = startTime;
      finalEndTime = endTime;
    }

    const reservation = {
      room_id: selectedRoom,
      teacher_name: teacherName,
      start_time: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${finalStartTime}`).toISOString(),
      end_time: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${finalEndTime}`).toISOString(),
      purpose,
    };

    if (isSemesterSchedule) {
      await addSemesterReservations(reservation, weeks);
    } else {
      await addReservation(reservation);
    }

    if (!error) {
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedBlock('');
    setSelectedRoom('');
    setTeacherName('');
    setStartTime('');
    setEndTime('');
    setPurpose('');
    setIsSemesterSchedule(false);
    setSelectedTimeSlot('');
    setUsePresetTime(true);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDeleteReservation = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      await deleteReservation(id);
    }
  };

  // Group reservations by block and room
  const groupedReservations = blocks.map(block => {
    const blockRooms = rooms.filter(room => room.block_id === block.id);
    const roomReservations = blockRooms.map(room => {
      const roomReservations = reservations.filter(res => res.room_id === room.id);
      return {
        room,
        reservations: roomReservations
      };
    });
    return {
      block,
      rooms: roomReservations
    };
  });

  if (viewMode === 'form') {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Novo Agendamento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bloco</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione um bloco</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sala</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={!selectedBlock}
            >
              <option value="">Selecione uma sala</option>
              {availableRooms
                .map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              {getRoomsByBlock(selectedBlock).length > 50 && (
                <option disabled>... e mais {getRoomsByBlock(selectedBlock).length - 50} salas</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Professor</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do professor"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              locale="pt-BR"
              className="w-full border rounded-lg p-4"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="presetTime"
                checked={usePresetTime}
                onChange={() => setUsePresetTime(true)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="presetTime" className="text-sm font-medium text-gray-700">
                Usar horário predefinido
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="customTime"
                checked={!usePresetTime}
                onChange={() => setUsePresetTime(false)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="customTime" className="text-sm font-medium text-gray-700">
                Definir horário manualmente
              </label>
            </div>
          </div>

          {usePresetTime ? (
            <div>
              <label className="block text-sm font-medium mb-1">Horário</label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um horário</option>
                {TIME_SLOTS.map((slot, index) => (
                  <option key={index} value={`${slot.start}-${slot.end}`}>
                    {slot.start} - {slot.end}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Início</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={!usePresetTime}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fim</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={!usePresetTime}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Finalidade</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Objetivo da reserva"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="semesterSchedule"
              checked={isSemesterSchedule}
              onChange={(e) => setIsSemesterSchedule(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="semesterSchedule" className="text-sm font-medium text-gray-700">
              Agendar para todo o semestre
            </label>
          </div>

          {isSemesterSchedule && (
            <div>
              <label className="block text-sm font-medium mb-1">Número de Semanas</label>
              <input
                type="number"
                value={weeks}
                onChange={(e) => setWeeks(parseInt(e.target.value))}
                min="1"
                max="52"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : isSemesterSchedule ? 'Confirmar Agendamentos do Semestre' : 'Confirmar Agendamento'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon size={20} /> Calendário
            </h3>
          </div>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            locale="pt-BR"
            className="w-full border-0"
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} /> Agendamentos do Dia
          </h3>
          
          {loading ? (
            <p className="text-gray-500 text-center py-4">Carregando agendamentos...</p>
          ) : groupedReservations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum agendamento para este dia</p>
          ) : (
            <div className="space-y-6">
              {groupedReservations.map(({ block, rooms }) => (
                <div key={block.id} className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Building2 className="w-5 h-5" />
                    <h4 className="font-medium">{block.name}</h4>
                  </div>
                  
                  {rooms.map(({ room, reservations }) => (
                    <div key={room.id} className="ml-6 space-y-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <DoorOpen className="w-4 h-4" />
                        <h5 className="font-medium">{room.name}</h5>
                      </div>
                      
                      {reservations.length > 0 ? (
                        <div className="space-y-2">
                          {reservations.map(reservation => (
                            <div key={reservation.id} className="ml-6 border rounded-lg p-3 hover:bg-slate-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-slate-700">{reservation.teacher_name}</p>
                                  <p className="text-sm text-slate-500">
                                    {format(new Date(reservation.start_time), 'HH:mm')} - 
                                    {format(new Date(reservation.end_time), 'HH:mm')}
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
                              <p className="mt-1 text-sm text-slate-600">{reservation.purpose}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="ml-6 text-sm text-slate-500">Nenhum agendamento</p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};