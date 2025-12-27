import { useState } from "react";
import recapData from "../../data/analysis/recap2025.json";

export default function Slide2({ color }: { color: string }) {
  const { summary, funStats } = recapData as any;
  const [factIndex, setFactIndex] = useState(0);

  const nextFact = () => {
    setFactIndex((prev) => (prev + 1) % funStats.epicComparisons.length);
  };

  return (
    <div className="relative flex flex-col items-center justify-center max-w-5xl px-6 gap-12">
      <div className="text-center shrink-0">
        <h2
            className="text-3xl md:text-5xl font-['Orbitron'] font-bold tracking-wider mb-3 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            style={{ color: color }}
        >
          THE NUMBERS
        </h2>
        <div
            className="w-32 h-1 mx-auto rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        ></div>
      </div>

      <div className="flex flex-col items-stretch justify-center w-full gap-8 md:gap-10 md:flex-row">
        {/* Total Repos */}
        <div
            className="flex flex-col items-center justify-center flex-1 p-10 md:p-12 transition-all duration-500 border-2 bg-black/40 backdrop-blur-md rounded-xl group"
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
          <span className="mt-8 text-sm tracking-widest uppercase md:text-base font-pixel text-slate-300">
            Total Repos
          </span>
        </div>

        {/* Total Contributions */}
        <div
            className="flex flex-col items-center justify-center flex-1 p-10 md:p-12 transition-all duration-500 border-2 bg-black/40 backdrop-blur-md rounded-xl group"
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
          <span className="mt-8 text-sm tracking-widest text-center uppercase md:text-base font-pixel text-slate-300">
            Contributions
          </span>
        </div>
      </div>

      {/* Fun Facts Section */}
      <div
        className="relative w-full max-w-2xl p-8 border-2 border-dashed rounded-lg bg-black/60"
        style={{ borderColor: `${color}60` }}
      >
        <div
            className="absolute px-3 text-xs bg-black -top-3 left-6 font-pixel"
            style={{ color: color }}
        >
          EPIC STATS
        </div>

        <div className="min-h-[70px] flex items-center justify-center text-center px-6">
          <p
            key={factIndex}
            className="text-base md:text-xl font-['Orbitron'] tracking-wide animate-[fadeIn_0.5s_ease-in-out] text-slate-200"
          >
            {funStats.epicComparisons[factIndex]}
          </p>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={nextFact}
            className="flex items-center gap-2 px-10 py-4 font-pixel text-[10px] md:text-xs rounded cursor-pointer hover:brightness-110 active:translate-y-1 transition-all"
            style={{
                backgroundColor: color,
                color: '#000',
                boxShadow: `4px 4px 0px 0px rgba(255,255,255,0.2)`
            }}
          >
            NEXT FACT
            <span className="inline-block animate-[bounceRight_1s_ease-in-out_infinite]">&gt;</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounceRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}