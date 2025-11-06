import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api', // Replace with your server's IP and port
});

export default apiClient;