import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://server-muddy-wind-4181.fly.dev', // Replace with your server's IP and port
});

export default apiClient;