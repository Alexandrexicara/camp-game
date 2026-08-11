import * as Phaser from 'phaser';
import { Enemy } from './Enemy';

/** Caiman — slow, heavy, cannot be stomped. Must be avoided or boomeranged. */
export class Caiman extends Enemy {
  private direction = 1;
  private speed: number;
  private patrolLeft: number;
  private patrolRight: number;
  private snapTimer = 0;
  readonly cannotBeStomp = true;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolLeft: number, patrolRight: number, speed = 55) {
    super(scene, x, y, 'caiman_walk', 0);
    this.patrolLeft = patrolLeft;
    this.patrolRight = patrolRight;
    this.speed = speed;
    // AI sprite 64×64; caiman is wide
    this.setScale(1.0);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(54, 26);
    body.setOffset(5, 34);
    body.setCollideWorldBounds(true);
    body.setGravityY(0);

    if (scene.anims.exists('caiman_walk_anim')) this.play('caiman_walk_anim');
  }

  update(time: number) {
    if (this.dead) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.direction * this.speed);
    if (this.x <= this.patrolLeft) { this.direction = 1; this.setFlipX(false); }
    else if (this.x >= this.patrolRight) { this.direction = -1; this.setFlipX(true); }

    // Snap: briefly stop
    if (time > this.snapTimer) {
      this.snapTimer = time + 3000 + Math.random() * 2000;
      body.setVelocityX(0);
      this.scene.time.delayedCall(600, () => {
        if (!this.dead) body.setVelocityX(this.direction * this.speed);
      });
    }
  }

  stomp() {
    // Cannot be stomped — player bounces off but takes damage
    return;
  }
}
