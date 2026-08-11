import * as Phaser from 'phaser';
import { Enemy } from './Enemy';

/** Jaguar — runs fast on the ground, turns at patrol edges */
export class Jaguar extends Enemy {
  private direction = 1;
  private speed: number;
  private patrolLeft: number;
  private patrolRight: number;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolLeft: number, patrolRight: number, speed = 130) {
    super(scene, x, y, 'jaguar_walk', 0);
    this.patrolLeft = patrolLeft;
    this.patrolRight = patrolRight;
    this.speed = speed;
    // AI sprite frame is 64×64; scale slightly to match game size
    this.setScale(0.9);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(44, 36);
    body.setOffset(10, 24);
    body.setCollideWorldBounds(true);
    body.setGravityY(0);

    if (scene.anims.exists('jaguar_run_anim')) {
      this.play('jaguar_run_anim');
    }
  }

  update(_time: number) {
    if (this.dead) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.direction * this.speed);
    if (this.x <= this.patrolLeft) { this.direction = 1; this.setFlipX(false); }
    else if (this.x >= this.patrolRight) { this.direction = -1; this.setFlipX(true); }
  }
}
