export enum StatusType {
  DOT = 'DOT',                 // Damage Over Time
  PARALYSIS = 'PARALYSIS',     // Hard CC, skips turn
  SLEEP = 'SLEEP',             // Skips turn, wakes on damage
  CONFUSION = 'CONFUSION',     // 25% chance behaviors
  STAT_BUFF = 'STAT_BUFF',     // Increases a base/combat stat
  STAT_DEBUFF = 'STAT_DEBUFF', // Decreases a base/combat stat
  DAMAGE_MOD = 'DAMAGE_MOD',   // Amplifies or reduces final damage
  TAUNT_COVER = 'TAUNT_COVER'  // Forces target redirection or intercepts damage
}

export interface StatusEffect {
  id: string;
  type: StatusType;
  durationTurns: number;
  value?: number; // e.g., DoT damage, or % buff
  targetStat?: string; // e.g., 'physicalDefense', 'speed'
  sourceEntityId?: string; // e.g., The Soldier who applied Taunt Cover
}

/**
 * Tracks all active status conditions on an entity.
 * Pure Data.
 */
export class StatusEffectsComponent {
  public effects: StatusEffect[];

  constructor() {
    this.effects = [];
  }

  addEffect(effect: StatusEffect) {
    this.effects.push(effect);
  }

  removeEffect(id: string) {
    this.effects = this.effects.filter(e => e.id !== id);
  }
}
