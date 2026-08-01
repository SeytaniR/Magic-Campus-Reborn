import { StatsComponent } from '../components/Stats';
import { GridPositionComponent } from '../components/GridPosition';
import { ATBComponent } from '../components/ATB';
import { StatusEffectsComponent } from '../components/StatusEffects';

export class Entity {
  public id: string;
  public name: string;
  
  public stats?: StatsComponent;
  public gridPosition?: GridPositionComponent;
  public atb?: ATBComponent;
  public statusEffects?: StatusEffectsComponent;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
