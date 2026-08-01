export type PolygonType = 'collision' | 'portal' | 'overlay' | 'elevation' | 'effect';

export interface Point {
  x: number;
  y: number;
}

export interface PortalData {
  portalId: number;
  portalType: 'teleport' | 'spawn';
  targetMap?: string;
  targetPortalId?: number;
}

export interface MapPolygon {
  id: string;
  type: PolygonType;
  points: Point[];
  portalData?: PortalData;
  elevationLevel?: number;
  effectType?: 'water' | 'crystal';
}

export type MapCategory = 'city' | 'field' | 'dungeon';
export type MapBiome = 'snow' | 'mountain' | 'woods' | 'prairie' | 'desert' | 'swamp' | 'suburb' | 'dungeon';

export interface MapConfig {
  name: string;
  level: number;
  category: MapCategory;
  biome: MapBiome;
  polygons: MapPolygon[];
}
