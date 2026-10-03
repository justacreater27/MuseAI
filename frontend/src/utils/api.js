import axios from 'axios'


const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    '/api',
  timeout: 120000
})

export const generateContent = (payload) => api.post('/generate', payload)
export const getCultureData = () => api.get('/config/culture-data')

export const generateBrandAdvisor = (payload, config = {}) =>
  api.post('/viral', payload, { timeout: 180000, ...config })


export const generateContentCalendar =
  (payload) =>
    api.post(
      '/content-calendar/generate',
      payload
    )


export const getContentCalendarHealth =
  () =>
    api.get(
      '/content-calendar/health'
    )


export const postHistory =
  (payload) =>
    api.post(
      '/history',
      payload
    )


export const syncHistory =
  (payload) =>
    api.post(
      '/history/sync',
      payload
    )


export const getHistory =
  (user_id) =>
    api.get(
      '/history',
      {
        params: { user_id }
      }
    )


export default api
