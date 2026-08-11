import * as Phaser from 'phaser';
import { GAME, ASSET_PREFIX } from './config';
import { BaseScene } from '@/kit/BaseScene';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

export function initGame(containerId: string): Phaser.Game {
  BaseScene.assetPrefix = ASSET_PREFIX;
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 1;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: typeof window !== 'undefined' ? window.innerWidth * dpr : GAME.width,
    height: typeof window !== 'undefined' ? window.innerHeight * dpr : GAME.height,
    parent: containerId,
    backgroundColor: '#1a1a2e',
    input: {
      // Allow touch events to propagate to DOM elements above the canvas
      // so React HUD buttons receive their touch events first
      activePointers: 4,
    },
    dom: {
      createContainer: false,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: GAME.gravity },
        debug: GAME.debug,
      },
    },
    scene: [BootScene, MenuScene, GameScene, GameOverScene],
    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      zoom: 1 / dpr,
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    },
  };

  const game = new Phaser.Game(config);

  // After the canvas is created, stop it from swallowing touch/pointer events
  // so HTML elements layered above (React HUD buttons) receive them first.
  game.events.once('ready', () => {
    const canvas = game.canvas;
    if (canvas) {
      canvas.style.touchAction = 'auto';
      // Remove Phaser's passive:false touch listeners that block propagation
      // by forcing the canvas to not call preventDefault on its own touch events.
      // We do this by wrapping: any touch that starts inside a .ctrl-btn won't
      // reach the canvas listener at all because we stopPropagation there.
    }
  });

  if (typeof window !== 'undefined') {
    const onResize = () => {
      const newDpr = Math.min(window.devicePixelRatio || 1, 3);
      game.scale.resize(window.innerWidth * newDpr, window.innerHeight * newDpr);
      game.scale.setZoom(1 / newDpr);
    };
    window.addEventListener('resize', onResize);
    game.events.once('destroy', () => window.removeEventListener('resize', onResize));
  }

  return game;
}
