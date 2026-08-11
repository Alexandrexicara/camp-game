'use client';
import { useEffect } from 'react';

/**
 * OrientationGuard
 * - Shows a "rotate your device" overlay when the screen is portrait on a touch device
 * - Overlay HIDES automatically as soon as the device switches to landscape
 * - Also has a "Jogar assim mesmo" button to dismiss it manually
 * - Auto-enters fullscreen on first tap and adds a ⛶ toggle button
 */
export function OrientationGuard() {
  useEffect(() => {
    // ── Create rotate overlay ─────────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.id = 'rotate-overlay';
    overlay.innerHTML = `
      <div class="rotate-icon">📱➡️</div>
      <p>Gire o celular para o lado<br>para jogar Animal Camp!</p>
      <button id="rotate-skip-btn">Jogar assim mesmo ▶</button>
    `;
    document.body.appendChild(overlay);

    // ── Determine if we're on a touch device ──────────────────────────────
    const isTouchDevice = () =>
      navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

    const isPortrait = () => window.innerHeight > window.innerWidth;

    // Show overlay only on touch + portrait
    const syncOverlay = () => {
      if (isTouchDevice() && isPortrait()) {
        overlay.style.display = 'flex';
      } else {
        overlay.style.display = 'none';
      }
    };

    // Initial check
    syncOverlay();

    // Re-check on every resize / orientation change
    window.addEventListener('resize', syncOverlay);
    window.addEventListener('orientationchange', syncOverlay);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', syncOverlay);
    }

    // "Play anyway" button dismisses overlay permanently for this session
    const skipBtn = document.getElementById('rotate-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        overlay.style.display = 'none';
        // Remove orientation listeners so it never comes back
        window.removeEventListener('resize', syncOverlay);
        window.removeEventListener('orientationchange', syncOverlay);
        if (window.screen?.orientation) {
          window.screen.orientation.removeEventListener('change', syncOverlay);
        }
      });
    }

    // ── Fullscreen helpers ────────────────────────────────────────────────
    const enterFullscreen = async () => {
      try {
        const el = document.documentElement;
        if (el.requestFullscreen) await el.requestFullscreen();
        else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
        const scr = window.screen as any;
        if (scr.orientation?.lock) {
          await scr.orientation.lock('landscape').catch(() => {});
        }
      } catch { /* denied — that's fine */ }
    };

    const exitFullscreen = () => {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    };

    const isFullscreen = () =>
      !!(document.fullscreenElement || (document as any).webkitFullscreenElement);

    // ── Fullscreen toggle button ──────────────────────────────────────────
    const btn = document.createElement('button');
    btn.id = 'fullscreen-btn';
    btn.title = 'Tela cheia';
    btn.textContent = '⛶';
    btn.setAttribute('aria-label', 'Alternar tela cheia');

    const updateIcon = () => { btn.textContent = isFullscreen() ? '✕' : '⛶'; };
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isFullscreen()) exitFullscreen();
      else enterFullscreen();
    });
    document.addEventListener('fullscreenchange', updateIcon);
    document.addEventListener('webkitfullscreenchange', updateIcon);
    document.body.appendChild(btn);

    // ── Auto-fullscreen on first tap ──────────────────────────────────────
    const onFirstTouch = () => {
      enterFullscreen();
      window.removeEventListener('pointerdown', onFirstTouch);
    };
    window.addEventListener('pointerdown', onFirstTouch, { once: true });

    return () => {
      overlay.remove();
      btn.remove();
      window.removeEventListener('resize', syncOverlay);
      window.removeEventListener('orientationchange', syncOverlay);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', syncOverlay);
      }
      document.removeEventListener('fullscreenchange', updateIcon);
      document.removeEventListener('webkitfullscreenchange', updateIcon);
      window.removeEventListener('pointerdown', onFirstTouch);
    };
  }, []);

  return null;
}
