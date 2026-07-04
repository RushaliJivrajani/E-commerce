'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, SpotLight } from '@react-three/drei';
import * as THREE from 'three';

// Reusing the 3D V-Mark geometry for the landing page
function LandingVLogo() {
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

// Bubbles Animation Component
function FloatingBubbles() {
  const bubbles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((_, i) => {
        const size = Math.random() * 40 + 10;
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 10;
        return (
          <motion.div
            key={i}
            initial={{ y: '110vh', opacity: 0, x: 0 }}
            animate={{
              y: '-20vh',
              opacity: [0, 0.5, 0],
              x: [0, Math.random() * 100 - 50, 0]
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: 'linear'
            }}
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(0,0,0,0.8))',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '50%',
              position: 'absolute',
              backdropFilter: 'blur(2px)',
            }}
          />
        );
      })}
    </div>
  );
}

export default function RootLandingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'logo' | 'text' | 'founders' | 'exiting'>('logo');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      setTimeout(() => setPhase('text'), 2500); 
      setTimeout(() => setPhase('founders'), 5000); 
    } else {
      setPhase('founders');
    }
  }, []);

  const handleEnter = () => {
    setPhase('exiting');
    setTimeout(() => {
      router.push('/home');
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div 
        key="landing"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'exiting' ? 0 : 1, y: phase === 'exiting' ? '-100%' : 0 }} 
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-0 z-50 bg-black text-white overflow-hidden flex flex-col"
      >
        {mounted && (
          <>
            <FloatingBubbles />

            {/* Canvas container */}
            <motion.div 
              animate={{ 
                height: phase === 'founders' ? '40vh' : '100vh',
                opacity: phase === 'founders' ? 0.4 : 1 
              }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="w-full absolute top-0 left-0"
            >
              <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <SpotLight position={[5, 5, 5]} intensity={1} />
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                  <LandingVLogo />
                </Float>
                <Environment preset="city" />
              </Canvas>
            </motion.div>
          </>
        )}

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
              <h1 className="text-6xl font-black tracking-[0.2em] mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>VIARO</h1>
              <p className="text-[#FF2D2D] font-bold uppercase tracking-widest italic mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>Live in Style.</p>
              <p className="text-sm text-white/70 uppercase tracking-widest" style={{ fontFamily: 'var(--font-montserrat)' }}>Modern. Minimal. Made for the now.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Founders Reveal & CTA */}
        <AnimatePresence>
          {phase === 'founders' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-0 w-full h-[60vh] flex flex-col items-center justify-center z-20 px-4"
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
                    <h3 className="text-xl font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-poppins)' }}>{founder.name}</h3>
                    <p className="text-[#FF2D2D] text-xs uppercase tracking-[0.2em] font-black" style={{ fontFamily: 'var(--font-montserrat)' }}>{founder.role}</p>
                    <p className="text-white/60 text-sm italic" style={{ fontFamily: 'var(--font-montserrat)' }}>"{founder.quote}"</p>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-4"
              >
                <button 
                  onClick={handleEnter} 
                  className="bg-[#FF2D2D] text-white px-12 py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#ff4d4d] transition-all shadow-[0_0_20px_rgba(255,45,45,0.4)] hover:shadow-[0_0_30px_rgba(255,45,45,0.6)] rounded-sm"
                  style={{ fontFamily: 'var(--font-montserrat)' }}
                >
                  ENTER VIARO
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
