'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from './AnimatedButton';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Preload, SpotLight } from '@react-three/drei';
import * as THREE from 'three';

// Reusing the 3D V-Mark geometry for the splash
function SplashVLogo() {
  const groupRef = useRef<THREE.Group>(null);
  const leftStrokeRef = useRef<THREE.Mesh>(null);
  const rightStrokeRef = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);

  const leftShape = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1, 2); s.lineTo(-0.6, 2); s.lineTo(0, -1); s.lineTo(-0.4, -1); s.lineTo(-1, 2);
    return s;
  }, []);

  const rightShape = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(1, 2); s.lineTo(0.6, 2); s.lineTo(0, -1); s.lineTo(0.4, -1); s.lineTo(1, 2);
    return s;
  }, []);

  const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    // Simple assemble animation (drop from top)
    const t = Math.min(state.clock.elapsedTime, 2); // 0 to 2 seconds
    if (leftStrokeRef.current) leftStrokeRef.current.position.y = THREE.MathUtils.lerp(5, 0, t / 2);
    if (rightStrokeRef.current) rightStrokeRef.current.position.y = THREE.MathUtils.lerp(5, 0, t / 2);
    if (dotRef.current) dotRef.current.position.y = THREE.MathUtils.lerp(5, -0.6, t / 2);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh ref={leftStrokeRef} position={[0, 5, 0]}>
        <extrudeGeometry args={[leftShape, extrudeSettings]} />
        <meshStandardMaterial color="#1A1A1D" metalness={0.9} roughness={0.2} envMapIntensity={1.5} />
      </mesh>
      <mesh ref={rightStrokeRef} position={[0, 5, 0]}>
        <extrudeGeometry args={[rightShape, extrudeSettings]} />
        <meshStandardMaterial color="#1A1A1D" metalness={0.9} roughness={0.2} envMapIntensity={1.5} />
      </mesh>
      <mesh ref={dotRef} position={[0, 5, 0.3]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 0.4, 3]} />
        <meshStandardMaterial color="#FF2D2D" metalness={0.5} roughness={0.4} emissive="#FF2D2D" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

export default function SplashIntro() {
  const [showSplash, setShowSplash] = useState(true);
  const [phase, setPhase] = useState<'logo' | 'text' | 'founders' | 'exiting'>('logo');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      // Timeline Sequence
      setTimeout(() => setPhase('text'), 2500); // Wait 2.5s for logo
      setTimeout(() => setPhase('founders'), 5000); // Show founders at 5s
    }
  }, []);

  const handleEnter = () => {
    setPhase('exiting');
    setTimeout(() => {
      setShowSplash(false);
    }, 1000);
  };

  if (!showSplash) return null;

  return (
    <AnimatePresence>
      {phase !== 'exiting' && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: '-100%' }} // Wipe up to reveal homepage
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] bg-viaro-black text-white overflow-hidden flex flex-col"
        >
          {/* Skip Button */}
          <button 
            onClick={handleEnter}
            className="absolute top-6 right-6 z-[110] text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
          >
            Skip Intro
          </button>

          {/* Canvas container (scales down when founders appear) */}
          <motion.div 
            animate={{ 
              height: phase === 'founders' ? '30vh' : '100vh',
              opacity: phase === 'founders' ? 0.3 : 1 
            }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="w-full absolute top-0 left-0"
          >
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <SpotLight position={[5, 5, 5]} intensity={1} />
              <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <SplashVLogo />
              </Float>
              <Environment preset="city" />
            </Canvas>
          </motion.div>

          {/* Text Reveal */}
          <AnimatePresence>
            {(phase === 'text' || phase === 'founders') && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: phase === 'founders' ? 0 : 1, 
                  y: phase === 'founders' ? -20 : 0 
                }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none mt-40"
              >
                <h1 className="text-6xl font-headings font-black tracking-[0.2em] mb-4">VIARO</h1>
                <p className="text-primary font-headings font-bold uppercase tracking-widest italic mb-2">Live in Style.</p>
                <p className="text-sm text-white/70 uppercase tracking-widest">Modern. Minimal. Made for the now.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Founders Reveal */}
          <AnimatePresence>
            {phase === 'founders' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-0 w-full h-[70vh] flex flex-col items-center justify-center z-20 px-4"
              >
                <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto w-full justify-center items-center mb-12">
                  {[
                    { name: 'Alvish', role: 'CEO', quote: "Redefining high-street presence." },
                    { name: 'Bhavin', role: 'CEO', quote: "Precision in every thread." },
                    { name: 'Vishwajeet', role: 'CEO', quote: "Luxury meets raw authenticity." }
                  ].map((founder, i) => (
                    <motion.div 
                      key={founder.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (i * 0.2), duration: 0.8 }}
                      className="text-center space-y-2 flex-1"
                    >
                      <h3 className="text-xl font-bold uppercase tracking-widest">{founder.name}</h3>
                      <p className="text-primary text-xs uppercase tracking-[0.2em] font-black">{founder.role}</p>
                      <p className="text-white/60 text-sm italic">"{founder.quote}"</p>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <AnimatedButton variant="primary" onClick={handleEnter} className="px-12 py-4 text-lg animate-pulse">
                    ENTER VIARO
                  </AnimatedButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
