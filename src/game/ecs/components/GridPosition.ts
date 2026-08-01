export enum Team {
  A = 'A', // Player side
  B = 'B'  // Enemy side
}

export enum GridLine {
  BACK = 'BACK',   // L1 (Team A) or L4 (Team B)
  FRONT = 'FRONT'  // L2 (Team A) or L3 (Team B)
}

/**
 * Represents an entity's position on the 10x10 grid (2 lines of 5 per team).
 * Pure Data.
 */
export class GridPositionComponent {
  public team: Team;
  public line: GridLine;
  public slot: number; // 0 to 4

  constructor(team: Team, line: GridLine, slot: number) {
    this.team = team;
    this.line = line;
    this.slot = slot;
  }
}
