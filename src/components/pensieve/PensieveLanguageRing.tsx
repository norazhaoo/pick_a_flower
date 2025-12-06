import React, { useState, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { usePensieveState, Language } from '@/state/pensieveState';
import { useFrame } from '@react-three/fiber';
import { Vector3, Euler } from 'three';

// Static map of languages for the ring
const languagesConfig: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
];

const PensieveLanguageRing: React.FC = () => {
  const { language, setLanguage } = usePensieveState();
  const [hoveredLang, setHoveredLang] = useState<Language | null>(null);
  
  const languages = useMemo(() => [
    ...languagesConfig,
    { code: 'spell' as Language, label: 'Spell' }
  ], []);

  const radius = 3.0; // Reduced radius to sit inside the rim
  const height = 0.3; // Lower height to fit inside
  
  return (
    <group position={[0, height, 0]}>
      {languages.map((lang, index) => {
        const angle = (index / languages.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const isSelected = language === lang.code;
        const isHovered = hoveredLang === lang.code;
        const isActive = isSelected || isHovered;

        return (
          <LanguageItem 
            key={lang.code}
            label={lang.label}
            position={[x, 0, z]}
            // Using 'YXZ' order to safely apply rotations:
            // 1. Z(90deg): Rotate text 90deg in its plane so it reads "Up".
            // 2. X(-45deg): Tilt the plane back 45deg (Slope).
            // 3. Y(-angle - 90deg): Rotate around the center to the correct radial position.
            rotation={new Euler(-Math.PI / 4, -angle - Math.PI / 2, Math.PI / 2, 'YXZ')}
            isActive={isActive}
            isSelected={isSelected}
            onClick={() => setLanguage(lang.code)}
            onPointerOver={() => setHoveredLang(lang.code)}
            onPointerOut={() => setHoveredLang(null)}
          />
        );
      })}
    </group>
  );
};

interface LanguageItemProps {
  label: string;
  position: [number, number, number];
  rotation: [number, number, number];
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

const LanguageItem: React.FC<LanguageItemProps> = ({ 
  label, position, rotation, isActive, isSelected, onClick, onPointerOver, onPointerOut 
}) => {
  // Subtle floating animation for selected/hovered items
  // Removed unused 'vec'
  
  useFrame((state) => {
     if (isSelected) {
         // Pulse effect
         // Removed unused 't'
         // Slight vertical bob or color pulse logic could go here
     }
  });

  return (
    <Text
      position={position}
      rotation={rotation as any} // Cast to any to avoid strict tuple check
      fontSize={isSelected ? 0.35 : 0.25}
      // Use default font to avoid loading errors
      color={isSelected ? "#ffffff" : (isActive ? "#e2e8f0" : "#64748b")}
      anchorX="center"
      anchorY="middle"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); }}
      onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); }}
      outlineWidth={isSelected ? 0.02 : 0}
      outlineColor="#ffffff"
      fillOpacity={isActive ? 1 : 0.6}
    >
      {label}
    </Text>
  );
};

export default PensieveLanguageRing;
