import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { PensieveBasin } from './PensieveBasin';
import { PensieveLiquid } from './PensieveLiquid';
import { MemoryThread } from './MemoryThread';
import { MemoryParticles } from './MemoryParticles';
import { usePensieveStore, type PensieveMode } from '../../state/pensieveState';
import * as THREE from 'three';

interface PensieveSceneProps {
  mode?: PensieveMode;
  onRevealCompleted?: () => void;
}

// Component to handle responsive camera adjustments
const ResponsiveCamera = () => {
  const { camera, size } = useThree();
  
  useEffect(() => {
    const aspect = size.width / size.height;
    
    // Base position for desktop (wide)
    const basePos = new THREE.Vector3(0, 6, 5);
    
    if (aspect < 1.0) {
      // Portrait mode (mobile)
      // Move camera back and up to keep basin in frame
      // Scale factor based on how narrow it is
      const factor = 1.0 / aspect; 
      camera.position.set(0, basePos.y * Math.pow(factor, 0.5), basePos.z * factor);
    } else {
      // Landscape
      camera.position.copy(basePos);
    }
    
    camera.lookAt(0, -0.5, 0);
    camera.updateProjectionMatrix();
  }, [size, camera]);

  return null;
};

const SceneContent = ({ onRevealCompleted }: { onRevealCompleted?: () => void }) => {
  const mode = usePensieveStore((state) => state.mode);
  
  useEffect(() => {
    if (mode === 'REVEALED' && onRevealCompleted) {
      const timer = setTimeout(onRevealCompleted, 2000); 
      return () => clearTimeout(timer);
    }
  }, [mode, onRevealCompleted]);

  return (
    <>
      {/* Dark, moody gradient background */}
      <color attach="background" args={['#050a10']} />
      <fog attach="fog" args={['#050a10', 8, 20]} />

      <ambientLight intensity={0.1} color="#001020" />
      
      {/* Main "God Ray" from top-down */}
      <spotLight
        position={[0, 8, 2]}
        target-position={[0, 0, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={2.0}
        color="#c0e0ff"
        castShadow
      />
      
      {/* Rim light / Bounce light */}
      <pointLight position={[-4, 2, -4]} intensity={0.5} color="#406080" />
      <pointLight position={[4, 1, 4]} intensity={0.3} color="#102030" />

      <group position={[0, -1.5, 0]}>
        <PensieveBasin />
        <PensieveLiquid />
        <MemoryThread />
        <MemoryParticles />
      </group>

      <EffectComposer>
        <Bloom luminanceThreshold={0.4} mipmapBlur intensity={1.2} radius={0.5} />
        <Vignette offset={0.2} darkness={0.7} eskil={false} />
        <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
      
      <ResponsiveCamera />
    </>
  );
};

export const PensieveScene = (props: PensieveSceneProps) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <Canvas
        // Cinematic high-angle camera (initial props, overridden by ResponsiveCamera)
        camera={{ position: [0, 6, 5], fov: 35, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        shadows
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      >
        <SceneContent onRevealCompleted={props.onRevealCompleted} />
      </Canvas>
    </div>
  );
};
