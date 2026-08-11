'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { initGame } from '../game/boot';

const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      gameRef.current = initGame(containerRef.current.id);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="phaser-game-container"
      ref={containerRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100vw', height: '100vh',
        // Canvas sits BELOW the HUD buttons (z-index 0 vs HUD z-index 50)
        zIndex: 0,
      }}
    />
  );
};

export default GameCanvas;
