(() => {
  const deck = document.querySelector('.experience-deck');
  const cards = [...deck.querySelectorAll('.detail-simple')];
  const picker = document.querySelector('.experience-picker');
  const links = [...picker.querySelectorAll('a')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeCard;
  let scrollFrame;

  function select(card) {
    if (card === activeCard) return;
    activeCard = card;
    links.forEach(link => {
      if (link.hash === '#' + card.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function readPosition() {
    scrollFrame = undefined;
    const frame = deck.getBoundingClientRect();
    const midline = (frame.top + frame.bottom) / 2;
    let closest = cards[0];
    let best = Infinity;
    for (const card of cards) {
      const box = card.getBoundingClientRect();
      const distance = Math.max(box.top - midline, midline - box.bottom, 0);
      if (distance < best) {
        best = distance;
        closest = card;
      }
    }
    select(closest);
  }

  function goToHash(behavior = 'instant') {
    const card = cards.find(item => '#' + item.id === location.hash) || cards[0];
    const center = card.offsetHeight + 24 <= deck.clientHeight;
    card.scrollIntoView({ behavior, block: center ? 'center' : 'start' });
    select(card);
  }

  function fitEdges() {
    const first = cards[0];
    const last = cards.at(-1);
    const edge = card => Math.max(18, (deck.clientHeight - card.offsetHeight) / 2) + 'px';
    deck.style.setProperty('--deck-start', edge(first));
    deck.style.setProperty('--deck-end', edge(last));
  }

  picker.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    if (link.hash !== location.hash) history.pushState(null, '', link.hash);
    goToHash(motion.matches ? 'instant' : 'smooth');
  });
  deck.addEventListener('scroll', () => {
    if (scrollFrame === undefined) scrollFrame = requestAnimationFrame(readPosition);
  }, { passive: true });
  window.addEventListener('hashchange', () => goToHash());
  const resize = new ResizeObserver(fitEdges);
  resize.observe(deck);
  cards.forEach(card => resize.observe(card));
  fitEdges();
  goToHash();
})();
