'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { touchInput } from '@/store/touchInput';

// ── Heart icon ───────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <span style={{
    display: 'inline-block', width: 22, height: 22,
    background: filled ? '#ff4466' : '#441133',
    borderRadius: '50% 50% 40% 40% / 40% 40% 60% 60%',
    border: '2px solid #ff88aa',
    boxShadow: filled ? '0 0 8px #ff4466' : 'none',
  }} />
);

// ── Control button — robust against pointer-cancel and canvas capture ─────────
interface CtrlBtnProps {
  children: React.ReactNode;
  onActivate: () => void;
  onDeactivate: () => void;
  style?: React.CSSProperties;
}

const CtrlBtn: React.FC<CtrlBtnProps> = ({ children, onActivate, onDeactivate, style }) => {
  const el = useRef<HTMLDivElement>(null);
  // Track which pointer IDs are currently held on THIS button
  const activePointers = useRef<Set<number>>(new Set());
  const active = useRef(false);

  // Called when ALL pointers on this button have been released
  const deactivate = useCallback(() => {
    if (active.current) {
      active.current = false;
      onDeactivate();
    }
    if (el.current) {
      el.current.style.transform = 'scale(1)';
      el.current.style.filter = 'none';
    }
  }, [onDeactivate]);

  const releasePointer = useCallback((pointerId: number) => {
    activePointers.current.delete(pointerId);
    if (activePointers.current.size === 0) {
      deactivate();
    }
  }, [deactivate]);

  useEffect(() => {
    // Global window listeners ensure we always catch release even if:
    // - finger drifts off the element
    // - browser cancels the pointer (canvas capture, scroll, etc.)
    const handleUp = (e: PointerEvent) => {
      if (activePointers.current.has(e.pointerId)) {
        releasePointer(e.pointerId);
      }
    };
    const handleCancel = (e: PointerEvent) => {
      if (activePointers.current.has(e.pointerId)) {
        releasePointer(e.pointerId);
      }
    };
    // Also release ALL when window loses focus (tab switch, call, etc.)
    const handleBlur = () => {
      activePointers.current.clear();
      deactivate();
    };

    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleCancel);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleCancel);
      window.removeEventListener('blur', handleBlur);
    };
  }, [releasePointer, deactivate]);

  const down = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Capture so we still receive events if finger drifts off element
    try { el.current?.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    activePointers.current.add(e.pointerId);
    if (!active.current) {
      active.current = true;
      onActivate();
    }
    if (el.current) {
      el.current.style.transform = 'scale(0.87)';
      el.current.style.filter = 'brightness(1.5)';
    }
  }, [onActivate]);

  return (
    <div
      ref={el}
      onPointerDown={down}
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        cursor: 'pointer',
        transition: 'transform 0.06s, filter 0.06s',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── HUD ───────────────────────────────────────────────────────────────────────
const HUD: React.FC = () => {
  const { score, lives, gameState, level } = useGameStore();

  // Safety net: if gameState leaves PLAYING, release all inputs
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      touchInput.reset();
    }
  }, [gameState]);

  if (gameState !== 'PLAYING') return null;

  const dirBtnStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: 72, height: 72,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'rgba(20,90,20,0.90)',
    border: '3px solid rgba(80,220,80,0.5)',
    borderRadius: 14,
    boxShadow: '0 5px 0 rgba(0,0,0,0.6)',
    fontSize: 30,
    color: '#fff',
    fontWeight: 900,
    fontFamily: 'monospace',
    ...extra,
  });

  const jumpBtnStyle: React.CSSProperties = {
    width: 86, height: 86,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'rgba(170,70,0,0.92)',
    border: '3px solid rgba(255,180,60,0.55)',
    borderRadius: 50,
    boxShadow: '0 5px 0 rgba(0,0,0,0.6), 0 0 18px rgba(255,140,0,0.35)',
    fontSize: 32,
    color: '#fff',
    fontWeight: 900,
    fontFamily: 'monospace',
    gap: 2,
  };

  return (
    // position: fixed keeps the HUD na viewport independente do scroll/câmera
    <div
      style={{
        position: 'fixed',
        inset: 0,
        fontFamily: 'monospace',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* ── Score / Lives ── */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'linear-gradient(to bottom,rgba(0,0,0,0.82),rgba(0,0,0,0))',
        }}
      >
        <div style={{
          background: 'rgba(0,0,0,0.65)', border: '2px solid #ffe066',
          borderRadius: 6, padding: '3px 10px',
        }}>
          <div style={{ fontSize: 9, color: '#ffe066', letterSpacing: '0.12em' }}>BOLOTAS</div>
          <div style={{ fontSize: 20, color: '#fff', fontWeight: 900 }}>
            🌰 {String(score).padStart(5, '0')}
          </div>
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.65)', border: '2px solid #88ff88',
          borderRadius: 6, padding: '3px 10px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 9, color: '#88ff88', letterSpacing: '0.12em' }}>FASE</div>
          <div style={{ fontSize: 20, color: '#fff', fontWeight: 900 }}>{level} / 5</div>
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.65)', border: '2px solid #ff4466',
          borderRadius: 6, padding: '3px 10px', textAlign: 'right',
        }}>
          <div style={{ fontSize: 9, color: '#ff8899', letterSpacing: '0.12em', marginBottom: 3 }}>VIDAS</div>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            {[1, 2, 3].map(i => <HeartIcon key={i} filled={i <= lives} />)}
          </div>
        </div>
      </div>

      {/* ── Touch controls — position: fixed, pointer-events: auto ── */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          padding: '0 20px 28px 20px',
          pointerEvents: 'auto',
        }}
      >
        {/* ← → buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <CtrlBtn
            onActivate={() => touchInput.pressLeft()}
            onDeactivate={() => touchInput.releaseLeft()}
            style={dirBtnStyle()}
          >
            ◀
          </CtrlBtn>
          <CtrlBtn
            onActivate={() => touchInput.pressRight()}
            onDeactivate={() => touchInput.releaseRight()}
            style={dirBtnStyle()}
          >
            ▶
          </CtrlBtn>
        </div>

        {/* JUMP + ATTACK buttons */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
          {/* ATTACK / boomerang */}
          <CtrlBtn
            onActivate={() => touchInput.pressAttack()}
            onDeactivate={() => touchInput.releaseAttack()}
            style={{
              width: 72, height: 72,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(140,60,0,0.92)',
              border: '3px solid rgba(255,200,80,0.6)',
              borderRadius: 14,
              boxShadow: '0 5px 0 rgba(0,0,0,0.6), 0 0 14px rgba(255,160,0,0.3)',
              fontSize: 26,
              color: '#fff',
              fontWeight: 900,
              fontFamily: 'monospace',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 28 }}>🪃</span>
            <span style={{ fontSize: 11, color: 'rgba(255,230,160,0.9)' }}>ARREMESS</span>
          </CtrlBtn>

          {/* JUMP */}
          <CtrlBtn
            onActivate={() => touchInput.pressJump()}
            onDeactivate={() => touchInput.releaseJump()}
            style={jumpBtnStyle}
          >
            <span style={{ fontSize: 34 }}>↑</span>
            <span style={{ fontSize: 13, color: 'rgba(255,230,180,0.9)' }}>PULAR</span>
          </CtrlBtn>
        </div>
      </div>
    </div>
  );
};

export default HUD;
