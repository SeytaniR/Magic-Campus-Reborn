import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../game/store';
import { MapPolygon } from '../../types';

function MapEffectMesh({ poly, effectType }: { poly: MapPolygon, effectType: 'water' | 'crystal' }) {
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);
  
  const particles = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const vs = poly.points.map(p => [p.x, p.y]);
    for (const p of poly.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const area = (maxX - minX) * (maxY - minY);
    // Rough estimation of how many particles based on the bounding box area
    // Reduced by 50%
    const desiredCount = Math.max(10, Math.min(1000, Math.floor(area / 3000)));
    
    const pos = [];
    const phases = [];
    let attempts = 0;
    
    while(pos.length < desiredCount * 3 && attempts < desiredCount * 20) {
      attempts++;
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          const xi = vs[i][0], yi = vs[i][1];
          const xj = vs[j][0], yj = vs[j][1];
          const intersect = ((yi > y) !== (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
      }
      if (inside) {
         pos.push(x, -y, 0);
         phases.push(Math.random() * Math.PI * 2);
      }
    }
    
    return { 
      positions: new Float32Array(pos), 
      phases: new Float32Array(phases) 
    };
  }, [poly]);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color(effectType === 'crystal' ? '#d8b4fe' : '#93c5fd') }
  }), [effectType]);

  useFrame((state) => {
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={particles.positions.length / 3} 
          array={particles.positions} 
          itemSize={3} 
        />
        <bufferAttribute 
          attach="attributes-phase" 
          count={particles.phases.length} 
          array={particles.phases} 
          itemSize={1} 
        />
      </bufferGeometry>
      <shaderMaterial 
        ref={shaderMaterialRef}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float phase;
          varying float vAlpha;
          uniform float time;
          void main() {
            // vary alpha between 0.2 and 1.0 based on time and phase
            vAlpha = 0.6 + 0.4 * sin(time * 1.5 + phase);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = (12.0 * vAlpha); 
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          varying float vAlpha;
          void main() {
            vec2 xy = gl_PointCoord.xy - vec2(0.5);
            float ll = length(xy);
            if(ll > 0.5) discard;
            // Soft edge calculation
            float alpha = smoothstep(0.5, 0.0, ll) * vAlpha;
            // Opacity reduced by 30% from previous value
            gl_FragColor = vec4(color, alpha * 0.63);
          }
        `}
      />
    </points>
  );
}

export default function MapEffects() {
  const { mapData, mapImageSize } = useGameStore();

  const effects = useMemo(() => {
    if (!mapData || mapImageSize.width === 0) return [];
    
    return mapData.polygons
      .filter(p => p.type === 'effect' && p.points.length >= 3)
      .map(poly => ({
        poly,
        effectType: (poly.effectType || 'water') as 'water' | 'crystal',
        id: poly.id
      }));
  }, [mapData, mapImageSize]);

  return (
    <group position={[0, 0, 0.1]}> {/* slightly above the map plane */}
      {effects.map(({ poly, effectType, id }) => (
        <MapEffectMesh key={id} poly={poly} effectType={effectType} />
      ))}
    </group>
  );
}
