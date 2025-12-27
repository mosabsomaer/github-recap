import recapData from "../../data/analysis/recap2025.json";

export default function Slide10({ color }: { color: string }) {
  const topContributors = (recapData as any).topDevelopers.byContributions.slice(0, 10);
  const maxContrib = topContributors[0].totalContributions;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-4xl ">
      <div className="flex flex-col w-full max-h-full gap-3 pr-2 overflow-y-auto md:gap-4 custom-scrollbar">
        {topContributors.map((dev: any, index: number) => {
          const percentage = (dev.totalContributions / maxContrib) * 100;
          return (
            <div key={dev.login} className="flex items-center w-full gap-4 group">
              <div 
                className="w-8 text-right font-pixel text-[10px] md:text-xs"
                style={{ color: index < 3 ? color : '#64748b' }}
              >
                #{index + 1}
              </div>
              
              <a href={`https://github.com/${dev.login}`} target="_blank" rel="noreferrer" className="shrink-0">
                  <img 
                    src={dev.avatar_url} 
                    alt={dev.login} 
                    className="object-cover w-8 h-8 transition-colors bg-black border-2 md:w-10 md:h-10"
                    style={{ borderColor: `${color}40`, borderRadius: '0px' }} 
                  />
              </a>

              <div className="flex flex-col justify-center flex-1">
                <div className="flex items-end justify-between mb-1">
                    <a 
                        href={`https://github.com/${dev.login}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="font-['Orbitron'] font-bold text-xs md:text-sm text-white hover:text-white/80 transition-colors tracking-wide"
                    >
                        {dev.login}
                    </a>
                    <span 
                        className="font-pixel text-[8px] md:text-[10px]"
                        style={{ color: color }}
                    >
                        {dev.totalContributions.toLocaleString()}
                    </span>
                </div>
                {/* The Bar - Pixel Style (No rounded corners) */}
                <div className="relative w-full h-3 bg-black border md:h-4 border-slate-800">
                    <div 
                        className="relative h-full overflow-hidden transition-all duration-1000"
                        style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: color, // Use pure color, not gradient, for retro feel
                            boxShadow: `0 0 5px ${color}40` 
                        }}
                    >
                         {/* Diagonal hatch pattern overlay */}
                        <div className="absolute inset-0 w-full h-full opacity-30" 
                             style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '4px 4px' }}>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
       <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${color}; 
        }
      `}</style>
    </div>
  );
}