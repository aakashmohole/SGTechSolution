"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function EarthModel() {
  const earthRef = useRef<THREE.Group>(null);
  
  // Create random points for a particle field around the earth
  const [positions] = useMemo(() => {
    const points = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
        // Spherical distribution
        const p = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).normalize().multiplyScalar(Math.random() * 0.5 + 2.5);
        
        points[i * 3] = p.x;
        points[i * 3 + 1] = p.y;
        points[i * 3 + 2] = p.z;
    }
    return [points];
  }, []);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.15;
      earthRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={earthRef} position={[0, -0.5, 0]}>
      {/* Core solid glow to obscure the back lines */}
      <mesh>
        <sphereGeometry args={[2.3, 32, 32]} />
        <meshBasicMaterial color="#020815" transparent opacity={0.9} />
      </mesh>

      {/* Primary Wireframe Globe */}
      <mesh>
        <sphereGeometry args={[2.4, 32, 32]} />
        <meshBasicMaterial color="#00f2ff" wireframe transparent opacity={0.25} />
      </mesh>

      {/* Secondary Outer Grid (Offset) */}
      <mesh>
        <sphereGeometry args={[2.42, 16, 16]} />
        <meshBasicMaterial color="#7000ff" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Floating Network Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#00f2ff" size={0.03} transparent opacity={0.6} sizeAttenuation />
      </points>
      
      {/* Navigational Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.2, 0.01, 64, 100]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2.2, 0.1, 0]}>
        <torusGeometry args={[3.5, 0.01, 64, 100]} />
        <meshBasicMaterial color="#7000ff" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export default function ThreeCanvas() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <EarthModel />
        </Float>
      </Canvas>
    </div>
  );
}
