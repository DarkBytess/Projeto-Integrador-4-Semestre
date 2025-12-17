// URL da API - usa variável de ambiente em produção, localhost em dev
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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
  latitude?: number;
  longitude?: number;
}

export interface SensorData {
  id: number;
  valor: number;
  dataHora: string;
  sensor: Sensor;
}

export interface Alerta {
  id: number;
  tipo: string;
  mensagem: string;
  nivel: string;
  dataHora: string;
  ativo: boolean;
  sensorData: SensorData;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("authToken");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "API request failed");
    }

    // Se a resposta não tiver conteúdo (204 No Content), retorna null
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null as T;
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("authToken", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("authToken");
  }

  // Auth
  async login(email: string, senha: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
  }

  async register(nome: string, email: string, senha: string, role: string = "AGRICULTOR"): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ nome, email, senha, role }),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>("/api/auth/me");
  }

  // Sensores
  async getSensores(): Promise<Sensor[]> {
    return this.request<Sensor[]>("/api/sensores");
  }

  async getSensor(id: number): Promise<Sensor> {
    return this.request<Sensor>(`/api/sensores/${id}`);
  }

  async createSensor(sensor: Omit<Sensor, "id">): Promise<Sensor> {
    return this.request<Sensor>("/api/sensores", {
      method: "POST",
      body: JSON.stringify(sensor),
    });
  }

  async updateSensor(id: number, sensor: Partial<Sensor>): Promise<Sensor> {
    return this.request<Sensor>(`/api/sensores/${id}`, {
      method: "PUT",
      body: JSON.stringify(sensor),
    });
  }

  async deleteSensor(id: number): Promise<void> {
    return this.request<void>(`/api/sensores/${id}`, {
      method: "DELETE",
    });
  }

  // Alertas
  async getAlertas(): Promise<Alerta[]> {
    return this.request<Alerta[]>("/api/alertas");
  }

  async getAlertasAtivos(): Promise<Alerta[]> {
    return this.request<Alerta[]>("/api/alertas/ativos");
  }

  async encerrarAlerta(id: number): Promise<void> {
    return this.request<void>(`/api/alertas/${id}/encerrar`, {
      method: "PUT",
    });
  }

  // Dados
  async getDados(): Promise<SensorData[]> {
    return this.request<SensorData[]>("/api/dados");
  }

  async getDadosBySensor(sensorId: number): Promise<SensorData[]> {
    return this.request<SensorData[]>(`/api/dados/sensor/${sensorId}`);
  }

  async deleteDado(id: number): Promise<void> {
    return this.request<void>(`/api/dados/${id}`, {
      method: "DELETE",
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
    return this.request<User[]>("/api/usuarios");
  }

  async getUsuario(id: number): Promise<User> {
    return this.request<User>(`/api/usuarios/${id}`);
  }

  async deleteUsuario(id: number): Promise<void> {
    return this.request<void>(`/api/usuarios/${id}`, {
      method: "DELETE",
    });
  }

  // Google Authentication
  async loginWithGoogle(): Promise<void> {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }
}

export const apiClient = new ApiClient();
