// Global touch/button input state — polled every Phaser frame
// No timeouts, no async reset: flags are reset by the consumer (Player.update)

type Direction = 'left' | 'right';
type Listener = () => void;

class TouchInputBus {
  // Held-down directional buttons (reset when button released)
  private _left = false;
  private _right = false;

  // Jump: set true on press, consumed (set false) by Player.update each frame
  private _jumpPending = false;

  // Attack (boomerang): one-shot flag consumed by Player each frame
  private _attackPending = false;

  // Restart: one-shot listeners called immediately
  private _restartListeners: Listener[] = [];

  pressLeft()   { this._left = true; }
  releaseLeft() { this._left = false; }

  pressRight()   { this._right = true; }
  releaseRight() { this._right = false; }

  pressJump() { this._jumpPending = true; }
  releaseJump() { /* momentary trigger */ }

  pressAttack() { this._attackPending = true; }
  releaseAttack() { /* momentary trigger */ }

  /** Called once per Phaser frame by Player.update to read & reset jump */
  consumeJump(): boolean {
    if (this._jumpPending) { this._jumpPending = false; return true; }
    return false;
  }

  /** Called once per Phaser frame to read & reset attack */
  consumeAttack(): boolean {
    if (this._attackPending) { this._attackPending = false; return true; }
    return false;
  }

  /** React button calls this → Phaser scene listener fires immediately */
  triggerRestart() {
    this._restartListeners.forEach(fn => fn());
  }

  /** GameScene registers here, returns unsubscribe fn */
  onRestart(fn: Listener): () => void {
    this._restartListeners.push(fn);
    return () => { this._restartListeners = this._restartListeners.filter(l => l !== fn); };
  }

  get left()  { return this._left; }
  get right() { return this._right; }

  reset() {
    this._left = false;
    this._right = false;
    this._jumpPending = false;
    this._attackPending = false;
  }
}

export const touchInput = new TouchInputBus();

