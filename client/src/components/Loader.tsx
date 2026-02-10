


interface LoaderProps {
  fullscreen?: boolean;
  message?: string;
}

export function Loader({ fullscreen = false, message = "Loading..." }: LoaderProps) {
  const containerClasses = fullscreen 
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="relative w-24 h-24">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-[spin_1.5s_linear_infinite]"></div>
        
        {/* Inner Ring */}
        <div className="absolute inset-4 border-4 border-purple-500/30 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
        <div className="absolute inset-4 border-b-4 border-purple-500 rounded-full animate-[spin_1s_linear_infinite_reverse]"></div>
        
        {/* Core Pulse */}
        <div className="absolute inset-0 m-auto w-4 h-4 bg-white rounded-full animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
      </div>
      
      {/* Loading Text */}
      <div className="mt-2 ml-2 text-center">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse">
          {message}
        </h3>
        {fullscreen && (
            <p className="text-gray-400 text-sm mt-2">Initializing System Agents...</p>
        )}
      </div>
    </div>
  );
}
