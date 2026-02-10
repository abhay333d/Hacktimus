import { useState, useEffect } from 'react';
import { api } from '../services/api';


import { ChaseModal } from './Modals/ChaseModal';
import { DeleteConfirmationModal } from './Modals/DeleteConfirmationModal';

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
        <div className="overflow-y-auto overflow-x-auto max-h-[75vh] min-h-[400px] custom-scrollbar pb-32">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-gray-200">
                        <th className="p-4 font-semibold w-16 text-center">#</th>
                        <th className="p-4 font-semibold w-1/4 text-center">Title</th>
                        <th className="p-4 font-semibold w-1/6 text-center">Assignee</th>
                        <th className="p-4 font-semibold w-1/6 text-center">Due Date</th>
                        <th className="p-4 font-semibold text-center w-1/6">Status</th>
                        <th className="p-4 font-semibold text-center w-1/12">Chases</th>
                        <th className="p-4 font-semibold text-center w-1/6">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {(Array.isArray(tasks) ? tasks : []).map((task, index) => {
                        // Determine if dropdown should open upwards (for last 2 items in list > 4 items)
                        const openUpwards = tasks.length > 4 && index >= tasks.length - 2;
                        
                        return (
                        <tr key={task.id} className="hover:bg-white/10 transition-colors duration-200">
                            <td className="p-4 text-gray-400 font-mono text-center align-middle">{index + 1}</td>
                            <td className="p-4 font-medium text-white whitespace-normal break-words align-middle text-center shadow-sm">{task.title}</td>
                            <td className="p-4 text-gray-300 align-middle text-center">{task.assignee_name}</td>
                            <td className="p-4 text-gray-300 align-middle text-center">{new Date(task.due_date).toLocaleDateString()}</td>
                            <td className="p-4 text-center uppercase text-xs font-bold align-middle">
                                <span className={`px-3 py-1 rounded-full backdrop-blur-sm shadow-sm ${
                                    task.status === 'COMPLETED' 
                                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                }`}>
                                    {task.status}
                                </span>
                            </td>
                            <td className="p-4 text-center text-gray-300 align-middle">{task.chase_count}</td>
                            <td className="p-4 text-center align-middle relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdownId(activeDropdownId === task.id ? null : task.id);
                                    }}
                                    className="action-dropdown-trigger p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    title="Open Actions"
                                >
                                    ⚙️
                                </button>
                                
                                {activeDropdownId === task.id && (
                                    <div className={`action-dropdown-menu absolute right-0 w-48 bg-gray-900/60 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 z-50 overflow-hidden animate-fadeIn ${
                                        openUpwards ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'
                                    }`}>
                                        <div className="py-1">
                                            <button
                                                onClick={() => handleStatusToggle(task)}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-3 transition-colors"
                                            >
                                                <span>{task.status === 'COMPLETED' ? '↩️ Make Pending' : '✅ Complete'}</span>
                                            </button>
                                            
                                            <button
                                                onClick={() => handleChaseClick(task)}
                                                disabled={task.status === 'COMPLETED'}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-colors"
                                            >
                                                <span>🚀 Chase</span>
                                            </button>
                                            
                                            <div className="border-t border-white/10 my-1"></div>
                                            
                                            <button
                                                onClick={() => handleDeleteClick(task)}
                                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 flex items-center gap-3 transition-colors"
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



