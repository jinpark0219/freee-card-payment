import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api', // Next.js API 라우트를 통해 백엔드로 프록시
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터
apiClient.interceptors.request.use((config) => {
  // 향후 인증 토큰 추가
  // const token = localStorage.getItem('auth-token')
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`
  // }
  return config
})

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 만료 처리
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 타입 안전한 API 클라이언트
export const api = {
  // 카드 관련
  cards: {
    list: (params?: { userId?: string }) => 
      apiClient.get('/cards', { params }),
    get: (id: string) => 
      apiClient.get(`/cards/${id}`),
    suspend: (id: string) => 
      apiClient.post(`/cards/${id}/suspend`),
    activate: (id: string) => 
      apiClient.post(`/cards/${id}/activate`),
  },

  // 거래 관련
  transactions: {
    list: (params?: { 
      userId?: string
      status?: string
      limit?: number
      offset?: number
    }) => apiClient.get('/transactions', { params }),
    get: (id: string) => 
      apiClient.get(`/transactions/${id}`),
    create: (data: any) => 
      apiClient.post('/transactions', data),
    update: (id: string, data: any) => 
      apiClient.patch(`/transactions/${id}`, data),
    approve: (id: string) => 
      apiClient.post(`/transactions/${id}/complete`),
    reject: (id: string) => 
      apiClient.post(`/transactions/${id}/fail`),
  },

  // 대시보드
  dashboard: {
    stats: () => apiClient.get('/dashboard/stats'),
    budget: () => apiClient.get('/dashboard/budget'),
  },
}