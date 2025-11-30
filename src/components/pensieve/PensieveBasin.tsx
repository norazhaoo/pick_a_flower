import { useRef, useMemo, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { usePensieveStore } from '../../state/pensieveState';

// Custom Lathe Geometry for a thick bowl profile
const BowlGeometry = () => {
  const points = useMemo(() => {
    const pts = [];
    // Profile: inner center -> inner rim -> outer rim -> outer bottom -> outer center
    // Right side profile (x > 0, rotating around y axis)
    
    const innerRadius = 2.0;
    const outerRadius = 2.5;
    const height = 1.5;
    const thickness = 0.5; // Bottom thickness

    // 1. Inner surface (curved bottom to rim)
    // Start at center bottom (0, thickness)
    // Curve to (innerRadius, height)
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Elliptical profile for inner bowl
      const x = innerRadius * Math.sin(t * Math.PI * 0.5);
      const y = thickness + (height - thickness) * (1.0 - Math.cos(t * Math.PI * 0.5));
      pts.push(new THREE.Vector2(x, y));
    }

    // 2. Rim (flat/slightly rounded top)
    pts.push(new THREE.Vector2(outerRadius, height));

    // 3. Outer surface (rim to bottom)
    // Curve from (outerRadius, height) down to (0, 0)
    for (let i = segments; i >= 0; i--) {
      const t = i / segments;
      const x = outerRadius * Math.sin(t * Math.PI * 0.5);
      const y = height * (1.0 - Math.cos(t * Math.PI * 0.5));
      pts.push(new THREE.Vector2(x, y));
    }

    return pts;
  }, []);

  return <latheGeometry args={[points, 64]} />;
};

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vPosition = position; // Local position
    vNormal = normalize(normalMatrix * normal);
    
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uRuneIntensity;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  // Simplex noise
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
    // Stone Material
    vec3 stoneBase = vec3(0.15, 0.18, 0.22); // Dark blue-gray
    float noise = snoise(vWorldPosition.xz * 3.0 + vWorldPosition.y);
    float detail = snoise(vWorldPosition.xyz * 10.0);
    
    // Cracks / Weathering
    float cracks = smoothstep(0.4, 0.45, abs(detail));
    vec3 color = stoneBase * (0.8 + 0.2 * noise) * cracks;

    // Moss (green patches near top/rim)
    float mossNoise = snoise(vWorldPosition.xz * 2.0);
    float mossMask = smoothstep(0.5, 0.8, vPosition.y / 2.0 + mossNoise * 0.2);
    color = mix(color, vec3(0.2, 0.3, 0.2), mossMask * 0.5);

    // Rune Mask (Only on the rim, approx y=1.5)
    float rimMask = smoothstep(1.4, 1.45, vPosition.y); // Top part
    
    // Rune Pattern - polar coordinates for ring
    vec2 polar = vec2(atan(vPosition.x, vPosition.z), vPosition.y);
    float runeNoise = snoise(polar * vec2(8.0, 50.0)); // High freq along ring
    float runeShape = step(0.2, runeNoise) * step(runeNoise, 0.5); // Band of noise as runes
    
    // Flicker
    float flicker = 0.8 + 0.2 * sin(uTime * 3.0 + polar.x * 5.0);
    
    vec3 emission = vec3(0.4, 0.7, 1.0) * runeShape * rimMask * uRuneIntensity * flicker;
    
    gl_FragColor = vec4(color + emission, 1.0);
  }
`;

export const PensieveBasin = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mode = usePensieveStore((state) => state.mode);
  const setRequestOpenUI = usePensieveStore((state) => state.setRequestOpenUI);
  const setBasinHovered = usePensieveStore((state) => state.setBasinHovered);

  const [hovered, setHovered] = useState(false);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRuneIntensity: { value: 1.0 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

      let targetIntensity = 1.0;
      switch (mode) {
        case 'CASTING': targetIntensity = 3.0; break;
        case 'LOCKED': targetIntensity = 0.5; break;
        case 'REVEALED': targetIntensity = 2.0; break;
        default: targetIntensity = 1.0;
      }
      
      if (hovered) targetIntensity += 0.5;

      materialRef.current.uniforms.uRuneIntensity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uRuneIntensity.value,
        targetIntensity,
        0.05
      );
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    setBasinHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    setBasinHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <mesh 
      position={[0, 0, 0]} 
      onPointerOver={handlePointerOver} 
      onPointerOut={handlePointerOut}
      onClick={(e) => { e.stopPropagation(); setRequestOpenUI(true); }}
    >
      <BowlGeometry />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
