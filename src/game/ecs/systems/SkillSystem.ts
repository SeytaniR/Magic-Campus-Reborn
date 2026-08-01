import { Entity } from '../core/Entity';
import { StatusType } from '../components/StatusEffects';

export class SkillSystem {
  
  /**
   * Called right before an entity takes its action (or skips it due to CC).
   * Processes all active Status Effects for the current turn.
   */
  public processStartOfTurnEffects(entity: Entity) {
    if (!entity.statusEffects || !entity.stats) return;

    // Apply DoTs and tick down durations
    for (let i = entity.statusEffects.effects.length - 1; i >= 0; i--) {
      const effect = entity.statusEffects.effects[i];

      // Apply Damage Over Time
      if (effect.type === StatusType.DOT && effect.value) {
        entity.stats.combat.currentHp -= effect.value;
        console.log(`[STATUS] ${entity.name} sofreu ${effect.value} de dano por Veneno/Sangramento. HP: ${entity.stats.combat.currentHp}`);
      }

      // Tick down duration
      effect.durationTurns--;

      // Remove expired effects
      if (effect.durationTurns <= 0) {
        console.log(`[STATUS] O efeito ${effect.type} em ${entity.name} expirou.`);
        entity.statusEffects.effects.splice(i, 1);
      }
    }
  }

  /**
   * Called to apply a new status effect to an entity
   */
  public applyStatusEffect(target: Entity, source: Entity, type: StatusType, duration: number, value?: number) {
    if (!target.statusEffects) return;

    // Energy stat represents resistance to status. 
    // Higher energy = chance to resist debuffs.
    // We can add the math for that later. For now, it always applies.

    target.statusEffects.addEffect({
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      durationTurns: duration,
      value,
      sourceEntityId: source.id
    });

    console.log(`[HABILIDADE] ${source.name} aplicou ${type} em ${target.name} por ${duration} turnos!`);
  }
}
