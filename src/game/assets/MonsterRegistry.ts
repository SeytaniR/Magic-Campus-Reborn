import { Element } from '../ecs/components/Stats';

export interface MonsterDef {
  id: string;
  namePattern: string;
  tier: string;
  biomes: string[];
  combatStyle: string;
  baseStatsSpread: {
    vitality: number;
    strength: number;
    intelligence: number;
    spirit: number;
    agility: number;
    mentality: number;
  };
  assetPath: string;
  attackAnimation?: string;
  description: string;
}

export class MonsterRegistry {
  private monsters: MonsterDef[] = [];

  constructor() {
    this.loadMonsters();
  }

  private loadMonsters() {
    // Dynamically import all JSON files in the public/monstros directory
    // In Vite, this will fetch the JSON files during dev, and bundle them in production.
    const modules = import.meta.glob('/public/monstros/*.json', { eager: true });
    
    for (const path in modules) {
      const monsterConfig = modules[path] as MonsterDef;
      if (monsterConfig.id) {
        this.monsters.push(monsterConfig);
      }
    }
    console.log(`[MonsterRegistry] Loaded ${this.monsters.length} monsters.`);
  }

  public getAllMonsters(): MonsterDef[] {
    return this.monsters;
  }

  public getMonstersByBiome(biome: string): MonsterDef[] {
    return this.monsters.filter(m => m.biomes.includes(biome));
  }

  public getRandomMonster(biome?: string, tier?: string): MonsterDef | null {
    let pool = this.monsters;
    if (biome) {
      pool = pool.filter(m => m.biomes.includes(biome));
    }
    if (tier) {
      pool = pool.filter(m => m.tier === tier);
    }

    if (pool.length === 0) {
      // Fallback if none found for specific biome/tier
      pool = this.monsters;
    }

    if (pool.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }
}

export const monsterRegistry = new MonsterRegistry();
