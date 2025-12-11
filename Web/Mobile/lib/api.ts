import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use o IP da sua máquina local para testes em dispositivos físicos
// Ex: "http://192.168.1.100:8080"
// Para emulador Android: "http://10.0.2.2:8080"
// Para emulador iOS: "http://localhost:8080"
export const API_BASE_URL = "http://10.109.25.49:8080";

// Helper para storage multiplataforma
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      console.log('SecureStore not available');
    }
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      console.log('SecureStore not available');
    }
  },
};

export interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export interface Sensor {
  id: number;
  tipo: string;
  localizacao: string;
  descricao: string;
  limiteMin: number;
  limiteMax: number;
}

export interface SensorData {
  id: number;
  valor: number;
  dataHora: string;
  sensorId?: number;
  sensor?: Sensor;
}

export interface Alerta {
  id: number;
  tipo: string;
  mensagem: string;
  nivel: string;
  dataHora: string;
  ativo: boolean;
  sensorData?: SensorData;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class ApiClient {
  private token: string | null = null;

  async init() {
    this.token = await storage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'API request failed');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async setToken(token: string) {
    this.token = token;
    await storage.setItem('authToken', token);
  }

  async clearToken() {
    this.token = null;
    await storage.removeItem('authToken');
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Auth
  async login(email: string, senha: string): Promise<AuthResponse> {
    const response = await this.request<{ token: string; usuario: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    // Backend retorna "usuario", mas padronizamos como "user"
    return { token: response.token, user: response.usuario };
  }

  async register(nome: string, email: string, senha: string, role: string = 'AGRICULTOR'): Promise<AuthResponse> {
    // Register retorna UsuarioDTO, precisamos fazer login após registro
    await this.request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha, role }),
    });
    // Após registro, fazemos login automaticamente
    return this.login(email, senha);
  }

  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // Sensores
  async getSensores(): Promise<Sensor[]> {
    return this.request<Sensor[]>('/api/sensores');
  }

  async getSensor(id: number): Promise<Sensor> {
    return this.request<Sensor>(`/api/sensores/${id}`);
  }

  async createSensor(sensor: Omit<Sensor, 'id'>): Promise<Sensor> {
    return this.request<Sensor>('/api/sensores', {
      method: 'POST',
      body: JSON.stringify(sensor),
    });
  }

  async updateSensor(id: number, sensor: Partial<Sensor>): Promise<Sensor> {
    return this.request<Sensor>(`/api/sensores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sensor),
    });
  }

  async deleteSensor(id: number): Promise<void> {
    return this.request<void>(`/api/sensores/${id}`, {
      method: 'DELETE',
    });
  }

  // Alertas
  async getAlertas(): Promise<Alerta[]> {
    return this.request<Alerta[]>('/api/alertas');
  }

  async getAlertasAtivos(): Promise<Alerta[]> {
    return this.request<Alerta[]>('/api/alertas/ativos');
  }

  async encerrarAlerta(id: number): Promise<void> {
    return this.request<void>(`/api/alertas/${id}/encerrar`, {
      method: 'PUT',
    });
  }

  // Dados
  async getDados(): Promise<SensorData[]> {
    return this.request<SensorData[]>('/api/dados');
  }

  async getDadosBySensor(sensorId: number): Promise<SensorData[]> {
    return this.request<SensorData[]>(`/api/dados/sensor/${sensorId}`);
  }

  async deleteDado(id: number): Promise<void> {
    return this.request<void>(`/api/dados/${id}`, {
      method: 'DELETE',
    });
  }

  // Relatórios
  async getRelatorioTendencias(sensorId: number, dias: number): Promise<any> {
    return this.request<any>(`/api/relatorios/tendencias?sensorId=${sensorId}&dias=${dias}`);
  }

  async getRelatorioMedias(sensorId: number, periodo: string): Promise<any> {
    return this.request<any>(`/api/relatorios/medias?sensorId=${sensorId}&periodo=${periodo}`);
  }

  async getRelatorioAlertas(sensorId: number, inicio: string, fim: string): Promise<any> {
    return this.request<any>(`/api/relatorios/alertas?sensorId=${sensorId}&inicio=${inicio}&fim=${fim}`);
  }

  // Usuários (Admin only)
  async getUsuarios(): Promise<User[]> {
    return this.request<User[]>('/api/usuarios');
  }

  async getUsuario(id: number): Promise<User> {
    return this.request<User>(`/api/usuarios/${id}`);
  }

  async deleteUsuario(id: number): Promise<void> {
    return this.request<void>(`/api/usuarios/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
