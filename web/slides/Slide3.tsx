export default function Slide3({ color }: { color: string })  {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <h2 className="font-pixel text-retro-green text-xl md:text-2xl text-center leading-relaxed drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
        TOP LANGUAGES
      </h2>
      <div className="w-full max-w-2xl mt-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between font-orbitron text-white/90">
            <span>TypeScript</span>
            <span>45%</span>
          </div>
          <div className="w-full h-4 border rounded-full bg-retro-darker/60 border-retro-blue/30">
            <div className="h-full rounded-full bg-gradient-to-r from-retro-blue to-retro-cyan shadow-neon-cyan" style={{ width: '45%' }}></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between font-orbitron text-white/90">
            <span>JavaScript</span>
            <span>30%</span>
          </div>
          <div className="w-full h-4 border rounded-full bg-retro-darker/60 border-retro-yellow/30">
            <div className="h-full rounded-full bg-gradient-to-r from-retro-yellow to-retro-orange shadow-neon-green" style={{ width: '30%' }}></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between font-orbitron text-white/90">
            <span>Python</span>
            <span>15%</span>
          </div>
          <div className="w-full h-4 border rounded-full bg-retro-darker/60 border-retro-green/30">
            <div className="h-full rounded-full bg-gradient-to-r from-retro-green to-retro-cyan shadow-neon-green" style={{ width: '15%' }}></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between font-orbitron text-white/90">
            <span>Go</span>
            <span>10%</span>
          </div>
          <div className="w-full h-4 border rounded-full bg-retro-darker/60 border-retro-purple/30">
            <div className="h-full rounded-full bg-gradient-to-r from-retro-purple to-retro-pink shadow-neon-purple" style={{ width: '10%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
