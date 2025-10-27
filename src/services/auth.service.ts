import api from '../lib/api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  age?: number;
  bio?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    age?: number;
    bio?: string;
  };
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('🌐 [AuthService] Register API call:', {
      url: '/auth/register',
      data: { ...data, password: '***' }
    });
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      console.log('✅ [AuthService] Register API response:', {
        status: response.status,
        token: response.data.token ? 'Token received' : 'No token',
        user: response.data.user
      });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      console.error('❌ [AuthService] Register API error:', error);
      console.error('📄 [AuthService] Error details:', {
        code: error.code,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      throw error;
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },
};

