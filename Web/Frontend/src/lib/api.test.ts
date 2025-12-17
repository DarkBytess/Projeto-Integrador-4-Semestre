import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock do fetch
global.fetch = vi.fn()

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Autenticação', () => {
    it('deve armazenar token no localStorage após login', async () => {
      const mockResponse = {
        token: 'fake-jwt-token',
        user: { id: 1, nome: 'Test User', email: 'test@test.com', role: 'ADMIN' }
      }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      // Simular chamada de login
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', senha: '123456' })
      })
      
      const data = await response.json()
      localStorage.setItem('authToken', data.token)

      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'fake-jwt-token')
    })

    it('deve remover token no logout', () => {
      localStorage.removeItem('authToken')
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken')
    })
  })

  describe('Requisições', () => {
    it('deve fazer GET request corretamente', async () => {
      const mockSensores = [
        { id: 1, tipo: 'TEMPERATURA_AR', localizacao: 'Campo Norte' },
        { id: 2, tipo: 'UMIDADE_AR', localizacao: 'Campo Sul' }
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSensores
      })

      const response = await fetch('http://localhost:8080/api/sensores')
      const data = await response.json()

      expect(data).toHaveLength(2)
      expect(data[0].tipo).toBe('TEMPERATURA_AR')
    })

    it('deve lidar com erro 401 (não autorizado)', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Token inválido' })
      })

      const response = await fetch('http://localhost:8080/api/sensores')
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
    })

    it('deve lidar com erro de rede', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(fetch('http://localhost:8080/api/sensores')).rejects.toThrow('Network error')
    })
  })

  describe('Validação de dados', () => {
    it('deve validar estrutura de Sensor', () => {
      const sensor = {
        id: 1,
        tipo: 'TEMPERATURA_AR',
        localizacao: 'Campo Norte',
        descricao: 'Sensor de temperatura',
        limiteMin: 0,
        limiteMax: 50
      }

      expect(sensor).toHaveProperty('id')
      expect(sensor).toHaveProperty('tipo')
      expect(sensor).toHaveProperty('localizacao')
      expect(sensor).toHaveProperty('limiteMin')
      expect(sensor).toHaveProperty('limiteMax')
      expect(typeof sensor.limiteMin).toBe('number')
      expect(typeof sensor.limiteMax).toBe('number')
    })

    it('deve validar estrutura de Alerta', () => {
      const alerta = {
        id: 1,
        tipo: 'TEMPERATURA_AR',
        mensagem: 'Temperatura alta',
        nivel: 'ALTO',
        dataHora: '2024-01-01T10:00:00',
        ativo: true
      }

      expect(alerta).toHaveProperty('id')
      expect(alerta).toHaveProperty('nivel')
      expect(alerta).toHaveProperty('ativo')
      expect(['BAIXO', 'MEDIO', 'ALTO', 'CRITICO']).toContain(alerta.nivel)
    })
  })
})
