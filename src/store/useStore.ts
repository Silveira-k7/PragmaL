import { create } from 'zustand';
import { Block, Room, Reservation } from '../types';
import { startOfDay, endOfDay, addWeeks, startOfYear, endOfYear } from 'date-fns';

interface State {
  blocks: Block[];
  rooms: Room[];
  reservations: Reservation[];
  allReservations: Reservation[]; // Todas as reservas para analytics
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
  getAllReservations: () => Reservation[];
  clearError: () => void;
  initializeSampleData: () => void;
}

// Simulated data storage
let blockIdCounter = 1;
let roomIdCounter = 1;
let reservationIdCounter = 1;

// Sample data initialization
let storedBlocks: Block[] = [
  { id: '1', name: 'Bloco C' },
  { id: '2', name: 'H15' },
  { id: '3', name: 'H06' },
  { id: '4', name: 'H03' }
];

let storedRooms: Room[] = [
  // Bloco C
  { id: '1', block_id: '1', name: 'Sala 1' },
  { id: '2', block_id: '1', name: 'Sala 2' },
  { id: '3', block_id: '1', name: 'Sala 3' },
  { id: '4', block_id: '1', name: 'Sala 4' },
  { id: '5', block_id: '1', name: 'Sala 5' },
  // H15
  { id: '6', block_id: '2', name: 'S01' },
  { id: '7', block_id: '2', name: 'S02' },
  { id: '8', block_id: '2', name: 'S03' },
  { id: '9', block_id: '2', name: 'S04' },
  { id: '10', block_id: '2', name: 'S05' },
  { id: '11', block_id: '2', name: 'S06' },
  // H06 - 20 salas
  { id: '12', block_id: '3', name: 'Sala 1' },
  { id: '13', block_id: '3', name: 'Sala 2' },
  { id: '14', block_id: '3', name: 'Sala 3' },
  { id: '15', block_id: '3', name: 'Sala 4' },
  { id: '16', block_id: '3', name: 'Sala 5' },
  { id: '17', block_id: '3', name: 'Sala 6' },
  { id: '18', block_id: '3', name: 'Sala 7' },
  { id: '19', block_id: '3', name: 'Sala 8' },
  { id: '20', block_id: '3', name: 'Sala 9' },
  { id: '21', block_id: '3', name: 'Sala 10' },
  { id: '22', block_id: '3', name: 'Sala 11' },
  { id: '23', block_id: '3', name: 'Sala 12' },
  { id: '24', block_id: '3', name: 'Sala 13' },
  { id: '25', block_id: '3', name: 'Sala 14' },
  { id: '26', block_id: '3', name: 'Sala 15' },
  { id: '27', block_id: '3', name: 'Sala 16' },
  { id: '28', block_id: '3', name: 'Sala 17' },
  { id: '29', block_id: '3', name: 'Sala 18' },
  { id: '30', block_id: '3', name: 'Sala 19' },
  { id: '31', block_id: '3', name: 'Sala 20' },
  // H03
  { id: '32', block_id: '4', name: 'Sala 1' },
  { id: '33', block_id: '4', name: 'Sala 2' },
  { id: '34', block_id: '4', name: 'Sala 3' }
];

// Generate sample reservations for the last 6 months
const generateSampleReservations = () => {
  const reservations: Reservation[] = [];
  const teachers = [
    'Prof. Dr. Ana Silva', 'Prof. Dr. Carlos Santos', 'Prof. Dra. Maria Oliveira', 
    'Prof. Dr. João Pereira', 'Prof. Dra. Lucia Costa', 'Prof. Dr. Roberto Lima',
    'Prof. Dra. Patricia Alves', 'Prof. Dr. Fernando Souza', 'Prof. Dra. Camila Rocha',
    'Prof. Dr. Eduardo Martins', 'Prof. Dra. Juliana Ferreira', 'Prof. Dr. Ricardo Gomes',
    'Prof. Dr. André Moreira', 'Prof. Dra. Beatriz Cunha', 'Prof. Dr. Diego Nascimento',
    'Prof. Dra. Eliana Barbosa', 'Prof. Dr. Fabio Cardoso', 'Prof. Dra. Gabriela Ramos'
  ];
  
  const subjects = [
    'Cálculo Diferencial e Integral I', 'Álgebra Linear', 'Física Geral I',
    'Química Geral', 'Programação Orientada a Objetos', 'Estruturas de Dados',
    'Banco de Dados', 'Engenharia de Software', 'Redes de Computadores',
    'Inteligência Artificial', 'Sistemas Operacionais', 'Arquitetura de Computadores',
    'Estatística e Probabilidade', 'Metodologia Científica', 'Gestão de Projetos',
    'Análise e Projeto de Sistemas', 'Desenvolvimento Web', 'Segurança da Informação',
    'Compiladores', 'Computação Gráfica', 'Sistemas Distribuídos',
    'Machine Learning', 'Ciência de Dados', 'DevOps e Cloud Computing',
    'Microeconomia', 'Contabilidade Geral', 'Administração Financeira',
    'Marketing Digital', 'Gestão de Pessoas', 'Direito Empresarial',
    'Psicologia Organizacional', 'Logística e Supply Chain', 'Empreendedorismo'
  ];

  const timeSlots = [
    { start: '07:10', end: '08:00' },
    { start: '08:00', end: '08:50' },
    { start: '08:50', end: '09:40' },
    { start: '09:55', end: '10:45' },
    { start: '10:45', end: '11:35' },
    { start: '11:35', end: '12:25' },
    { start: '13:15', end: '14:05' },
    { start: '14:05', end: '14:55' },
    { start: '15:10', end: '16:00' },
    { start: '16:00', end: '16:50' },
    { start: '16:50', end: '17:40' },
    { start: '18:30', end: '19:20' },
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
    
    // Generate 25-40 reservations per month (mais aulas de faculdade)
    const reservationsThisMonth = Math.floor(Math.random() * 16) + 25;
    
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
  allReservations: storedReservations,
  selectedDate: new Date(),
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  initializeSampleData: () => {
    set({ 
      blocks: [...storedBlocks],
      rooms: [...storedRooms],
      allReservations: [...storedReservations]
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
    set({ allReservations: [...storedReservations] });
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
    set({ allReservations: [...storedReservations] });
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
    set({ allReservations: [...storedReservations] });
    get().setSelectedDate(get().selectedDate);
  },

  getAllReservations: () => {
    return storedReservations;
  }
}));