interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    taskTitle: string;
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, taskTitle }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-700 transform transition-all animate-scaleIn">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🗑️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Task?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-300">"{taskTitle}"</span>? This action cannot be undone.
                    </p>
                    
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
