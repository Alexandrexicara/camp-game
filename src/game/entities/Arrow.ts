import * as Phaser from 'phaser';

/** Arrow shot by the Archer enemy. Travels in a straight line with slight arc. */
export class Arrow extends Phaser.GameObjects.Graphics {
  declare body: Phaser.Physics.Arcade.Body;

  private alive = true;
  private dirX: number;

  constructor(scene: Phaser.Scene, x: number, y: number, dirX: number) {
    super(scene);
    this.dirX = dirX;
    scene.add.existing(this);
    scene.physics.add.existing(this as unknown as Phaser.GameObjects.GameObject, false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setGravityY(-500); // partial gravity so it arcs slightly
    body.setSize(14, 6);
    body.setVelocityX(dirX * 260);
    body.setVelocityY(-40); // slight upward arc
    // Manual overlap check in GameScene — disable physics collision
    body.checkCollision.none = true;

    this.setPosition(x, y);
    this.setDepth(12);
    this.drawShape(dirX);
  }

  private drawShape(dirX: number) {
    this.clear();
    // Shaft
    this.fillStyle(0xc8a050, 1);
    this.fillRect(-10, -2, 20, 4);
    // Head (tip in the direction of travel)
    this.fillStyle(0x888888, 1);
    this.fillTriangle(
      dirX > 0 ? 10 : -10, 0,
      dirX > 0 ? 6  : -6,  -4,
      dirX > 0 ? 6  : -6,   4,
    );
    // Tail feathers
    this.fillStyle(0xff4444, 0.85);
    this.fillTriangle(
      dirX > 0 ? -10 : 10,  0,
      dirX > 0 ? -8  : 8,  -5,
      dirX > 0 ? -6  : 6,   0,
    );
    this.fillTriangle(
      dirX > 0 ? -10 : 10,  0,
      dirX > 0 ? -8  : 8,   5,
      dirX > 0 ? -6  : 6,   0,
    );
  }

  isAlive() { return this.alive; }

  update() {
    if (!this.alive) return;
    // Rotate slightly to follow trajectory
    const body = this.body as Phaser.Physics.Arcade.Body;
    const angle = Math.atan2(body.velocity.y, body.velocity.x);
    this.setRotation(angle);

    // Remove when off screen
    if (this.x < -200 || this.x > 9000 || this.y > 700) {
      this.expire();
    }
  }

  expire() {
    this.alive = false;
    this.destroy();
  }

  destroy(fromScene?: boolean) {
    this.alive = false;
    super.destroy(fromScene);
  }
}
