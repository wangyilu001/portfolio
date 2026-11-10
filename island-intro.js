// A short interactive welcome, followed by the decoded, clickable island.
(() => {
  const intro = document.querySelector('#island-intro');
  const progress = document.querySelector('#intro-progress');
  const percent = document.querySelector('#intro-percent');
  const status = document.querySelector('#intro-status');
  const retry = document.querySelector('#intro-retry');
  const art = document.querySelector('.island-art');
  const background = [document.querySelector('body > .header'), document.querySelector('#main'), document.querySelector('.island-back')].filter(Boolean);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const isHome = () => document.body.dataset.view === 'home';

  function hideIntro() {
    intro.hidden = true;
    document.body.classList.remove('is-intro-loading');
    background.forEach(element => { element.inert = false; });
    const theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.content = isHome() ? '#fff1df' : '#60213e';
  }

  function playIntro() {
    let completed = false, frame = 0, timer = 0;


    function finish() {
      if (completed) return;
      completed = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      hideIntro();
      if (isHome()) {
        const heading = document.querySelector('#hero-title');
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }

    intro.hidden = false;
    intro.classList.remove('is-ready');
    document.body.classList.add('is-intro-loading');
    progress.value = 0;
    progress.textContent = '0%';
    percent.textContent = '0%';
    status.textContent = '正在加载小岛';
    retry.hidden = true;
    background.forEach(element => { element.inert = true; });
    const title = document.querySelector('#intro-title');
    title.tabIndex = -1;
    title.focus({ preventScroll: true });

    function waitForImage(image) {
      return new Promise((resolve, reject) => {
        const loaded = async () => {
          if (!image.naturalWidth) { reject(new Error('Image unavailable')); return; }
          // Some embedded/background browsers postpone decode() indefinitely.
          // A successfully loaded image is still usable; do not trap the visitor.
          try { await Promise.race([image.decode(), new Promise(done => setTimeout(done, 750))]); } catch { /* Use the loaded image. */ }
          resolve();
        };
        if (image.complete) { loaded(); return; }
        image.addEventListener('load', loaded, { once: true });
        image.addEventListener('error', reject, { once: true });
      });
    }

    // Actual image readiness supplies 70% of the progress. The welcome's
    // remaining 30% gives the visitor a moment to interact, even on a warm cache.
    const started = performance.now();
    const welcomeDuration = reduced.matches ? 650 : 3000;
    let readyWeight = 0, shown = 0, lastTick = started, failed = false;
    waitForImage(intro.querySelector('.intro-island-art')).then(() => { readyWeight += 15; }).catch(fail);
    waitForImage(intro.querySelector('.intro-paper-art')).catch(() => {}).then(() => { readyWeight += 15; });
    waitForImage(art).then(() => { readyWeight += 40; }).catch(fail);

    function fail() {
      if (completed || failed) return;
      failed = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      status.textContent = '小岛图片暂时未加载成功，请重试';
      status.classList.remove('sr-only');
      retry.hidden = false;
    }

    function tick(now) {
      if (completed || failed) return;
      const timeProgress = Math.min(1, (now - started) / welcomeDuration);
      const target = readyWeight + 30 * timeProgress;
      const elapsed = Math.max(0, now - lastTick);
      lastTick = now;
      shown += Math.max(0, target - shown) * (1 - Math.exp(-elapsed / 175));
      const value = Math.min(99, Math.floor(shown));
      progress.value = value;
      progress.textContent = `${value}%`;
      percent.textContent = `${value}%`;
      if (readyWeight === 70 && timeProgress === 1 && shown >= 99) {
        progress.value = 100;
        progress.textContent = '100%';
        percent.textContent = '100%';
        status.textContent = '小岛准备好了';
        intro.classList.add('is-ready');
        clearTimeout(timer);
        timer = setTimeout(finish, reduced.matches ? 80 : 380);
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    timer = setTimeout(fail, 18000);
    frame = requestAnimationFrame(tick);
    return finish;
  }

  // Back from a standalone detail page opens the illustrated home immediately.
  // Normalize the hash so a subsequent reload starts with the welcome screen.
  const returnedFromDetail = location.hash === '#island';
  if (returnedFromDetail) history.replaceState(history.state, '', '#home');
  if (!isHome() || returnedFromDetail) {
    hideIntro();
    return;
  }

  const stopIntro = playIntro();
  retry.addEventListener('click', () => location.reload());
  window.addEventListener('hashchange', () => {
    if (!isHome()) stopIntro();
  });
})();
