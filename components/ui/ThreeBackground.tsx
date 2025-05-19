'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Add preset types to allow easy configuration for different pages
type BackgroundPreset = 'landing' | 'chat' | 'dashboard' | 'video';

interface ThreeBackgroundPresetConfig {
  color: string;
  density: number;
  speed: number;
  interactive: boolean;
}

// Preset configurations
const PRESET_CONFIGS: Record<BackgroundPreset, ThreeBackgroundPresetConfig> = {
  landing: {
    color: '#4ade80', // Emerald (green)
    density: 150,
    speed: 0.05,
    interactive: true
  },
  chat: {
    color: '#3b82f6', // Blue
    density: 80,
    speed: 0.02,
    interactive: true
  },
  dashboard: {
    color: '#8b5cf6', // Purple
    density: 100,
    speed: 0.03,
    interactive: true
  },
  video: {
    color: '#ec4899', // Pink
    density: 50,
    speed: 0.01,
    interactive: false // Reduce distractions during video calls
  }
};

interface ThreeBackgroundProps {
  color?: string;
  density?: number;
  speed?: number;
  className?: string;
  interactive?: boolean;
  disableOnLowPerformance?: boolean;
  preset?: BackgroundPreset; // Add preset option
}

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({
  color,
  density,
  speed,
  className = '',
  interactive,
  disableOnLowPerformance = true,
  preset
}) => {
  // Apply preset config if provided, otherwise use individual props
  const config = preset ? PRESET_CONFIGS[preset] : {
    color: undefined,
    density: undefined, 
    speed: undefined,
    interactive: undefined
  };
  
  // Use preset values as fallbacks if individual props are not provided
  const finalColor = color || config.color || '#4ade80';
  const finalDensity = density || config.density || 100;
  const finalSpeed = speed || config.speed || 0.1;
  const finalInteractive = interactive !== undefined ? interactive : (config.interactive !== undefined ? config.interactive : true);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  // Detect low performance device
  useEffect(() => {
    if (disableOnLowPerformance) {
      // Check for mobile devices
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Check for low memory (not all browsers support this)
      const hasLowMemory = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
      
      // Check for low CPU cores (not all browsers support this)
      const hasLowCPU = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency < 4;
      
      // Check for low-end devices where performance might be an issue
      setIsLowPerformance(isMobile || hasLowMemory || hasLowCPU);
    }
  }, [disableOnLowPerformance]);

  const handleMouseMove = (event: MouseEvent) => {
    if (finalInteractive && isInitialized) {
      // Calculate normalized mouse position (-1 to 1)
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Add subtle rotation to particles based on mouse position
      if (particlesRef.current) {
        particlesRef.current.rotation.x += mouseRef.current.y * 0.001;
        particlesRef.current.rotation.y += mouseRef.current.x * 0.001;
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current || isLowPerformance) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    
    // Adjust particle count based on device capabilities
    const actualDensity = isLowPerformance ? Math.floor(finalDensity / 2) : finalDensity;
    const particlesCount = actualDensity;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    const sizesArray = new Float32Array(particlesCount);

    const baseColor = new THREE.Color(finalColor);
    const lighterColor = baseColor.clone().multiplyScalar(1.2);

    for (let i = 0; i < particlesCount; i++) {
      // Position
      const i3 = i * 3;
      posArray[i3] = (Math.random() - 0.5) * 10;     // x
      posArray[i3 + 1] = (Math.random() - 0.5) * 10; // y
      posArray[i3 + 2] = (Math.random() - 0.5) * 10; // z

      // Color - vary between base color and lighter shade
      const mixFactor = Math.random();
      const particleColor = new THREE.Color().lerpColors(
        baseColor, 
        lighterColor, 
        mixFactor
      );
      colorsArray[i3] = particleColor.r;
      colorsArray[i3 + 1] = particleColor.g;
      colorsArray[i3 + 2] = particleColor.b;

      // Size - random sizes for more natural look
      sizesArray[i] = Math.random() * 0.03 + 0.01;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizesArray, 1));

    // Create materials with custom shader for better particles
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true, // Use per-vertex colors
      transparent: true,
      opacity: 0.8,
      depthWrite: false, // Better rendering of transparent particles
      blending: THREE.AdditiveBlending, // Create glow effect when particles overlap
      sizeAttenuation: true, // Size based on distance from camera
    });

    // Create particle system
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Add subtle ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    setIsInitialized(true);

    // Animation
    let animationFrameId: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Calculate delta time for smoother animation across different devices
      const delta = time - lastTime;
      lastTime = time;
      
      // Use delta to ensure consistent animation speed
      const rotationSpeed = (delta / 16) * finalSpeed * 0.001;

      if (particlesRef.current) {
        // Rotation animation
        particlesRef.current.rotation.x += rotationSpeed * 2;
        particlesRef.current.rotation.y += rotationSpeed;
        
        // Optional: subtle pulsing effect
        const pulseFactor = Math.sin(time * 0.0005) * 0.03;
        particlesRef.current.scale.set(
          1 + pulseFactor,
          1 + pulseFactor,
          1 + pulseFactor
        );
      }

      renderer.render(scene, camera);
    };
    
    animate(0);

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && containerRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Add mouse move event listener for interactivity
    if (finalInteractive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (finalInteractive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      
      cancelAnimationFrame(animationFrameId);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (particlesRef.current) {
        scene.remove(particlesRef.current);
        particlesGeometry.dispose();
        particlesMaterial.dispose();
      }
    };
  }, [finalColor, finalDensity, finalSpeed, finalInteractive, isLowPerformance]);

  // If on a low-performance device and disableOnLowPerformance is true, render nothing
  if (isLowPerformance && disableOnLowPerformance) {
    return null;
  }

  return (
    <div 
      ref={containerRef} 
      className={`fixed top-0 left-0 w-full h-full -z-10 pointer-events-none ${className}`}
    />
  );
};

export default ThreeBackground; 