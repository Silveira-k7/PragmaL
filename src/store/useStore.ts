import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { offlineStorage } from '../lib/offlineStorage';

export interface Reservation {
  id: string;
  professor_name: string;
  subject: string;
  block: string;
  room: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  user_id?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

interface StoreState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Data
  reservations: Reservation[];
  users: User[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Cache
  cachedReservations: Map<string, Reservation[]>;
  cachedRooms: Map<string, string[]>;
  lastSync: number;
  
  // Actions
  setUser: (user: User | null) => void;
  setReservations: (reservations: Reservation[]) => void;
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Data operations
  addReservation: (reservation: Omit<Reservation, 'id' | 'created_at'>) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  fetchReservations: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  
  // Cache operations
  getCachedReservations: (key: string) => Reservation[] | null;
  setCachedReservations: (key: string, reservations: Reservation[]) => void;
  getCachedRooms: (block: string) => string[] | null;
  setCachedRooms: (block: string, rooms: string[]) => void;
  
  // Offline support
  syncOfflineData: () => Promise<void>;
  clearCache: () => void;
}

// Generate sample data for development
const generateSampleData = (): Reservation[] => {
  const blocks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const professors = [
    'Prof. João Silva', 'Prof. Maria Santos', 'Prof. Carlos Oliveira',
    'Prof. Ana Costa', 'Prof. Pedro Lima', 'Prof. Julia Ferreira',
    'Prof. Roberto Alves', 'Prof. Fernanda Souza', 'Prof. Lucas Pereira',
    'Prof. Camila Rodrigues'
  ];
  const subjects = [
    'Cálculo I', 'Física I', 'Química Geral', 'Programação I',
    'Álgebra Linear', 'Estatística', 'Biologia Molecular',
    'História do Brasil', 'Inglês Técnico', 'Metodologia Científica'
  ];

  const reservations: Reservation[] = [];
  const today = new Date();
  
  // Generate 60 days of data (past and future)
  for (let dayOffset = -30; dayOffset <= 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Generate 15-25 reservations per day
    const reservationsPerDay = Math.floor(Math.random() * 11) + 15;
    
    for (let i = 0; i < reservationsPerDay; i++) {
      const block = blocks[Math.floor(Math.random() * blocks.length)];
      const roomNumber = Math.floor(Math.random() * 300) + 1;
      const room = `${roomNumber.toString().padStart(3, '0')}`;
      
      const startHour = Math.floor(Math.random() * 10) + 7; // 7-16h
      const startTime = `${startHour.toString().padStart(2, '0')}:00`;
      const endTime = `${(startHour + 2).toString().padStart(2, '0')}:00`;
      
      reservations.push({
        id: `${date.toISOString().split('T')[0]}-${block}-${room}-${i}`,
        professor_name: professors[Math.floor(Math.random() * professors.length)],
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        block,
        room,
        date: date.toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime,
        created_at: new Date(date.getTime() - Math.random() * 86400000).toISOString(),
        user_id: 'sample-user'
      });
    }
  }
  
  return reservations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      reservations: generateSampleData(),
      users: [],
      isLoading: false,
      error: null,
      cachedReservations: new Map(),
      cachedRooms: new Map(),
      lastSync: Date.now(),

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setReservations: (reservations) => set({ reservations }),
      setUsers: (users) => set({ users }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Data operations
      addReservation: async (reservationData) => {
        try {
          set({ isLoading: true, error: null });
          
          const newReservation: Reservation = {
            ...reservationData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
          };

          // Try to save online first
          if (navigator.onLine) {
            const { error } = await supabase
              .from('reservations')
              .insert([newReservation]);
            
            if (error) throw error;
          } else {
            // Save offline
            await offlineStorage.addPendingReservation(newReservation);
          }

          // Update local state
          const { reservations } = get();
          set({ 
            reservations: [newReservation, ...reservations],
            isLoading: false 
          });
        } catch (error) {
          console.error('Error adding reservation:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add reservation',
            isLoading: false 
          });
        }
      },

      deleteReservation: async (id) => {
        try {
          set({ isLoading: true, error: null });
          
          if (navigator.onLine) {
            const { error } = await supabase
              .from('reservations')
              .delete()
              .eq('id', id);
            
            if (error) throw error;
          }

          // Update local state
          const { reservations } = get();
          set({ 
            reservations: reservations.filter(r => r.id !== id),
            isLoading: false 
          });
        } catch (error) {
          console.error('Error deleting reservation:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete reservation',
            isLoading: false 
          });
        }
      },

      fetchReservations: async () => {
        try {
          set({ isLoading: true, error: null });
          
          if (navigator.onLine) {
            const { data, error } = await supabase
              .from('reservations')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data) {
              set({ reservations: data, lastSync: Date.now() });
              // Cache the data offline
              await offlineStorage.cacheReservations(data);
            }
          } else {
            // Load from offline cache
            const cachedData = await offlineStorage.getCachedReservations();
            if (cachedData.length > 0) {
              set({ reservations: cachedData });
            }
          }
          
          set({ isLoading: false });
        } catch (error) {
          console.error('Error fetching reservations:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch reservations',
            isLoading: false 
          });
        }
      },

      fetchUsers: async () => {
        try {
          if (!navigator.onLine) return;
          
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          if (data) set({ users: data });
        } catch (error) {
          console.error('Error fetching users:', error);
        }
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

      getCachedRooms: (block) => {
        const { cachedRooms } = get();
        return cachedRooms.get(block) || null;
      },

      setCachedRooms: (block, rooms) => {
        const { cachedRooms } = get();
        cachedRooms.set(block, rooms);
        set({ cachedRooms: new Map(cachedRooms) });
      },

      // Offline support
      syncOfflineData: async () => {
        try {
          if (!navigator.onLine) return;
          
          set({ isLoading: true });
          
          // Sync pending reservations
          const pendingReservations = await offlineStorage.getPendingReservations();
          
          for (const reservation of pendingReservations) {
            const { error } = await supabase
              .from('reservations')
              .insert([reservation]);
            
            if (!error) {
              await offlineStorage.removePendingReservation(reservation.id);
            }
          }
          
          // Fetch latest data
          await get().fetchReservations();
          
          set({ isLoading: false, lastSync: Date.now() });
        } catch (error) {
          console.error('Error syncing offline data:', error);
          set({ isLoading: false });
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
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        reservations: state.reservations,
        lastSync: state.lastSync,
      }),
    }
  )
);