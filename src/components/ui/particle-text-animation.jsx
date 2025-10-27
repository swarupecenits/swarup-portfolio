import React, { useEffect, useRef } from "react"

"use client"

class Particle {
    constructor() {
        this.pos = { x: 0, y: 0 }
        this.vel = { x: 0, y: 0 }
        this.acc = { x: 0, y: 0 }
        this.target = { x: 0, y: 0 }

        this.closeEnoughTarget = 100
        this.maxSpeed = 1.0
        this.maxForce = 0.1
        this.particleSize = 10
        this.isKilled = false

        this.startColor = { r: 0, g: 0, b: 0 }
        this.targetColor = { r: 0, g: 0, b: 0 }
        this.colorWeight = 0
        this.colorBlendRate = 0.01
    }

    move() {
        // Check if particle is close enough to its target to slow down
        let proximityMult = 1
        const dx = this.pos.x - this.target.x
        const dy = this.pos.y - this.target.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < this.closeEnoughTarget) {
            proximityMult = distance / this.closeEnoughTarget
        }

        // Add force towards target
        const towardsTarget = {
            x: this.target.x - this.pos.x,
            y: this.target.y - this.pos.y,
        }

        const magnitude = Math.sqrt(towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y)
        if (magnitude > 0) {
            towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult
            towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult
        }

        const steer = {
            x: towardsTarget.x - this.vel.x,
            y: towardsTarget.y - this.vel.y,
        }

        const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y)
        if (steerMagnitude > 0) {
            steer.x = (steer.x / steerMagnitude) * this.maxForce
            steer.y = (steer.y / steerMagnitude) * this.maxForce
        }

        this.acc.x += steer.x
        this.acc.y += steer.y

        // Move particle
        this.vel.x += this.acc.x
        this.vel.y += this.acc.y
        this.pos.x += this.vel.x
        this.pos.y += this.vel.y
        this.acc.x = 0
        this.acc.y = 0
    }

    draw(ctx, drawAsPoints) {
        // Blend towards target color
        if (this.colorWeight < 1.0) {
            this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)
        }

        // Calculate current color
        const currentColor = {
            r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
            g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
            b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
        }

        if (drawAsPoints) {
            ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
            ctx.fillRect(this.pos.x, this.pos.y, 2, 2)
        } else {
            ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
            ctx.beginPath()
            ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2)
            ctx.fill()
        }
    }

    kill(width, height) {
        if (!this.isKilled) {
            // Set target outside the scene
            const randomPos = this.generateRandomPos(width / 2, height / 2, (width + height) / 2)
            this.target.x = randomPos.x
            this.target.y = randomPos.y

            // Begin blending color to black
            this.startColor = {
                r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
                g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
                b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
            }
            this.targetColor = { r: 0, g: 0, b: 0 }
            this.colorWeight = 0

            this.isKilled = true
        }
    }

    generateRandomPos(x, y, mag) {
        const randomX = Math.random() * 1000
        const randomY = Math.random() * 500

        const direction = {
            x: randomX - x,
            y: randomY - y,
        }

        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
        if (magnitude > 0) {
            direction.x = (direction.x / magnitude) * mag
            direction.y = (direction.y / magnitude) * mag
        }

        return {
            x: x + direction.x,
            y: y + direction.y,
        }
    }
}

const DEFAULT_WORDS = ["Swarup", "Chanda", "Portfolio"];

/** ============ Component (JSX) ============ */

export default function ParticleTextEffect({ words = DEFAULT_WORDS, onComplete }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]); // Particle[]
    const frameCountRef = useRef(0);
    const wordIndexRef = useRef(0);
    const mouseRef = useRef({ x: 0, y: 0, isPressed: false, isRightClick: false });

    const pixelSteps = 6;
    const drawAsPoints = true;
        const hasCompletedRef = useRef(false);

    const generateRandomPos = (x, y, mag) => {
        const randomX = Math.random() * 1000;
        const randomY = Math.random() * 500;

        const direction = {
            x: randomX - x,
            y: randomY - y,
        };

        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (magnitude > 0) {
            direction.x = (direction.x / magnitude) * mag;
            direction.y = (direction.y / magnitude) * mag;
        }

        return {
            x: x + direction.x,
            y: y + direction.y,
        };
    };

    const nextWord = (word, canvas) => {
        // Create off-screen canvas for text rendering
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        const offscreenCtx = offscreenCanvas.getContext("2d");

            // Choose a responsive font size based on canvas size
            // Keep font within reasonable min/max bounds and scale with viewport
            const fontSize = Math.max(18, Math.floor(Math.min(canvas.width * 0.12, canvas.height * 0.28)));
            offscreenCtx.fillStyle = "white";
            offscreenCtx.font = `bold ${fontSize}px Arial`;
            offscreenCtx.textAlign = "center";
            offscreenCtx.textBaseline = "middle";
            // draw centered text
            offscreenCtx.fillText(word, canvas.width / 2, canvas.height / 2);

        const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Generate new color
        const newColor = {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255,
        };

        const particles = particlesRef.current;
        let particleIndex = 0;

        // Collect coordinates
        const coordsIndexes = [];
        for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
            coordsIndexes.push(i);
        }

        // Shuffle coordinates for fluid motion
        for (let i = coordsIndexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]];
        }

        for (const coordIndex of coordsIndexes) {
            const pixelIndex = coordIndex;
            const alpha = pixels[pixelIndex + 3];

            if (alpha > 0) {
                const x = (pixelIndex / 4) % canvas.width;
                const y = Math.floor(pixelIndex / 4 / canvas.width);

                let particle;

                if (particleIndex < particles.length) {
                    particle = particles[particleIndex];
                    particle.isKilled = false;
                    particleIndex++;
                } else {
                    particle = new Particle();

                    const randomPos = generateRandomPos(canvas.width / 2, canvas.height / 2, (canvas.width + canvas.height) / 2);
                    particle.pos.x = randomPos.x;
                    particle.pos.y = randomPos.y;

                    particle.maxSpeed = Math.random() * 6 + 4;
                    particle.maxForce = particle.maxSpeed * 0.05;
                    particle.particleSize = Math.random() * 6 + 6;
                    particle.colorBlendRate = Math.random() * 0.0275 + 0.0025;

                    particles.push(particle);
                }

                // Set color transition
                particle.startColor = {
                    r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
                    g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
                    b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
                };
                particle.targetColor = newColor;
                particle.colorWeight = 0;

                particle.target.x = x;
                particle.target.y = y;
            }
        }

        // Kill remaining particles
        for (let i = particleIndex; i < particles.length; i++) {
            particles[i].kill(canvas.width, canvas.height);
        }
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const particles = particlesRef.current;

        // Background with motion blur
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.move();
            particle.draw(ctx, drawAsPoints);

            // Remove dead particles that are out of bounds
            if (particle.isKilled) {
                if (
                    particle.pos.x < 0 ||
                    particle.pos.x > canvas.width ||
                    particle.pos.y < 0 ||
                    particle.pos.y > canvas.height
                ) {
                    particles.splice(i, 1);
                }
            }
        }

        // Handle mouse interaction (right-click destroy)
        if (mouseRef.current.isPressed && mouseRef.current.isRightClick) {
            particles.forEach((particle) => {
                const dx = particle.pos.x - mouseRef.current.x;
                const dy = particle.pos.y - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 50) {
                    particle.kill(canvas.width, canvas.height);
                }
            });
        }

            // Auto-advance words every ~4 seconds (240 frames @ 60fps)
            frameCountRef.current++;
            // advance every ~240 frames (~4s at 60fps). When we reach the last word, call onComplete once.
            if (frameCountRef.current >= 240) {
                frameCountRef.current = 0;
                if (wordIndexRef.current < words.length - 1) {
                    wordIndexRef.current = wordIndexRef.current + 1;
                    nextWord(words[wordIndexRef.current], canvas);
                } else if (!hasCompletedRef.current) {
                    hasCompletedRef.current = true;
                    // allow one final frame draw, then notify parent that the sequence finished
                    if (typeof onComplete === "function") {
                        // call asynchronously so we don't interrupt the render loop mid-frame
                        setTimeout(() => onComplete(), 50);
                    }
                }
            }

        animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

            // set canvas to viewport size and keep it in sync on resize
            const setCanvasSize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            };

            setCanvasSize();

            // Initialize with first word
            nextWord(words[0], canvas);

            // Start animation
            animate();

        // Mouse event handlers
        const handleMouseDown = (e) => {
            mouseRef.current.isPressed = true;
            mouseRef.current.isRightClick = e.button === 2;
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };

        const handleMouseUp = () => {
            mouseRef.current.isPressed = false;
            mouseRef.current.isRightClick = false;
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
        };

            canvas.addEventListener("mousedown", handleMouseDown);
            canvas.addEventListener("mouseup", handleMouseUp);
            canvas.addEventListener("mousemove", handleMouseMove);
            canvas.addEventListener("contextmenu", handleContextMenu);
            const handleResize = () => {
                setCanvasSize();
                // regenerate layout for the current word so particles map correctly
                nextWord(words[wordIndexRef.current], canvas);
            };
            window.addEventListener("resize", handleResize);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mouseup", handleMouseUp);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', background: '#000', zIndex: 9999 }}>
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', display: 'block' }}
            />
        </div>
    );
}
