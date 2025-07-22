import { create } from 'zustand';
import { Block, Room, Reservation } from '../types';
import { startOfDay, endOfDay, addWeeks } from 'date-fns';

interface State {
  blocks: Block[];
  rooms: Room[];
  reservations: Reservation[];
  selectedDate: Date;
  loading: boolean;
  error: string | null;
  setSelectedDate: (date: Date) => void;
  addBlock: (name: string) => void;
  addRoom: (blockId: string, name: string) => void;
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  addSemesterReservations: (baseReservation: Omit<Reservation, 'id'>, weeks: number) => void;
  deleteBlock: (id: string) => void;
  deleteRoom: (id: string) => void;
  deleteReservation: (id: string) => void;
  clearError: () => void;
  initializeSampleData: () => void;
}

// Simulated data storage
let blockIdCounter = 1;
let roomIdCounter = 1;
let reservationIdCounter = 1;

// Sample data initialization
let storedBlocks: Block[] = [
  { id: '1', name: 'Bloco A - Ciências Exatas' },
  { id: '2', name: 'Bloco B - Ciências Humanas' },
  { id: '3', name: 'Bloco C - Laboratórios' },
  { id: '4', name: 'Bloco D - Auditórios' }
];

let storedRooms: Room[] = [
  // Bloco A
  { id: '1', block_id: '1', name: 'Sala 101 - Matemática' },
  { id: '2', block_id: '1', name: 'Sala 102 - Física' },
  { id: '3', block_id: '1', name: 'Sala 103 - Química' },
  // Bloco B
  { id: '4', block_id: '2', name: 'Sala 201 - História' },
  { id: '5', block_id: '2', name: 'Sala 202 - Geografia' },
  { id: '6', block_id: '2', name: 'Sala 203 - Literatura' },
  // Bloco C
  { id: '7', block_id: '3', name: 'Lab 301 - Informática' },
  { id: '8', block_id: '3', name: 'Lab 302 - Química' },
  { id: '9', block_id: '3', name: 'Lab 303 - Física' },
  // Bloco D
  { id: '10', block_id: '4', name: 'Auditório Principal' },
  { id: '11', block_id: '4', name: 'Mini Auditório' }
];

// Generate sample reservations for the last 6 months
const generateSampleReservations = () => {
  const reservations: Reservation[] = [];
  const teachers = [
    'Prof. Ana Silva', 'Prof. Carlos Santos', 'Prof. Maria Oliveira', 
    'Prof. João Pereira', 'Prof. Lucia Costa', 'Prof. Roberto Lima',
    'Prof. Patricia Alves', 'Prof. Fernando Souza', 'Prof. Camila Rocha',
    'Prof. Eduardo Martins', 'Prof. Juliana Ferreira', 'Prof. Ricardo Gomes'
  ];
  
  const subjects = [
    'Matemática Avançada', 'Física Experimental', 'Química Orgânica',
    'História do Brasil', 'Geografia Mundial', 'Literatura Brasileira',
    'Programação Web', 'Análise de Sistemas', 'Banco de Dados',
    'Seminário de Pesquisa', 'Apresentação de TCC', 'Palestra Especial'
  ];

  const timeSlots = [
    { start: '07:10', end: '08:00' },
    { start: '08:00', end: '08:50' },
    { start: '08:50', end: '09:40' },
    { start: '09:55', end: '10:45' },
    { start: '10:45', end: '11:35' },
    { start: '13:15', end: '14:05' },
    { start: '14:05', end: '14:55' },
    { start: '15:10', end: '16:00' },
    { start: '16:00', end: '16:50' },
    { start: '19:20', end: '20:05' },
    { start: '20:05', end: '20:50' },
    { start: '21:05', end: '21:50' }
  ];

  let id = 1;
  const today = new Date();
  
  // Generate reservations for the last 6 months
  for (let monthsBack = 6; monthsBack >= 0; monthsBack--) {
    const currentMonth = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1);
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    
    // Generate 15-25 reservations per month
    const reservationsThisMonth = Math.floor(Math.random() * 11) + 15;
    
    for (let i = 0; i < reservationsThisMonth; i++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const room = storedRooms[Math.floor(Math.random() * storedRooms.length)];
      
      const startTime = new Date(date);
      const [startHour, startMinute] = timeSlot.start.split(':').map(Number);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(date);
      const [endHour, endMinute] = timeSlot.end.split(':').map(Number);
      endTime.setHours(endHour, endMinute, 0, 0);
      
      reservations.push({
        id: String(id++),
        room_id: room.id,
        teacher_name: teacher,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        purpose: subject
      });
    }
  }
  
  return reservations;
};

let storedReservations: Reservation[] = generateSampleReservations();

// Update counters based on existing data
blockIdCounter = Math.max(...storedBlocks.map(b => parseInt(b.id))) + 1;
roomIdCounter = Math.max(...storedRooms.map(r => parseInt(r.id))) + 1;
reservationIdCounter = Math.max(...storedReservations.map(r => parseInt(r.id))) + 1;

export const useStore = create<State>((set, get) => ({
  blocks: storedBlocks,
  rooms: storedRooms,
  reservations: [],
  selectedDate: new Date(),
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  initializeSampleData: () => {
    set({ 
      blocks: [...storedBlocks],
      rooms: [...storedRooms]
    });
    get().setSelectedDate(get().selectedDate);
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    const filteredReservations = storedReservations.filter(res => {
      const resDate = new Date(res.start_time);
      return resDate >= start && resDate <= end;
    });
    
    set({ reservations: filteredReservations });
  },

  addBlock: (name) => {
    const newBlock: Block = {
      id: String(blockIdCounter++),
      name
    };
    storedBlocks.push(newBlock);
    set({ blocks: [...storedBlocks] });
  },

  addRoom: (blockId, name) => {
    const newRoom: Room = {
      id: String(roomIdCounter++),
      block_id: blockId,
      name
    };
    storedRooms.push(newRoom);
    set({ rooms: [...storedRooms] });
  },

  addReservation: (reservation) => {
    const newReservation: Reservation = {
      id: String(reservationIdCounter++),
      ...reservation
    };
    storedReservations.push(newReservation);
    get().setSelectedDate(get().selectedDate);
  },

  addSemesterReservations: (baseReservation, weeks) => {
    for (let i = 0; i < weeks; i++) {
      const startDate = addWeeks(new Date(baseReservation.start_time), i);
      const endDate = addWeeks(new Date(baseReservation.end_time), i);
      
      const reservation: Reservation = {
        id: String(reservationIdCounter++),
        ...baseReservation,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString()
      };
      
      storedReservations.push(reservation);
    }
    get().setSelectedDate(get().selectedDate);
  },

  deleteBlock: (id) => {
    storedBlocks = storedBlocks.filter(block => block.id !== id);
    storedRooms = storedRooms.filter(room => room.block_id !== id);
    set({ 
      blocks: [...storedBlocks],
      rooms: [...storedRooms]
    });
  },

  deleteRoom: (id) => {
    storedRooms = storedRooms.filter(room => room.id !== id);
    set({ rooms: [...storedRooms] });
  },

  deleteReservation: (id) => {
    storedReservations = storedReservations.filter(res => res.id !== id);
    get().setSelectedDate(get().selectedDate);
  }
}));