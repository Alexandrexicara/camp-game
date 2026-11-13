/**
 * Minijogo SDK wrapper
 * Plataforma: minigame.vip — instância FBInstant
 * Config IDs dos anúncios conforme configuração da conta.
 */

const AD_IDS = {
  interstitial:          '4864743603539728_5070034729677280',
  banner:                '4864743603539728_5082905605056859',
  rewardedVideo:         '4864743603539728_5070034119677341',
  rewardedInterstitial:  '4864743603539728_5070034119677341',
};

// Detecta se o SDK está disponível
function hasFBInstant(): boolean {
  return typeof window !== 'undefined' &&
    typeof (window as Window & { FBInstant?: unknown }).FBInstant !== 'undefined';
}

function getFBInstant() {
  if (!hasFBInstant()) return null;
  return (window as unknown as { FBInstant: FBInstantLike }).FBInstant;
}

// ── Tipos mínimos do FBInstant para TypeScript ──────────────────────────────
interface AdInstance {
  loadAsync(): Promise<void>;
  showAsync(): Promise<void>;
}

interface FBInstantLike {
  initializeAsync(): Promise<void>;
  startGameAsync(): Promise<void>;
  getAdInstance(placementId: string): AdInstance;
  quit(): void;
}

interface KhelogySDKLike {
  init(options: { gameId: string }): Promise<void>;
  showAd(type: 'rewarded'): Promise<boolean | void>;
}

declare global {
  interface Window {
    KhelogySDK?: KhelogySDKLike;
    KHELOGY_GAME_ID?: string;
  }
}

// ── Estado interno dos ads ───────────────────────────────────────────────────
let sdkInitialized = false;
let interstitialInstance: AdInstance | null = null;
let rewardedInstance: AdInstance | null = null;

// Cada transição solicitada pelo jogo pode exibir um intersticial.
let interstitialInFlight: Promise<void> | null = null;

// ── Inicialização ─────────────────────────────────────────────────────────────
export async function initMinijogoSDK(): Promise<void> {
  if (sdkInitialized) return;

  // Khelogy HTML5 publisher SDK (used only in the Khelogy export).
  if (!hasFBInstant() && typeof window !== 'undefined' && window.KhelogySDK) {
    const gameId = window.KHELOGY_GAME_ID;
    if (!gameId || gameId === 'YOUR_GAME_ID') {
      console.info('[Khelogy SDK] Add the Game ID supplied in the publisher dashboard.');
      return;
    }
    try {
      await window.KhelogySDK.init({ gameId });
      sdkInitialized = true;
    } catch (e) {
      console.warn('[Khelogy SDK] init error:', e);
    }
    return;
  }

  if (!hasFBInstant()) return;
  try {
    const fb = getFBInstant()!;
    await fb.initializeAsync();
    await fb.startGameAsync();
    sdkInitialized = true;
    // Pré-carregar intersticial e rewarded
    await Promise.allSettled([
      preloadInterstitial(),
      preloadRewarded(),
    ]);
  } catch (e) {
    console.warn('[Minijogo SDK] init error:', e);
  }
}

// ── Pré-carregamento ──────────────────────────────────────────────────────────
async function preloadInterstitial(): Promise<void> {
  const fb = getFBInstant();
  if (!fb) return;
  try {
    interstitialInstance = fb.getAdInstance(AD_IDS.interstitial);
    await interstitialInstance.loadAsync();
  } catch (e) {
    console.warn('[Minijogo SDK] preload interstitial error:', e);
    interstitialInstance = null;
  }
}

async function preloadRewarded(): Promise<void> {
  const fb = getFBInstant();
  if (!fb) return;
  try {
    rewardedInstance = fb.getAdInstance(AD_IDS.rewardedVideo);
    await rewardedInstance.loadAsync();
  } catch (e) {
    console.warn('[Minijogo SDK] preload rewarded error:', e);
    rewardedInstance = null;
  }
}

// ── Mostrar intersticial (entre fases) ───────────────────────────────────────
export async function showInterstitial(): Promise<void> {
  // Khelogy currently serves preroll/container ads automatically. Its published
  // SDK documents rewarded video, not forced interstitial placements.
  if (typeof window !== 'undefined' && window.KhelogySDK && !hasFBInstant()) return;
  if (!sdkInitialized) return;
  // Evita duas chamadas simultâneas na mesma transição, sem bloquear anúncios
  // legítimos em mortes ou mudanças de fase distintas.
  if (interstitialInFlight) return interstitialInFlight;

  interstitialInFlight = (async () => {
    try {
      if (!interstitialInstance) await preloadInterstitial();
      if (!interstitialInstance) return;
      const currentAd = interstitialInstance;
      interstitialInstance = null;
      await currentAd.showAsync();
    } catch (e) {
      console.warn('[Minijogo SDK] show interstitial error:', e);
      interstitialInstance = null;
    } finally {
      interstitialInFlight = null;
      // Pré-carrega o próximo anúncio sem atrasar a continuação do jogo.
      setTimeout(() => { void preloadInterstitial(); }, 1500);
    }
  })();
  return interstitialInFlight;
}

// ── Mostrar vídeo recompensado ────────────────────────────────────────────────
export async function showRewardedVideo(
  onRewarded: () => void,
): Promise<boolean> {
  if (!sdkInitialized) return false;

  // Khelogy rewarded video: only grant the extra life after a completed ad.
  if (typeof window !== 'undefined' && window.KhelogySDK && !hasFBInstant()) {
    try {
      const completed = await window.KhelogySDK.showAd('rewarded');
      if (completed === false) return false;
      onRewarded();
      return true;
    } catch (e) {
      console.warn('[Khelogy SDK] rewarded ad error:', e);
      return false;
    }
  }

  try {
    if (!rewardedInstance) await preloadRewarded();
    if (!rewardedInstance) return false;

    await rewardedInstance.showAsync();
    onRewarded();
    rewardedInstance = null;

    // Pré-carrega próximo
    setTimeout(preloadRewarded, 2000);
    return true;
  } catch (e) {
    console.warn('[Minijogo SDK] show rewarded error:', e);
    rewardedInstance = null;
    return false;
  }
}

// ── Verificar se rewarded está disponível ────────────────────────────────────
export function isRewardedAvailable(): boolean {
  if (typeof window !== 'undefined' && window.KhelogySDK && !hasFBInstant()) {
    return sdkInitialized;
  }
  return sdkInitialized && rewardedInstance !== null;
}

export function isSdkReady(): boolean {
  return sdkInitialized;
}
