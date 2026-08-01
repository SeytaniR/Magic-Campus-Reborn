import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../game/store';

export default function MapPortals() {
  const { mapData } = useGameStore();

  const portals = useMemo(() => {
    if (!mapData) return [];
    return mapData.polygons
      .filter(p => p.type === 'portal')
      .map(poly => {
        let cx = 0, cy = 0;
        for (let pt of poly.points) {
          cx += pt.x;
          cy += pt.y;
        }
        cx /= poly.points.length;
        cy /= poly.points.length;
        return { cx, cy, id: poly.id };
      });
  }, [mapData]);

  return (
    <>
      {portals.map(p => (
        <group key={p.id} position={[p.cx, -p.cy, 1]}>
          <Html center transform zIndexRange={[0, 0]}>
             <div className="portal-container">
               <svg viewBox="0 0 100 100" width="150" height="150" className="portal-pentagram">
                 <polygon points="50,5 61,35 93,35 68,54 77,85 50,65 23,85 32,54 7,35 39,35" fill="none" stroke="currentColor" strokeWidth="3" />
                 <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                 <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
                 <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
               </svg>
             </div>
          </Html>
        </group>
      ))}
    </>
  );
}
