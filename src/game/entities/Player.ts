import * as Phaser from 'phaser';
import { UnifiedInput } from '@/kit/input';
import { useGameStore } from '@/store/useGameStore';
import { PLAYER } from '../config';

export class Player extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  // renamed to avoid conflict with Phaser's internal `input` property
  private gameInput: UnifiedInput;
  private isInvincible = false;
  private jumpCount = 0;
  private maxJumps = 2;
  private facingRight = true;

  // Boomerang callback injected by GameScene
  private _onThrow?: (x: number, y: number, dirX: number) => void;
  private boomerangCooldown = 0;

  setThrowCallback(fn: (x: number, y: number, dirX: number) => void) {
    this._onThrow = fn;
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const textureKey = scene.textures.exists('raccoon_idle') ? 'raccoon_idle' : 'raccoon_run';
    super(scene, x, y, textureKey, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this as unknown as Phaser.GameObjects.GameObject, false);

    this.gameInput = new UnifiedInput(scene);

    // Scale 0.75 over 64×64 frames → ~48×48 display.
    // setScale persists across animation frame changes; setDisplaySize does NOT.
    this.setScale(0.75);
    this.setDepth(10);

    const body = this.body as Phaser.Physics.Arcade.Body;
    // Arcade body coords are PRE-scale (native frame pixels = 64×64).
    // Hitbox: 30 wide, 44 tall, centered horizontally, touching bottom of frame.
    body.setSize(30, 44);
    body.setOffset(17, 18);
    body.setCollideWorldBounds(true);
    body.setMaxVelocityX(PLAYER.speed * 1.5);
    body.setMaxVelocityY(700);
    body.setGravityY(0);

    if (scene.anims.exists('raccoon_idle_anim')) {
      this.play('raccoon_idle_anim');
    }
  }

  update() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const now = this.scene.time.now;
    const { left, right, jumpJustPressed, attackJustPressed } = this.gameInput;

    // Reset jump count on landing
    if (body.blocked.down) {
      this.jumpCount = 0;
    }

    // Horizontal movement
    if (left) {
      body.setVelocityX(-PLAYER.speed);
      this.facingRight = false;
      this.setFlipX(true);
    } else if (right) {
      body.setVelocityX(PLAYER.speed);
      this.facingRight = true;
      this.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    // Jump (double jump allowed)
    if (jumpJustPressed && this.jumpCount < this.maxJumps) {
      body.setVelocityY(PLAYER.jumpVelocity);
      this.jumpCount++;
      try { (this.scene as any).audio?.play('jump'); } catch { /* synth fallback */ }
    }

    // Throw boomerang (cooldown 700 ms so only one in the air at a time)
    if (attackJustPressed && this._onThrow && now > this.boomerangCooldown) {
      this.boomerangCooldown = now + 700;
      this._onThrow(this.x + (this.facingRight ? 24 : -24), this.y - 8, this.facingRight ? 1 : -1);
      // Quick throw flash — scale back to 0.75 (not 1) after the squish
      this.scene.tweens.add({
        targets: this, scaleX: 0.75 * 1.2, duration: 60,
        yoyo: true,
        onComplete: () => { this.setScale(0.75); },
      });
    }

    // Animate
    this.updateAnimation(body);
  }

  private updateAnimation(body: Phaser.Physics.Arcade.Body) {
    const movingX = Math.abs(body.velocity.x) > 10;

    if (!body.blocked.down) {
      if (this.scene.textures.exists('raccoon_jump')) {
        if (this.anims.isPlaying) this.stop();
        this.setTexture('raccoon_jump', 0);
      }
    } else if (movingX) {
      if (this.scene.anims.exists('raccoon_run_anim') && this.anims.currentAnim?.key !== 'raccoon_run_anim') {
        this.play('raccoon_run_anim');
      }
    } else {
      if (this.scene.anims.exists('raccoon_idle_anim') && this.anims.currentAnim?.key !== 'raccoon_idle_anim') {
        this.play('raccoon_idle_anim');
      }
    }

    // Always enforce scale so nothing resets it (texture swap or Phaser internals)
    if (this.scaleX !== 0.75 || this.scaleY !== 0.75) {
      this.setScale(0.75);
    }
  }

  /** Called by GameScene when the player takes damage.
   *  Returns true if damage was accepted (not invincible), false if blocked. */
  hit(): boolean {
    if (this.isInvincible) return false;
    this.isInvincible = true;
    // NOTE: loseLife() is intentionally NOT called here.
    // GameScene owns the death/respawn flow and calls loseLife() itself.

    // Flash invincibility
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 120,
      yoyo: true,
      repeat: 8,
      onComplete: () => {
        this.alpha = 1;
        this.isInvincible = false;
      },
    });

    // Knockback
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-280);
    body.setVelocityX(this.facingRight ? -160 : 160);
    return true;
  }

  stomp(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-300);
  }
}
