import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 90000,
})

export const getCultureData = () => api.get('/config/culture-data')
export const generateContent = (payload) => api.post('/generate', payload)

export default api
