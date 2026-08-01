import React, { useEffect, useState } from 'react';
import { battleManager } from '../../game/ecs/BattleManager';
import { Team } from '../../game/ecs/components/GridPosition';

export default function BattleUI() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    battleManager.setOnStateChange(() => setTick(t => t + 1));
    
    // Start engine tick loop
    const interval = setInterval(() => {
      battleManager.tick();
    }, 50); // 20 ticks per second
    
    return () => {
      clearInterval(interval);
      battleManager.setOnStateChange(() => {});
    };
  }, []);

  const playerTeam = battleManager.entities.filter(e => e.gridPosition!.team === Team.A);
  const enemyTeam = battleManager.entities.filter(e => e.gridPosition!.team === Team.B);

  return (
    <div className="absolute inset-0 pointer-events-none flex p-4 z-10">
      
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
