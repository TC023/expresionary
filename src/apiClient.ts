import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://expresionary.com.mx/api', // Replace with your server's IP and port
});

export default apiClient;