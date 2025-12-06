import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import PensieveBasin from './PensieveBasin';
import PensieveLiquid from './PensieveLiquid';
import MemoryParticles from './MemoryParticles';
import MemoryThread from './MemoryThread';
import PensieveLanguageRing from './PensieveLanguageRing';
import { usePensieveState } from '@/state/pensieveState';

const PensieveScene: React.FC = () => {
  const { isUnlocked } = usePensieveState();

  return (
    <div className="w-full h-screen bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={45} />
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.1} 
          minPolarAngle={Math.PI / 6}
          minDistance={4}
          maxDistance={12}
        />
        
        {/* Low ambient light to allow for contrast */}
        <ambientLight intensity={0.1} />
        
        {/* Main Moon/Key Light - Cool blue-white, casting shadows */}
        <pointLight position={[8, 12, 8]} intensity={1.5} color="#c0d0ff" />
        
        {/* Fill Light - Darker blue to lift shadows slightly */}
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#1e293b" />
        
        {/* Strong Rim Light - Backlight to define the basin shape against dark background */}
        <spotLight 
          position={[0, 5, -8]} 
          angle={1.0} 
          penumbra={0.5} 
          intensity={5.0} 
          color="#38bdf8" 
          distance={20}
        />

        {/* Top-down Highlight - Brings out the liquid and inner basin texture */}
        <spotLight 
          position={[0, 15, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={1.0} 
          color="#ffffff" 
        />
        
        <color attach="background" args={['#050505']} />
        
        <Suspense fallback={null}>
          <PensieveBasin />
          <PensieveLiquid />
          <PensieveLanguageRing />
          <MemoryParticles />
          {isUnlocked && <MemoryThread />}
          
          <Environment preset="night" blur={0.8} />
        </Suspense>

        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            intensity={0.8} 
            radius={0.6}
            mipmapBlur
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default PensieveScene;

