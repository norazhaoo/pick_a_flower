import React, { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial, Billboard } from '@react-three/drei';

const SmokeShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#d4d8e0'),
    uOpacity: 0.6,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    uniform float uTime;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Curl/Wisp simulation
      float t = uTime * 0.2;
      
      // S-curve path
      float sway = sin(pos.y * 1.2 - t) * 0.15 * smoothstep(0.0, 1.0, pos.y * 0.2);
      pos.x += sway;
      
      // Secondary detail
      pos.x += sin(pos.y * 2.5 + t * 1.3) * 0.05;
      
      // Slight spread
      float spread = 1.0 + pow(max(0.0, pos.y), 1.1) * 0.2;
      pos.x *= spread;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;

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
    
    // FBM for more detail
    float fbm(vec2 uv) {
        float sum = 0.0;
        float amp = 0.5;
        float freq = 1.0;
        for(int i = 0; i < 3; i++) {
            sum += snoise(uv * freq) * amp;
            amp *= 0.5;
            freq *= 2.0;
        }
        return sum;
    }

    void main() {
      // Flow coordinates
      vec2 flowUV = vUv;
      flowUV.y -= uTime * 0.12;
      flowUV.x += snoise(vec2(uTime * 0.05, vUv.y * 0.5)) * 0.1; 
      
      // Reduced Y-stretch
      float noiseVal = fbm(flowUV * vec2(2.5, 1.2) + vec2(0.0, uTime * 0.1));
      
      // Shape mask
      float distFromCenter = abs(vUv.x - 0.5) * 2.0;
      
      // Edge feathering
      float edgeNoise = snoise(vUv * 8.0 + uTime * 0.3) * 0.1;
      float mask = smoothstep(0.6 + edgeNoise, 0.1 + edgeNoise, distFromCenter);
      
      // Vertical fade
      float vFade = smoothstep(0.12, 0.25, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
      
      // Combine noise and mask
      float strandNoise = smoothstep(-0.3, 0.7, noiseVal); 
      
      float alpha = mask * vFade * strandNoise;
      
      // Color mixing
      vec3 finalColor = mix(uColor * 0.9, vec3(1.0), alpha * 0.4);
      
      // Final opacity
      alpha *= uOpacity;
      
      if (alpha < 0.01) discard;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

extend({ SmokeShaderMaterial });

const MemoryThread: React.FC = () => {
  const materialRef = useRef<any>();

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
    }
  });

  return (
    <group position={[0, -0.25, 0]}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        {/* @ts-ignore */}
        <mesh position={[0, 2.5, 0]}> 
          <planeGeometry args={[1.8, 7, 32, 64]} />
          {/* @ts-ignore */}
          <smokeShaderMaterial 
            ref={materialRef}
            transparent
            depthWrite={false}
            blending={THREE.NormalBlending} 
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>
    </group>
  );
};

export default MemoryThread;
