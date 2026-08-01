export enum Element {
  FIRE = 'FIRE',
  WATER = 'WATER',
  EARTH = 'EARTH',
  WIND = 'WIND',
  NEUTRAL = 'NEUTRAL'
}

/**
 * Represents the 6 primary attributes of an entity.
 */
export interface BaseStats {
  vitality: number; // Vitalidade (VIT)
  strength: number; // Força (FOR)
  intelligence: number; // Inteligência (INT)
  spirit: number; // Espírito (ESP)
  agility: number; // Agilidade (AGI)
  mentality: number; // Mentalidade (MEN)
}

/**
 * Represents the derived combat attributes.
 * These are calculated from BaseStats + Equipment + Passives.
 */
export interface CombatStats {
  maxHp: number;
  currentHp: number;
  
  physicalDamage: number;
  magicalDamage: number;
  
  physicalDefense: number;
  magicalDefense: number;
  
  speed: number;
  
  accuracy: number;
  evasion: number;
  
  energy: number; // Used for buff/debuff resistance and application
  
  criticalChance: number; // Percentage (e.g., 0.15 = 15%)
  counterAttackChance: number; // Percentage
  doubleStrikeChance: number; // Percentage
  healEffectiveness: number; // Multiplier (e.g., 1.0 = 100%)
  
  element: Element; // Fogo, Água, Terra, Vento, Neutro
}

/**
 * The core Stats Component attached to any combat entity.
 * Pure Data.
 */
export class StatsComponent {
  public base: BaseStats;
  public combat: CombatStats;

  constructor(base: BaseStats, combat: CombatStats) {
    this.base = base;
    this.combat = combat;
  }
}
