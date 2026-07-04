'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Preload, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    // Scroll-synced 3D camera on homepage
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // smooth scrubbing
      },
    });

    // Make the camera recede and rotate away as the user scrolls
    tl.to(camera.position, {
      z: 12,
      y: 3,
      x: -2,
      ease: 'none',
    }, 0);
    
    tl.to(camera.rotation, {
      x: -0.2,
      y: 0.5,
      z: 0.1,
      ease: 'none',
    }, 0);

    return () => {
      tl.kill();
    };
  }, [camera]);

  return null;
}

function VLogoModel() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Custom geometry for the V-mark using shapes
  const vShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Left stroke
    shape.moveTo(-1, 2);
    shape.lineTo(-0.6, 2);
    shape.lineTo(0, -1);
    shape.lineTo(-0.4, -1);
    shape.lineTo(-1, 2);
    
    // Right stroke
    shape.moveTo(1, 2);
    shape.lineTo(0.6, 2);
    shape.lineTo(0, -1);
    shape.lineTo(0.4, -1);
    shape.lineTo(1, 2);
    return shape;
  }, []);

  const extrudeSettings = {
    depth: 0.4,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 2,
    bevelSize: 0.05,
    bevelThickness: 0.05,
  };

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Slow idle rotation + subtle tilt response to mouse position
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      Math.sin(state.clock.elapsedTime * 0.3) * 0.15 + (state.pointer.x * 0.4),
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      (state.pointer.y * -0.4),
      0.05
    );
  });

  return (
    <group ref={groupRef}>
      {/* The V body - Brushed Metal PBR */}
      <mesh position={[-0.2, 0, 0]}>
        <extrudeGeometry args={[vShape, extrudeSettings]} />
        <meshStandardMaterial 
          color="#1A1A1D" 
          metalness={0.9} 
          roughness={0.2}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* The Red Accent Dot (Triangle/Pyramid) */}
      <mesh position={[0, -0.6, 0.3]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 0.4, 3]} />
        <meshStandardMaterial 
          color="#FF2D2D" 
          metalness={0.5} 
          roughness={0.4}
          emissive="#FF2D2D"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

export default function VMark3D() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-40 mix-blend-screen dark:mix-blend-normal">
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <SpotLight 
          position={[5, 5, 5]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1} 
          castShadow 
        />
        
        <CameraController />

        <Float 
          speed={2} 
          rotationIntensity={0.2} 
          floatIntensity={0.5}
          floatingRange={[-0.1, 0.1]}
        >
          <VLogoModel />
        </Float>
        
        <Environment preset="city" />
        <Preload all />
      </Canvas>
    </div>
  );
}
