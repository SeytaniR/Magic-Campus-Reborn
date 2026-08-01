import { Entity } from '../core/Entity';
import { CombatAction } from './ActionQueueSystem';

export class AISystem {
  /**
   * Generates a combat action for an AI-controlled entity (Monster or Auto-Pet).
   * Currently uses a very basic logic: Basic attack on a random living enemy.
   */
  public decideAction(actor: Entity, allEntities: Entity[]): CombatAction | null {
    if (!actor.gridPosition || !actor.stats || actor.stats.combat.currentHp <= 0) {
      return null;
    }

    // Find living enemies
    const aliveEnemies = allEntities.filter(e => 
      e.gridPosition && 
      e.gridPosition.team !== actor.gridPosition!.team && 
      e.stats && 
      e.stats.combat.currentHp > 0
    );

    if (aliveEnemies.length === 0) {
      return null; // Battle is over
    }

    // Advanced AI would check if they are Ranged or Melee, check who is in range,
    // evaluate who has the lowest HP, or use specific skills based on cooldowns.
    
    // Basic AI: Pick random enemy
    const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

    return {
      actorId: actor.id,
      targetId: target.id,
      skillId: 'basic_attack'
    };
  }
}
