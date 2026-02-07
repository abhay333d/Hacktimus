import { useState } from 'react';
import { api } from '../services/api';

interface Task {
    id: number;
    title: string;
    description: string;
    assignee_name: string;
    due_date: string;
    status: string;
    last_chased_at: string | null;
    chase_count: number;
}

interface Props {
    tasks: Task[];
    refreshTasks: () => void;
}

export function TaskTable({ tasks, refreshTasks }: Props) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handleChase = async (taskId: number) => {
        setLoadingId(taskId);
        try {
            await api.chaseTask(taskId);
            alert("Chase initiated!");
            refreshTasks();
        } catch (err) {
            alert("Failed to chase task.");
            console.error(err);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Title</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Assignee</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Due Date</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Chases</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {tasks.map(task => (
                        <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="p-4 font-medium text-gray-900 dark:text-white">{task.title}</td>
                            <td className="p-4 text-gray-500 dark:text-gray-400">{task.assignee_name}</td>
                            <td className="p-4 text-gray-500 dark:text-gray-400">{new Date(task.due_date).toLocaleDateString()}</td>
                            <td className="p-4 uppercase text-xs font-bold">
                                <span className={`px-2 py-1 rounded-full ${
                                    task.status === 'COMPLETED' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                    {task.status}
                                </span>
                            </td>
                            <td className="p-4 text-gray-500 dark:text-gray-400">{task.chase_count}</td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleChase(task.id)}
                                    disabled={loadingId === task.id || task.status === 'COMPLETED'}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        task.status === 'COMPLETED'
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                                    }`}
                                >
                                    {loadingId === task.id ? 'Sending...' : 'Chase Now'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {tasks.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No tasks found. Create one to get started!
                </div>
            )}
        </div>
    );
}
