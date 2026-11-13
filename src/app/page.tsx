'use client';

import React from 'react';
import GameWrapper from '../components/GameWrapper';
import HUD from '../ui/HUD';

export default function Home() {
  return (
    <main
      className="game-container block relative w-full h-screen overflow-hidden select-none"
      style={{ background: '#1a1a2e' }}
    >
      {/* z-index: 0 — Phaser canvas layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <GameWrapper />
      </div>

      <div id="applixir-ad-container" aria-live="polite" />

      {/* z-index: 100 — React HUD & touch controls, above canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none' }}>
        <HUD />
      </div>
    </main>
  );
}
