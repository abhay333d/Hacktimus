import { useState, useEffect } from 'react';
import { api } from '../services/api';


// Clean up unused imports
import { ChaseModal } from './ChaseModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

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
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    
    // Delete Modal State
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            // Only close if clicking outside BOTH the trigger AND the dropdown menu itself
            if (activeDropdownId !== null && 
                !target.closest('.action-dropdown-trigger') && 
                !target.closest('.action-dropdown-menu')) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdownId]);

    const handleChaseClick = (task: Task) => {
        setActiveDropdownId(null);
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleStatusToggle = async (task: Task) => {
        setActiveDropdownId(null);
        const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        try {
            await api.updateTaskStatus(task.id, newStatus);
            refreshTasks();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleDeleteClick = (task: Task) => {
        setActiveDropdownId(null);
        setTaskToDelete(task);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (taskToDelete) {
            try {
                await api.deleteTask(taskToDelete.id);
                refreshTasks();
            } catch (err) {
                console.error("Failed to delete task", err);
            }
        }
    };

    const handleConfirmChase = async (taskId: number) => {
        await api.chaseTask(taskId);
        refreshTasks();
    };

    return (
        <div className="overflow-visible min-h-[400px]">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 w-1/4 text-center">Title</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 w-1/6 text-center">Assignee</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 w-1/6 text-center">Due Date</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center w-1/6">Status</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center w-1/12">Chases</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center w-1/6">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {(Array.isArray(tasks) ? tasks : []).map((task, index) => {
                        // Determine if dropdown should open upwards (for last 2 items in list > 4 items)
                        const openUpwards = tasks.length > 4 && index >= tasks.length - 2;
                        
                        return (
                        <tr key={task.id} className="hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors">
                            <td className="p-4 font-medium text-gray-900 dark:text-white whitespace-normal break-words align-middle text-center">{task.title}</td>
                            <td className="p-4 text-gray-500 dark:text-gray-400 align-middle text-center">{task.assignee_name}</td>
                            <td className="p-4 text-gray-500 dark:text-gray-400 align-middle text-center">{new Date(task.due_date).toLocaleDateString()}</td>
                            <td className="p-4 text-center uppercase text-xs font-bold align-middle">
                                <span className={`px-2 py-1 rounded-full ${
                                    task.status === 'COMPLETED' 
                                        ? 'bg-green-100/80 text-green-800 dark:bg-green-900/80 dark:text-green-200' 
                                        : 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/80 dark:text-yellow-200'
                                }`}>
                                    {task.status}
                                </span>
                            </td>
                            <td className="p-4 text-center text-gray-500 dark:text-gray-400 align-middle">{task.chase_count}</td>
                            <td className="p-4 text-center align-middle relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdownId(activeDropdownId === task.id ? null : task.id);
                                    }}
                                    className="action-dropdown-trigger p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                                    title="Open Actions"
                                >
                                    ⚙️
                                </button>
                                
                                {activeDropdownId === task.id && (
                                    <div className={`action-dropdown-menu absolute right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fadeIn ${
                                        openUpwards ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'
                                    }`}>
                                        <div className="py-1">
                                            <button
                                                onClick={() => handleStatusToggle(task)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                            >
                                                <span>{task.status === 'COMPLETED' ? '↩️ Make Pending' : '✅ Complete'}</span>
                                            </button>
                                            
                                            <button
                                                onClick={() => handleChaseClick(task)}
                                                disabled={task.status === 'COMPLETED'}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <span>🚀 Chase</span>
                                            </button>
                                            
                                            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                            
                                            <button
                                                onClick={() => handleDeleteClick(task)}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                            >
                                                <span>🗑️ Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
            
            {tasks.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No tasks found. Create one to get started!
                </div>
            )}

            <ChaseModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                onConfirm={handleConfirmChase}
            />
            
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                taskTitle={taskToDelete?.title || ""}
            />
        </div>
    );
}



