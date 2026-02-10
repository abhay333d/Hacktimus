import { useState, useEffect, useRef } from 'react';
import { TaskTable } from './components/TaskTable';
import { AddTaskModal } from './components/Modals/AddTaskModal';
import { SmartCheckModal } from './components/Modals/SmartCheckModal';
import { Background3D } from './components/Background3D';
import { Loader } from './components/Loader';
import { ScrollingNumber } from './components/ScrollingNumber';
import { api } from './services/api';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSmartCheckModal, setShowSmartCheckModal] = useState(false);
  const [smartCheckResults, setSmartCheckResults] = useState(null);
  const [isSmartCheckLoading, setIsSmartCheckLoading] = useState(false);

  // Animation Refs
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const textWrapperRef = useRef(null);
  const buttonsRef = useRef(null);
  const tableRef = useRef(null);
  const statsRef = useRef(null);


  const fetchTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
       // Allow animation to play a bit before showing data if needed, 
       // but here we just turn off loader.
       setTimeout(() => setIsLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useGSAP(() => {
    if (isLoading) return; // Wait for loader to finish

    const tl = gsap.timeline();

    // Initial States
    gsap.set(logoRef.current, { scale: 0, opacity: 0, rotation: -180 });
    gsap.set(textWrapperRef.current, { width: 0, opacity: 0 }); 
    gsap.set(buttonsRef.current, { y: -20, opacity: 0 });
    gsap.set(tableRef.current, { y: -50, opacity: 0 }); // Table from top
    gsap.set(statsRef.current, { y: 50, opacity: 0 }); // Stats last

    // Sequence
    tl.to(logoRef.current, { 
      duration: 0.8, 
      scale: 1, 
      opacity: 1, 
      rotation: 0, 
      ease: "back.out(1.7)" 
    })
    .to(textWrapperRef.current, {
      duration: 1,
      width: "auto",
      opacity: 1,
      ease: "power3.inOut"
    }, "-=0.2") // Overlap slightly with logo
    .to(buttonsRef.current, {
      duration: 0.5,
      y: 0,
      opacity: 1,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.2")
    .to(tableRef.current, {
        duration: 0.8,
        y: 0,
        opacity: 1,
        ease: "power3.out"
    }, "-=0.1")
    .to(statsRef.current, {
        duration: 0.8,
        y: 0,
        opacity: 1,
        ease: "power3.out"
    }, "-=0.4"); // Stats start appearing as table settles

  }, { scope: containerRef, dependencies: [isLoading] });


  if (isLoading) {
      return (
          <>
            <Background3D />
            <Loader fullscreen message="Accessing Mainframe..." />
          </>
      )
  }

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
    <div ref={containerRef} className="min-h-screen text-white transition-colors duration-200 relative overflow-hidden">
      <Background3D />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 backdrop-blur-[1px] bg-white/[0.03] p-4 rounded-xl border border-white/10 shadow-lg ring-1 ring-white/5 gap-4 md:gap-0">
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <span ref={logoRef} className="text-4xl p-1 inline-block">🤖</span>
            <div ref={textWrapperRef} className="overflow-hidden whitespace-nowrap">
                <h1 ref={textRef} className="text-2xl md:text-3xl p-1 font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,#818cf8,#c084fc,#818cf8)] bg-[length:200%_auto] animate-text-shimmer drop-shadow-sm underline text-center md:text-left">
                Automated Chaser Agent
                </h1>
            </div>
          </div>
          
          <div ref={buttonsRef} className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end opacity-0">

            <button 
              onClick={handleSmartCheck}
              className="flex-1 md:flex-none justify-center px-4 py-2 bg-purple-600/40 hover:bg-purple-700/60 backdrop-blur-sm text-white rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2 border border-white/10 whitespace-nowrap"
            >
              <span>🚀</span> Chase All
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="flex-1 md:flex-none justify-center px-4 py-2 bg-blue-600/40 hover:bg-blue-700/60 backdrop-blur-sm text-white rounded-lg shadow-md transition-all hover:scale-105 border border-white/10 whitespace-nowrap"
            >
              + Add Task
            </button>
          </div>
        </header>

        {/* Stats Dashboard */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 opacity-0">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg hover:bg-white/10 transition-colors">
             <div className="text-gray-400 text-sm font-medium mb-1">Total Tasks</div>
             <div className="text-3xl font-bold text-white">
                 <ScrollingNumber value={tasks.length} direction="up" />
             </div>
          </div>
          <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 shadow-lg hover:bg-green-500/20 transition-colors">
             <div className="text-green-300 text-sm font-medium mb-1">Completed</div>
             <div className="text-3xl font-bold text-green-400">
               <ScrollingNumber value={tasks.filter((t: any) => t.status === 'COMPLETED').length} direction="down" />
             </div>
          </div>
          <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-4 shadow-lg hover:bg-yellow-500/20 transition-colors">
             <div className="text-yellow-300 text-sm font-medium mb-1">Pending</div>
             <div className="text-3xl font-bold text-yellow-400">
               <ScrollingNumber value={tasks.filter((t: any) => t.status !== 'COMPLETED').length} direction="up" />
             </div>
          </div>
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 shadow-lg hover:bg-red-500/20 transition-colors">
             <div className="text-red-300 text-sm font-medium mb-1">Overdue (Pending)</div>
             <div className="text-3xl font-bold text-red-400">
               <ScrollingNumber value={tasks.filter((t: any) => {
                 const isOverdue = new Date(t.due_date) < new Date() && t.status !== 'COMPLETED';
                 return isOverdue;
               }).length} direction="down" />
             </div>
          </div>
        </div>

         <main ref={tableRef} className="opacity-0 mb-8">
            <div className="bg-black/30 rounded-xl shadow-2xl overflow-hidden border border-white/5 ring-1 ring-white/5 max-h-[60vh] overflow-y-auto">
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
