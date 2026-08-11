import * as Phaser from 'phaser';
import { Enemy } from './Enemy';
import { Arrow } from './Arrow';

/** Archer — stands on a platform/tree, shoots arrows at the player. */
export class Archer extends Enemy {
  private shootCooldown = 0;
  private shootInterval: number;
  private arrows: Arrow[] = [];
  private onArrowSpawn: (arrow: Arrow) => void;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    onArrowSpawn: (arrow: Arrow) => void,
    shootInterval = 2200,
  ) {
    super(scene, x, y, 'archer_idle', 0);
    this.onArrowSpawn = onArrowSpawn;
    this.shootInterval = shootInterval;
    // AI sprite 64×64; monkey archer is upright
    this.setScale(0.85);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(28, 48);
    body.setOffset(18, 12);
    body.setAllowGravity(true);
    body.setImmovable(false);
    body.setCollideWorldBounds(true);

    if (scene.anims.exists('archer_idle_anim')) this.play('archer_idle_anim');
  }

  getArrows() { return this.arrows; }

  update(time: number, playerX?: number) {
    if (this.dead) return;
    if (playerX !== undefined) {
      this.setFlipX(playerX < this.x);
    }

    if (time > this.shootCooldown) {
      this.shootCooldown = time + this.shootInterval + Math.random() * 600;
      this.shoot(playerX);
    }

    this.arrows = this.arrows.filter(a => a.isAlive());
  }

  private shoot(playerX?: number) {
    if (this.dead) return;
    const dirX = (playerX !== undefined && playerX < this.x) ? -1 : 1;
    const arrow = new Arrow(this.scene, this.x + dirX * 18, this.y - 10, dirX);
    this.arrows.push(arrow);
    this.onArrowSpawn(arrow);

    this.scene.tweens.add({
      targets: this, alpha: 0.5, duration: 80,
      yoyo: true, repeat: 1,
      onComplete: () => { this.alpha = 1; },
    });
  }
}
