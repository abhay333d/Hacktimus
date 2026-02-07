import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const api = {
    getTasks: async () => {
        const res = await axios.get(`${API_URL}/tasks`);
        return res.data;
    },
    createTask: async (task: any) => {
        const res = await axios.post(`${API_URL}/tasks`, task);
        return res.data;
    },
    getUsers: async () => {
        const res = await axios.get(`${API_URL}/users`);
        return res.data;
    },
    chaseTask: async (taskId: number) => {
        const res = await axios.post(`${API_URL}/tasks/${taskId}/chase`);
        return res.data;
    },
    checkOverdue: async () => {
        const res = await axios.get(`${API_URL}/tasks/check-overdue`);
        return res.data;
    }
};
