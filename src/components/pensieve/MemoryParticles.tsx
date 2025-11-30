import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePensieveStore } from '../../state/pensieveState';

const COUNT = 60; // Reduced count for "magical dust" feel

export const MemoryParticles = () => {
  const mode = usePensieveStore((state) => state.mode);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Store particle data
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < COUNT; i++) {
      // Confine closer to the basin (radius ~2.5, height ~1.5)
      // eslint-disable-next-line react-hooks/purity
      const r = 2.5 + Math.random() * 1.0; 
      // eslint-disable-next-line react-hooks/purity
      const theta = Math.random() * Math.PI * 2;
      // eslint-disable-next-line react-hooks/purity
      const y = 1.0 + Math.random() * 1.5; // Slightly above/around the liquid level
      data.push({
        // eslint-disable-next-line react-hooks/purity
        pos: new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)),
        vel: new THREE.Vector3(),
        // eslint-disable-next-line react-hooks/purity
        initialPos: new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)),
        // eslint-disable-next-line react-hooks/purity
        phase: Math.random() * Math.PI * 2,
        // eslint-disable-next-line react-hooks/purity
        life: Math.random(),
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    particles.forEach((particle, i) => {
      const { pos, vel, initialPos, phase } = particle;

      if (mode === 'CASTING') {
        // Strong suction into the liquid center
        const target = new THREE.Vector3(0, 1.2, 0); // Liquid center
        const dir = new THREE.Vector3().subVectors(target, pos).normalize();
        vel.addScaledVector(dir, 0.08);
        vel.multiplyScalar(0.92); 
        pos.add(vel);
        
        if (pos.distanceTo(target) < 0.2) {
             // Reset to outside
             const r = 3.0 + Math.random();
             const th = Math.random() * Math.PI * 2;
             pos.set(r * Math.cos(th), 2.0 + Math.random(), r * Math.sin(th));
             vel.set(0,0,0);
        }

      } else if (mode === 'REVEALED') {
        // Gentle rising magic
        pos.y += 0.005 + Math.sin(time + phase) * 0.002;
        // Spiral out
        const r = Math.sqrt(pos.x*pos.x + pos.z*pos.z);
        const angle = Math.atan2(pos.z, pos.x) + 0.005;
        pos.x = Math.cos(angle) * r;
        pos.z = Math.sin(angle) * r;

        if (pos.y > 4.0) {
            pos.y = 1.2;
            pos.x = (Math.random() - 0.5) * 1.0;
            pos.z = (Math.random() - 0.5) * 1.0;
        }

      } else {
        // Idle: subtle hover near rim
        const hover = Math.sin(time * 0.5 + phase) * 0.1;
        const driftAngle = time * 0.05 + phase;
        
        // Target position is initial pos + drift
        const targetX = initialPos.x + Math.cos(driftAngle) * 0.2;
        const targetZ = initialPos.z + Math.sin(driftAngle) * 0.2;
        const targetY = initialPos.y + hover;

        pos.x += (targetX - pos.x) * 0.02;
        pos.z += (targetZ - pos.z) * 0.02;
        pos.y += (targetY - pos.y) * 0.02;
      }

      dummy.position.copy(pos);
      // Pulse scale
      const s = 0.03 + Math.sin(time * 3 + phase) * 0.015;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial 
        color="#b0d0ff" 
        transparent 
        opacity={0.4} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </instancedMesh>
  );
};
