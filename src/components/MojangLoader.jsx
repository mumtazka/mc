import { useEffect, useRef, useState, useCallback } from 'react';

const FRAMES = 12;           // 12 sprite sheet files
const IMAGE_PER_FRAME = 4;   // 4 sub-frames per sheet (stacked vertically)
const FRAMES_PER_FRAME = 2;  // Each sub-frame displays for 2 ticks
const TOTAL_FRAMES = FRAMES * IMAGE_PER_FRAME * FRAMES_PER_FRAME; // 96 total animation ticks
const ANIMATION_DURATION = 3000; // 3 seconds in ms
const FADE_OUT_DURATION = 1000;  // 1 second fade out
const BG_COLOR = '#ED1C24';     // Mojang red background

// Sprite sheet dimensions
const SHEET_WIDTH = 1024;
const SHEET_HEIGHT = 1024;
const SUB_FRAME_HEIGHT = 256;

function MojangLoader({ onComplete, isContentLoaded = false }) {
    const canvasRef = useRef(null);
    const [sheets, setSheets] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [animationPhase, setAnimationPhase] = useState('loading'); // 'loading' | 'animating' | 'waiting' | 'fadeout' | 'done'
    const animationRef = useRef(null);
    const startTimeRef = useRef(null);
    const fadeStartRef = useRef(null);

    // Preload all sprite sheets
    useEffect(() => {
        const loadedSheets = [];
        let loadedCount = 0;

        for (let i = 0; i < FRAMES; i++) {
            const img = new Image();
            img.src = `/mojang-animation/frame_${i}.png`;

            img.onload = () => {
                loadedCount++;
                setLoadingProgress(Math.round((loadedCount / FRAMES) * 100));

                if (loadedCount === FRAMES) {
                    setSheets(loadedSheets);
                    setIsLoading(false);
                    setAnimationPhase('animating');
                }
            };

            img.onerror = () => {
                loadedCount++;
                console.error(`Failed to load frame_${i}.png`);
                if (loadedCount === FRAMES) {
                    setSheets(loadedSheets);
                    setIsLoading(false);
                    setAnimationPhase('animating');
                }
            };

            loadedSheets[i] = img;
        }
    }, []);

    // Draw a specific animation frame
    const drawFrame = useCallback((ctx, canvas, frameIndex, opacity = 1) => {
        // Calculate which sprite sheet and sub-frame to use
        const sheetIndex = Math.floor(frameIndex / (IMAGE_PER_FRAME * FRAMES_PER_FRAME));
        const subFrameIndex = Math.floor((frameIndex % (IMAGE_PER_FRAME * FRAMES_PER_FRAME)) / FRAMES_PER_FRAME);
        const subFrameY = subFrameIndex * SUB_FRAME_HEIGHT;

        const sheet = sheets[Math.min(sheetIndex, FRAMES - 1)];
        if (!sheet || !sheet.complete) return;

        // Calculate dimensions to maintain aspect ratio
        const screenWidth = canvas.width;
        const screenHeight = canvas.height;
        const logoWidth = screenWidth * 0.5;
        const logoHeight = (logoWidth * SUB_FRAME_HEIGHT) / SHEET_WIDTH;
        const x = (screenWidth - logoWidth) / 2;
        const y = (screenHeight - logoHeight) / 2;

        // Apply opacity
        ctx.globalAlpha = opacity;

        // Draw the sprite from the sheet
        ctx.drawImage(
            sheet,
            0, subFrameY,           // Source x, y
            SHEET_WIDTH, SUB_FRAME_HEIGHT, // Source width, height
            x, y,                   // Destination x, y
            logoWidth, logoHeight   // Destination width, height
        );

        ctx.globalAlpha = 1;
    }, [sheets]);

    // Draw loading bar
    const drawLoadingBar = useCallback((ctx, canvas, progress, opacity = 1) => {
        const screenWidth = canvas.width;
        const screenHeight = canvas.height;

        const barWidth = screenWidth * 0.4;
        const barHeight = 10;
        const barX = (screenWidth - barWidth) / 2;
        const barY = screenHeight * 0.83;

        ctx.globalAlpha = opacity;

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Fill
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * progress, barHeight - 4);

        ctx.globalAlpha = 1;
    }, []);

    // Animation loop
    useEffect(() => {
        if (isLoading || sheets.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const animate = (timestamp) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const elapsed = timestamp - startTimeRef.current;

            // Clear canvas with red background
            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (animationPhase === 'animating') {
                // Calculate current frame based on elapsed time
                const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
                const frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));

                drawFrame(ctx, canvas, frameIndex);

                if (progress >= 1) {
                    // Animation complete - wait for content to load or start fadeout
                    if (isContentLoaded) {
                        setAnimationPhase('fadeout');
                        fadeStartRef.current = timestamp;
                    } else {
                        setAnimationPhase('waiting');
                    }
                }
            } else if (animationPhase === 'waiting') {
                // Freeze on last frame until content is loaded
                drawFrame(ctx, canvas, TOTAL_FRAMES - 1);

                if (isContentLoaded) {
                    setAnimationPhase('fadeout');
                    fadeStartRef.current = timestamp;
                }
            } else if (animationPhase === 'fadeout') {
                const fadeElapsed = timestamp - fadeStartRef.current;
                const fadeProgress = Math.min(fadeElapsed / FADE_OUT_DURATION, 1);
                const opacity = 1 - fadeProgress;

                // Draw last frame with fading opacity
                drawFrame(ctx, canvas, TOTAL_FRAMES - 1, opacity);

                if (fadeProgress >= 1) {
                    setAnimationPhase('done');
                    if (onComplete) {
                        onComplete();
                    }
                    return;
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isLoading, sheets, animationPhase, drawFrame, onComplete]);

    if (animationPhase === 'done') {
        return null;
    }

    return (
        <div className="mojang-loader">
            <canvas ref={canvasRef} className="mojang-canvas" />
        </div>
    );
}

export default MojangLoader;
