import { useEffect, useRef, useState } from 'react';
import { BiFork } from "react-icons/bi";
import { Bs8CircleFill } from "react-icons/bs";
import { CgUserList } from "react-icons/cg";
import { FaChevronLeft, FaChevronRight, FaCode, FaGithub, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { LuBoxes } from "react-icons/lu";
import { MdOutlineLeaderboard, MdOutlineSubtitles } from "react-icons/md";
import { RiBubbleChartFill, RiPlayCircleLine } from "react-icons/ri";
import Slide1 from './slides/Slide1';
import Slide10 from './slides/Slide10';
import Slide11 from './slides/Slide11';
import Slide12 from './slides/Slide12';
import Slide2 from './slides/Slide2';
import Slide3 from './slides/Slide3';
import Slide4 from './slides/Slide4';
import Slide5 from './slides/Slide5';
import Slide6 from './slides/Slide6';
import Slide7 from './slides/Slide7';
import Slide8 from './slides/Slide8';
import Slide9 from './slides/Slide9';
function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const totalSlides = 12;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
    audioRef.current = new Audio('/select-button-ui-395763.mp3');
    audioRef.current.volume = 0.5;

    // Initialize background music
    bgMusicRef.current = new Audio('/background music.mov');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, []);

  // Update background music volume when muted state changes
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = isMuted ? 0 : 0.3;
    }
  }, [isMuted]);

  const startBackgroundMusic = () => {
    if (bgMusicRef.current && bgMusicRef.current.paused) {
      bgMusicRef.current.play().catch(err => console.log('Background music play failed:', err));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => console.log('Audio play failed:', err));
        }
        if (bgMusicRef.current && bgMusicRef.current.paused) {
          bgMusicRef.current.play().catch(err => console.log('Background music play failed:', err));
        }
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      } else if (e.key === 'ArrowLeft') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => console.log('Audio play failed:', err));
        }
        if (bgMusicRef.current && bgMusicRef.current.paused) {
          bgMusicRef.current.play().catch(err => console.log('Background music play failed:', err));
        }
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

const slideColors = [
  '#0096FF', // Blue - Slide 1
  '#FF006E', // Pink - Slide 2
  '#FFBE0B', // Yellow - Slide 3 (title)
  '#FFBE0B', // Yellow - Slide 4 (chart)
  '#00F5D4', // Mint - Slide 5 (title)
  '#00F5D4', // Mint - Slide 6 (chart)
  '#FF006E', // Pink - Slide 7
  '#FF006E', // Pink - Slide 8
  '#FFBE0B', // Yellow - Slide 9
  '#FFBE0B', // Yellow - Slide 10
  '#FF006E', // Mint - Slide 11
  '#D946EF', // Purple - Slide 12
];

  const slides = [
    { component: <Slide1 color={slideColors[currentSlide]} />, icon: RiPlayCircleLine },
    { component: <Slide2 color={slideColors[currentSlide]}/>, icon: FaCode },
    { component: <Slide3 color={slideColors[currentSlide]}/>, icon: MdOutlineSubtitles },
    { component: <Slide4 color={slideColors[currentSlide]}/>, icon: RiBubbleChartFill },
    { component: <Slide5 color={slideColors[currentSlide]}/>, icon: MdOutlineSubtitles },
    { component: <Slide6 color={slideColors[currentSlide]}/>, icon: LuBoxes },
    { component: <Slide7 color={slideColors[currentSlide]}/>, icon: MdOutlineSubtitles },
    { component: <Slide8 color={slideColors[currentSlide]}/>, icon: MdOutlineLeaderboard },
    { component: <Slide9 color={slideColors[currentSlide]}/>, icon: MdOutlineSubtitles },
    { component: <Slide10 color={slideColors[currentSlide]}/>, icon: CgUserList },
    { component: <Slide11 color={slideColors[currentSlide]}/>, icon: BiFork },
    { component: <Slide12 color={slideColors[currentSlide]}/>, icon: Bs8CircleFill },

  ];

  const nextSlide = () => {
    playSound();
    startBackgroundMusic();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    playSound();
    startBackgroundMusic();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    playSound();
    startBackgroundMusic();
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
        {/* Header with slides in center and branding top-right */}
        <div className="relative w-full py-6">
<button
  onClick={() => {
    startBackgroundMusic();
    toggleMute();
  }}
  /* Added flex, items-center, and justify-center. Adjusted padding to p-1 */
  className="fixed flex items-center justify-center p-1 transition-all duration-100 border-2 cursor-pointer size-10 top-9 left-9 active:scale-95 backdrop-blur-sm"
  style={{
    borderColor: slideColors[currentSlide],
    color: slideColors[currentSlide],
    backgroundColor: `${slideColors[currentSlide]}15`,
  }}
>
  {isMuted ? (
    <FaVolumeMute className="text-lg md:text-xl" />
  ) : (
    <FaVolumeUp className="text-lg md:text-xl" />
  )}
</button>

          {/* Slide indicators - centered */}
          <div className="absolute flex items-center gap-3 -translate-x-1/2 left-1/2 top-6 md:gap-4">
            {slides.map((slide, index) => {
              const Icon = slide.icon;
              const isCurrent = index === currentSlide;
              const isPast = index < currentSlide;

              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="transition-all duration-100 active:scale-95"
                >
                  {isPast || isCurrent ? (
                    <div className={`cursor-pointer border-2 size-10 md:size-12 flex items-center justify-center rounded-full transition-all duration-100 ${
                      isCurrent
                        ? 'opacity-100'
                        : 'opacity-60'
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
                    <div className="transition-all duration-100 border-2 rounded-full cursor-pointer size-10 md:size-12"
                      style={{ borderColor: `${slideColors[currentSlide]}40` }}></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Branding - top right */}
          <div className="absolute flex items-center gap-2 top-6 right-6 md:right-10 md:gap-3">
            <FaGithub className="text-xl transition-colors duration-700 md:text-2xl" style={{ color: slideColors[currentSlide] }} />
            <span className="font-pixel text-[8px] md:text-xs leading-tight hidden sm:block transition-colors duration-700" style={{ color: slideColors[currentSlide] }}>
              DEVELOPER<br/>RECAP<br/>LIBYAN
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center flex-1 size-full">
          {slides[currentSlide].component}
        </div>

        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          className="fixed z-20 p-6 transition-all duration-100 border-2 cursor-pointer md:p-8 bottom-8 left-8 md:bottom-12 md:left-12 active:scale-95 active:brightness-110 backdrop-blur-sm"
          style={{
            borderColor: slideColors[currentSlide],
            color: slideColors[currentSlide],
            backgroundColor: `${slideColors[currentSlide]}15`,
            boxShadow: `0 0 25px ${slideColors[currentSlide]}30`
          }}
        >
          <FaChevronLeft className="text-3xl md:text-4xl" />
        </button>

        <button
          onClick={nextSlide}
          className="fixed z-20 p-6 transition-all duration-100 border-2 cursor-pointer md:p-8 bottom-8 right-8 md:bottom-12 md:right-12 active:scale-95 active:brightness-110 backdrop-blur-sm"
          style={{
            borderColor: slideColors[currentSlide],
            color: slideColors[currentSlide],
            backgroundColor: `${slideColors[currentSlide]}15`,
            boxShadow: `0 0 25px ${slideColors[currentSlide]}30`
          }}
        >
          <FaChevronRight className="text-3xl md:text-4xl" />
        </button>
      </div>
    </div>
  );
}

export default App;
