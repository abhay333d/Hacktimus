import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

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

interface ChaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onConfirm: (taskId: number) => Promise<void>;
}

export function ChaseModal({ isOpen, onClose, task, onConfirm }: ChaseModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<'idle' | 'chasing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setErrorMessage('');
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(modalRef.current, 
                { scale: 0.8, opacity: 0, y: 20 }, 
                { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
            );
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        if (!task) return;
        setStatus('chasing');
        try {
            await onConfirm(task.id);
            setStatus('success');
            // Auto close after success
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMessage(err.message || 'Failed to send chase.');
        }
    };

    const handleClose = () => {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
        gsap.to(modalRef.current, { 
            scale: 0.8, 
            opacity: 0, 
            y: 20, 
            duration: 0.2, 
            onComplete: onClose 
        });
    };

    if (!isOpen || !task) return null;

    return (
        <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div 
                ref={modalRef}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white/20 dark:border-gray-700 overflow-hidden"
            >
                <div className="p-6">
                    {status === 'idle' && (
                        <>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full text-2xl">
                                    🚀
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                    Chase Task?
                                </h2>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Send a friendly reminder to <span className="font-semibold text-blue-600 dark:text-blue-400">{task.assignee_name}</span> for the task "<span className="italic">{task.title}</span>"?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={handleClose}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirm}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold"
                                >
                                    Send Reminder
                                </button>
                            </div>
                        </>
                    )}

                    {status === 'chasing' && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Sending Chase...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center rounded-full text-3xl mb-4 animate-bounce">
                                ✅
                            </div>
                            <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">Chase Sent!</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center">
                                The assignee has been notified.
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center rounded-full text-3xl mb-4">
                                ❌
                            </div>
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Failed to Send</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                                {errorMessage}
                            </p>
                            <button 
                                onClick={handleClose}
                                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
