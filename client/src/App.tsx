import { useState, useEffect } from 'react';
import { TaskTable } from './components/TaskTable';
import { AddTaskModal } from './components/AddTaskModal';
import { Background3D } from './components/Background3D';
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
    <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200 relative">
      <Background3D />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center mb-8 backdrop-blur-sm bg-white/30 dark:bg-black/30 p-4 rounded-xl border border-white/20 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🤖</span>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Automated Chaser Agent
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-black/50 transition-colors"
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
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/20 dark:border-gray-700">
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
