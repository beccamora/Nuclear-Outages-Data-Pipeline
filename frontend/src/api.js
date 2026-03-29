import axios from 'axios'

const api = axios.create({
    baseURL: 'https://nuclear-outages-data-pipeline.onrender.com'
})

// fetch outage records with optional sorting and pagination
export async function fetchData({ page = 1, limit = 50, dateFrom = '', dateTo = '' } = {}) {
    const params = { page, limit }
    if (dateFrom) params.date_from = dateFrom
    if (dateTo)   params.date_to   = dateTo

    const response = await api.get('/data', { params })
    return response.data
}

// fetch yearly outages
export async function fetchStats() {
    const response = await api.get('/data/stats')
    return response.data
}

// trigger data pipeline
export async function triggerRefresh() {
    const response = await api.post('/refresh')
    return response.data
}