import * as Phaser from 'phaser';

/** Base class shared by all enemies. Drawn procedurally when no sprite loaded. */
export abstract class Enemy extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  protected dead = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame = 0) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this as unknown as Phaser.GameObjects.GameObject, false);
    this.setDepth(8);
  }

  abstract update(time: number, playerX?: number, playerY?: number): void;

  stomp() {
    if (this.dead) return;
    this.dead = true;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);
    this.scene.tweens.add({
      targets: this, scaleY: 0.15, alpha: 0, y: this.y + 10,
      duration: 280, onComplete: () => this.destroy(),
    });
    try { (this.scene as any).audio?.play('ko'); } catch { /* no-op */ }
  }

  isAlive() { return !this.dead; }

  /** Draw a solid-colour placeholder and generate texture */
  protected static makeColorTexture(scene: Phaser.Scene, key: string, w: number, h: number, color: number) {
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.fillStyle(color, 1);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
