import * as Phaser from 'phaser';
import { BaseScene } from '@/kit/BaseScene';
import { useGameStore } from '@/store/useGameStore';

export class MenuScene extends BaseScene {
  private stars: Phaser.GameObjects.Graphics[] = [];
  private titleText!: Phaser.GameObjects.Text;
  private bgTile!: Phaser.GameObjects.TileSprite;

  constructor() { super('MenuScene'); }

  create() {
    const { width, height } = this.scale;

    try { this.audio.play('select'); } catch { /* no-op */ }

    // Background
    if (this.textures.exists('bg_forest')) {
      this.bgTile = this.add.tileSprite(0, 0, width, height, 'bg_forest').setOrigin(0, 0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x1a4a2e);
    }

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);

    // Pixel-art border
    this.drawPixelBorder(width, height);

    // Camp tent decoration
    this.drawTentDecoration(width);

    // Title
    this.titleText = this.add.text(width / 2, height * 0.28, 'ANIMAL CAMP', {
      fontFamily: 'monospace',
      fontSize: '52px',
      color: '#ffe066',
      stroke: '#5b3a0a',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#3a2000', blur: 0, fill: true },
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, height * 0.42, '~~ Uma aventura na floresta ~~', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#aaffaa',
    }).setOrigin(0.5).setDepth(10);

    // Start button
    const btnBg = this.add.rectangle(width / 2, height * 0.60, 220, 54, 0x2d8e2d, 1)
      .setStrokeStyle(3, 0x88ff88)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(width / 2, height * 0.60, '▶  JOGAR', {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(11);

    btnBg.on('pointerover', () => { btnBg.setFillStyle(0x44bb44); btnText.setStyle({ color: '#ffff00' }); });
    btnBg.on('pointerout', () => { btnBg.setFillStyle(0x2d8e2d); btnText.setStyle({ color: '#ffffff' }); });
    btnBg.on('pointerdown', () => { this.audio.play('confirm'); this.startGame(); });

    // Keyboard start
    this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
    this.input.keyboard?.once('keydown-ENTER', () => this.startGame());

    // Controls hint
    this.add.text(width / 2, height * 0.80, '← → Mover  |  ↑ / SPACE Pular', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#cccccc',
    }).setOrigin(0.5).setDepth(10);

    this.add.text(width / 2, height * 0.88, 'Colete as bolotas 🌰 e evite os sapos!', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#99ffcc',
    }).setOrigin(0.5).setDepth(10);

    // Raccoon preview sprite
    if (this.textures.exists('raccoon_idle')) {
      const preview = this.add.sprite(width / 2 - 90, height * 0.60, 'raccoon_idle', 0)
        .setDisplaySize(48, 48)
        .setDepth(12);
      if (this.anims.exists('raccoon_idle_anim')) preview.play('raccoon_idle_anim');
    }

    // Title bounce tween
    this.tweens.add({
      targets: this.titleText,
      y: height * 0.28 - 6,
      duration: 1200,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    });

    useGameStore.getState().reset();
  }

  private drawPixelBorder(width: number, height: number) {
    const g = this.add.graphics().setDepth(20);
    g.lineStyle(4, 0xffe066, 1);
    g.strokeRect(8, 8, width - 16, height - 16);
    g.lineStyle(2, 0xffaa00, 0.5);
    g.strokeRect(14, 14, width - 28, height - 28);
  }

  private drawTentDecoration(width: number) {
    const g = this.add.graphics().setDepth(5);
    // Left tent
    g.fillStyle(0xcc4444, 1);
    g.fillTriangle(60, 370, 10, 440, 110, 440);
    g.fillStyle(0xff6666, 0.7);
    g.fillTriangle(60, 370, 35, 420, 85, 420);
    g.fillStyle(0x8b2222, 1);
    g.fillRect(50, 410, 20, 30);
    // Right tent
    g.fillStyle(0x4444cc, 1);
    g.fillTriangle(width - 60, 370, width - 110, 440, width - 10, 440);
    g.fillStyle(0x6666ff, 0.7);
    g.fillTriangle(width - 60, 370, width - 85, 420, width - 35, 420);
    g.fillStyle(0x22228b, 1);
    g.fillRect(width - 70, 410, 20, 30);
    // Pennant string
    g.lineStyle(2, 0xffdd44, 1);
    g.beginPath();
    g.moveTo(60, 370);
    for (let x = 80; x <= width - 80; x += 40) g.lineTo(x, 350 + 20 * Math.sin((x / (width - 160)) * Math.PI));
    g.lineTo(width - 60, 370);
    g.strokePath();
    // Pennants
    const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff];
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * ((width - 200) / 4);
      const y = 353;
      g.fillStyle(colors[i], 1);
      g.fillTriangle(x - 10, y, x + 10, y, x, y + 16);
    }
  }

  private startGame() {
    this.audio.play('round_start');
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      useGameStore.getState().reset();
      useGameStore.getState().setGameState('PLAYING');
      this.scene.start('GameScene', { level: 1 });
    });
  }
}
