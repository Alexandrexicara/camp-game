import * as Phaser from 'phaser';

/** Single boomerang projectile.
 *  Phases: OUTWARD → RETURN → CAUGHT (or GONE if it falls off world).
 *  While active it can hit enemies. Once caught by the player it's destroyed.
 */
export class Boomerang extends Phaser.GameObjects.Graphics {
  declare body: Phaser.Physics.Arcade.Body;

  private phase: 'outward' | 'return' | 'gone' = 'outward';
  private speed = 420;
  private dirX: number;         // initial launch direction (+1 right, -1 left)
  private outwardTime = 0;      // ms until it starts returning
  private rotAngle = 0;
  private owner: Phaser.GameObjects.Sprite;
  private alive = true;

  constructor(scene: Phaser.Scene, x: number, y: number, dirX: number, owner: Phaser.GameObjects.Sprite) {
    super(scene);
    this.dirX = dirX;
    this.owner = owner;
    this.outwardTime = scene.time.now + 340; // goes outward ~340 ms then returns

    // Position BEFORE adding physics so the body starts at the correct location
    this.setPosition(x, y);
    this.drawShape();
    this.setDepth(15);

    scene.add.existing(this);
    scene.physics.add.existing(this as unknown as Phaser.GameObjects.GameObject, false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCollideWorldBounds(false);
    body.setImmovable(false);
    body.setSize(14, 14);
    body.setOffset(-7, -7);
    body.reset(x, y);
    body.setVelocity(0, 0);
    // Disable ALL physics collision — boomerang is checked manually in GameScene
    // This prevents the body from pushing the player or stopping on terrain
    body.checkCollision.none = true;
  }

  private drawShape() {
    this.clear();
    // Wooden boomerang — two curved arms
    this.fillStyle(0xd4882e, 1);
    this.fillRect(-9, -3, 18, 6);    // horizontal arm
    this.fillRect(-3, -9, 6, 18);    // vertical arm (cross)
    // outline
    this.lineStyle(1.5, 0x8b5e1a, 1);
    this.strokeRect(-9, -3, 18, 6);
    this.strokeRect(-3, -9, 6, 18);
    // grain lines
    this.lineStyle(1, 0xa06418, 0.6);
    this.lineBetween(-7, 0, 7, 0);
    this.lineBetween(0, -7, 0, 7);
  }

  isAlive() { return this.alive; }

  update(time: number) {
    if (!this.alive) return;
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Spin
    this.rotAngle += 0.28;
    this.setRotation(this.rotAngle);

    if (this.phase === 'outward') {
      body.setVelocityX(this.dirX * this.speed);
      body.setVelocityY(0);
      if (time > this.outwardTime) {
        this.phase = 'return';
      }
    } else if (this.phase === 'return') {
      // Home toward owner
      const dx = this.owner.x - this.x;
      const dy = this.owner.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 28) {
        // Caught!
        this.catch();
        return;
      }
      const nx = dx / dist;
      const ny = dy / dist;
      const returnSpeed = Math.min(this.speed * 1.1, this.speed + dist * 0.5);
      body.setVelocityX(nx * returnSpeed);
      body.setVelocityY(ny * returnSpeed);
    }
  }

  catch() {
    this.alive = false;
    this.destroy();
  }

  destroy(fromScene?: boolean) {
    this.alive = false;
    super.destroy(fromScene);
  }
}
