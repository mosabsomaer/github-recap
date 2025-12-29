
export default function Slide1({ color = "#3b82f6" }: { color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4 font-extrabold text-white perspective-1000">
      
      {/* TV Assembly */}
      <div className="relative w-full max-w-[600px] aspect-4/3 flex items-center justify-center mb-8">
        
        {/* The TV Frame */}
        <img 
            src="/tv.png" 
            alt="Retro TV" 
            className="absolute inset-0 z-10 object-contain pointer-events-none size-full drop-shadow-2xl"
        />

        {/* The Video Screen */}
        {/* Positioned and sized to fit inside a standard retro TV bezel */}
        <div className="relative z-20 w-[60%] h-[61%] bg-black shadow-[inset_0_0_20px_rgba(0,0,0,1)] bottom-9 left-4">
             <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="object-cover size-full contrast-125 saturate-150"
            >
                <source src="/git_contrib_heatmap.webm" type="video/webm" />
            </video>
        </div>

      </div>

      {/* Text Section */}
      <div className="relative z-30 flex flex-col items-center gap-4 -mt-4 text-center">
        <h1 
          className="text-3xl sm:text-5xl md:text-6xl font-['Orbitron'] font-black tracking-widest text-transparent bg-clip-text "
          style={{ 
            filter: `drop-shadow(0 0 25px ${color}66)`,
                        backgroundColor: color,

          }}
        >
          LIBYAN DEVELOPERS
        </h1>
        <div 
          className="w-32 h-1 rounded-full"
          style={{ 
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`
          }}
        ></div>
        <h2 
          className="text-sm sm:text-lg md:text-xl font-['Press_Start_2P'] drop-shadow-md tracking-wider mt-2"
          style={{ color: `${color}cc` }}
        >
          GITHUB RECAP
        </h2>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
}
