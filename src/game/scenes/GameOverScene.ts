import * as Phaser from 'phaser';
import { BaseScene } from '@/kit/BaseScene';
import { useGameStore } from '@/store/useGameStore';

export class GameOverScene extends BaseScene {
  private _isVictory = false;
  private _nextLevel: number | null = null;
  private _currentLevel = 1;

  constructor() { super('GameOverScene'); }

  init(data: { victory?: boolean; nextLevel?: number | null; currentLevel?: number }) {
    super.init(data);
    this._isVictory = data?.victory === true;
    this._nextLevel = data?.nextLevel ?? null;
    this._currentLevel = data?.currentLevel ?? useGameStore.getState().level;
  }

  create() {
    const { width, height } = this.scale;
    const { score, level } = useGameStore.getState();
    const isVictory = this._isVictory;
    const nextLevel = this._nextLevel;
    const currentLevel = this._currentLevel;
    const isFinalLevel = isVictory && nextLevel === null;

    // Background
    if (this.textures.exists('bg_forest')) {
      this.add.image(width / 2, height / 2, 'bg_forest')
        .setDisplaySize(width, height).setDepth(0).setAlpha(0.35);
    }
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.72).setDepth(1);

    // Border
    const g = this.add.graphics().setDepth(20);
    const borderColor = isVictory ? 0xffe066 : 0xff4444;
    g.lineStyle(4, borderColor, 1); g.strokeRect(8, 8, width - 16, height - 16);

    // Title
    const title = isFinalLevel
      ? '🏆  VOCÊ VENCEU O JOGO!'
      : isVictory
        ? `🏕️  FASE ${level} CONCLUÍDA!`
        : '💀  GAME OVER';
    const titleColor = isFinalLevel ? '#ffd700' : isVictory ? '#ffe066' : '#ff4444';

    this.add.text(width / 2, height * 0.20, title, {
      fontFamily: 'monospace',
      fontSize: isFinalLevel ? '34px' : isVictory ? '36px' : '44px',
      color: titleColor,
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(10);

    // Phase indicator dots
    if (isVictory || !isVictory) {
      const dotY = height * 0.34;
      for (let i = 1; i <= 5; i++) {
        const cx = width / 2 - 80 + (i - 1) * 40;
        const filled = i <= level;
        this.add.circle(cx, dotY, 10, filled ? 0xffe066 : 0x444444)
          .setStrokeStyle(2, filled ? 0xffaa00 : 0x666666).setDepth(10);
        this.add.text(cx, dotY, String(i), {
          fontFamily: 'monospace', fontSize: '10px',
          color: filled ? '#000' : '#888',
        }).setOrigin(0.5).setDepth(11);
      }
      this.add.text(width / 2, height * 0.34 + 20, 'FASE', {
        fontFamily: 'monospace', fontSize: '10px', color: '#888',
      }).setOrigin(0.5).setDepth(10);
    }

    // Raccoon sprite
    if (this.textures.exists('raccoon_idle')) {
      this.add.sprite(width / 2, height * 0.50, 'raccoon_idle', 0)
        .setDisplaySize(64, 64).setDepth(10);
    }

    // Score
    this.add.text(width / 2, height * 0.62, `Pontuação: ${score}`, {
      fontFamily: 'monospace', fontSize: '24px', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);

    if (isFinalLevel) {
      this.add.text(width / 2, height * 0.71, '✨ Você dominou todas as 5 fases da selva! ✨', {
        fontFamily: 'monospace', fontSize: '14px', color: '#ffd700',
      }).setOrigin(0.5).setDepth(10);
    } else if (isVictory && nextLevel) {
      this.add.text(width / 2, height * 0.71, `Próxima: Fase ${nextLevel} — Mais difícil!`, {
        fontFamily: 'monospace', fontSize: '14px', color: '#aaffaa',
      }).setOrigin(0.5).setDepth(10);
    }

    const btnY = height * 0.84;

    // Primary action button
    if (isVictory && nextLevel) {
      this.createButton(width / 2 - 100, btnY, `▶ FASE ${nextLevel}`, 0x1e8e1e, () => {
        useGameStore.getState().setGameState('PLAYING');
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameScene', { level: nextLevel });
        });
      });
      this.createButton(width / 2 + 110, btnY, '↩ Menu', 0x224488, () => {
        useGameStore.getState().reset();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
      });
    } else if (!isVictory) {
      // Game over — retry the same level or go to menu
      this.createButton(width / 2 - 100, btnY, `↺ Fase ${currentLevel} de Novo`, 0x1e8e1e, () => {
        // Reset lives, set the current level, keep score
        useGameStore.setState({ lives: 3, level: currentLevel, gameState: 'PLAYING' });
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameScene', { level: currentLevel });
        });
      });
      this.createButton(width / 2 + 110, btnY, '↩ Menu', 0x224488, () => {
        useGameStore.getState().reset();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
      });
    } else {
      // Final victory
      this.createButton(width / 2, btnY, '↩ Menu Principal', 0x224488, () => {
        useGameStore.getState().reset();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
      });
    }

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private createButton(x: number, y: number, label: string, color: number, onClick: () => void) {
    const bg = this.add.rectangle(x, y, 185, 48, color, 1)
      .setStrokeStyle(2, 0xffffff, 0.6).setDepth(10).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '15px', color: '#fff',
    }).setOrigin(0.5).setDepth(11);
    bg.on('pointerover', () => bg.setFillStyle(color + 0x181818));
    bg.on('pointerout',  () => bg.setFillStyle(color));
    bg.on('pointerdown', onClick);
  }
}
