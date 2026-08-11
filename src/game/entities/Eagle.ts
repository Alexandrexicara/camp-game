import * as Phaser from 'phaser';
import { Enemy } from './Enemy';

/** Eagle — flies horizontally, swoops down when player is below */
export class Eagle extends Enemy {
  private baseY: number;
  private speed: number;
  private patrolLeft: number;
  private patrolRight: number;
  private direction = 1;
  private swooping = false;
  private swoopCooldown = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolLeft: number, patrolRight: number, speed = 110) {
    super(scene, x, y, 'eagle_fly', 0);
    this.baseY = y;
    this.patrolLeft = patrolLeft;
    this.patrolRight = patrolRight;
    this.speed = speed;
    // AI sprite 64×64; eagle has wide wingspan
    this.setScale(0.85);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(48, 32);
    body.setOffset(8, 16);
    body.setAllowGravity(false);
    body.setCollideWorldBounds(false);

    if (scene.anims.exists('eagle_fly_anim')) this.play('eagle_fly_anim');
  }

  update(time: number, _px?: number, playerY?: number) {
    if (this.dead) return;
    const body = this.body as Phaser.Physics.Arcade.Body;

    body.setVelocityX(this.direction * this.speed);
    if (this.x <= this.patrolLeft) { this.direction = 1; this.setFlipX(true); }
    else if (this.x >= this.patrolRight) { this.direction = -1; this.setFlipX(false); }

    if (!this.swooping && time > this.swoopCooldown && playerY !== undefined && playerY > this.baseY) {
      this.swooping = true;
    }
    if (this.swooping) {
      body.setVelocityY(200);
      if (this.y > this.baseY + 120) {
        this.swooping = false;
        this.swoopCooldown = time + 2000;
      }
    } else {
      const dy = this.baseY - this.y;
      body.setVelocityY(dy > 0 ? Math.min(dy * 2, 80) : Math.max(dy * 2, -80));
    }
  }
}
