import { Entity } from '../core/Entity';
import { CombatAction } from './ActionQueueSystem';
import { GridLine, Team } from '../components/GridPosition';
import { StatusType } from '../components/StatusEffects';
import { Element } from '../components/Stats';

export class CombatSystem {
  
  /**
   * Resolves a combat action (e.g. a basic attack or targeted skill)
   * @param action The intended action
   * @param entities All combat entities to find targets and evaluate Taunt covers
   */
  public executeAction(action: CombatAction, entities: Entity[]) {
    const actor = entities.find(e => e.id === action.actorId);
    if (!actor) return;

    if (action.skillId === 'flee') {
      this.executeFlee(actor, entities);
      return;
    }

    let target = entities.find(e => e.id === action.targetId);
    if (!target || !actor.stats || !target.stats) return;

    // 1. Evaluate Range Rules (if action is Melee)
    if (!this.isTargetInRange(actor, target, entities)) {
      console.log(`${actor.name} tentou atacar ${target.name}, mas está fora de alcance!`);
      // Consume ATB anyway since it was an invalid command
      if (actor.atb) actor.atb.value = 0;
      return;
    }

    // 2. Evaluate Taunt/Cover Interception
    const interceptor = this.findInterceptor(target, entities);
    if (interceptor) {
      console.log(`${interceptor.name} interceptou o ataque direcionado a ${target.name}!`);
      target = interceptor; // Change target
    }

    // 3. Evaluate Accuracy vs Evasion
    const acc = actor.stats.combat.accuracy;
    const eva = target.stats.combat.evasion;
    const hitChance = 1.0 + (acc - eva) / 100; // 100% + diff
    
    if (Math.random() > hitChance) {
      console.log(`${actor.name} errou o ataque em ${target.name}!`);
      this.finishTurn(actor);
      return;
    }

    // 4. Calculate Damage (Assuming basic physical attack for now)
    let rawDamage = actor.stats.combat.physicalDamage;

    // Critical Hit
    const critChance = actor.stats.combat.criticalChance;
    let isCrit = false;
    if (Math.random() < critChance) {
      isCrit = true;
      // Crit multiplies damage by 1.5x to 2.0x
      const critMultiplier = 1.5 + (Math.random() * 0.5); 
      rawDamage *= critMultiplier;
    }

    // 5. Defense Mitigation Formula (1000 / 1000 + DEF)
    const targetDef = target.stats.combat.physicalDefense;
    const defenseMultiplier = 1000 / (1000 + targetDef);
    
    let finalDamage = rawDamage * defenseMultiplier;

    // 6. Elemental Modifiers
    const actorElement = actor.stats.combat.element;
    const targetElement = target.stats.combat.element;
    const elementalMod = this.getElementalMultiplier(actorElement, targetElement);
    
    finalDamage *= elementalMod;

    // 7. Apply Damage
    target.stats.combat.currentHp = Math.max(0, target.stats.combat.currentHp - finalDamage);
    console.log(`${actor.name} causou ${finalDamage.toFixed(0)} de dano ${isCrit ? 'CRÍTICO ' : ''}em ${target.name}! HP restante: ${target.stats.combat.currentHp}`);

    // 8. Counter Attack Check (Target survives and counters)
    if (target.stats.combat.currentHp > 0) {
      const counterChance = target.stats.combat.counterAttackChance;
      if (Math.random() < counterChance) {
        console.log(`${target.name} contra-atacou ${actor.name}!`);
        this.applyDamage(target, actor, target.stats.combat.physicalDamage);
      }
    }

    // 9. Double Strike Check (Actor hits again)
    const doubleStrikeChance = actor.stats.combat.doubleStrikeChance;
    // We would need a flag to prevent infinite loops of double strikes (limit 1 per turn)
    // We'll skip recursive calls for now and just log it.
    if (Math.random() < doubleStrikeChance) {
      console.log(`${actor.name} ativou Ataque Duplo!`);
      this.applyDamage(actor, target, actor.stats.combat.physicalDamage * 0.5); // Second hit maybe 50% or 100%? Let's say 100% in real game.
    }

    this.finishTurn(actor);
  }

  /**
   * Helper to directly apply unmitigated/mitigated damage (used by counters)
   */
  private applyDamage(source: Entity, target: Entity, rawAmount: number) {
    if (!target.stats || !source.stats) return;
    const def = target.stats.combat.physicalDefense;
    const mult = 1000 / (1000 + def);
    let final = rawAmount * mult;
    
    // Apply elements on counter-attack too
    final *= this.getElementalMultiplier(source.stats.combat.element, target.stats.combat.element);

    target.stats.combat.currentHp = Math.max(0, target.stats.combat.currentHp - final);
  }

  private finishTurn(actor: Entity) {
    if (actor.atb) {
      actor.atb.value = 0;
      actor.atb.isReady = false;
    }
  }

  /**
   * Flee Logic
   * 50% + (Avg Party Speed - Avg Enemy Speed)
   */
  private executeFlee(actor: Entity, allEntities: Entity[]) {
    if (!actor.gridPosition) return;
    
    const myTeam = actor.gridPosition.team;
    let myTeamSpeedSum = 0;
    let myTeamCount = 0;
    
    let enemyTeamSpeedSum = 0;
    let enemyTeamCount = 0;

    allEntities.forEach(e => {
      if (!e.stats || !e.gridPosition || e.stats.combat.currentHp <= 0) return;
      if (e.gridPosition.team === myTeam) {
        myTeamSpeedSum += e.stats.combat.speed;
        myTeamCount++;
      } else {
        enemyTeamSpeedSum += e.stats.combat.speed;
        enemyTeamCount++;
      }
    });

    const avgMySpeed = myTeamCount > 0 ? myTeamSpeedSum / myTeamCount : 0;
    const avgEnemySpeed = enemyTeamCount > 0 ? enemyTeamSpeedSum / enemyTeamCount : 0;

    let escapeChance = 0.50 + ((avgMySpeed - avgEnemySpeed) / 100);
    
    // Floor of 15% chance to escape no matter what
    escapeChance = Math.max(0.15, escapeChance);
    // Ceiling of 95% chance
    escapeChance = Math.min(0.95, escapeChance);

    const roll = Math.random();
    if (roll <= escapeChance) {
      console.log(`[FUGA] ${actor.name} tentou fugir... E CONSEGUIU! (Chance: ${(escapeChance*100).toFixed(1)}%)`);
      // Em um jogo real, aqui dispararíamos um evento de fim de combate pro servidor.
    } else {
      console.log(`[FUGA] ${actor.name} tentou fugir... MAS FALHOU! (Chance: ${(escapeChance*100).toFixed(1)}%)`);
    }

    this.finishTurn(actor);
  }

  /**
   * Elemental Rock-Paper-Scissors Math
   * Água > Fogo > Vento > Terra > Água
   */
  private getElementalMultiplier(atkElement: Element, defElement: Element): number {
    if (atkElement === Element.NEUTRAL && defElement === Element.NEUTRAL) return 1.0;
    
    // Target is neutral, receives 15% more damage from any Element
    if (defElement === Element.NEUTRAL && atkElement !== Element.NEUTRAL) {
      return 1.15;
    }

    // Attacker is neutral against an Element (Normal damage)
    if (atkElement === Element.NEUTRAL && defElement !== Element.NEUTRAL) {
      return 1.0;
    }

    // Check Advantage
    if (
      (atkElement === Element.WATER && defElement === Element.FIRE) ||
      (atkElement === Element.FIRE && defElement === Element.WIND) ||
      (atkElement === Element.WIND && defElement === Element.EARTH) ||
      (atkElement === Element.EARTH && defElement === Element.WATER)
    ) {
      return 1.20; // +20% damage
    }

    // Check Disadvantage (Reverse of above)
    if (
      (atkElement === Element.FIRE && defElement === Element.WATER) ||
      (atkElement === Element.WIND && defElement === Element.FIRE) ||
      (atkElement === Element.EARTH && defElement === Element.WIND) ||
      (atkElement === Element.WATER && defElement === Element.EARTH)
    ) {
      return 0.80; // -20% damage
    }

    // Same element
    return 1.0;
  }

  /**
   * Evaluates if a melee attacker can reach the target based on Grid Rules.
   * Ranged ignores this.
   */
  private isTargetInRange(actor: Entity, target: Entity, allEntities: Entity[]): boolean {
    // Assuming we have a way to know if 'skillId' is Ranged. 
    // For Basic Attacks, let's assume Melee by default for this check.
    // If it's a Ranged character (Atirador, etc), they would skip this.
    
    if (!actor.gridPosition || !target.gridPosition) return true; // Failsafe

    if (actor.gridPosition.team === target.gridPosition.team) return true; // Can target allies (heals/buffs)

    const isActorFront = actor.gridPosition.line === GridLine.FRONT;
    const isTargetFront = target.gridPosition.line === GridLine.FRONT;

    // Melee Range is 2 (Front = 1, Back = 2 relative to center)
    // If actor is Back (2) and target is Front (1), distance is 3 (Too far? No, range +2 reaches L3).
    // Let's simplify the L1/L2 vs L3/L4 logic:
    
    // Melee in Backline can ONLY hit Enemy Frontline.
    if (!isActorFront) {
      if (isTargetFront) return true;
      
      // Target is Backline. Actor is Backline. Impossible UNLESS enemy frontline is entirely dead/empty.
      const isEnemyFrontlineAlive = allEntities.some(e => 
        e.gridPosition?.team === target.gridPosition!.team && 
        e.gridPosition?.line === GridLine.FRONT &&
        e.stats && e.stats.combat.currentHp > 0
      );

      if (!isEnemyFrontlineAlive) return true; // Reaches through
      return false; // Blocked by frontline
    }

    // Melee in Frontline can hit ANYONE (Front or Back)
    if (isActorFront) {
      return true; 
    }

    return true;
  }

  /**
   * Checks if anyone on the target's team has an active TAUNT_COVER on the target.
   */
  private findInterceptor(target: Entity, allEntities: Entity[]): Entity | null {
    if (!target.statusEffects) return null;
    
    const coverEffect = target.statusEffects.effects.find(e => e.type === StatusType.TAUNT_COVER);
    if (coverEffect && coverEffect.sourceEntityId) {
      const protector = allEntities.find(e => e.id === coverEffect.sourceEntityId);
      // Protector must be alive
      if (protector && protector.stats && protector.stats.combat.currentHp > 0) {
        return protector;
      }
    }
    return null;
  }
}
