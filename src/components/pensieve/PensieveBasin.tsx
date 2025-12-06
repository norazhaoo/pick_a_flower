import React, { useMemo } from 'react';
import * as THREE from 'three';

const PensieveBasin: React.FC = () => {
  // Generate a procedural stone texture
  const stoneTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base background - Dark Granite
      ctx.fillStyle = '#1a1a1a'; 
      ctx.fillRect(0, 0, 512, 512);

      // Layer 1: Large noise - Deep variations
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = 20 + Math.random() * 60;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.5 ? '#2a2a2a' : '#0d0d0d'; 
        ctx.globalAlpha = 0.1;
        ctx.fill();
      }

      // Layer 2: Fine grain - Subtle stone texture
      for (let i = 0; i < 20000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        // Mix of slight light and dark specks
        const isLight = Math.random() > 0.7;
        ctx.fillStyle = isLight ? '#555' : '#000'; 
        ctx.globalAlpha = isLight ? 0.1 : 0.2; // Subtle
        ctx.fillRect(x, y, 2, 2);
      }
      
      // Layer 3: Faint banding
      ctx.fillStyle = '#333';
      ctx.globalAlpha = 0.03;
      for(let i=0; i<512; i+=4) {
         if(Math.random() > 0.5) ctx.fillRect(0, i, 512, 2);
      }
      ctx.globalAlpha = 0.3;
      for(let i=0; i<5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * 512);
        ctx.bezierCurveTo(
          170, Math.random() * 512, 
          340, Math.random() * 512, 
          512, Math.random() * 512
        );
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 1); // Stretch horizontally for lathe geometry
    return texture;
  }, []);

  const profile = useMemo(() => {
    const points = [];
    // Define a cross-section of a stone basin
    // Coordinates are (x = radius, y = height)
    
    // 1. Inner Surface (Starting from center bottom)
    points.push(new THREE.Vector2(0.0, -0.8));   // Inner Center - Shallower
    points.push(new THREE.Vector2(2.5, -0.8));   // Inner Flat Bottom
    points.push(new THREE.Vector2(3.4, 0.0));    // Curve up - Tighter
    points.push(new THREE.Vector2(3.7, 0.2));    // Inner Rim Edge

    // 2. The Rim (Slimmer)
    points.push(new THREE.Vector2(4.0, 0.3));    // Rim Top Highest Point
    points.push(new THREE.Vector2(4.2, 0.2));    // Rim Outer Edge
    points.push(new THREE.Vector2(4.2, -0.1));   // Rim Vertical Drop

    // 3. Outer Surface (Smooth seamless curve)
    points.push(new THREE.Vector2(4.2, -0.5));   // Start of curve
    points.push(new THREE.Vector2(3.5, -1.2));   // Mid curve
    points.push(new THREE.Vector2(2.0, -1.6));   // Lower curve
    points.push(new THREE.Vector2(0.0, -1.7));   // Bottom Center

    return points;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Main Stone Basin */}
      <mesh receiveShadow castShadow rotation={[0, 0, 0]}>
        <latheGeometry args={[profile, 64]} />
        <meshStandardMaterial 
          map={stoneTexture}
          bumpMap={stoneTexture}
          bumpScale={0.1} // Restored texture depth
          color="#444" // Dark grey base - relies on lighting for visibility
          roughness={0.6} // Slightly reflective to catch rim lights
          metalness={0.2} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rune Ring - Icy and subtle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <ringGeometry args={[3.75, 4.15, 64]} />
        <meshStandardMaterial 
          color="#0f172a"
          roughness={0.2}
          emissive="#38bdf8" // Light Sky Blue glow
          emissiveIntensity={0.2}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

export default PensieveBasin;