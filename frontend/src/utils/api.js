import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 90000,
})

export const getCultureData = () => api.get('/config/culture-data')
export const generateContent = (payload) => api.post('/generate', payload)
export const generateBrandAdvisor = (payload) => api.post('/viral', payload)
export const postHistory = (payload) => api.post('/history', payload)
export const syncHistory = (payload) => api.post('/history/sync', payload)
export const getHistory = (user_id) => api.get('/history', { params: { user_id } })

export default api
