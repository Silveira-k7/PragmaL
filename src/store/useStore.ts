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
}

// Simulated data storage
let blockIdCounter = 1;
let roomIdCounter = 1;
let reservationIdCounter = 1;
let storedBlocks: Block[] = [];
let storedRooms: Room[] = [];
let storedReservations: Reservation[] = [];

export const useStore = create<State>((set, get) => ({
  blocks: [],
  rooms: [],
  reservations: [],
  selectedDate: new Date(),
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

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