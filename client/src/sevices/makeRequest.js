import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    withCredentials: true, // 允許cookie等資料的操作
})

export default function makeRequest(url, options) {
    return api(url, options)
        .then(res => res.data)
        .catch(err => Promise.reject(err?.response?.data?.message ?? 'Error'))
}