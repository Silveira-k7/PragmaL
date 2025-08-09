import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { offlineStorage } from '../lib/offlineStorage';
import { Block, Room, Reservation } from '../types';

interface StoreState {
  // Data
  blocks: Block[];
  rooms: Room[];
  reservations: Reservation[];
  
  // UI State
  selectedDate: Date;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  loading: boolean;
  error: string | null;
  
  // Cache
  cachedReservations: Map<string, Reservation[]>;
  cachedRooms: Map<string, Room[]>;
  lastSync: number;
  
  // Actions
  setBlocks: (blocks: Block[]) => void;
  setRooms: (rooms: Room[]) => void;
  setReservations: (reservations: Reservation[]) => void;
  setSelectedDate: (date: Date) => void;
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Data operations
  fetchBlocks: () => Promise<void>;
  fetchRooms: () => Promise<void>;
  fetchReservations: () => Promise<void>;
  addBlock: (name: string) => Promise<void>;
  addRoom: (blockId: string, name: string) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<void>;
  addSemesterReservations: (reservation: Omit<Reservation, 'id'>, weeks: number) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  
  // Helper functions
  getRoomsByBlock: (blockId: string) => Room[];
  getAllReservations: () => Reservation[];
  
  // Cache operations
  getCachedReservations: (key: string) => Reservation[] | null;
  setCachedReservations: (key: string, reservations: Reservation[]) => void;
  
  // Initialization
  initializeSampleData: () => Promise<void>;
  
  // Offline support
  syncOfflineData: () => Promise<void>;
  clearCache: () => void;
}

// Generate sample data for development
const generateSampleBlocks = (): Block[] => {
  return [
    { id: 'block-c', name: 'Bloco C' },
    { id: 'block-h15', name: 'Bloco H15' },
    { id: 'block-h06', name: 'Bloco H06' },
    { id: 'block-h03', name: 'Bloco H03' },
    { id: 'block-a', name: 'Bloco A' },
    { id: 'block-b', name: 'Bloco B' },
    { id: 'block-d', name: 'Bloco D' },
    { id: 'block-e', name: 'Bloco E' },
    { id: 'block-f', name: 'Bloco F' },
    { id: 'block-g', name: 'Bloco G' }
  ];
};

const generateSampleRooms = (blocks: Block[]): Room[] => {
  const rooms: Room[] = [];
  
  blocks.forEach(block => {
    const roomCount = Math.floor(Math.random() * 151) + 150; // 150-300 rooms per block
    
    for (let i = 1; i <= roomCount; i++) {
      rooms.push({
        id: `${block.id}-room-${i.toString().padStart(3, '0')}`,
        block_id: block.id,
        name: `Sala ${i.toString().padStart(3, '0')}`
      });
    }
  });
  
  return rooms;
};

const generateSampleReservations = (rooms: Room[]): Reservation[] => {
  const professors = [
    'Prof. João Silva', 'Prof. Maria Santos', 'Prof. Carlos Oliveira',
    'Prof. Ana Costa', 'Prof. Pedro Lima', 'Prof. Julia Ferreira',
    'Prof. Roberto Alves', 'Prof. Fernanda Souza', 'Prof. Lucas Pereira',
    'Prof. Camila Rodrigues', 'Prof. Ricardo Mendes', 'Prof. Patricia Gomes',
    'Prof. Eduardo Santos', 'Prof. Beatriz Lima', 'Prof. Marcos Oliveira'
  ];
  
  const subjects = [
    'Cálculo I', 'Física I', 'Química Geral', 'Programação I',
    'Álgebra Linear', 'Estatística', 'Biologia Molecular',
    'História do Brasil', 'Inglês Técnico', 'Metodologia Científica',
    'Estruturas de Dados', 'Banco de Dados', 'Redes de Computadores',
    'Engenharia de Software', 'Inteligência Artificial'
  ];

  const reservations: Reservation[] = [];
  const today = new Date();
  
  // Generate 3 months of data (past and future)
  for (let dayOffset = -45; dayOffset <= 45; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Generate 15-25 reservations per day
    const reservationsPerDay = Math.floor(Math.random() * 11) + 15;
    
    for (let i = 0; i < reservationsPerDay; i++) {
      const room = rooms[Math.floor(Math.random() * Math.min(rooms.length, 1000))]; // Limit for performance
      
      const startHour = Math.floor(Math.random() * 10) + 7; // 7-16h
      const duration = Math.floor(Math.random() * 3) + 1; // 1-3 hours
      
      const startTime = new Date(date);
      startTime.setHours(startHour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startHour + duration, 0, 0, 0);
      
      reservations.push({
        id: `res-${date.toISOString().split('T')[0]}-${room.id}-${i}`,
        room_id: room.id,
        teacher_name: professors[Math.floor(Math.random() * professors.length)],
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        purpose: subjects[Math.floor(Math.random() * subjects.length)]
      });
    }
  }
  
  return reservations.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      blocks: [],
      rooms: [],
      reservations: [],
      selectedDate: new Date(),
      currentPage: 1,
      itemsPerPage: 25,
      totalItems: 0,
      loading: false,
      error: null,
      cachedReservations: new Map(),
      cachedRooms: new Map(),
      lastSync: Date.now(),

      // Actions
      setBlocks: (blocks) => set({ blocks }),
      setRooms: (rooms) => set({ rooms }),
      setReservations: (reservations) => set({ reservations, totalItems: reservations.length }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      setPage: (currentPage) => set({ currentPage }),
      setItemsPerPage: (itemsPerPage) => set({ itemsPerPage, currentPage: 1 }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Data operations
      fetchBlocks: async () => {
        try {
          set({ loading: true, error: null });
          
          // Try Supabase first, but always fallback to sample data
          try {
            const { data, error } = await supabase
              .from('blocks')
              .select('*')
              .order('name');
            
            if (error) {
              console.warn('Supabase error, using sample data:', error);
              throw error;
            }
            
            if (data) {
              set({ blocks: data });
              return;
            }
          } catch (supabaseError) {
            console.warn('Supabase not accessible, using sample data:', supabaseError);
          }
          
          // Fallback to sample data
          const sampleBlocks = generateSampleBlocks();
          set({ blocks: sampleBlocks });
        } catch (error) {
          console.warn('Using sample data due to fetch error:', error);
          // Use sample data as fallback
          const sampleBlocks = generateSampleBlocks();
          set({ blocks: sampleBlocks });
        } finally {
          set({ loading: false });
        }
      },

      fetchRooms: async () => {
        try {
          set({ loading: true, error: null });
          
          // Try Supabase first, but always fallback to sample data
          try {
            const { data, error } = await supabase
              .from('rooms')
              .select('*')
              .order('name');
            
            if (error) {
              console.warn('Supabase error, using sample data:', error);
              throw error;
            }
            
            if (data) {
              set({ rooms: data });
              return;
            }
          } catch (supabaseError) {
            console.warn('Supabase not accessible, using sample data:', supabaseError);
          }
          
          // Fallback to sample data
          const { blocks } = get();
          const sampleRooms = generateSampleRooms(blocks);
          set({ rooms: sampleRooms });
        } catch (error) {
          console.warn('Using sample data due to fetch error:', error);
          // Use sample data as fallback
          const { blocks } = get();
          const sampleRooms = generateSampleRooms(blocks);
          set({ rooms: sampleRooms });
        } finally {
          set({ loading: false });
        }
      },

      fetchReservations: async () => {
        try {
          set({ loading: true, error: null });
          
          // Try Supabase first, but always fallback to sample data
          try {
            const { data, error } = await supabase
              .from('reservations')
              .select('*')
              .order('start_time', { ascending: false });
            
            if (error) {
              console.warn('Supabase error, using sample data:', error);
              throw error;
            }
            
            if (data) {
              set({ reservations: data, totalItems: data.length, lastSync: Date.now() });
              await offlineStorage.saveOfflineData('reservations', data);
              return;
            }
          } catch (supabaseError) {
            console.warn('Supabase not accessible, using sample data:', supabaseError);
          }
          
          // Try offline data
          const offlineData = await offlineStorage.getOfflineData('reservations');
          if (offlineData && offlineData.length > 0) {
            set({ reservations: offlineData, totalItems: offlineData.length });
            return;
          }
          
          // Fallback to sample data
          const { rooms } = get();
          if (rooms.length > 0) {
            const sampleReservations = generateSampleReservations(rooms);
            set({ reservations: sampleReservations, totalItems: sampleReservations.length });
          } else {
            // If no rooms yet, set empty reservations
            set({ reservations: [], totalItems: 0 });
          }
        } catch (error) {
          console.warn('Using sample data due to fetch error:', error);
          // Don't set error state, just use sample data
          const { rooms } = get();
          if (rooms.length > 0) {
            const sampleReservations = generateSampleReservations(rooms);
            set({ reservations: sampleReservations, totalItems: sampleReservations.length });
          } else {
            set({ reservations: [], totalItems: 0 });
          }
        } finally {
          set({ loading: false });
        }
      },

      addBlock: async (name) => {
        try {
          set({ loading: true, error: null });
          
          const newBlock: Block = {
            id: `block-${Date.now()}`,
            name
          };

          if (navigator.onLine) {
            const { error } = await supabase
              .from('blocks')
              .insert([newBlock]);
            
            if (error) throw error;
          }

          const { blocks } = get();
          set({ blocks: [...blocks, newBlock], loading: false });
        } catch (error) {
          console.error('Error adding block:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add block',
            loading: false 
          });
        }
      },

      addRoom: async (blockId, name) => {
        try {
          set({ loading: true, error: null });
          
          const newRoom: Room = {
            id: `room-${Date.now()}`,
            block_id: blockId,
            name
          };

          if (navigator.onLine) {
            const { error } = await supabase
              .from('rooms')
              .insert([newRoom]);
            
            if (error) throw error;
          }

          const { rooms } = get();
          set({ rooms: [...rooms, newRoom], loading: false });
        } catch (error) {
          console.error('Error adding room:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add room',
            loading: false 
          });
        }
      },

      deleteBlock: async (id) => {
        try {
          set({ loading: true, error: null });
          
          if (navigator.onLine) {
            const { error } = await supabase
              .from('blocks')
              .delete()
              .eq('id', id);
            
            if (error) throw error;
          }

          const { blocks, rooms } = get();
          set({ 
            blocks: blocks.filter(b => b.id !== id),
            rooms: rooms.filter(r => r.block_id !== id),
            loading: false 
          });
        } catch (error) {
          console.error('Error deleting block:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete block',
            loading: false 
          });
        }
      },

      deleteRoom: async (id) => {
        try {
          set({ loading: true, error: null });
          
          if (navigator.onLine) {
            const { error } = await supabase
              .from('rooms')
              .delete()
              .eq('id', id);
            
            if (error) throw error;
          }

          const { rooms } = get();
          set({ 
            rooms: rooms.filter(r => r.id !== id),
            loading: false 
          });
        } catch (error) {
          console.error('Error deleting room:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete room',
            loading: false 
          });
        }
      },

      addReservation: async (reservationData) => {
        try {
          set({ loading: true, error: null });
          
          const newReservation: Reservation = {
            ...reservationData,
            id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          };

          if (navigator.onLine) {
            const { error } = await supabase
              .from('reservations')
              .insert([newReservation]);
            
            if (error) throw error;
          } else {
            await offlineStorage.saveOfflineData('pending_reservations', [newReservation]);
          }

          const { reservations } = get();
          const updatedReservations = [newReservation, ...reservations];
          set({ 
            reservations: updatedReservations,
            totalItems: updatedReservations.length,
            loading: false 
          });
        } catch (error) {
          console.error('Error adding reservation:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add reservation',
            loading: false 
          });
        }
      },

      addSemesterReservations: async (reservationData, weeks) => {
        try {
          set({ loading: true, error: null });
          
          const reservations: Reservation[] = [];
          const startDate = new Date(reservationData.start_time);
          
          for (let week = 0; week < weeks; week++) {
            const weekDate = new Date(startDate);
            weekDate.setDate(startDate.getDate() + (week * 7));
            
            const startTime = new Date(weekDate);
            const endTime = new Date(reservationData.end_time);
            endTime.setDate(weekDate.getDate());
            
            reservations.push({
              ...reservationData,
              id: `res-${Date.now()}-${week}-${Math.random().toString(36).substr(2, 9)}`,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString()
            });
          }

          if (navigator.onLine) {
            const { error } = await supabase
              .from('reservations')
              .insert(reservations);
            
            if (error) throw error;
          } else {
            await offlineStorage.saveOfflineData('pending_reservations', reservations);
          }

          const { reservations: currentReservations } = get();
          const updatedReservations = [...reservations, ...currentReservations];
          set({ 
            reservations: updatedReservations,
            totalItems: updatedReservations.length,
            loading: false 
          });
        } catch (error) {
          console.error('Error adding semester reservations:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add semester reservations',
            loading: false 
          });
        }
      },

      deleteReservation: async (id) => {
        try {
          set({ loading: true, error: null });
          
          if (navigator.onLine) {
            const { error } = await supabase
              .from('reservations')
              .delete()
              .eq('id', id);
            
            if (error) throw error;
          }

          const { reservations } = get();
          const updatedReservations = reservations.filter(r => r.id !== id);
          set({ 
            reservations: updatedReservations,
            totalItems: updatedReservations.length,
            loading: false 
          });
        } catch (error) {
          console.error('Error deleting reservation:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete reservation',
            loading: false 
          });
        }
      },

      // Helper functions
      getRoomsByBlock: (blockId) => {
        const { rooms } = get();
        return rooms.filter(room => room.block_id === blockId);
      },

      getAllReservations: () => {
        const { reservations } = get();
        return reservations;
      },

      // Cache operations
      getCachedReservations: (key) => {
        const { cachedReservations } = get();
        return cachedReservations.get(key) || null;
      },

      setCachedReservations: (key, reservations) => {
        const { cachedReservations } = get();
        cachedReservations.set(key, reservations);
        set({ cachedReservations: new Map(cachedReservations) });
      },

      // Initialization
      initializeSampleData: async () => {
        const { blocks, rooms, reservations } = get();
        
        if (blocks.length === 0) {
          await get().fetchBlocks();
        }
        
        if (rooms.length === 0) {
          await get().fetchRooms();
        }
        
        if (reservations.length === 0) {
          await get().fetchReservations();
        }
      },

      // Offline support
      syncOfflineData: async () => {
        try {
          if (import.meta.env.VITE_USE_SUPABASE !== 'true' || !navigator.onLine) return;
          
          set({ loading: true });
          
          const pendingReservations = await offlineStorage.getOfflineData('pending_reservations') || [];
          
          for (const reservation of pendingReservations) {
            const { error } = await supabase
              .from('reservations')
              .insert([reservation]);
            
            if (!error) {
              await offlineStorage.markAsSynced('pending_reservations', reservation.id);
            }
          }
          
          await get().fetchReservations();
          
          set({ loading: false, lastSync: Date.now() });
        } catch (error) {
          console.error('Error syncing offline data:', error);
          set({ loading: false });
        }
      },

      clearCache: () => {
        set({ 
          cachedReservations: new Map(),
          cachedRooms: new Map(),
          lastSync: 0
        });
        offlineStorage.clearCache();
      },
    }),
    {
      name: 'pragma-store',
      partialize: (state) => ({
        blocks: state.blocks,
        rooms: state.rooms,
        reservations: state.reservations,
        selectedDate: state.selectedDate,
        lastSync: state.lastSync,
      }),
    }
  )
);