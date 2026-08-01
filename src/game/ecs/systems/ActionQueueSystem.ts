import { Entity } from '../core/Entity';
import { StatusType } from '../components/StatusEffects';

export interface CombatAction {
  actorId: string;
  targetId: string;
  skillId: string; // 'basic_attack', 'basic_defense', 'flee', or specific skill UUID
}

export class ActionQueueSystem {
  /**
   * Processes an entity whose ATB reached 1000.
   * If the entity is under Hard CC, their turn is consumed and they do nothing.
   * Otherwise, the engine should pause and request an action (from Player or AI).
   * 
   * @param entity The entity ready to act
   * @returns An action if forced by CC/AI, or null if waiting for Player input
   */
  public processReadyEntity(entity: Entity): CombatAction | 'WAITING_FOR_PLAYER' | 'TURN_SKIPPED' {
    if (!entity.statusEffects || !entity.atb) return 'TURN_SKIPPED';

    const hasHardCC = entity.statusEffects.effects.some(
      e => e.type === StatusType.PARALYSIS || e.type === StatusType.SLEEP
    );

    if (hasHardCC) {
      // Consume turn
      entity.atb.value = 0;
      entity.atb.isReady = false;
      return 'TURN_SKIPPED';
    }

    const hasConfusion = entity.statusEffects.effects.some(e => e.type === StatusType.CONFUSION);
    if (hasConfusion) {
      // Confusion logic rolls a D4 to override action.
      // 1 = Normal (Waiting for player)
      // 2 = Self hit
      // 3 = Ally hit
      // 4 = Enemy hit
      const roll = Math.floor(Math.random() * 4) + 1;
      if (roll === 1) {
        // Player retains control
        return 'WAITING_FOR_PLAYER';
      } else {
        // Force an action (Targeting will be resolved by the CombatSystem or AI)
        // For now, we return a special placeholder that CombatSystem will interpret
        return {
          actorId: entity.id,
          targetId: `CONFUSION_TARGET_${roll}`, // 2=self, 3=ally, 4=enemy
          skillId: 'basic_attack'
        };
      }
    }

    // Normal behavior
    return 'WAITING_FOR_PLAYER';
  }
}
