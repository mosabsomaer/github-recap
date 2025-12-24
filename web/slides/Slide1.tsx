export default function Slide1({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full font-extrabold" style={{ color: color }}>
      <h1 className="text-3xl leading-relaxed text-center sm:text-6xl font-orbitron">
        LIBYAN DEVELOPER
      </h1>
      <h2 className="text-3xl leading-relaxed text-center font-orbitron sm:text-6xl"
       >
        GITHUB RECAP
      </h2>
      <p className="mt-4 text-lg text-center font-pixel md:text-2xl">
        Your Year in Code
      </p>
    </div>
  );
}
