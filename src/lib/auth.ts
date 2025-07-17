// Simple authentication system without Supabase auth
interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'user';
}

class AuthService {
  private currentUser: User | null = null;
  private sessionToken: string | null = null;

  constructor() {
    // Check for existing session on initialization
    this.loadSession();
  }

  private loadSession() {
    const token = localStorage.getItem('session_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        this.sessionToken = token;
        this.currentUser = JSON.parse(userData);
      } catch (error) {
        this.clearSession();
      }
    }
  }

  private saveSession(user: User, token: string) {
    localStorage.setItem('session_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    this.currentUser = user;
    this.sessionToken = token;
  }

  private clearSession() {
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_data');
    this.currentUser = null;
    this.sessionToken = null;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API call - in real implementation, this would call your backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock authentication logic
        if (credentials.email === 'admin@pragma.com' && credentials.password === 'admin123') {
          const user: User = {
            id: '1',
            email: 'admin@pragma.com',
            full_name: 'Administrador',
            role: 'admin',
            is_active: true
          };
          const token = 'mock-session-token-' + Date.now();
          this.saveSession(user, token);
          resolve(user);
        } else if (credentials.email === 'user@pragma.com' && credentials.password === 'user123') {
          const user: User = {
            id: '2',
            email: 'user@pragma.com',
            full_name: 'Usuário',
            role: 'user',
            is_active: true
          };
          const token = 'mock-session-token-' + Date.now();
          this.saveSession(user, token);
          resolve(user);
        } else {
          reject(new Error('Credenciais inválidas'));
        }
      }, 1000);
    });
  }

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.clearSession();
        resolve();
      }, 500);
    });
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.sessionToken !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  async createUser(userData: CreateUserData): Promise<User> {
    if (!this.isAdmin()) {
      throw new Error('Apenas administradores podem criar usuários');
    }

    // Simulate API call to create user
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock user creation
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          is_active: true
        };
        resolve(newUser);
      }, 1000);
    });
  }

  async getUsers(): Promise<User[]> {
    if (!this.isAdmin()) {
      throw new Error('Apenas administradores podem listar usuários');
    }

    // Simulate API call to get users
    return new Promise((resolve) => {
      setTimeout(() => {
        const users: User[] = [
          {
            id: '1',
            email: 'admin@pragma.com',
            full_name: 'Administrador',
            role: 'admin',
            is_active: true
          },
          {
            id: '2',
            email: 'user@pragma.com',
            full_name: 'Usuário',
            role: 'user',
            is_active: true
          }
        ];
        resolve(users);
      }, 500);
    });
  }

  async updateUser(userId: string, updates: Partial<CreateUserData>): Promise<User> {
    if (!this.isAdmin()) {
      throw new Error('Apenas administradores podem atualizar usuários');
    }

    // Simulate API call to update user
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser: User = {
          id: userId,
          email: updates.email || 'user@pragma.com',
          full_name: updates.full_name || 'Usuário',
          role: updates.role || 'user',
          is_active: true
        };
        resolve(updatedUser);
      }, 1000);
    });
  }

  async deleteUser(userId: string): Promise<void> {
    if (!this.isAdmin()) {
      throw new Error('Apenas administradores podem excluir usuários');
    }

    // Simulate API call to delete user
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }
}

export const authService = new AuthService();
export type { User, LoginCredentials, CreateUserData };