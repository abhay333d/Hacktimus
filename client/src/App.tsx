import { useState, useEffect } from 'react';
import { TaskTable } from './components/TaskTable';
import { AddTaskModal } from './components/AddTaskModal';
import { api } from './services/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from system preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  // Update DOM when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fetchTasks = () => {
    api.getTasks().then(setTasks).catch(console.error);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSmartCheck = async () => {
    try {
      const res = await api.checkOverdue();
      alert(`Smart Check Complete. Triggered ${res.chased_count} chases.`);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to run smart check');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🤖</span>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Automated Chaser Agent
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button 
              onClick={handleSmartCheck}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-colors"
            >
              Run Smart Check
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors"
            >
              + Add Task
            </button>
          </div>
        </header>

        <main>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
            <TaskTable tasks={tasks} refreshTasks={fetchTasks} />
          </div>
        </main>
      </div>

      {showModal && (
        <AddTaskModal 
          onClose={() => setShowModal(false)} 
          onTaskAdded={fetchTasks} 
        />
      )}
    </div>
  );
}

export default App;
