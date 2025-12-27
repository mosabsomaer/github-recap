
export default function Slide9({ color }: { color: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center px-4">
      <div 
        className="z-10 p-8 text-center border-4 shadow-2xl md:p-12 bg-black/80 backdrop-blur"
        style={{ 
            borderColor: color,
            boxShadow: `0 0 50px ${color}40, inset 0 0 20px ${color}20`
        }}
      >
        <h1 className="text-2xl md:text-5xl font-['Orbitron'] font-bold text-white mb-4 tracking-widest">
          CONTRIBUTION
        </h1>
        <h1 
            className="text-4xl md:text-7xl font-['Orbitron'] font-black drop-shadow-xl"
            style={{ color: color, textShadow: `0 0 30px ${color}` }}
        >
          LEGENDS
        </h1>
        
        <div 
            className="w-full h-2 mt-8 mb-8"
            style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
        ></div>
        
        <p className="text-xs md:text-lg font-pixel text-slate-400 animate-pulse">
          THE CODE MACHINES
        </p>
      </div>
    </div>
  );
}