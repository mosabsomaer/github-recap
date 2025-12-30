import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [frame, setFrame] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  // Wave from light to heavy characters and back
  const chars = ['.','.','.','.','.', '-', '=', '≡','≡','≡', '=', '-'];
  const barWidth = 15;

  useEffect(() => {
    // Check if already loaded
    if (document.readyState === 'complete') {
      setIsLoading(true);
      return;
    }

    const handleLoad = () => {
      setIsLoading(false);
    };

    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => {
        setVisible(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % chars.length);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  // Build wave pattern (right to left)
  const wave = Array(barWidth).fill(0).map((_, i) => {
    const charIndex = ((i - frame) % chars.length + chars.length) % chars.length;
    return chars[charIndex];
  }).join(' ');

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col gap-7 items-center justify-center bg-black transition-opacity duration-500 ${
        !isLoading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <pre className="font-mono text-lg tracking-wider text-white select-none md:text-2xl">
        {wave}
      </pre>
      <p className="text-sm tracking-widest font-pixel text-white/60">
        Loading...
      </p>
    </div>
  );
}
