(() => {
  'use strict';
  const normalize = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const matchesSetup = el => {
    const label = normalize(el?.innerText || el?.textContent || el?.value || el?.getAttribute?.('aria-label'));
    return label.includes('run queue setup') || label.includes('run setup queue') || label.includes('kuyruk ayarlarını uygula');
  };
  let busy = false;
  let lastCourse = '';
  function check() {
    const button = [...document.querySelectorAll('button,[role="button"],input[type="button"],input[type="submit"]')].find(matchesSetup);
    if (!button) return;
    // Never let the manual intermediate step flash on screen.
    button.style.setProperty('display', 'none', 'important');
    button.style.setProperty('visibility', 'hidden', 'important');
    button.setAttribute('aria-hidden', 'true');
    const course = normalize(document.querySelector('h1,h2,[class*="course-title"],[class*="CourseTitle"]')?.textContent) || location.pathname;
    if (busy || course === lastCourse) return;
    busy = true;
    lastCourse = course;
    button.click();
    setTimeout(() => { busy = false; check(); }, 500);
  }
  function start() {
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true });
    check();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();