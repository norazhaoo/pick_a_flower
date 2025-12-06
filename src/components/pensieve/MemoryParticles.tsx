import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

const MemoryParticles: React.FC = () => {
  const ref = useRef<any>();
  
  // Generate random particles
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  
  for(let i=0; i<particleCount; i++) {
    const r = 4 * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    positions[i*3] = r * Math.cos(theta); // x
    positions[i*3+1] = Math.random() * 5; // y (height)
    positions[i*3+2] = r * Math.sin(theta); // z
  }

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#a0c0ff"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
};

export default MemoryParticles;
