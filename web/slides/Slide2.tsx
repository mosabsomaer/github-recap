export default function Slide2() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <h2 className="font-pixel text-retro-cyan text-xl md:text-2xl text-center leading-relaxed drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
        CONTRIBUTIONS
      </h2>
      <div className="grid grid-cols-2 gap-8 mt-4 w-full max-w-2xl">
        <div className="bg-retro-darker/60 border-2 border-retro-purple rounded-lg p-6 text-center">
          <p className="font-pixel text-retro-purple text-3xl md:text-4xl mb-2">1,234</p>
          <p className="font-orbitron text-white/80 text-sm md:text-base">Commits</p>
        </div>
        <div className="bg-retro-darker/60 border-2 border-retro-green rounded-lg p-6 text-center">
          <p className="font-pixel text-retro-green text-3xl md:text-4xl mb-2">56</p>
          <p className="font-orbitron text-white/80 text-sm md:text-base">Pull Requests</p>
        </div>
        <div className="bg-retro-darker/60 border-2 border-retro-yellow rounded-lg p-6 text-center">
          <p className="font-pixel text-retro-yellow text-3xl md:text-4xl mb-2">89</p>
          <p className="font-orbitron text-white/80 text-sm md:text-base">Issues</p>
        </div>
        <div className="bg-retro-darker/60 border-2 border-retro-pink rounded-lg p-6 text-center">
          <p className="font-pixel text-retro-pink text-3xl md:text-4xl mb-2">12</p>
          <p className="font-orbitron text-white/80 text-sm md:text-base">Repos</p>
        </div>
      </div>
    </div>
  );
}
