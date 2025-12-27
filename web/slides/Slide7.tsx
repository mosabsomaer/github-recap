
export default function Slide7({ color }: { color: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center px-4 overflow-hidden text-white">
      <div className="relative z-10 text-center">
        {/* Decorative elements */}
        <div className="absolute text-6xl -translate-x-1/2 opacity-50 -top-20 left-1/2 animate-pulse" style={{ color }}>
            ✦
        </div>

        <h1 
            className="text-4xl md:text-7xl font-['Orbitron'] font-black leading-tight drop-shadow-[0_0_25px_rgba(0,0,0,0.8)]"
            style={{ 
                color: color,
                textShadow: `0 0 40px ${color}80`
            }}
        >
          DEVELOPER<br/>STARS
        </h1>
        
        <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-0.5 w-12 md:w-24 bg-current" style={{ color }}></div>
            <h2 
                className="text-lg md:text-2xl font-pixel tracking-widest uppercase"
                style={{ color: '#fff' }}
            >
            Of The Year
            </h2>
            <div className="h-0.5 w-12 md:w-24 bg-current" style={{ color }}></div>
        </div>
      </div>
    </div>
  );
}