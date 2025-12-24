export default function Slide2({ color }: { color: string })  {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <h2 className="text-xl leading-relaxed text-center font-pixel md:text-2xl" style={{ color: color }}>
        CONTRIBUTIONS
      </h2>
      <div className="grid w-full max-w-2xl grid-cols-2 gap-8 mt-4" style={{ color: color }}>
        <div className="p-6 text-center border-2 rounded-lg bg-retro-darker/60 ">
          <p className="mb-2 text-3xl font-pixel md:text-4xl">1,234</p>
          <p className="text-sm font-orbitron md:text-base">Commits</p>
        </div>
        <div className="p-6 text-center border-2 rounded-lg bg-retro-darker/60 border-retro-green">
          <p className="mb-2 text-3xl font-pixel text-retro-green md:text-4xl">56</p>
          <p className="text-sm font-orbitron md:text-base">Pull Requests</p>
        </div>
        <div className="p-6 text-center border-2 rounded-lg bg-retro-darker/60 border-retro-yellow">
          <p className="mb-2 text-3xl font-pixel text-retro-yellow md:text-4xl">89</p>
          <p className="text-sm font-orbitron md:text-base">Issues</p>
        </div>
        <div className="p-6 text-center border-2 rounded-lg bg-retro-darker/60 border-retro-pink">
          <p className="mb-2 text-3xl font-pixel md:text-4xl">12</p>
          <p className="text-sm font-orbitron md:text-base">Repos</p>
        </div>
      </div>
    </div>
  );
}
