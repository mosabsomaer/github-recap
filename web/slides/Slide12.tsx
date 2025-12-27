import { useEffect, useMemo, useRef, useState } from "react";
import usersData from "../../data/users.json";

export default function Slide12({ color }: {
  color: string;
}) {
  // --- Internal Sound Logic ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioDuration = 5; // MP3 is 5 seconds long
  const safeEndBuffer = 0.5; // Don't start in the last 0.5 seconds
  const shakeDuration = 800; // Animation duration in ms

  useEffect(() => {
    audioRef.current = new Audio('/rolling-dice.mp3');
    audioRef.current.volume = 1;
  }, []);

  const playRandomSegment = () => {
    if (audioRef.current) {
      // Calculate max start time: duration - shake time - end buffer
      const maxStartTime = audioDuration - (shakeDuration / 1000) - safeEndBuffer;
      const randomStart = Math.random() * maxStartTime;

      audioRef.current.currentTime = randomStart;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // --- Data Logic ---
  const bios = useMemo(() => {
    return Object.values(usersData as Record<string, any>)
      .filter((u) => u.bio && u.bio.trim().length > 0 ) // Shorter bios fit better on the triangle
      .map((u) => ({
        bio: u.bio,
        login: u.login,
      }));
  }, []);

  const [currentBio, setCurrentBio] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleShake = () => {
    if (isShaking || bios.length === 0) return;

    playRandomSegment();
    setIsShaking(true);
    setIsRevealing(true);

    // Clear current bio immediately to simulate the die sinking
    setCurrentBio(null);

    // Shake animation duration
    setTimeout(() => {
      setIsShaking(false);
      stopSound();

      // Select random bio
      const random = bios[Math.floor(Math.random() * bios.length)];
      setCurrentBio(random.bio);

      // Allow the "float up" animation to complete
      setTimeout(() => {
        setIsRevealing(false);
      }, 100);
    }, shakeDuration);
  };

  // --- Render ---
  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl gap-12 px-6 py-16 mx-auto">

      {/* Title */}
      <div className="z-10 text-center pointer-events-none select-none">
        <h2
          className="text-3xl md:text-5xl font-['Orbitron'] font-bold tracking-widest drop-shadow-md"
          style={{ color: color, textShadow: `0 0 20px ${color}80` }}
        >
          THE ORACLE
        </h2>
        <p
            className=" text-[10px] md:text-xs font-pixel animate-pulse tracking-wider"
            style={{ color: '#fff' }}
        >
            UNCOVER LIBYAN BIOS
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-center">
        
        {/* The Magic 8-Ball Container */}
        <button
            onClick={handleShake}
            disabled={isShaking}
            className={`
                relative w-72 h-72 md:w-96 md:h-96 rounded-full flex items-center justify-center
                bg-black
                shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_-15px_-15px_30px_rgba(255,255,255,0.05),0_0_0_4px_#111]
                transition-transform cursor-pointer
                active:scale-95 hover:shadow-[0_0_40px_rgba(217,70,239,0.2)]
                ${isShaking ? 'animate-shake' : 'animate-float'}
            `}
            style={{ outline: 'none' }}
        >
            {/* Specular Highlight on the Ball */}
            <div className="absolute top-10 right-10 w-24 h-12 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl rotate-[-45deg] pointer-events-none"></div>

            {/* The "Window" - Dark Blue Liquid */}
            <div 
                className="w-36 h-36 md:w-48 md:h-48 rounded-full flex items-center justify-center overflow-hidden relative border-8 border-black/50 shadow-[inset_0_0_20px_#000]"
                style={{
                    background: 'radial-gradient(circle at center, #172554 0%, #020617 90%)', // Blue-950 to Slate-950
                }}
            >
                {/* The Floating Die (Triangle) */}
                <div 
                    className={`
                        relative flex items-center justify-center text-center
                        transition-all duration-1000 ease-out
                        ${isRevealing || !currentBio ? 'opacity-0 scale-50 blur-sm translate-y-8' : 'opacity-100 scale-100 blur-0 translate-y-0'}
                    `}
                    style={{
                        width: 0,
                        height: 0,
                        // CSS Triangle Logic
                        borderLeft: '65px solid transparent',
                        borderRight: '65px solid transparent',
                        borderTop: '110px solid #2563eb', // Blue-600
                        filter: 'drop-shadow(0 0 10px rgba(37, 99, 235, 0.5))',
                        transformOrigin: 'center top'
                    }}
                >
                    {/* Text Container - Absolute positioned to center in the inverted triangle */}
                    {/* The triangle points down, so we position text "above" the point (which is 0,0 locally) */}
                    <div 
                        className="absolute -top-[105px] -left-[65px] w-[130px] h-[80px] flex items-center justify-center px-2 py-1 overflow-hidden"
                    >
                        {currentBio && (
                            <p 
                                className="w-full text-[8px] leading-tight text-center text-blue-100 break-words font-pixel"
                                style={{ 
                                    textShadow: '1px 1px 0px #1e3a8a',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 8,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}
                            >
                                {currentBio}
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Liquid Glare/Reflection */}
                <div className="absolute top-0 left-0 w-full h-full rounded-full pointer-events-none bg-gradient-to-b from-white/5 to-transparent mix-blend-overlay"></div>
            </div>

            {/* Instruction Tooltip (Below) */}
            {!isShaking && !currentBio && (
                 <div 
                    className="absolute text-lg rounded-full -bottom-12 md:-bottom-16 whitespace-nowrap font-pixel animate-bounce bg-black/80 backdrop-blur-sm"
                    style={{ color: color }}
                 >
                    SHAKE ME!
                 </div>
            )}
        </button>

      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-shake {
          animation: shake 0.4s linear infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}