(() => {
  'use strict';
  // Automatically open queue configuration and media/subtitle selection
  // after a queue item appears. The original downloader actions remain in charge.
  const norm = value => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const labels = {
    setup: ['Run Queue Setup', 'Run Setup Queue', 'Kuyruk ayarlarını uygula', 'Kuyruk ayarlarını yeniden yapılandır'],
    media: [
      'Get Available Media Format & Subtitle',
      'Get Available Media Formats and Subtitles',
      'Kullanılabilir medya biçimlerini ve altyazıları getir'
    ]
  };
  const visible = el => !!(el && el.isConnected && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  const textOf = el => norm(el?.innerText || el?.textContent || el?.getAttribute?.('aria-label') || el?.title);
  const findButton = values => [...document.querySelectorAll('button,[role="button"],input[type="button"],input[type="submit"]')]
    .find(el => visible(el) && !el.disabled && values.some(v => textOf(el) === norm(v)));
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  let running = false;
  let lastAttempt = 0;
  let previousSnapshot = '';
  const snapshot = () => {
    // Track queue-like content without depending on React/Ember private internals.
    const candidates = [...document.querySelectorAll('[class*="QueueItem"],[class*="queue-item"],[data-testid*="queue"],li')];
    return candidates.map(el => textOf(el)).filter(Boolean).join('|').slice(0, 12000);
  };
  async function openSelection() {
    if (running || Date.now() - lastAttempt < 1800) return;
    running = true;
    lastAttempt = Date.now();
    try {
      await sleep(180);
      let media = findButton(labels.media);
      if (!media) {
        const setup = findButton(labels.setup);
        if (!setup) return;
        setup.click();
        // React renders the second stage only after setup is opened.
        for (let i = 0; i < 80; i++) {
          await sleep(150);
          media = findButton(labels.media);
          if (media) break;
        }
      }
      if (media && visible(media) && !media.disabled) {
        await sleep(180);
        media.click();
      }
    } catch (error) {
      console.warn('[LLFetcher] Automatic queue setup failed:', error);
    } finally {
      setTimeout(() => { running = false; }, 900);
    }
  }
  function observe() {
    const current = snapshot();
    if (!previousSnapshot) {
      previousSnapshot = current;
      return;
    }
    if (current && current !== previousSnapshot) {
      previousSnapshot = current;
      // Wait for the original queue-add handler to finish rendering.
      setTimeout(() => {
        const setup = findButton(labels.setup);
        const media = findButton(labels.media);
        if (setup || media) openSelection();
      }, 220);
    } else {
      previousSnapshot = current;
    }
  }
  // Also handle direct interaction with the setup control: the media selection
  // follows automatically, so the user never needs to click the second button.
  document.addEventListener('click', event => {
    const target = event.target?.closest?.('button,[role="button"],input[type="button"],input[type="submit"]');
    if (!target || !labels.setup.some(v => textOf(target) === norm(v))) return;
    setTimeout(async () => {
      for (let i = 0; i < 80; i++) {
        const media = findButton(labels.media);
        if (media) {
          await sleep(150);
          if (visible(media) && !media.disabled) media.click();
          return;
        }
        await sleep(150);
      }
    }, 120);
  }, true);
  const start = () => {
    previousSnapshot = snapshot();
    const observer = new MutationObserver(observe);
    observer.observe(document.documentElement || document, { childList: true, subtree: true, characterData: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();