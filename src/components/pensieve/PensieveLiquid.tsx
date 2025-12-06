import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { usePensieveState } from '@/state/pensieveState';

const LiquidShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color('#02040a'),
    uColor2: new THREE.Color('#94a3b8'),

    uHover: 0,
    uUnlock: 0,
    uResolution: new THREE.Vector2(1, 1)
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    uniform float uHover;
    uniform float uUnlock;

    void main() {
      vUv = uv;
      
      vec3 pos = position;
      
      // Gentle wave motion - Restored flow
      float elevation = sin(pos.x * 2.0 + uTime * 0.5) * 0.1;
      elevation += cos(pos.y * 2.0 + uTime * 0.3) * 0.1;
      
      // Intensify with hover/unlock
      elevation *= (1.0 + uHover * 0.3 + uUnlock * 0.8);
      
      pos.z += elevation;
      vElevation = elevation;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uHover;
    uniform float uUnlock;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Swirling coordinates
      vec2 centeredUv = vUv - 0.5;
      float dist = length(centeredUv);
      float angle = atan(centeredUv.y, centeredUv.x);
      
      // Rotation speed increases with unlock
      float speed = uTime * (0.1 + uUnlock * 0.8);
      float swirl = angle + dist * 3.0 - speed;
      
      // Noise sampling
      float noiseVal = snoise(vec2(cos(swirl) * 1.5, sin(swirl) * 1.5 + uTime * 0.1));
      
      // Layering noise
      float noiseVal2 = snoise(vec2(centeredUv.x * 3.0 - uTime * 0.15, centeredUv.y * 3.0));
      
      float finalNoise = mix(noiseVal, noiseVal2, 0.5);
      
      // Mixing colors - pearlescent effect
      float mixFactor = smoothstep(-0.2, 0.8, finalNoise + vElevation);
      vec3 mixColor = mix(uColor1, uColor2, mixFactor);
      
      // Add a metallic shine
      float shine = smoothstep(0.4, 0.45, finalNoise + vElevation * 0.5);
      mixColor += vec3(0.2, 0.3, 0.4) * shine * 0.3;
      
      // Brightness boost on unlock/hover (controlled)
      float brightness = 0.6 + uHover * 0.1 + uUnlock * 0.4;
      
      // Radial fade for soft edges
      float alpha = smoothstep(0.5, 0.28, dist);
      
      // Misty variation
      alpha *= (0.9 + 0.1 * finalNoise); 
      
      vec3 finalColor = mixColor * brightness;

      // Center glow on unlock - purely additive light
      if(uUnlock > 0.0) {
        float centerGlow = 1.0 - smoothstep(0.0, 0.3, dist);
        // Gold/Silver glow instead of pure white
        vec3 glowColor = vec3(0.9, 0.95, 1.0);
        finalColor += glowColor * centerGlow * uUnlock * 0.8;
      }

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

extend({ LiquidShaderMaterial });

const PensieveLiquid: React.FC = () => {
  const materialRef = useRef<any>();
  const { setIsHovered, isUnlocked } = usePensieveState();
  
  useFrame((_state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
      
      // Smoothly interpolate hover and unlock uniforms
      const targetUnlock = isUnlocked ? 1.0 : 0.0;
      // @ts-ignore
      materialRef.current.uUnlock = THREE.MathUtils.lerp(materialRef.current.uUnlock, targetUnlock, delta * 2);
    }
  });

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
    if (materialRef.current) materialRef.current.uHover = 1.0;
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'default';
    setIsHovered(false);
    if (materialRef.current) materialRef.current.uHover = 0.0;
  };

  const handleClick = () => {
    // Trigger UI if idle
    const { mode, setMode } = usePensieveState.getState();
    if (mode === 'idle') {
      setMode('input');
    }
  };

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.25, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <circleGeometry args={[2.8, 64]} />
      {/* @ts-ignore */}
      <liquidShaderMaterial 
        ref={materialRef} 
        transparent 
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
};

export default PensieveLiquid;
