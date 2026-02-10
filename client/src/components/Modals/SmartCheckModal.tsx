
import { Loader } from '../Loader';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    results: any;
    isLoading: boolean;
}

export function SmartCheckModal({ isOpen, onClose, results, isLoading }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 transform transition-all animate-scaleIn relative overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 flex items-center gap-2">
                             🚀 Smart Check Results
                        </h2>
                        {!isLoading && (
                            <button 
                                onClick={onClose} 
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <Loader message="Scanning for overdue tasks..." />
                    ) : (
                        <div className="space-y-6">
                            <div className={`p-6 rounded-xl text-center transition-colors ${
                                (results?.chased_count || 0) > 0 
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800' 
                                : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600'
                            }`}>
                                <div className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">
                                    {results?.chased_count || 0}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                    Overdue Tasks Chased
                                </p>
                            </div>

                            {results?.details && results.details.length > 0 && (
                                <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                    {results.details.map((detail: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 hover:border-purple-200 dark:hover:border-purple-700 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                    {detail.task?.title || "Unknown Task"}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {detail.task?.assignee_name || "Unassigned"}
                                                </span>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                                                detail.status === 'sent' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                            }`}>
                                                {detail.status === 'sent' ? 'Sent' : 'Failed'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
