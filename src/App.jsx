import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MojangLoader from './components/MojangLoader';
import Hero from './components/Hero';
import History from './components/History';
import PlayerProfiles from './components/PlayerProfiles';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

// Generate frame paths - adjust range based on your frames
const FRAME_COUNT = 1368; // Total number of frames
const getFramePath = (index) => {
  // Handle different naming conventions in your frames
  if (index <= 1272) {
    return `/frames/frame_${String(index).padStart(6, '0')}.jpg`;
  } else {
    return `/frames/frame_${String(index).padStart(5, '0')}.jpg`;
  }
};

function App() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isFramesLoaded, setIsFramesLoaded] = useState(false);
  const [showMojangLoader, setShowMojangLoader] = useState(true);
  const frameIndexRef = useRef({ value: 0 });

  // Handle Mojang animation complete
  const handleMojangComplete = () => {
    setShowMojangLoader(false);
  };

  // Preload all images immediately (while Mojang animation plays)
  useEffect(() => {
    const loadedImages = [];
    let loadedCount = 0;

    const preloadImages = () => {
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = getFramePath(i);

        img.onload = () => {
          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));

          if (loadedCount === FRAME_COUNT) {
            setImages(loadedImages);
            setIsFramesLoaded(true);
          }
        };

        img.onerror = () => {
          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));

          if (loadedCount === FRAME_COUNT) {
            setImages(loadedImages);
            setIsFramesLoaded(true);
          }
        };

        loadedImages[i - 1] = img;
      }
    };

    preloadImages();
  }, []);

  // Setup GSAP ScrollTrigger after images are loaded
  useEffect(() => {
    if (!isFramesLoaded || images.length === 0 || showMojangLoader) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(Math.round(frameIndexRef.current.value));
    };

    // Render a specific frame
    const renderFrame = (index) => {
      const clampedIndex = Math.max(0, Math.min(index, images.length - 1));
      const img = images[clampedIndex];

      if (img && img.complete && img.naturalWidth > 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate aspect ratio to cover the canvas
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = canvas.width / canvas.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspect > canvasAspect) {
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgAspect;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgAspect;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }

        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // GSAP ScrollTrigger animation - smoother with higher scrub value
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 5, // Increased for smoother scrolling (was 3)
      }
    });

    tl.to(frameIndexRef.current, {
      value: FRAME_COUNT - 1,
      ease: 'none',
      onUpdate: () => {
        renderFrame(Math.round(frameIndexRef.current.value));
      }
    });

    // Render first frame initially
    renderFrame(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isFramesLoaded, images, showMojangLoader]);

  // Show Mojang loader first (frames load in background)
  if (showMojangLoader) {
    return <MojangLoader onComplete={handleMojangComplete} isContentLoaded={isFramesLoaded} />;
  }

  return (
    <div className="app">
      {/* Main Scroll Container */}
      <div
        ref={containerRef}
        className="scroll-container"
      >
        {/* Fixed Canvas for Frame Animation */}
        <canvas
          ref={canvasRef}
          className="frame-canvas"
        />

        {/* Dark Semi-Transparent Overlay */}
        <div className="dark-overlay"></div>

        {/* Content Layer - on top of everything */}
        <div className="content-layer">
          {/* Hero Section */}
          <Hero />

          {/* History Section */}
          <History />

          {/* Player Profiles */}
          <PlayerProfiles />
        </div>

        {/* Scroll Height Spacer - Increased for slower/smoother scrolling */}
        <div className="scroll-spacer"></div>
      </div>
    </div>
  );
}

export default App;
