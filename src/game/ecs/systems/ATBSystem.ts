import { Entity } from '../core/Entity';
import { StatusType } from '../components/StatusEffects';

export class ATBSystem {
  /**
   * Ticks the ATB bar for all entities.
   * Should be called in a loop until at least one entity reaches 1000 ATB.
   * @param entities List of combat entities
   * @returns List of entities that are ready to act (ATB >= 1000)
   */
  public tick(entities: Entity[]): Entity[] {
    const readyEntities: Entity[] = [];

    for (const entity of entities) {
      if (!entity.atb || !entity.stats || !entity.statusEffects || entity.stats.combat.currentHp <= 0) {
        continue; // Skip dead or invalid entities
      }

      // Check for Hard CC that prevents ATB progression (Paralysis, Sleep)
      const hasHardCC = entity.statusEffects.effects.some(
        e => e.type === StatusType.PARALYSIS || e.type === StatusType.SLEEP
      );

      if (hasHardCC) {
        // Option A: ATB freezes. Option B: ATB fills but turn is skipped.
        // Usually, ATB fills, then when it hits 1000, the turn is consumed to remove the CC duration.
        // Let's go with ATB filling so durations tick down on their 'turn'.
      }

      // Base speed
      const speed = entity.stats.combat.speed;
      
      // Calculate +/- 5% randomness
      const rngFactor = 0.95 + (Math.random() * 0.10); 
      const tickAmount = speed * rngFactor;

      entity.atb.value += tickAmount;

      if (entity.atb.value >= 1000) {
        entity.atb.isReady = true;
        
        if (hasHardCC) {
          // Consume turn immediately to tick down CC (logic for ticking down CC will be in SkillSystem/StatusSystem)
          // For now, we just reset their ATB so they don't get stuck at 1000 without acting.
          // Alternatively, we flag them ready and let the ActionQueueSystem handle skipping them.
          // Let's pass them to ActionQueue to process the skipped turn formally.
        }
        
        readyEntities.push(entity);
      }
    }

    return readyEntities;
  }
}
