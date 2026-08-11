import * as Phaser from 'phaser';
import { BaseScene } from '@/kit/BaseScene';
import { AssetManifest, FallbackMap } from '@/kit/AssetsManager';

const MANIFEST: AssetManifest = {
  images: [
    { key: 'bg_forest', path: '/assets/images/bg_forest.png' },
    { key: 'tile_ground', path: '/assets/images/tile_ground.png' },
    { key: 'tile_platform', path: '/assets/images/tile_platform.png' },
    { key: 'prop_campfire', path: '/assets/images/prop_campfire.png' },
  ],
  spritesheets: [
    { key: 'raccoon_run', path: '/assets/spritesheets/raccoon_run.png', frameWidth: 64, frameHeight: 64 },
    { key: 'raccoon_idle', path: '/assets/spritesheets/raccoon_idle.png', frameWidth: 64, frameHeight: 64 },
    { key: 'raccoon_jump', path: '/assets/spritesheets/raccoon_jump.png', frameWidth: 64, frameHeight: 64 },
    { key: 'frog_hop', path: '/assets/spritesheets/frog_hop.png', frameWidth: 48, frameHeight: 48 },
    { key: 'jaguar_walk', path: '/assets/spritesheets/jaguar_walk.png', frameWidth: 64, frameHeight: 64 },
    { key: 'snake_slither', path: '/assets/spritesheets/snake_slither.png', frameWidth: 64, frameHeight: 64 },
    { key: 'caiman_walk', path: '/assets/spritesheets/caiman_walk.png', frameWidth: 64, frameHeight: 64 },
    { key: 'eagle_fly', path: '/assets/spritesheets/eagle_fly.png', frameWidth: 64, frameHeight: 64 },
    { key: 'archer_idle', path: '/assets/spritesheets/archer_idle.png', frameWidth: 64, frameHeight: 64 },
    { key: 'acorn', path: '/assets/spritesheets/acorn.png', frameWidth: 32, frameHeight: 32 },
  ],
};

const FALLBACKS: FallbackMap = {
  bg_forest: (scene) => {
    const g = scene.add.graphics();
    // Sky gradient
    g.fillStyle(0x87ceeb, 1); g.fillRect(0, 0, 800, 500);
    // Sun
    g.fillStyle(0xffdd44, 1); g.fillCircle(700, 60, 40);
    // Clouds
    g.fillStyle(0xffffff, 0.8);
    g.fillEllipse(150, 80, 120, 50);
    g.fillEllipse(400, 60, 100, 40);
    g.fillEllipse(580, 90, 140, 55);
    // Tree silhouettes (back)
    g.fillStyle(0x2d5a27, 1);
    for (let x = 0; x < 800; x += 100) {
      g.fillTriangle(x + 50, 200, x, 350, x + 100, 350);
      g.fillTriangle(x + 50, 160, x + 10, 290, x + 90, 290);
    }
    // Ground hill
    g.fillStyle(0x4a7c59, 1);
    g.fillEllipse(400, 480, 1200, 200);
    g.generateTexture('bg_forest', 800, 500);
    g.destroy();
  },
  tile_ground: (scene) => {
    const g = scene.add.graphics();
    // Dirt base
    g.fillStyle(0x8b4513, 1); g.fillRect(0, 0, 32, 32);
    // Grass top
    g.fillStyle(0x4a8c3f, 1); g.fillRect(0, 0, 32, 8);
    g.fillStyle(0x5db34e, 1); g.fillRect(2, 0, 28, 6);
    // Texture detail
    g.fillStyle(0x6b3410, 0.5);
    g.fillRect(4, 12, 8, 4); g.fillRect(18, 20, 6, 3);
    g.generateTexture('tile_ground', 32, 32);
    g.destroy();
  },
  tile_platform: (scene) => {
    const g = scene.add.graphics();
    g.fillStyle(0x7a5c3e, 1); g.fillRect(0, 0, 32, 16);
    // Wood grain
    g.fillStyle(0x5e3e22, 0.6);
    g.fillRect(0, 5, 32, 2); g.fillRect(0, 11, 32, 2);
    // Edge highlight
    g.fillStyle(0xa07850, 0.8); g.fillRect(0, 0, 32, 2);
    g.generateTexture('tile_platform', 32, 16);
    g.destroy();
  },
  prop_campfire: (scene) => {
    const g = scene.add.graphics();
    // Logs
    g.fillStyle(0x5c3317, 1);
    g.fillRect(4, 22, 24, 8);
    // Fire base
    g.fillStyle(0xff6600, 1); g.fillTriangle(16, 4, 4, 28, 28, 28);
    g.fillStyle(0xff9900, 1); g.fillTriangle(16, 8, 8, 28, 24, 28);
    g.fillStyle(0xffdd00, 1); g.fillTriangle(16, 14, 11, 28, 21, 28);
    g.generateTexture('prop_campfire', 32, 32);
    g.destroy();
  },
  raccoon_run: (scene) => {
    const key = 'raccoon_run';
    const frameCount = 4;
    const fw = 64, fh = 64;
    const g = scene.add.graphics();
    for (let i = 0; i < frameCount; i++) {
      const ox = i * fw;
      const legOffset = (i % 2 === 0) ? 5 : -5;
      // Body
      g.fillStyle(0x888888, 1); g.fillRoundedRect(ox + 18, fh - 40, 26, 28, 6);
      // Head
      g.fillStyle(0x888888, 1); g.fillCircle(ox + 32, fh - 44, 14);
      // Face mask
      g.fillStyle(0x333333, 1); g.fillRoundedRect(ox + 24, fh - 48, 16, 10, 4);
      // Eyes
      g.fillStyle(0xffffff, 1); g.fillCircle(ox + 27, fh - 46, 3); g.fillCircle(ox + 37, fh - 46, 3);
      g.fillStyle(0x111111, 1); g.fillCircle(ox + 27, fh - 46, 1.5); g.fillCircle(ox + 37, fh - 46, 1.5);
      // Ears
      g.fillStyle(0x888888, 1); g.fillTriangle(ox + 22, fh - 55, ox + 18, fh - 68, ox + 28, fh - 68);
      g.fillTriangle(ox + 42, fh - 55, ox + 38, fh - 68, ox + 46, fh - 68);
      g.fillStyle(0xffaaaa, 0.5); g.fillTriangle(ox + 22, fh - 57, ox + 19, fh - 66, ox + 27, fh - 66);
      // Tail (striped)
      g.fillStyle(0x888888, 1); g.fillEllipse(ox + 12, fh - 28, 14, 28);
      g.fillStyle(0x333333, 0.5);
      for (let s = 0; s < 3; s++) g.fillRect(ox + 6, fh - 36 + s * 7, 12, 3);
      // Legs
      g.fillStyle(0x777777, 1);
      g.fillRect(ox + 20 + legOffset, fh - 14, 8, 14);
      g.fillRect(ox + 32 - legOffset, fh - 14, 8, 14);
      // Backpack
      g.fillStyle(0x7b4cca, 1); g.fillRoundedRect(ox + 10, fh - 40, 14, 18, 3);
    }
    g.generateTexture(key, fw * frameCount, fh);
    g.destroy();
    const tex = scene.textures.get(key);
    for (let i = 0; i < frameCount; i++) tex.add(i, 0, i * fw, 0, fw, fh);
  },
  raccoon_idle: (scene) => {
    const key = 'raccoon_idle';
    const frameCount = 2;
    const fw = 64, fh = 64;
    const g = scene.add.graphics();
    for (let i = 0; i < frameCount; i++) {
      const ox = i * fw;
      const bobY = i === 1 ? 2 : 0;
      g.fillStyle(0x888888, 1); g.fillRoundedRect(ox + 18, fh - 40 + bobY, 26, 28, 6);
      g.fillStyle(0x888888, 1); g.fillCircle(ox + 32, fh - 44 + bobY, 14);
      g.fillStyle(0x333333, 1); g.fillRoundedRect(ox + 24, fh - 48 + bobY, 16, 10, 4);
      g.fillStyle(0xffffff, 1); g.fillCircle(ox + 27, fh - 46 + bobY, 3); g.fillCircle(ox + 37, fh - 46 + bobY, 3);
      g.fillStyle(0x111111, 1); g.fillCircle(ox + 27, fh - 46 + bobY, 1.5); g.fillCircle(ox + 37, fh - 46 + bobY, 1.5);
      g.fillStyle(0x888888, 1); g.fillTriangle(ox + 22, fh - 55 + bobY, ox + 18, fh - 68 + bobY, ox + 28, fh - 68 + bobY);
      g.fillTriangle(ox + 42, fh - 55 + bobY, ox + 38, fh - 68 + bobY, ox + 46, fh - 68 + bobY);
      g.fillStyle(0x888888, 1); g.fillEllipse(ox + 12, fh - 28 + bobY, 14, 28);
      g.fillStyle(0x333333, 0.5);
      for (let s = 0; s < 3; s++) g.fillRect(ox + 6, fh - 36 + s * 7 + bobY, 12, 3);
      g.fillStyle(0x777777, 1);
      g.fillRect(ox + 20, fh - 14, 8, 14); g.fillRect(ox + 34, fh - 14, 8, 14);
      g.fillStyle(0x7b4cca, 1); g.fillRoundedRect(ox + 10, fh - 40 + bobY, 14, 18, 3);
    }
    g.generateTexture(key, fw * frameCount, fh);
    g.destroy();
    const tex = scene.textures.get(key);
    for (let i = 0; i < frameCount; i++) tex.add(i, 0, i * fw, 0, fw, fh);
  },
  raccoon_jump: (scene) => {
    const key = 'raccoon_jump';
    const g = scene.add.graphics();
    const fw = 64, fh = 64;
    g.fillStyle(0x888888, 1); g.fillRoundedRect(18, fh - 46, 26, 28, 6);
    g.fillStyle(0x888888, 1); g.fillCircle(32, fh - 52, 14);
    g.fillStyle(0x333333, 1); g.fillRoundedRect(24, fh - 56, 16, 10, 4);
    g.fillStyle(0xffffff, 1); g.fillCircle(27, fh - 54, 3); g.fillCircle(37, fh - 54, 3);
    g.fillStyle(0x111111, 1); g.fillCircle(27, fh - 54, 1.5); g.fillCircle(37, fh - 54, 1.5);
    g.fillStyle(0x888888, 1); g.fillTriangle(22, fh - 63, 18, fh - 76, 28, fh - 76);
    g.fillTriangle(42, fh - 63, 38, fh - 76, 46, fh - 76);
    // Arms raised
    g.fillStyle(0x777777, 1); g.fillRect(10, fh - 44, 8, 16); g.fillRect(46, fh - 44, 8, 16);
    // Legs tucked
    g.fillRect(20, fh - 20, 8, 10); g.fillRect(36, fh - 20, 8, 10);
    g.fillStyle(0x888888, 1); g.fillEllipse(8, fh - 32, 14, 28);
    g.fillStyle(0x7b4cca, 1); g.fillRoundedRect(10, fh - 46, 14, 18, 3);
    g.generateTexture(key, fw, fh);
    g.destroy();
    const tex = scene.textures.get(key);
    tex.add(0, 0, 0, 0, fw, fh);
  },
  frog_hop: (scene) => {
    const key = 'frog_hop';
    const frameCount = 2;
    const fw = 48, fh = 48;
    const g = scene.add.graphics();
    for (let i = 0; i < frameCount; i++) {
      const ox = i * fw;
      const squat = i === 0 ? 4 : 0;
      // Body
      g.fillStyle(0x2ecc40, 1); g.fillEllipse(ox + 24, fh - 16 + squat, 30, 22 + squat * 2);
      // Head
      g.fillStyle(0x2ecc40, 1); g.fillCircle(ox + 24, fh - 28 + squat, 14);
      // Eyes (bulging)
      g.fillStyle(0xddff66, 1); g.fillCircle(ox + 16, fh - 36 + squat, 8); g.fillCircle(ox + 32, fh - 36 + squat, 8);
      g.fillStyle(0x111111, 1); g.fillCircle(ox + 16, fh - 36 + squat, 4); g.fillCircle(ox + 32, fh - 36 + squat, 4);
      // Mouth
      g.fillStyle(0x1a9929, 1); g.fillRect(ox + 17, fh - 24 + squat, 14, 3);
      // Legs
      g.fillStyle(0x27b535, 1);
      if (i === 0) {
        // Crouching
        g.fillRect(ox + 8, fh - 10, 10, 10); g.fillRect(ox + 30, fh - 10, 10, 10);
      } else {
        // Jumping
        g.fillRect(ox + 2, fh - 20, 10, 14); g.fillRect(ox + 36, fh - 20, 10, 14);
      }
    }
    g.generateTexture(key, fw * frameCount, fh);
    g.destroy();
    const tex = scene.textures.get(key);
    for (let i = 0; i < frameCount; i++) tex.add(i, 0, i * fw, 0, fw, fh);
  },
  jaguar_walk: (scene) => {
    const key = 'jaguar_walk';
    const frameCount = 4;
    const fw = 64, fh = 64;
    const g = scene.add.graphics();
    for (let i = 0; i < frameCount; i++) {
      const ox = i * fw;
      const legAlt = i % 2 === 0;
      g.fillStyle(0xe8a020, 1); g.fillRoundedRect(ox + 8, fh - 38, 38, 24, 6);
      g.fillStyle(0xe8a020, 1); g.fillCircle(ox + 46, fh - 36, 12);
      g.fillStyle(0xd08010, 1); g.fillEllipse(ox + 56, fh - 34, 10, 7);
      g.fillStyle(0x220000, 1); g.fillCircle(ox + 48, fh - 38, 2.5);
      g.fillStyle(0x8b4000, 0.6);
      g.fillCircle(ox + 16, fh - 42, 3); g.fillCircle(ox + 26, fh - 38, 3); g.fillCircle(ox + 22, fh - 46, 2);
      g.fillStyle(0xd08010, 1);
      g.fillRect(ox + (legAlt ? 12 : 16), fh - 16, 8, 14);
      g.fillRect(ox + (legAlt ? 30 : 26), fh - 16, 8, 14);
      g.fillStyle(0xe8a020, 1); g.fillEllipse(ox + 6, fh - 28, 10, 6);
    }
    g.generateTexture(key, fw * frameCount, fh);
    g.destroy();
    const tex = scene.textures.get(key);
    for (let i = 0; i < frameCount; i++) tex.add(i, 0, i * fw, 0, fw, fh);
  },
  snake_slither: (scene) => {
    const key = 'snake_slither';
    const frameCount = 2;
    const fw = 64, fh = 64;
    const g = scene.add.graphics();
    for (let i = 0; i < frameCount; i++) {
      const ox = i * fw;
      for (let s = 0; s < 5; s++) {
        const sx = ox + 8 + s * 10;
        const sy = fh - 24 + Math.sin((s + i) * 0.8) * 4;
        g.fillStyle(s % 2 === 0 ? 0x2eb82e : 0x1a991a, 1);
        g.fillEllipse(sx, sy, 14, 12);
      }
      g.fillStyle(0x1aaa1a, 1); g.fillEllipse(ox + 58, fh - 24, 18, 14);
      g.fillStyle(0xff0000, 1); g.fillCircle(ox + 62, fh - 27, 2.5);
      g.fillStyle(0xff3333, 1); g.fillRect(ox + 64, fh - 23, 6, 1);
    }
    g.generateTexture(key, fw * frameCount, fh);
    g.destroy();
    const tex = scene.textures.get(key);
    for (let i = 0; i < frameCount; i++) tex.add(i, 0, i * fw, 0, fw, fh);
  },
  caiman_walk: (scene) => {
    const key = 'caiman_walk';
    const frameCount = 2;
    const fw = 64, fh = 64;
    const g = scene.add.graphics();
    for (let i = 0; i < frameCount; i++) {
      const ox = i * fw;
      const legOff = i === 0 ? 0 : 3;
      g.fillStyle(0x1a6b1a, 1); g.fillRoundedRect(ox + 4, fh - 30, 52, 20, 5);
      g.fillStyle(0x1a6b1a, 1); g.fillRoundedRect(ox + 48, fh - 32, 16, 16, 4);
      g.fillStyle(0xffff00, 1); g.fillCircle(ox + 52, fh - 34, 4);
      g.fillStyle(0x111111, 1); g.fillCircle(ox + 52, fh - 34, 2);
      g.fillStyle(0x155a15, 1);
      g.fillRect(ox + 14 + legOff, fh - 12, 8, 10); g.fillRect(ox + 30 - legOff, fh - 12, 8, 10);
    }
    g.generateTexture(key, fw * frameCount, fh);
    g.destroy();
    const tex = scene.textures.get(key);
    for (let i = 0; i < frameCount; i++) tex.add(i, 0, i * fw, 0, fw, fh);
  },
  eagle_fly: (scene) => {
    const key = 'eagle_fly';
    const frameCount = 2;
    const fw = 64, fh = 64;
    const g = scene.add.graphics();
    for (let i = 0; i < frameCount; i++) {
      const ox = i * fw;
      const wingUp = i === 0;
      g.fillStyle(0x6b3a10, 1); g.fillEllipse(ox + 32, fh - 28, 32, 22);
      g.fillStyle(0xffffff, 1); g.fillCircle(ox + 50, fh - 34, 10);
      g.fillStyle(0xffcc00, 1); g.fillTriangle(ox + 58, fh - 34, ox + 64, fh - 32, ox + 58, fh - 30);
      g.fillStyle(0x111111, 1); g.fillCircle(ox + 52, fh - 35, 2.5);
      g.fillStyle(0x4a2808, 1);
      if (wingUp) {
        g.fillTriangle(ox + 16, fh - 34, ox + 0, fh - 48, ox + 30, fh - 28);
        g.fillTriangle(ox + 36, fh - 28, ox + 64, fh - 48, ox + 50, fh - 26);
      } else {
        g.fillTriangle(ox + 16, fh - 26, ox + 0, fh - 12, ox + 30, fh - 28);
        g.fillTriangle(ox + 36, fh - 28, ox + 64, fh - 12, ox + 50, fh - 30);
      }
      g.fillStyle(0xffcc00, 1); g.fillRect(ox + 24, fh - 18, 4, 6); g.fillRect(ox + 30, fh - 18, 4, 6);
    }
    g.generateTexture(key, fw * frameCount, fh);
    g.destroy();
    const tex = scene.textures.get(key);
    for (let i = 0; i < frameCount; i++) tex.add(i, 0, i * fw, 0, fw, fh);
  },
  archer_idle: (scene) => {
    const key = 'archer_idle';
    const frameCount = 2;
    const fw = 64, fh = 64;
    const g = scene.add.graphics();
    for (let i = 0; i < frameCount; i++) {
      const ox = i * fw;
      const bobY = i === 1 ? 1 : 0;
      g.fillStyle(0x8b4513, 1); g.fillRect(ox + 22, fh - 16, 6, 14); g.fillRect(ox + 34, fh - 16, 6, 14);
      g.fillStyle(0xa05c2a, 1); g.fillRoundedRect(ox + 16, fh - 32 + bobY, 24, 22, 4);
      g.fillStyle(0xe8956d, 1); g.fillCircle(ox + 28, fh - 42 + bobY, 10);
      g.fillStyle(0xcc4400, 1); g.fillRect(ox + 18, fh - 45 + bobY, 20, 4);
      g.fillStyle(0x111111, 1); g.fillCircle(ox + 24, fh - 42 + bobY, 2); g.fillCircle(ox + 32, fh - 42 + bobY, 2);
      g.lineStyle(2.5, 0x6b3a10, 1);
      g.beginPath(); g.moveTo(ox + 42, fh - 42 + bobY); g.lineTo(ox + 46, fh - 32 + bobY); g.lineTo(ox + 42, fh - 22 + bobY); g.strokePath();
      g.lineStyle(1, 0xeeeeee, 0.9); g.lineBetween(ox + 42, fh - 42 + bobY, ox + 42, fh - 22 + bobY);
      g.fillStyle(0xc8a050, 1); g.fillRect(ox + 32, fh - 32 + bobY, 14, 3);
    }
    g.generateTexture(key, fw * frameCount, fh);
    g.destroy();
    const tex = scene.textures.get(key);
    for (let i = 0; i < frameCount; i++) tex.add(i, 0, i * fw, 0, fw, fh);
  },
  acorn: (scene) => {
    const g = scene.add.graphics();
    // Cap
    g.fillStyle(0x8b5e3c, 1); g.fillEllipse(16, 8, 22, 14);
    g.fillStyle(0x6b4423, 1); g.fillRect(14, 4, 4, 6); // stem
    // Body
    g.fillStyle(0xc8832a, 1); g.fillEllipse(16, 20, 20, 22);
    // Shine
    g.fillStyle(0xffd980, 0.5); g.fillEllipse(11, 14, 8, 10);
    g.generateTexture('acorn', 32, 32);
    g.destroy();
  },
};

export class BootScene extends BaseScene {
  constructor() { super('BootScene'); }

  preload() {
    this.assets.loadManifest(MANIFEST);

    // Loading progress bar
    const { width, height } = this.scale;
    const barBg = this.add.rectangle(width / 2, height / 2, 300, 20, 0x333333);
    const bar = this.add.rectangle(width / 2 - 150, height / 2, 0, 18, 0x4a8c3f);
    bar.setOrigin(0, 0.5);

    const loadText = this.add.text(width / 2, height / 2 - 30, 'Carregando...', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      bar.width = 300 * value;
    });

    this.load.on('complete', () => {
      barBg.destroy(); bar.destroy(); loadText.destroy();
    });
  }

  create() {
    this.assets.applyFallbacks(FALLBACKS);

    // Helper: build frame list that works for both real spritesheets
    // (loaded via loadManifest → generateFrameNumbers works)
    // and procedural atlas textures (frames registered as String keys via tex.add).
    const frames = (key: string, count: number) => {
      const tex = this.textures.get(key);
      // If the texture has numeric frame names (procedural fallback path), use named frames
      if (tex.has('0')) {
        return Array.from({ length: count }, (_, i) => ({ key, frame: String(i) }));
      }
      // Real spritesheet loaded from file
      return this.anims.generateFrameNumbers(key, { start: 0, end: count - 1 });
    };

    this.anims.create({ key: 'raccoon_run_anim',  frames: frames('raccoon_run',  4), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'raccoon_idle_anim', frames: frames('raccoon_idle', 2), frameRate: 3,  repeat: -1 });
    this.anims.create({ key: 'frog_hop_anim',     frames: frames('frog_hop',     2), frameRate: 4,  repeat: -1 });
    this.anims.create({ key: 'jaguar_run_anim',   frames: frames('jaguar_walk',  4), frameRate: 8,  repeat: -1 });
    this.anims.create({ key: 'snake_slither_anim',frames: frames('snake_slither',2), frameRate: 5,  repeat: -1 });
    this.anims.create({ key: 'caiman_walk_anim',  frames: frames('caiman_walk',  2), frameRate: 3,  repeat: -1 });
    this.anims.create({ key: 'eagle_fly_anim',    frames: frames('eagle_fly',    2), frameRate: 5,  repeat: -1 });
    this.anims.create({ key: 'archer_idle_anim',  frames: frames('archer_idle',  2), frameRate: 2,  repeat: -1 });

    this.scene.start('MenuScene');
  }
}
