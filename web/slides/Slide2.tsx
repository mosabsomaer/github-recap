import { useState } from "react";
import recapData from "../../data/analysis/recap2025.json";

export default function Slide2({ color }: { color: string }) {
  const { summary, funStats } = recapData as any;
  const [factIndex, setFactIndex] = useState(0);

  const nextFact = () => {
    setFactIndex((prev) => (prev + 1) % funStats.epicComparisons.length);
  };

  return (
    <div className="relative flex flex-col items-center justify-center max-w-5xl px-4">
      <div className="mb-10 text-center shrink-0">
        <h2 
            className="text-3xl md:text-5xl font-['Orbitron'] font-bold tracking-wider mb-2 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            style={{ color: color }}
        >
          THE NUMBERS
        </h2>
        <div 
            className="w-32 h-1 mx-auto rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        ></div>
      </div>

      <div className="flex flex-col items-stretch justify-center w-full gap-8 mb-12 md:flex-row">
        {/* Total Repos */}
        <div 
            className="flex flex-col items-center justify-center flex-1 p-8 transition-all duration-500 border-2 bg-black/40 backdrop-blur-md rounded-xl group"
            style={{ 
                borderColor: `${color}40`,
                boxShadow: `0 0 30px ${color}20, inset 0 0 20px ${color}10`
            }}
        >
          <span 
            className="text-6xl md:text-8xl font-['Orbitron'] font-black drop-shadow-lg transition-transform group-hover:scale-110 duration-300"
            style={{ 
                color: 'transparent', 
                WebkitTextStroke: `2px ${color}`,
                textShadow: `0 0 20px ${color}60`
            }}
          >
            {summary.totalRepos}
          </span>
          <span className="mt-6 text-sm md:text-base font-['Press_Start_2P'] uppercase tracking-widest text-slate-300">
            Total Repos
          </span>
        </div>

        {/* Total Contributions */}
        <div 
            className="flex flex-col items-center justify-center flex-1 p-8 transition-all duration-500 border-2 bg-black/40 backdrop-blur-md rounded-xl group"
            style={{ 
                borderColor: `${color}40`,
                boxShadow: `0 0 30px ${color}20, inset 0 0 20px ${color}10`
            }}
        >
          <span 
            className="text-5xl md:text-7xl font-['Orbitron'] font-black drop-shadow-lg transition-transform group-hover:scale-110 duration-300"
            style={{ 
                color: color, 
                textShadow: `0 0 30px ${color}80`
            }}
          >
            {summary.totalContributions.toLocaleString()}
          </span>
          <span className="mt-6 text-sm md:text-base font-['Press_Start_2P'] uppercase tracking-widest text-slate-300 text-center">
            Contributions
          </span>
        </div>
      </div>

      {/* Fun Facts Section */}
      <div 
        className="relative w-full max-w-3xl p-6 border-2 border-dashed rounded-lg bg-black/60"
        style={{ borderColor: `${color}60` }}
      >
        <div 
            className="absolute -top-3 left-6 px-3 text-xs font-['Press_Start_2P'] bg-black"
            style={{ color: color }}
        >
          EPIC STATS
        </div>
        
        <div className="min-h-[60px] flex items-center justify-center text-center px-4">
          <p 
            key={factIndex} 
            className="text-base md:text-xl font-['Orbitron'] tracking-wide animate-[fadeIn_0.5s_ease-in-out] text-slate-200"
          >
            {funStats.epicComparisons[factIndex]}
          </p>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={nextFact}
            className="px-6 py-3 font-['Press_Start_2P'] text-[10px] md:text-xs rounded hover:brightness-110 active:translate-y-1 transition-all"
            style={{ 
                backgroundColor: color, 
                color: '#000',
                boxShadow: `4px 4px 0px 0px rgba(255,255,255,0.2)`
            }}
          >
            NEXT FACT &gt;
          </button>
        </div>
      </div>
    </div>
  );
}