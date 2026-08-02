import { Entity } from './core/Entity';
import { ATBSystem } from './systems/ATBSystem';
import { ActionQueueSystem } from './systems/ActionQueueSystem';
import { CombatSystem, CombatAction } from './systems/CombatSystem';
import { SkillSystem } from './systems/SkillSystem';
import { AISystem } from './systems/AISystem';
import { Team, GridLine, GridPositionComponent } from './components/GridPosition';
import { StatsComponent, Element } from './components/Stats';
import { ATBComponent } from './components/ATB';
import { StatusEffectsComponent } from './components/StatusEffects';
import { monsterRegistry } from '../assets/MonsterRegistry';
export class BattleManager {
  public entities: Entity[] = [];
  public active: boolean = false;
  public waitingForPlayerInput: Entity | null = null;
  public combatLog: string[] = [];
  public entityAnimations: Record<string, string> = {};

  private atbSystem = new ATBSystem();
  private queueSystem = new ActionQueueSystem();
  private combatSystem = new CombatSystem();
  private skillSystem = new SkillSystem();
  private aiSystem = new AISystem();

  private stateChangeCallbacks = new Set<() => void>();
  private onBattleEndCallback: ((victory: boolean) => void) | null = null;

  public addOnStateChange(cb: () => void) {
    this.stateChangeCallbacks.add(cb);
  }

  public removeOnStateChange(cb: () => void) {
    this.stateChangeCallbacks.delete(cb);
  }

  public setOnBattleEnd(cb: (victory: boolean) => void) {
    this.onBattleEndCallback = cb;
  }

  private notify() {
    this.stateChangeCallbacks.forEach(cb => cb());
  }

  private log(msg: string) {
    this.combatLog.unshift(msg); // Add to beginning so latest is index 0
    if (this.combatLog.length > 50) this.combatLog.pop();
  }

  public startBattle(playerClass: string) {
    this.entities = [];
    this.combatLog = ["A batalha começou!"];
    this.active = true;
    this.waitingForPlayerInput = null;

    // Create Player Entity
    const player = new Entity('player1', 'Herói');
    player.stats = new StatsComponent(
      { vitality: 30, strength: 30, intelligence: 10, spirit: 10, agility: 20, mentality: 10 },
      { 
        maxHp: 500, currentHp: 500, physicalDamage: 120, magicalDamage: 0, 
        physicalDefense: 50, magicalDefense: 30, speed: 110, accuracy: 100, evasion: 5, 
        energy: 0, criticalChance: 0.1, counterAttackChance: 0.05, doubleStrikeChance: 0.05, 
        healEffectiveness: 1.0, element: Element.NEUTRAL 
      }
    );
    player.gridPosition = new GridPositionComponent(Team.A, GridLine.BACK, 2);
    player.atb = new ATBComponent(0);
    player.statusEffects = new StatusEffectsComponent();
    // Use assetPath trick for the UI to know what model to load
    (player as any).assetPath = `/characters/${playerClass}.glb`;
    this.entities.push(player);

    // Create 3 Enemy Monsters dynamically
    const elements = [Element.EARTH, Element.FIRE, Element.WATER, Element.WIND];
    const colors = ["Verde", "Fogo", "Água", "Vento"];
    const colorHex = ["#4caf50", "#ff4444", "#4444ff", "#aaaaaa"];
    
    for (let i = 0; i < 3; i++) {
      const eIdx = Math.floor(Math.random() * elements.length);
      
      const monsterDef = monsterRegistry.getRandomMonster() || {
        id: "fallback",
        namePattern: "Cogumelo {elemento}",
        tier: "C",
        biomes: [],
        combatStyle: "MELEE_PHYSICAL",
        description: "",
        baseStatsSpread: { vitality: 30, strength: 15, intelligence: 5, spirit: 5, agility: 10, mentality: 5 },
        assetPath: "/monstros/cogumelo.glb",
        attackAnimation: "Shield_Dash_RM"
      };

      const finalName = monsterDef.namePattern.replace("{elemento}", colors[eIdx]);
      const enemy = new Entity(`enemy${i}`, finalName);
      
      // Simple scaling from base stats for mockup purposes
      const base = monsterDef.baseStatsSpread;
      enemy.stats = new StatsComponent(
        base,
        { 
          maxHp: base.vitality * 15, currentHp: base.vitality * 15, 
          physicalDamage: base.strength * 3, magicalDamage: base.intelligence * 3, 
          physicalDefense: base.vitality * 1 + base.strength * 1, 
          magicalDefense: base.spirit * 2, 
          speed: base.agility * 2 + Math.random() * 20, 
          accuracy: 90 + base.mentality * 2, evasion: base.agility * 2, energy: base.intelligence * 2 + base.spirit * 2, 
          criticalChance: 0.05 + base.mentality * 0.002, 
          counterAttackChance: base.strength * 0.001, doubleStrikeChance: base.mentality * 0.002, healEffectiveness: 1.0 + base.spirit * 0.01, 
          element: elements[eIdx] 
        }
      );
      
      // Put some in front, some in back
      enemy.gridPosition = new GridPositionComponent(Team.B, i % 2 === 0 ? GridLine.FRONT : GridLine.BACK, i);
      enemy.atb = new ATBComponent(Math.random() * 200); // Random initial ATB advantage
      enemy.statusEffects = new StatusEffectsComponent();
      (enemy as any).assetPath = monsterDef.assetPath;
      (enemy as any).colorOverride = colorHex[eIdx];
      (enemy as any).attackAnimation = monsterDef.attackAnimation;
      this.entities.push(enemy);
    }

    this.notify();
  }

  public tick() {
    if (!this.active) return;
    if (this.waitingForPlayerInput) return; // Wait for player

    // Check win/loss conditions
    const teamAAlive = this.entities.filter(e => e.gridPosition!.team === Team.A && e.stats!.combat.currentHp > 0);
    const teamBAlive = this.entities.filter(e => e.gridPosition!.team === Team.B && e.stats!.combat.currentHp > 0);

    if (teamAAlive.length === 0) {
      this.active = false;
      this.log("Você foi derrotado...");
      this.notify();
      if (this.onBattleEndCallback) setTimeout(() => this.onBattleEndCallback!(false), 2000);
      return;
    }
    
    if (teamBAlive.length === 0) {
      this.active = false;
      this.log("Vitória!");
      this.notify();
      if (this.onBattleEndCallback) setTimeout(() => this.onBattleEndCallback!(true), 2000);
      return;
    }

    const readyEntities = this.atbSystem.tick(this.entities);

    for (const ready of readyEntities) {
      if (ready.stats!.combat.currentHp <= 0) continue;

      const actionState = this.queueSystem.processReadyEntity(ready);
      
      if (actionState === 'WAITING_FOR_PLAYER') {
        if (ready.gridPosition!.team === Team.A) {
           this.waitingForPlayerInput = ready;
           this.notify();
           return; // Pause the engine for input
        } else {
           // AI Turn
           const action = this.aiSystem.decideAction(ready, this.entities);
           if (action) {
              const target = this.entities.find(e => e.id === action.targetId);
              this.log(`${ready.name} ataca ${target?.name || 'alguém'}!`);
              this.combatSystem.executeAction(action, this.entities);
           }
        }
      }
    }

    this.notify();
  }

  public handlePlayerAction(actionType: 'attack' | 'defend' | 'flee', targetId?: string) {
    if (!this.waitingForPlayerInput) return;
    const actor = this.waitingForPlayerInput;

    if (actionType === 'flee') {
      this.log(`${actor.name} tentou fugir!`);
      const action: CombatAction = { actorId: actor.id, skillId: 'flee' };
      const success = this.combatSystem.executeAction(action, this.entities);
      // Wait, executeAction returns void. Flee sets a flag or handles it.
      // We should check if flee was successful in combat system.
      // But combatSystem just checks RNG. We need a way to know if it ended the battle.
      // For now, let's just say Flee always works for testing, or we rely on the log.
      // Let's modify CombatSystem to actually return boolean for flee? Not now.
      // The CombatSystem currently console.logs. We need to redirect CombatSystem logs to BattleManager!
    } else if (actionType === 'attack') {
      const target = this.entities.find(e => e.id === targetId);
      if (!target) return;
      this.log(`${actor.name} atacou ${target.name}!`);
      this.combatSystem.executeAction({ actorId: actor.id, targetId: target.id, skillId: 'basic_attack' }, this.entities);
    } else if (actionType === 'defend') {
      this.log(`${actor.name} está se defendendo!`);
      // Emulate defend (maybe give 50% damage reduction buff next turn?)
      // For now, just reset ATB
      if (actor.atb) {
        actor.atb.value = 0;
        actor.atb.isReady = false;
      }
    }

    this.waitingForPlayerInput = null;
    this.notify();
  }

  public injectLog(msg: string) {
    this.log(msg);
    this.notify();
  }
}

// Global instance for the client
export const battleManager = new BattleManager();
