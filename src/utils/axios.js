import axios from 'axios'


const Axios = axios.create({
    baseURL: import.meta.env.NODE_ENV === "production" ?
        'https://learnmoreacademy.com/api' :
        'http://127.0.0.1:8000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});


Axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('lm-access-token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
)


export default Axios;