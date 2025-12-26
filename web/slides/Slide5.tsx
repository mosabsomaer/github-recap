export default function Slide5({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6 px-8">
      <h1
        className="text-4xl font-bold tracking-wider text-center sm:text-5xl md:text-7xl lg:text-8xl font-orbitron"
        style={{ color }}
      >
        LIBYA’S BUSIEST & <br/> QUIETEST DAYS
      </h1>
      <p
        className="max-w-2xl text-base tracking-wide text-center sm:text-lg md:text-xl font-pixel opacity-70"
        style={{ color }}
      >
        Contribution highs and lows from Libyan developers in 2025
      </p>
    </div>
  );
}
