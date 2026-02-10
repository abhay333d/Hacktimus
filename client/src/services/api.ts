import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
    updateTaskStatus: async (taskId: number, status: 'PENDING' | 'COMPLETED') => {
        const res = await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status });
        return res.data;
    },
    checkOverdue: async () => {
        const res = await axios.get(`${API_URL}/tasks/check-overdue`);
        return res.data;
    },
    deleteTask: async (taskId: number) => {
        const res = await axios.delete(`${API_URL}/tasks/${taskId}`);
        return res.data;
    }
};
