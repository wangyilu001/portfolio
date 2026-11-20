// Product showcase interactions stay local to the work view.
(() => {
  const assets = 'assets/today-project/';
  // Trim the old title bars and the captured device status bar.
  const screens = [
    { file: '01-wish.png', width: 860, height: 1720, trim: 139 },
    { file: '02-options.png', width: 860, height: 1720, trim: 110 },
    { file: '03-itinerary.png', width: 860, height: 1720, trim: 110 },
    { file: '04-adjustment.png', width: 860, height: 1720, trim: 110 },
    { file: '05-community.png', width: 940, height: 1382, trim: 0, bodyHeight: 1245 },
    { file: '06-points.png', width: 1200, height: 2664, trim: 120 }
  ];
  const showcase = document.querySelector('#work .showcase');
  const swipeArea = showcase.querySelector('.swipe-area');
  const front = showcase.querySelector('.front');
  const screen = front.querySelector('img');
  const rear = showcase.querySelector('.back');
  const preview = rear.querySelector('img');
  const buttons = [...showcase.querySelectorAll('.controls button')];
  const detailTrigger = front.querySelector('.detail-trigger');
  const detail = document.querySelector('.work-detail');
  const detailImage = detail.querySelector('img');
  const status = document.querySelector('#screen-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wrap = index => (index + screens.length) % screens.length;

  let active = 0;
  let gesture = null;
  let ignorePointerClick = false;
  let lastHorizontalWheel = -Infinity;
  let lastWheelDelta = 0;
  let wheelPeak = 0;

  for (const { file } of screens) {
    const image = new Image();
    image.src = assets + file;
  }

  function setCapture(device, image, index) {
    if (device.dataset.screen === String(index)) return;
    const { file, width, height, trim, bodyHeight = height - trim } = screens[index];
    device.style.setProperty('--source-width', width);
    device.style.setProperty('--source-height', height);
    device.style.setProperty('--trim', trim);
    device.style.setProperty('--body-height', bodyHeight);
    device.dataset.screen = index;
    image.src = assets + file;
  }

  function show(index) {
    active = wrap(index);
    const label = buttons[active].textContent.trim();
    setCapture(front, screen, active);
    screen.alt = label + '界面';
    detailTrigger.setAttribute('aria-label', '放大' + screen.alt);
    setCapture(rear, preview, wrap(active + 1));
    buttons.forEach((button, position) => {
      button.setAttribute('aria-pressed', String(position === active));
    });
    status.textContent = (active + 1) + ' / ' + screens.length + '，' + label;
  }

  function setOffset(offset) {
    swipeArea.style.setProperty('--travel', offset + 'px');
    swipeArea.style.setProperty('--tilt', offset / 18 + 'deg');
  }

  function switchScreen(index, direction) {
    if (wrap(index) === active) {
      setOffset(0);
      return;
    }

    front.getAnimations().filter(animation => animation.id === 'screen-enter').forEach(animation => animation.cancel());
    show(index);
    setOffset(0);

    if (!reducedMotion.matches) {
      const shift = direction * 20;
      const animation = front.animate(
        [{ transform: 'translateX(calc(-50% + ' + shift + 'px))', opacity: .74 },
         { transform: 'translateX(-50%)', opacity: 1 }],
        { duration: 220, easing: 'cubic-bezier(.2, .7, .24, 1)' }
      );
      animation.id = 'screen-enter';
    }
  }

  swipeArea.addEventListener('pointerdown', event => {
    if (gesture || !event.isPrimary || event.button !== 0) return;
    front.getAnimations().filter(animation => animation.id === 'screen-enter').forEach(animation => animation.cancel());
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
    ignorePointerClick = false;
    event.target.setPointerCapture(event.pointerId);
  });

  swipeArea.addEventListener('pointermove', event => {
    if (gesture?.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.horizontal && Math.abs(dx) <= Math.abs(dy)) return;

    gesture.horizontal = true;
    swipeArea.classList.add('is-dragging');
    if (!reducedMotion.matches) setOffset(Math.max(-82, Math.min(82, dx * .6)));
    setCapture(rear, preview, wrap(active + (dx < 0 ? 1 : -1)));
  });

  function endGesture(event, cancelled = false) {
    if (gesture?.id !== event.pointerId) return;
    const distance = event.clientX - gesture.x;
    const verticalDistance = event.clientY - gesture.y;
    const horizontal = gesture.horizontal || Math.abs(distance) > Math.abs(verticalDistance);
    const changed = !cancelled && horizontal && distance !== 0;
    ignorePointerClick = cancelled || horizontal;
    gesture = null;
    swipeArea.classList.remove('is-dragging');

    if (changed) {
      const direction = distance < 0 ? 1 : -1;
      switchScreen(active + direction, direction);
    } else {
      setOffset(0);
      setCapture(rear, preview, wrap(active + 1));
    }
  }

  swipeArea.addEventListener('pointerup', event => endGesture(event));
  swipeArea.addEventListener('pointercancel', event => endGesture(event, true));
  swipeArea.addEventListener('lostpointercapture', event => endGesture(event, true));
  showcase.addEventListener('wheel', event => {
    const { deltaMode, deltaX, deltaY, timeStamp } = event;
    if (gesture || event.ctrlKey || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    event.preventDefault();

    const scale = deltaMode === 1 ? 16 : deltaMode === 2 ? swipeArea.clientWidth : 1;
    const delta = deltaX * scale;
    const magnitude = Math.abs(delta);
    const previousMagnitude = Math.abs(lastWheelDelta);
    const reversed = Math.sign(delta) !== Math.sign(lastWheelDelta);
    const acceleratedAfterDecay = previousMagnitude <= wheelPeak / 2 && magnitude > previousMagnitude * 1.65;

    // Switch on the first horizontal event, then group the momentum that follows it.
    if (timeStamp - lastHorizontalWheel > 180 || reversed || acceleratedAfterDecay) {
      wheelPeak = magnitude;
      const direction = delta > 0 ? 1 : -1;
      switchScreen(active + direction, direction);
    } else {
      wheelPeak = Math.max(wheelPeak, magnitude);
    }
    lastHorizontalWheel = timeStamp;
    lastWheelDelta = delta;
  }, { passive: false });
  detailTrigger.addEventListener('click', event => {
    if (event.detail && ignorePointerClick) return;
    setCapture(detail, detailImage, active);
    detailImage.alt = screen.alt;
    detail.showModal();
    detail.scrollTop = 0;
  });
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => switchScreen(index, index >= active ? 1 : -1));
  });
  showcase.addEventListener('keydown', event => {
    const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!direction) return;
    event.preventDefault();
    switchScreen(active + direction, direction);
    if (buttons.includes(event.target)) buttons[active].focus();
  });
  show(0);
})();
