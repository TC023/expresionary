import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://expresionary.onrender.com/', // Replace with your server's IP and port
});

export default apiClient;