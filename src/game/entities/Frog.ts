import * as Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Frog extends Enemy {
  private direction = 1;
  private hopTimer = 0;
  private hopInterval: number;
  private patrolLeft: number;
  private patrolRight: number;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolLeft: number, patrolRight: number, hopInterval = 1800) {
    super(scene, x, y, 'frog_hop', 0);
    this.patrolLeft = patrolLeft;
    this.patrolRight = patrolRight;
    this.hopInterval = hopInterval;
    // frog_hop frames are 48×48 — scale 0.82 ≈ 40×40 display, persists across anim frames
    this.setScale(0.82);

    const body = this.body as Phaser.Physics.Arcade.Body;
    // Body in pre-scale (48px frame) coords
    body.setSize(30, 26);
    body.setOffset(9, 18);   // center horizontally, sit on the bottom of the frame
    body.setCollideWorldBounds(true);
    body.setGravityY(0);

    if (scene.anims.exists('frog_hop_anim')) this.play('frog_hop_anim');
  }

  update(time: number) {
    if (this.dead) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (time > this.hopTimer) {
      this.hopTimer = time + this.hopInterval;
      body.setVelocityX(this.direction * 110);
      body.setVelocityY(-300);
    }
    if (this.x <= this.patrolLeft) { this.direction = 1; this.setFlipX(false); }
    else if (this.x >= this.patrolRight) { this.direction = -1; this.setFlipX(true); }
    if (body.blocked.down) body.setVelocityX(body.velocity.x * 0.75);
  }
}
