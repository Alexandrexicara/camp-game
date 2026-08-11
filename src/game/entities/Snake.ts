import * as Phaser from 'phaser';
import { Enemy } from './Enemy';

/** Snake — slithers on the ground, low profile */
export class Snake extends Enemy {
  private direction = 1;
  private speed: number;
  private patrolLeft: number;
  private patrolRight: number;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolLeft: number, patrolRight: number, speed = 80) {
    super(scene, x, y, 'snake_slither', 0);
    this.patrolLeft = patrolLeft;
    this.patrolRight = patrolRight;
    this.speed = speed;
    // AI sprite is 64×64 per frame; snake body is ~50% height of frame
    this.setScale(0.85);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(52, 32);
    body.setOffset(6, 28);
    body.setCollideWorldBounds(true);
    body.setGravityY(0);
    body.setMaxVelocityY(50);

    if (scene.anims.exists('snake_slither_anim')) this.play('snake_slither_anim');
  }

  update(_time: number) {
    if (this.dead) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.direction * this.speed);
    if (this.x <= this.patrolLeft) { this.direction = 1; this.setFlipX(false); }
    else if (this.x >= this.patrolRight) { this.direction = -1; this.setFlipX(true); }
  }
}
