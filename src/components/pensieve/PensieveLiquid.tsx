import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePensieveStore } from '../../state/pensieveState';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uSwirlStrength;
  uniform float uIntensity;
  uniform float uRippleImpulse;
  uniform vec3 uColor;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
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
    vec2 center = vec2(0.5);
    vec2 toCenter = vUv - center;
    float dist = length(toCenter);
    float angle = atan(toCenter.y, toCenter.x);

    // Mask circle (UV space)
    if (dist > 0.5) discard;

    // Swirl effect
    float swirl = uSwirlStrength * (0.5 - dist);
    float swirledAngle = angle + uTime * 0.5 + swirl * 8.0;
    
    // Perturb with ripple
    swirledAngle += sin(dist * 30.0 - uTime * 10.0) * uRippleImpulse * 0.3;

    vec2 swirledUv = center + vec2(cos(swirledAngle), sin(swirledAngle)) * dist;

    // Layers
    float n1 = snoise(swirledUv * 6.0 + uTime * 0.1);
    float n2 = snoise(swirledUv * 12.0 - uTime * 0.05);
    float noise = (n1 + n2 * 0.5) * 0.5 + 0.5;

    // Center vortex dark hole
    float hole = smoothstep(0.0, 0.15, dist);
    
    // Edge soft fade
    float edge = smoothstep(0.5, 0.4, dist);
    
    // Fresnel
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

    vec3 finalColor = uColor * noise * hole;
    
    // Brightness boost from ripple
    finalColor += uRippleImpulse * vec3(0.5, 0.6, 0.8) * (1.0 - dist*2.0);

    // Rim glow
    finalColor += vec3(0.8, 0.9, 1.0) * fresnel * 0.5 * edge;
    
    gl_FragColor = vec4(finalColor * uIntensity, 0.9 * edge);
  }
`;

export const PensieveLiquid = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mode = usePensieveStore((state) => state.mode);
  const lastRipple = usePensieveStore((state) => state.lastRipple);
  const impulseRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSwirlStrength: { value: 1.0 },
      uIntensity: { value: 1.0 },
      uRippleImpulse: { value: 0.0 },
      uColor: { value: new THREE.Color('#c0c0d0') },
    }),
    []
  );

  useEffect(() => {
    if (lastRipple > 0) impulseRef.current = 1.0;
  }, [lastRipple]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      impulseRef.current = THREE.MathUtils.lerp(impulseRef.current, 0, 0.05);
      materialRef.current.uniforms.uRippleImpulse.value = impulseRef.current;

      let targetSwirl = 1.0;
      let targetIntensity = 1.0;

      switch (mode) {
        case 'CASTING': targetSwirl = 4.0; targetIntensity = 1.5; break;
        case 'LOCKED': targetSwirl = 6.0; targetIntensity = 0.6; break;
        case 'UNLOCKING': targetSwirl = 0.5; targetIntensity = 2.0; break;
        case 'REVEALED': targetSwirl = 0.5; targetIntensity = 1.2; break;
        default: targetSwirl = 1.0; targetIntensity = 1.0; break;
      }

      materialRef.current.uniforms.uSwirlStrength.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uSwirlStrength.value,
        targetSwirl,
        0.05
      );
      materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uIntensity.value,
        targetIntensity,
        0.05
      );
    }
  });

  // Positioned inside the bowl:
  // Bowl inner radius ~2.0
  // Bowl height 1.5
  // So liquid should be slightly below 1.5, radius ~1.9
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.2, 0]}>
      <planeGeometry args={[3.8, 3.8]} /> 
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
};
