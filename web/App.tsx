import { useEffect, useRef, useState } from 'react';
import { FaChartBar, FaChevronLeft, FaChevronRight, FaCode, FaGithub, FaStar } from 'react-icons/fa';
import Slide1 from './slides/Slide1';
import Slide2 from './slides/Slide2';
import Slide3 from './slides/Slide3';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
    audioRef.current = new Audio('/select-button-ui-395763.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

const slideColors = [
  '#0096FF', // Blue
  '#FF006E', // Pink
  '#FFBE0B', // Yellow
  '#00F5D4', // Mint
  '#06D6A0'  // Green
];

  const slides = [
    { component: <Slide1 />, icon: FaStar },
    { component: <Slide2 />, icon: FaCode },
    { component: <Slide3 />, icon: FaChartBar },
  ];

  const nextSlide = () => {
    playSound();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    playSound();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    playSound();
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 z-0 overflow-hidden opacity-20">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 object-cover size-full"
        >
          <source src="/ascii_background.webm" type="video/webm" />
        </video>
        {/* Color mask overlay - changes per slide */}
        <div
          className="absolute inset-0 transition-colors duration-700 mix-blend-multiply opacity-80"
          style={{ backgroundColor: slideColors[currentSlide] }}
        ></div>
      </div>

      <div className="absolute inset-0 z-10 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 md:px-10 md:py-6">
          <div className="w-1/3"></div>

          <div className="flex items-center justify-center w-1/3 gap-3 md:gap-4">
            {slides.map((slide, index) => {
              const Icon = slide.icon;
              const isCurrent = index === currentSlide;
              const isPast = index < currentSlide;

              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="transition-all duration-300"
                >
                  {isPast || isCurrent ? (
                    <div className={`p-3 cursor-pointer rounded-lg transition-all duration-300 ${
                      isCurrent
                        ? 'opacity-100 scale-110'
                        : 'opacity-60 scale-100'
                    }`}
                    style={{
                      backgroundColor: isCurrent ? `${slideColors[currentSlide]}40` : 'rgba(10, 14, 39, 0.4)',
                      borderWidth: isCurrent ? '2px' : '1px',
                      borderColor: isCurrent ? slideColors[currentSlide] : `${slideColors[currentSlide]}30`,
                      boxShadow: isCurrent ? `0 0 20px ${slideColors[currentSlide]}80` : 'none'
                    }}>
                      <Icon className="text-lg transition-colors duration-300 md:text-xl"
                        style={{ color: isCurrent ? slideColors[currentSlide] : `${slideColors[currentSlide]}70` }} />
                    </div>
                  ) : (
                    <div className="transition-all duration-300 border rounded-full size-8 md:w-10 md:h-10 bg-retro-dark/20 opacity-40"
                      style={{ borderColor: `${slideColors[currentSlide]}30` }}></div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end w-1/3 gap-2 md:gap-3">
            <FaGithub className="text-xl transition-colors duration-700 md:text-2xl" style={{ color: slideColors[currentSlide] }} />
            <span className="font-pixel text-[8px] md:text-xs leading-tight hidden sm:block transition-colors duration-700" style={{ color: slideColors[currentSlide] }}>
              LIBYAN<br/>DEVELOPER<br/>RECAP
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center flex-1 px-4 md:px-10">
          <div className="w-[90%] h-[70%] md:w-[80%] md:h-[70%] lg:w-[70%] lg:h-[70%] bg-retro-dark/80 backdrop-blur-lg rounded-2xl border-2 border-retro-purple/30 shadow-2xl shadow-retro-purple/20 p-6 md:p-10 lg:p-16 overflow-auto">
            {slides[currentSlide].component}
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="fixed z-20 p-4 transition-all duration-300 border-2 cursor-pointer group bottom-10 left-10 md:p-5 active:scale-95"
          style={{ borderColor: slideColors[currentSlide], color: slideColors[currentSlide] }}
        >
          <FaChevronLeft className="text-2xl transition-transform group-hover:scale-110" />
        </button>

        <button
          onClick={nextSlide}
          className="fixed z-20 p-4 transition-all duration-300 border-2 cursor-pointer group bottom-10 right-10 md:p-5 active:scale-95"
          style={{ borderColor: slideColors[currentSlide], color: slideColors[currentSlide] }}
        >
          <FaChevronRight className="text-2xl transition-transform group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}

export default App;
