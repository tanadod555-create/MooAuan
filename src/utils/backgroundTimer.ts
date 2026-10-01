/**
 * Background Timer & Notification Service for MooAuan
 * Handles:
 * 1. Web Notifications for background tabs / phone lock screen (e.g. while on TikTok)
 * 2. Web Audio API synthesized gym buzzer/chime without external asset dependencies
 * 3. Haptic vibration for mobile devices
 * 4. Document title countdown synchronization
 */

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }
  return false;
};

export const sendBackgroundNotification = (title: string, body: string) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      // Use ServiceWorker registration if available, otherwise fallback to standard Notification
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: '/mascots/maxnum_icon.png',
            badge: '/mascots/maxnum_icon.png',
            vibrate: [200, 100, 200, 100, 400],
            tag: 'mooauan-rest-timer',
            renotify: true,
          } as any);
        }).catch(() => {
          new Notification(title, {
            body,
            icon: '/mascots/maxnum_icon.png',
            tag: 'mooauan-rest-timer',
          });
        });
      } else {
        new Notification(title, {
          body,
          icon: '/mascots/maxnum_icon.png',
          tag: 'mooauan-rest-timer',
        });
      }
    } catch (err) {
      console.warn('Notification failed:', err);
    }
  }
};

/**
 * Synthesizes high-fidelity gym audio alerts (works even in background/safari)
 */
export const playGymAlertSound = (type: 'tick' | 'warning' | 'finish' = 'finish') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (type === 'tick') {
      // Short 1s tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'warning') {
      // 3, 2, 1 Countdown Beeps
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      // Finish Double Chime (Happy Gym Buzzer)
      const now = ctx.currentTime;
      // Note 1: E5 (659Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: A5 (880Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.18);
      gain2.gain.setValueAtTime(0.4, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.65);

      // Note 3: C#6 (1108Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1108.73, now + 0.36);
      gain3.gain.setValueAtTime(0.45, now + 0.36);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.36);
      osc3.stop(now + 0.95);
    }
  } catch (err) {
    console.warn('Web Audio error:', err);
  }
};

export const triggerMobileVibrate = (pattern: number[] = [200, 100, 200, 100, 400]) => {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};
