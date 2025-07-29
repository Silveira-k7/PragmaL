import { create } from 'zustand';
import { Block, Room, Reservation } from '../types';
import { startOfDay, endOfDay, addWeeks, startOfYear, endOfYear } from 'date-fns';

interface State {
  blocks: Block[];
  rooms: Room[];
  reservations: Reservation[];
  allReservations: Reservation[];
  selectedDate: Date;
  loading: boolean;
  error: string | null;
  
  // Cache para performance
  roomsByBlock: Map<string, Room[]>;
  reservationsByDate: Map<string, Reservation[]>;
  reservationsByRoom: Map<string, Reservation[]>;
  
  // Paginação
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  
  // Métodos otimizados
  setSelectedDate: (date: Date) => void;
  addBlock: (name: string) => void;
  addRoom: (blockId: string, name: string) => void;
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  addSemesterReservations: (baseReservation: Omit<Reservation, 'id'>, weeks: number) => void;
  deleteBlock: (id: string) => void;
  deleteRoom: (id: string) => void;
  deleteReservation: (id: string) => void;
  getAllReservations: () => Reservation[];
  getReservationsByDateRange: (startDate: Date, endDate: Date) => Reservation[];
  getRoomsByBlock: (blockId: string) => Room[];
  clearError: () => void;
  initializeSampleData: () => void;
  
  // Paginação
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  
  // Cache management
  invalidateCache: () => void;
  buildCache: () => void;
}

// Dados simulados otimizados
let blockIdCounter = 1;
let roomIdCounter = 1;
let reservationIdCounter = 1;

// Blocos principais de uma universidade
let storedBlocks: Block[] = [
  { id: '1', name: 'Bloco A - Administração' },
  { id: '2', name: 'Bloco B - Engenharias' },
  { id: '3', name: 'Bloco C - Ciências Exatas' },
  { id: '4', name: 'Bloco D - Ciências Humanas' },
  { id: '5', name: 'Bloco E - Ciências Biológicas' },
  { id: '6', name: 'Bloco F - Tecnologia' },
  { id: '7', name: 'Bloco G - Laboratórios' },
  { id: '8', name: 'Bloco H - Auditórios' },
  { id: '9', name: 'Bloco I - Biblioteca' },
  { id: '10', name: 'Bloco J - Esportes' }
];

// Gerar salas de forma otimizada (simulando 2000+ salas)
const generateRooms = (): Room[] => {
  const rooms: Room[] = [];
  let roomId = 1;
  
  storedBlocks.forEach((block, blockIndex) => {
    // Cada bloco tem entre 150-300 salas
    const roomCount = Math.floor(Math.random() * 150) + 150;
    
    for (let i = 1; i <= roomCount; i++) {
      const roomNumber = i.toString().padStart(3, '0');
      rooms.push({
        id: roomId.toString(),
        block_id: block.id,
        name: `Sala ${roomNumber}`
      });
      roomId++;
    }
  });
  
  return rooms;
};

let storedRooms: Room[] = generateRooms();

// Gerar reservas de forma mais eficiente
const generateOptimizedReservations = (): Reservation[] => {
  const reservations: Reservation[] = [];
  const teachers = [
    'Prof. Dr. Ana Silva', 'Prof. Dr. Carlos Santos', 'Prof. Dra. Maria Oliveira', 
    'Prof. Dr. João Pereira', 'Prof. Dra. Lucia Costa', 'Prof. Dr. Roberto Lima',
    'Prof. Dra. Patricia Alves', 'Prof. Dr. Fernando Souza', 'Prof. Dra. Camila Rocha',
    'Prof. Dr. Eduardo Martins', 'Prof. Dra. Juliana Ferreira', 'Prof. Dr. Ricardo Gomes'
  ];
  
  const subjects = [
    'Cálculo I', 'Álgebra Linear', 'Física I', 'Química Geral', 'Programação I',
    'Estruturas de Dados', 'Banco de Dados', 'Engenharia de Software', 'Redes',
    'Inteligência Artificial', 'Sistemas Operacionais', 'Estatística',
    'Metodologia Científica', 'Gestão de Projetos', 'Marketing', 'Contabilidade'
  ];

  const timeSlots = [
    { start: '07:10', end: '08:00' }, { start: '08:00', end: '08:50' },
    { start: '08:50', end: '09:40' }, { start: '09:55', end: '10:45' },
    { start: '10:45', end: '11:35' }, { start: '11:35', end: '12:25' },
    { start: '13:15', end: '14:05' }, { start: '14:05', end: '14:55' },
    { start: '15:10', end: '16:00' }, { start: '16:00', end: '16:50' },
    { start: '16:50', end: '17:40' }, { start: '18:30', end: '19:20' },
    { start: '19:20', end: '20:05' }, { start: '20:05', end: '20:50' }
  ];

  let id = 1;
  const today = new Date();
  
  // Gerar apenas 3 meses de dados para performance inicial
  for (let monthsBack = 3; monthsBack >= 0; monthsBack--) {
    const currentMonth = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1);
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    
    // 20 reservas por dia útil
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // 20 reservas por dia
      for (let i = 0; i < 20; i++) {
        const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const room = storedRooms[Math.floor(Math.random() * Math.min(storedRooms.length, 500))]; // Usar apenas primeiras 500 salas para performance
        
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
  }
  
  return reservations;
};

let storedReservations: Reservation[] = generateOptimizedReservations();

// Update counters
blockIdCounter = Math.max(...storedBlocks.map(b => parseInt(b.id))) + 1;
roomIdCounter = Math.max(...storedRooms.map(r => parseInt(r.id))) + 1;
reservationIdCounter = Math.max(...storedReservations.map(r => parseInt(r.id))) + 1;

export const useStore = create<State>((set, get) => ({
  blocks: storedBlocks,
  rooms: storedRooms,
  reservations: [],
  allReservations: storedReservations,
  selectedDate: new Date(),
  loading: false,
  error: null,
  
  // Cache
  roomsByBlock: new Map(),
  reservationsByDate: new Map(),
  reservationsByRoom: new Map(),
  
  // Paginação
  currentPage: 1,
  itemsPerPage: 50,
  totalItems: 0,

  clearError: () => set({ error: null }),

  buildCache: () => {
    const state = get();
    const roomsByBlock = new Map<string, Room[]>();
    const reservationsByDate = new Map<string, Reservation[]>();
    const reservationsByRoom = new Map<string, Reservation[]>();
    
    // Cache rooms by block
    state.blocks.forEach(block => {
      roomsByBlock.set(block.id, state.rooms.filter(room => room.block_id === block.id));
    });
    
    // Cache reservations by date and room
    state.allReservations.forEach(reservation => {
      const dateKey = startOfDay(new Date(reservation.start_time)).toISOString();
      
      if (!reservationsByDate.has(dateKey)) {
        reservationsByDate.set(dateKey, []);
      }
      reservationsByDate.get(dateKey)!.push(reservation);
      
      if (!reservationsByRoom.has(reservation.room_id)) {
        reservationsByRoom.set(reservation.room_id, []);
      }
      reservationsByRoom.get(reservation.room_id)!.push(reservation);
    });
    
    set({ roomsByBlock, reservationsByDate, reservationsByRoom });
  },

  invalidateCache: () => {
    set({ 
      roomsByBlock: new Map(),
      reservationsByDate: new Map(),
      reservationsByRoom: new Map()
    });
    get().buildCache();
  },

  initializeSampleData: () => {
    set({ 
      blocks: [...storedBlocks],
      rooms: [...storedRooms],
      allReservations: [...storedReservations],
      totalItems: storedReservations.length
    });
    get().buildCache();
    get().setSelectedDate(get().selectedDate);
  },

  setSelectedDate: (date) => {
    const dateKey = startOfDay(date).toISOString();
    const reservationsByDate = get().reservationsByDate;
    const filteredReservations = reservationsByDate.get(dateKey) || [];
    
    set({ 
      selectedDate: date,
      reservations: filteredReservations
    });
  },

  getRoomsByBlock: (blockId: string) => {
    const roomsByBlock = get().roomsByBlock;
    return roomsByBlock.get(blockId) || [];
  },

  getReservationsByDateRange: (startDate: Date, endDate: Date) => {
    const reservationsByDate = get().reservationsByDate;
    const result: Reservation[] = [];
    
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = startOfDay(current).toISOString();
      const dayReservations = reservationsByDate.get(dateKey) || [];
      result.push(...dayReservations);
      current.setDate(current.getDate() + 1);
    }
    
    return result;
  },

  setPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (items) => set({ itemsPerPage: items, currentPage: 1 }),

  addBlock: (name) => {
    const newBlock: Block = {
      id: String(blockIdCounter++),
      name
    };
    storedBlocks.push(newBlock);
    set({ blocks: [...storedBlocks] });
    get().invalidateCache();
  },

  addRoom: (blockId, name) => {
    const newRoom: Room = {
      id: String(roomIdCounter++),
      block_id: blockId,
      name
    };
    storedRooms.push(newRoom);
    set({ rooms: [...storedRooms] });
    get().invalidateCache();
  },

  addReservation: (reservation) => {
    const newReservation: Reservation = {
      id: String(reservationIdCounter++),
      ...reservation
    };
    storedReservations.push(newReservation);
    set({ 
      allReservations: [...storedReservations],
      totalItems: storedReservations.length
    });
    get().invalidateCache();
    get().setSelectedDate(get().selectedDate);
  },

  addSemesterReservations: (baseReservation, weeks) => {
    const newReservations: Reservation[] = [];
    
    for (let i = 0; i < weeks; i++) {
      const startDate = addWeeks(new Date(baseReservation.start_time), i);
      const endDate = addWeeks(new Date(baseReservation.end_time), i);
      
      const reservation: Reservation = {
        id: String(reservationIdCounter++),
        ...baseReservation,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString()
      };
      
      newReservations.push(reservation);
      storedReservations.push(reservation);
    }
    
    set({ 
      allReservations: [...storedReservations],
      totalItems: storedReservations.length
    });
    get().invalidateCache();
    get().setSelectedDate(get().selectedDate);
  },

  deleteBlock: (id) => {
    storedBlocks = storedBlocks.filter(block => block.id !== id);
    storedRooms = storedRooms.filter(room => room.block_id !== id);
    set({ 
      blocks: [...storedBlocks],
      rooms: [...storedRooms]
    });
    get().invalidateCache();
  },

  deleteRoom: (id) => {
    storedRooms = storedRooms.filter(room => room.id !== id);
    set({ rooms: [...storedRooms] });
    get().invalidateCache();
  },

  deleteReservation: (id) => {
    storedReservations = storedReservations.filter(res => res.id !== id);
    set({ 
      allReservations: [...storedReservations],
      totalItems: storedReservations.length
    });
    get().invalidateCache();
    get().setSelectedDate(get().selectedDate);
  },

  getAllReservations: () => {
    return storedReservations;
  }
}));