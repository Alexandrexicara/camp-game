import { create } from 'zustand';

type GameStatus = 'START' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' | 'PAUSED';

interface GameState {
  score: number;
  lives: number;
  gameState: GameStatus;
  level: number;

  // Actions
  addScore: (amount: number) => void;
  setGameState: (state: GameStatus) => void;
  loseLife: () => void;
  setLevel: (level: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  lives: 3,
  gameState: 'START',
  level: 1,

  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  setGameState: (s) => set({ gameState: s }),
  loseLife: () =>
    set((state) => {
      const newLives = state.lives - 1;
      return {
        lives: newLives,
        gameState: newLives <= 0 ? 'GAMEOVER' : state.gameState,
      };
    }),
  setLevel: (level) => set({ level }),
  reset: () => set({ score: 0, lives: 3, gameState: 'START', level: 1 }),
}));
