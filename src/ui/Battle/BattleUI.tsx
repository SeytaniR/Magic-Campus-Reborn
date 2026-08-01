import React, { useEffect, useState } from 'react';
import { battleManager } from '../../game/ecs/BattleManager';
import { Team } from '../../game/ecs/components/GridPosition';
import { hudPositions } from './BattleScene';

export default function BattleUI() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleStateChange = () => setTick(t => t + 1);
    battleManager.addOnStateChange(handleStateChange);
    
    // Start engine tick loop
    const interval = setInterval(() => {
      battleManager.tick();
    }, 50); // 20 ticks per second
    
    return () => {
      clearInterval(interval);
      battleManager.removeOnStateChange(handleStateChange);
    };
  }, []);

  const playerTeam = battleManager.entities.filter(e => e.gridPosition!.team === Team.A);
  const enemyTeam = battleManager.entities.filter(e => e.gridPosition!.team === Team.B);

  return (
    <div className="absolute inset-0 pointer-events-none flex p-4 z-10 overflow-hidden">
      
      {/* 2D Projected HUD for Entities */}
      {battleManager.entities.map(entity => {
        if (entity.stats!.combat.currentHp <= 0) return null;
        const pos = hudPositions[entity.id];
        if (!pos) return null; // Not yet projected

        const hpPct = Math.max(0, entity.stats!.combat.currentHp / entity.stats!.combat.maxHp) * 100;
        const atbPct = Math.min(100, ((entity.atb?.value || 0) / 1000) * 100);

        return (
          <div 
            key={`hud-${entity.id}`} 
            className="absolute flex flex-col items-center pointer-events-none"
            style={{ 
              left: pos.x, 
              top: pos.y,
              transform: 'translate(-50%, -100%)',
              width: '80px'
            }}
          >
            <span 
              className="text-[11px] font-bold text-white mb-0.5" 
              style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}
            >
              {entity.name}
            </span>
            <div className="w-full bg-gray-900 border border-black/80 h-1.5 rounded-sm overflow-hidden mb-[1px]">
              <div className="bg-green-500 h-full" style={{ width: `${hpPct}%` }} />
            </div>
            <div className="w-full bg-gray-900 border border-black/80 h-1 rounded-sm overflow-hidden">
              <div className="bg-yellow-400 h-full transition-all duration-75" style={{ width: `${atbPct}%` }} />
            </div>
          </div>
        );
      })}

      {/* Combat Log */}
      <div className="absolute bottom-4 left-4 w-80 h-32 overflow-hidden flex flex-col justify-end">
        <div className="space-y-1">
          {battleManager.combatLog.slice(0, 5).reverse().map((log, i) => (
            <div key={i} className="text-white text-xs bg-black/60 px-2 py-1 rounded shadow border border-white/10">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Action Menu (Vertical, Right-Aligned like Magic Campus) */}
      {battleManager.waitingForPlayerInput && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 pointer-events-auto flex flex-col bg-cyan-900/80 border border-cyan-400 p-2 rounded shadow-2xl min-w-[120px]">
          <div className="text-center text-cyan-200 text-xs font-bold bg-cyan-950 mb-2 py-1 rounded">
            Ações
          </div>
          
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => {
                const aliveEnemies = enemyTeam.filter(e => e.stats!.combat.currentHp > 0);
                if (aliveEnemies.length > 0) {
                  (battleManager as any).setEntityAnimation?.(battleManager.waitingForPlayerInput!.id, 'attack', 1000);
                  battleManager.handlePlayerAction('attack', aliveEnemies[0].id);
                }
              }}
              className="bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-white font-bold py-1.5 px-3 rounded shadow text-sm border border-orange-200"
            >
              Ataque
            </button>
            <button 
              onClick={() => battleManager.handlePlayerAction('defend')}
              className="bg-gradient-to-b from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 text-white font-bold py-1.5 px-3 rounded shadow text-sm border border-cyan-200"
            >
              Defesa
            </button>
            <button 
              disabled
              className="bg-gradient-to-b from-gray-400 to-gray-600 opacity-50 cursor-not-allowed text-white font-bold py-1.5 px-3 rounded shadow text-sm border border-gray-200"
            >
              Magia
            </button>
            <button 
              disabled
              className="bg-gradient-to-b from-gray-400 to-gray-600 opacity-50 cursor-not-allowed text-white font-bold py-1.5 px-3 rounded shadow text-sm border border-gray-200"
            >
              Captura
            </button>
            <button 
              disabled
              className="bg-gradient-to-b from-gray-400 to-gray-600 opacity-50 cursor-not-allowed text-white font-bold py-1.5 px-3 rounded shadow text-sm border border-gray-200"
            >
              Item
            </button>
            <button 
              onClick={() => battleManager.handlePlayerAction('flee')}
              className="bg-gradient-to-b from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 text-white font-bold py-1.5 px-3 rounded shadow text-sm border border-cyan-200 mt-2"
            >
              Fuga
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
