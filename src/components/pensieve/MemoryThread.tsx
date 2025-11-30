import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePensieveStore } from '../../state/pensieveState';

export const MemoryThread = () => {
  const mode = usePensieveStore((state) => state.mode);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Define the curve
  const curve = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      const angle = t * Math.PI * 4; // 2 spins
      const radius = t * 1.0; // Widening spiral
      const height = t * 3.0;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGrowth: { value: 0 }, // 0 to 1
      uColor: { value: new THREE.Color('#e0f0ff') },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Animate growth based on mode
      const targetGrowth = mode === 'REVEALED' ? 1.0 : 0.0;
      materialRef.current.uniforms.uGrowth.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uGrowth.value,
        targetGrowth,
        0.02
      );
    }
    
    // Slight rotation of the whole thread
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uGrowth;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      // vUv.x is along the tube length (0..1)
      // vUv.y is around the tube circumference
      
      // Growth mask
      float visible = step(vUv.x, uGrowth);
      if (visible < 0.5) discard;

      // Fade out at the tip of growth
      float alpha = smoothstep(uGrowth, uGrowth - 0.2, vUv.x);
      
      // Pulse
      float pulse = 0.5 + 0.5 * sin(vUv.x * 10.0 - uTime * 3.0);
      
      vec3 color = uColor * (0.5 + 0.5 * pulse);
      
      // Add "sparkle" or high intensity core
      float core = smoothstep(0.4, 0.6, abs(vUv.y - 0.5)); // Actually vUv.y wraps 0-1, but simple gradient is fine
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <tubeGeometry args={[curve, 64, 0.02, 8, false]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

