import { Entity } from './core/Entity';
import { StatsComponent, BaseStats, CombatStats, Element } from './components/Stats';
import { GridPositionComponent, GridLine, Team } from './components/GridPosition';
import { ATBComponent } from './components/ATB';
import { StatusEffectsComponent, StatusType } from './components/StatusEffects';
import { ATBSystem } from './systems/ATBSystem';
import { ActionQueueSystem } from './systems/ActionQueueSystem';
import { CombatSystem } from './systems/CombatSystem';

// Helper to create a dummy entity
function createEntity(id: string, name: string, team: Team, line: GridLine, speed: number, hp: number, physDmg: number, physDef: number, element: Element = Element.NEUTRAL): Entity {
  const e = new Entity(id, name);
  
  const base: BaseStats = { vitality: 10, strength: 10, intelligence: 10, spirit: 10, agility: 10, mentality: 10 };
  const combat: CombatStats = {
    maxHp: hp, currentHp: hp, physicalDamage: physDmg, magicalDamage: 0, physicalDefense: physDef, magicalDefense: 0,
    speed, accuracy: 100, evasion: 0, energy: 0, criticalChance: 0.2, counterAttackChance: 0.1, doubleStrikeChance: 0.1, healEffectiveness: 1.0,
    element
  };
  
  e.stats = new StatsComponent(base, combat);
  e.gridPosition = new GridPositionComponent(team, line, 0);
  e.atb = new ATBComponent(0);
  e.statusEffects = new StatusEffectsComponent();

  return e;
}

async function runSimulation() {
  console.log("=== INICIANDO SIMULAÇÃO DE COMBATE ECS ===\n");

  const lutador = createEntity('p1', 'Lutador (Fogo)', Team.A, GridLine.BACK, 100, 500, 150, 50, Element.FIRE);
  const monstroFront = createEntity('m1', 'Sapo (Água)', Team.B, GridLine.FRONT, 80, 200, 50, 20, Element.WATER);
  const monstroBack = createEntity('m2', 'Arqueiro (Vento)', Team.B, GridLine.BACK, 120, 150, 80, 10, Element.WIND);
  
  const entities = [lutador, monstroFront, monstroBack];

  const atbSystem = new ATBSystem();
  const queueSystem = new ActionQueueSystem();
  const combatSystem = new CombatSystem();

  let turnCount = 0;

  // Simulate 10 turns of actions
  while (turnCount < 10) {
    const readyEntities = atbSystem.tick(entities);

    for (const ready of readyEntities) {
      if (ready.stats!.combat.currentHp <= 0) continue; // Skip if killed this turn by someone else

      const actionState = queueSystem.processReadyEntity(ready);
      
      if (actionState === 'WAITING_FOR_PLAYER') {
        // AI Logic Mock: Pick a random alive enemy
        const aliveEnemies = entities.filter(e => e.gridPosition!.team !== ready.gridPosition!.team && e.stats!.combat.currentHp > 0);
        if (aliveEnemies.length === 0) {
          console.log("\nVITÓRIA! Batalha encerrada.");
          return;
        }

        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        
        console.log(`[Turno ${++turnCount}] ${ready.name} (ATB Cheio) decide atacar ${target.name}...`);
        
        combatSystem.executeAction({
          actorId: ready.id,
          targetId: target.id,
          skillId: 'basic_attack'
        }, entities);

        console.log("---");
      }
    }
  }
}

runSimulation();
