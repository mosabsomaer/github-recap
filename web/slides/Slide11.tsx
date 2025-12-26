import { useRef, useState } from "react";
import { FaCode, FaCss3Alt, FaHtml5, FaJava, FaJs, FaPhp, FaPython, FaRust } from "react-icons/fa";
import recapData from "../../data/analysis/recap2025.json";

export default function Slide11({ color }: { color: string }) {
  const topForks = (recapData as any).topRepos.byForks;
  const [currentIndex, setCurrentIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
  

  const handleNext = () => {
    playSound();
    setCurrentIndex((prev) => (prev + 1) % topForks.length);
  };

  const repo = topForks[currentIndex];
  const [owner, name] = repo.full_name.split("/");

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };
  // Helper for language icons
  const getLangIcon = (lang: string | null) => {
    if (!lang) return <FaCode />;
    const l = lang.toLowerCase();
    if (l.includes("python")) return <FaPython />;
    if (l.includes("java") && !l.includes("script")) return <FaJava />;
    if (l.includes("javascript") || l.includes("js")) return <FaJs />;
    if (l.includes("rust")) return <FaRust />;
    if (l.includes("php")) return <FaPhp />;
    if (l.includes("html")) return <FaHtml5 />;
    if (l.includes("css")) return <FaCss3Alt />;
    return <FaCode />;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4">
      <h2 
        className="text-2xl md:text-4xl font-['Orbitron'] font-bold mb-12 drop-shadow-md text-center"
        style={{ color: color, textShadow: `0 0 20px ${color}60` }}
      >
        TOP FORKED REPOS
      </h2>

      <div 
        className="relative flex flex-col w-full max-w-4xl overflow-hidden transition-all duration-300 bg-black border-2 shadow-2xl md:flex-row group"
        style={{ borderColor: color, boxShadow: `10px 10px 0px ${color}20` }}
      >

        <div className="flex-1 pl-16 pr-16 py-8 md:py-12 flex flex-col justify-center relative min-h-[350px]">
            <div className="z-10 animate-[fadeIn_0.3s_ease-out]" key={currentIndex}>
                
                {/* Header: Rank and Forks */}
                <div className="flex items-start justify-between pb-4 mb-6 border-b-2" style={{ borderColor: `${color}20` }}>
                    <div 
                        className="text-xs font-['Press_Start_2P'] tracking-widest mt-1"
                        style={{ color: color }}
                    >
                        RANK #{currentIndex + 1}
                    </div>
                    
                    {/* Dominant Fork Count */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-['Press_Start_2P'] text-slate-500">FORKS</span>
                        <div 
                            className="text-4xl md:text-5xl font-['Press_Start_2P']"
                            style={{ color: color, textShadow: `4px 4px 0px #000` }}
                        >
                            {repo.forks}
                        </div>
                    </div>
                </div>

                {/* Repo Name & Owner */}
                <div className="mb-6">
                    <div className="text-sm text-slate-500 font-['Press_Start_2P'] mb-2 flex items-center gap-2">
                        {owner} /
                    </div>
                    <a 
                        href={`https://github.com/${repo.full_name}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-3xl md:text-5xl font-['Orbitron'] font-black hover:underline break-words block leading-tight"
                        style={{ color: '#fff', textDecorationColor: color }}
                    >
                        {name}
                    </a>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {repo.language && (
                        <span 
                            className="px-3 py-2 bg-slate-900 text-xs font-['Press_Start_2P'] flex items-center gap-2 border"
                            style={{ borderColor: `${color}40`, color: color }}
                        >
                            {getLangIcon(repo.language)}
                            {repo.language}
                        </span>
                    )}
                    <span 
                        className="px-3 py-2 bg-slate-900 text-xs font-['Press_Start_2P'] text-slate-300 border border-slate-800"
                    >
                       {repo.commits ?? 0} COMMITS
                    </span>
                </div>

                {/* Description */}
                <p 
                    className="text-slate-400 font-['Inter'] leading-relaxed text-sm md:text-base bg-white/5 p-4 border-l-4"
                    style={{ borderColor: color }}
                >
                    {repo.description || "No description provided."}
                </p>
            </div>
        </div>

        <button 
            onClick={handleNext}
            className="absolute top-0 bottom-0 right-0 z-20 flex items-center justify-center w-12 text-white transition-colors border-l-2 hover:bg-white/5"
            style={{ borderColor: `${color}20` }}
        >
            <span className="font-['Press_Start_2P'] text-lg opacity-50 hover:opacity-100">&gt;</span>
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex gap-3 mt-8">
        {topForks.map((_: any, idx: number) => (
            <div 
                key={idx} 
                className={`h-2 transition-all duration-300 cursor-pointer ${idx === currentIndex ? 'w-8' : 'w-2 hover:bg-slate-600'}`}
                style={{ backgroundColor: idx === currentIndex ? color : '#334155' }}
                onClick={() => { playSound(); setCurrentIndex(idx); }}
            />
        ))}
      </div>
    </div>
  );
}