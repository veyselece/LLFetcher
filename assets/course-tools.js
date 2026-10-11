(() => {
  'use strict';
  if (window.__lltrCourseToolsInstalled) return;
  window.__lltrCourseToolsInstalled = true;

  const state = { paused: false, canceled: false, running: false };
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const visible = el => !!(el && el.isConnected && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  const norm = value => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  function getMainTable() {
    const tables = [...document.querySelectorAll('table')];
    return tables.find(table => {
      const headers = norm(table.querySelector('thead')?.innerText);
      return headers.includes('title') && (headers.includes('subtitle/transcript') || headers.includes('media'));
    });
  }
  function getRows(table) {
    return [...(table?.querySelectorAll('tbody tr') || [])].filter(row => row.querySelectorAll('td').length >= 4);
  }
  function rowAction(row) {
    const cells = row.querySelectorAll('td');
    const cell = cells[cells.length - 1];
    return [...(cell?.querySelectorAll('button,[role="button"]') || [])].find(visible);
  }
  function addCheckbox(row, index) {
    const first = row.querySelector('td');
    if (!first || first.querySelector('.lltr-row-select')) return;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'lltr-row-select';
    checkbox.setAttribute('aria-label', `Select lesson ${index + 1}`);
    checkbox.dataset.lltrIndex = String(index);
    checkbox.style.marginRight = '8px';
    first.prepend(checkbox);
    checkbox.addEventListener('change', updateCount);
  }
  function selectedRows() {
    const table = getMainTable();
    return getRows(table).filter(row => row.querySelector('.lltr-row-select')?.checked);
  }
  function updateCount() {
    const count = selectedRows().length;
    const label = document.getElementById('lltr-selected-count');
    if (label) label.textContent = `${count} selected`;
    const download = document.getElementById('lltr-download-selected');
    if (download) download.disabled = count === 0 || state.running;
  }
  function ensureToolbar(table) {
    if (document.getElementById('lltr-course-tools')) return;
    const toolbar = document.createElement('div');
    toolbar.id = 'lltr-course-tools';
    toolbar.className = 'lltr-select-tools';
    toolbar.innerHTML = `
      <label style="display:flex;align-items:center;gap:6px">
        <input id="lltr-select-all" class="lltr-row-select" type="checkbox">
        <span>Select all</span>
      </label>
      <span id="lltr-selected-count" class="lltr-muted">0 selected</span>
      <button id="lltr-download-selected" type="button" disabled>Download selected</button>
      <button id="lltr-pause-selected" type="button" disabled>Pause after current</button>
      <button id="lltr-cancel-selected" type="button" disabled>Cancel batch</button>
      <span id="lltr-batch-status" class="lltr-muted" role="status" aria-live="polite"></span>`;
    table.parentElement?.parentElement?.insertBefore(toolbar, table.parentElement);
    toolbar.querySelector('#lltr-select-all').addEventListener('change', event => {
      getRows(getMainTable()).forEach((row, i) => {
        addCheckbox(row, i);
        row.querySelector('.lltr-row-select').checked = event.target.checked;
      });
      updateCount();
    });
    toolbar.querySelector('#lltr-download-selected').addEventListener('click', runBatch);
    toolbar.querySelector('#lltr-pause-selected').addEventListener('click', () => {
      state.paused = !state.paused;
      const button = document.getElementById('lltr-pause-selected');
      button.textContent = state.paused ? 'Resume batch' : 'Pause after current';
      setStatus(state.paused ? 'Will pause after the current download finishes.' : 'Batch resumed.');
      if (!state.paused) state.resumeResolve?.();
    });
    toolbar.querySelector('#lltr-cancel-selected').addEventListener('click', () => {
      state.canceled = true;
      state.paused = false;
      state.resumeResolve?.();
      // Ask the existing downloader to abort if it exposes a cancellation handler.
      window.dispatchEvent(new CustomEvent('lltr:cancel-current-download'));
      setStatus('Cancel requested; stopping the current item if supported.');
    });
    updateCount();
  }
  function setStatus(text) {
    const el = document.getElementById('lltr-batch-status');
    if (el) el.textContent = text;
  }
  async function waitForIdle(row, timeoutMs = 30 * 60 * 1000) {
    const start = Date.now();
    let sawBusy = false;
    while (Date.now() - start < timeoutMs) {
      if (state.canceled) return false;
      const button = rowAction(row);
      const isBusy = !!(button && (button.disabled || button.querySelector('.fa-spinner,.fa-refresh') || /loading/i.test(button.getAttribute('aria-label') || '')));
      if (isBusy) sawBusy = true;
      if (sawBusy && !isBusy) return true;
      await sleep(250);
    }
    return false;
  }
  async function waitIfPaused() {
    while (state.paused && !state.canceled) {
      await new Promise(resolve => { state.resumeResolve = resolve; });
      state.resumeResolve = null;
    }
  }
  async function runBatch() {
    if (state.running) return;
    const table = getMainTable();
    const rows = selectedRows();
    if (!table || rows.length === 0) return;
    state.running = true;
    state.canceled = false;
    state.paused = false;
    const download = document.getElementById('lltr-download-selected');
    const pause = document.getElementById('lltr-pause-selected');
    const cancel = document.getElementById('lltr-cancel-selected');
    download.disabled = true; pause.disabled = false; cancel.disabled = false;
    try {
      for (let i = 0; i < rows.length; i++) {
        if (state.canceled) break;
        await waitIfPaused();
        if (state.canceled) break;
        const row = rows[i];
        const button = rowAction(row);
        if (!button || button.disabled) continue;
        const title = row.querySelectorAll('td')[1]?.innerText?.trim() || `Lesson ${i + 1}`;
        setStatus(`Starting ${i + 1}/${rows.length}: ${title}`);
        button.click();
        const completed = await waitForIdle(row);
        if (!completed && !state.canceled) {
          setStatus(`Could not confirm completion: ${title}. Batch stopped for safety.`);
          break;
        }
        if (!state.canceled) setStatus(`Completed ${i + 1}/${rows.length}: ${title}`);
      }
      setStatus(state.canceled ? 'Batch canceled.' : state.paused ? 'Batch paused.' : 'Selected download batch finished.');
    } catch (error) {
      console.error('[LLFetcher] Selected download batch failed', error);
      setStatus('Batch stopped due to an error. Check the console.');
    } finally {
      state.running = false;
      download.disabled = selectedRows().length === 0;
      pause.disabled = true; cancel.disabled = true;
      updateCount();
    }
  }

  // Add a helpful inline explanation when the transcript fetch failure code is visible.
  function addTranscriptWarnings() {
    const table = getMainTable();
    if (!table) return;
    for (const row of getRows(table)) {
      const text = row.innerText || '';
      if (!/FETCH_TRANS\s*:\s*\(11\)/i.test(text) && !/FETCH_TRANS\s*\(11\)/i.test(text)) continue;
      const cells = row.querySelectorAll('td');
      const transcriptCell = cells[2];
      if (transcriptCell && !transcriptCell.querySelector('.lltr-transcript-warning')) {
        const warning = document.createElement('span');
        warning.className = 'lltr-transcript-warning';
        warning.textContent = 'Subtitle language file not found';
        warning.title = 'FETCH_TRANS:(11) — No matching subtitle/translation file was found for this lesson.';
        transcriptCell.appendChild(warning);
      }
    }
  }
  function scan() {
    const table = getMainTable();
    if (!table) return;
    getRows(table).forEach(addCheckbox);
    ensureToolbar(table);
    addTranscriptWarnings();
  }
  const start = () => {
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();