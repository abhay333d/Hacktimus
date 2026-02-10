import { useState, useEffect } from 'react';
import { TaskTable } from './components/TaskTable';
import { AddTaskModal } from './components/AddTaskModal';
import { SmartCheckModal } from './components/SmartCheckModal';
import { Background3D } from './components/Background3D';
import { api } from './services/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSmartCheckModal, setShowSmartCheckModal] = useState(false);
  const [smartCheckResults, setSmartCheckResults] = useState(null);
  const [isSmartCheckLoading, setIsSmartCheckLoading] = useState(false);


  const fetchTasks = () => {
    api.getTasks().then(setTasks).catch(console.error);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSmartCheck = async () => {
    setIsSmartCheckLoading(true);
    setShowSmartCheckModal(true);
    setSmartCheckResults(null);
    try {
      const res = await api.checkOverdue();
      setSmartCheckResults(res);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to run smart check'); // Fallback if modal fails
      setShowSmartCheckModal(false);
    } finally {
      setIsSmartCheckLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white transition-colors duration-200 relative">
      <Background3D />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center mb-8 backdrop-blur-[1px] bg-white/[0.03] p-4 rounded-xl border border-white/10 shadow-lg ring-1 ring-white/5">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-1">🤖</span>
            <h1 className="text-3xl md:text-3xl p-1 font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,#818cf8,#c084fc,#818cf8)] bg-[length:200%_auto] animate-text-shimmer drop-shadow-sm underline ">
              Automated Chaser Agent
            </h1>
          </div>
          
          <div className="flex items-center gap-4">

            <button 
              onClick={handleSmartCheck}
              className="px-4 py-2 bg-purple-600/40 hover:bg-purple-700/60 backdrop-blur-sm text-white rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2 border border-white/10"
            >
              <span>🚀</span> Chase All
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600/40 hover:bg-blue-700/60 backdrop-blur-sm text-white rounded-lg shadow-md transition-all hover:scale-105 border border-white/10"
            >
              + Add Task
            </button>
          </div>
        </header>

        <main>
          <div className="bg-white/[0.02] backdrop-blur-[1px] rounded-xl shadow-2xl overflow-hidden border border-white/5 ring-1 ring-white/5">
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

      {showSmartCheckModal && (
        <SmartCheckModal
            isOpen={showSmartCheckModal}
            onClose={() => setShowSmartCheckModal(false)}
            results={smartCheckResults}
            isLoading={isSmartCheckLoading}
        />
      )}
    </div>
  );
}

export default App;
