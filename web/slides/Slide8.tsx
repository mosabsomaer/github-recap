import recapData from "../../data/analysis/recap2025.json";

export default function Slide8({ color }: { color: string }) {
  const topFollowers = (recapData as any).topDevelopers.byFollowers.slice(0, 3);
  
  // Podium Order: 3rd (Left), 1st (Center), 2nd (Right)
  const first = topFollowers[0];
  const second = topFollowers[1];
  const third = topFollowers[2];

  const PodiumItem = ({ data, rank, heightClass, delay }: { data: any, rank: string, heightClass: string, delay: string }) => (
    <div className={`flex flex-col items-center justify-end ${heightClass} w-1/3 max-w-[200px] ${delay} animate-[slideUp_1s_ease-out_forwards] opacity-0`} style={{ animationFillMode: 'forwards' }}>
      
      {/* Avatar & Info */}
      <div className="flex flex-col items-center mb-6 animate-[fadeIn_0.5s_ease-out_1s_forwards] opacity-0 w-full relative z-10">
        <a 
            href={`https://github.com/${data.login}`} 
            target="_blank" 
            rel="noreferrer" 
            className="relative block group"
        >
            <div className="absolute transition-opacity duration-300 bg-black opacity-50 -inset-1"></div>
            <img 
                src={data.avatar_url} 
                alt={data.login} 
                className="relative object-cover w-16 h-16 transition-transform duration-300 bg-black border-2 rounded-sm md:w-24 md:h-24 hover:scale-105"
                style={{ borderColor: color }}
            />
        </a>
        <a 
            href={`https://github.com/${data.login}`} 
            target="_blank" 
            rel="noreferrer"
            className="mt-3 text-[10px] md:text-xs font-['Press_Start_2P'] text-white hover:text-white/80 transition-all text-center truncate w-full px-1"
            style={{ textShadow: `2px 2px 0px #000` }}
        >
            @{data.login}
        </a>
        <span className="text-[8px] md:text-[10px] font-['Orbitron'] text-slate-400 mt-2 tracking-widest">{data.followers} FOLLOWERS</span>
      </div>

      {/* Podium Block - Sharp edges */}
      <div 
        className="relative flex items-end justify-center w-full pb-4 border-t-2 backdrop-blur-md border-x-2"
        style={{ 
            backgroundColor: `${color}15`,
            borderColor: color,
            height: '100%',
            boxShadow: `0 0 20px ${color}10`
        }}
      >
         {/* Rank Number on Stand */}
         <span 
            className="text-4xl md:text-6xl font-['Orbitron'] font-black select-none absolute bottom-4 opacity-30"
            style={{ color: color }}
        >
            {rank}
         </span>
         
         {/* Internal grid lines for retro feel */}
         <div className="absolute inset-0 w-full h-full opacity-10 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,0.3)_25%,rgba(255,255,255,0.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,0.3)_75%,rgba(255,255,255,0.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,0.3)_25%,rgba(255,255,255,0.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,0.3)_75%,rgba(255,255,255,0.3)_76%,transparent_77%,transparent)] bg-[length:20px_20px]"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full h-full pb-8">
      {/* Container for podium */}
      <div className="flex items-end justify-center w-full max-w-4xl h-[70%] gap-4 md:gap-8 relative z-10">
        <PodiumItem 
            data={third} 
            rank="3" 
            heightClass="h-[45%]" 
            delay="animation-delay-400"
        />
        <PodiumItem 
            data={first} 
            rank="1" 
            heightClass="h-[75%]" 
            delay="animation-delay-0"
        />
        <PodiumItem 
            data={second} 
            rank="2" 
            heightClass="h-[60%]" 
            delay="animation-delay-200"
        />
      </div>
      
      {/* The Floor Line */}
      <div className="relative z-0 w-full h-1 max-w-5xl mt-0" style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}></div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animation-delay-0 { animation-delay: 0.1s; }
        .animation-delay-100 { animation-delay: 0.3s; }
        .animation-delay-200 { animation-delay: 0.5s; }
      `}</style>
    </div>
  );
}