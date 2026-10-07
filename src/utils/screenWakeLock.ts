/**
 * Screen Wake Lock API helper.
 * Keeps the device screen awake during workouts and rest timers.
 */
let wakeLockSentinel: any = null;

export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    if ('wakeLock' in navigator && (navigator as any).wakeLock) {
      if (wakeLockSentinel !== null && !wakeLockSentinel.released) {
        return true;
      }
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    }
  } catch (err) {
    console.warn('Wake Lock request failed or not supported:', err);
  }
  return false;
}

export async function releaseScreenWakeLock(): Promise<void> {
  try {
    if (wakeLockSentinel !== null) {
      await wakeLockSentinel.release();
      wakeLockSentinel = null;
    }
  } catch (err) {
    console.warn('Wake Lock release failed:', err);
  }
}

export function isScreenWakeLockActive(): boolean {
  return wakeLockSentinel !== null && !wakeLockSentinel.released;
}
