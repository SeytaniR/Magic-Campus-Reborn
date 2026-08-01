/**
 * Active Time Battle (ATB) Component.
 * Tracks when it's the entity's turn to act.
 * Pure Data.
 */
export class ATBComponent {
  public value: number; // 0 to 1000
  public isReady: boolean;

  constructor(initialValue: number = 0) {
    this.value = initialValue;
    this.isReady = false;
  }
}
