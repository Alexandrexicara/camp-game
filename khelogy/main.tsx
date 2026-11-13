import React from 'react';
import { createRoot } from 'react-dom/client';
import GameCanvas from '../src/ui/GameCanvas';
import HUD from '../src/ui/HUD';

const root = document.getElementById('root');
if (!root) throw new Error('Game root element was not found.');

createRoot(root).render(
  <React.StrictMode>
    <main
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#1a1a2e',
        touchAction: 'none',
      }}
    >
      <GameCanvas />
      <HUD />
    </main>
  </React.StrictMode>,
);
