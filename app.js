// This prototype works from a local file and has no runtime dependencies.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const stickerButton = document.querySelector('#sticker-button');
if(!stickerButton?.classList.contains('hero-character'))stickerButton?.addEventListener('click', () => {
  stickerButton.classList.remove('is-waving');
  void stickerButton.offsetWidth;
  stickerButton.classList.add('is-waving');
});

document.addEventListener('pointermove', event => {
  if (reduceMotion.matches || event.pointerType !== 'mouse') return;
  const x = (event.clientX / window.innerWidth - 0.5) * 8;
  const y = (event.clientY / window.innerHeight - 0.5) * 7;
  document.documentElement.style.setProperty('--eye-x', `${x}px`);
  document.documentElement.style.setProperty('--eye-y', `${y}px`);
  if(!stickerButton?.classList.contains('hero-character'))stickerButton?.style.setProperty('--sticker-lean', `${-11 + x * .5}deg`);
});

// Fictional experience points, used only to illustrate the project's constraint logic.
const activities = {
  coffee: { name: '咖啡小坐', price: 28, minutes: 40, symbol: '☕', indoor: true },
  book: { name: '书店闲逛', price: 0, minutes: 45, symbol: '▤', indoor: true },
  park: { name: '公园散步', price: 0, minutes: 40, symbol: '✿', indoor: false },
  exhibit: { name: '看一场小展', price: 40, minutes: 60, symbol: '◈', indoor: true },
  tea: { name: '热茶与发呆', price: 15, minutes: 35, symbol: '♧', indoor: true }
};

function planAfternoon(budget, raining) {
  // The three bands give different plans; every returned plan respects the displayed budget.
  let keys;
  if (budget >= 70) keys = raining ? ['coffee', 'exhibit', 'book'] : ['coffee', 'exhibit', 'park'];
  else if (budget >= 30) keys = raining ? ['coffee', 'book', 'tea'] : ['coffee', 'book', 'park'];
  else keys = raining ? ['book', 'tea'] : ['book', 'park'];
  let total = 0;
  const stops = keys.map(key => activities[key]).filter(item => {
    if (total + item.price > budget || (raining && !item.indoor)) return false;
    total += item.price;
    return true;
  });
  return { stops, total, minutes: stops.reduce((sum, item) => sum + item.minutes, 0) + Math.max(stops.length - 1, 0) * 10 };
}

const budgetInput = document.querySelector('#budget');
const rainInput = document.querySelector('#rain');
const routeElement = document.querySelector('#route');
function updateRoute(animate = true) {
  const budget = Number(budgetInput.value);
  const plan = planAfternoon(budget, rainInput.checked);
  document.querySelector('#budget-value').textContent = budget;
  const percent = (budget - 20) / 180 * 100;
  budgetInput.style.background = `linear-gradient(to right, var(--navy) ${percent}%, #1d24402b ${percent}%)`;
  routeElement.replaceChildren(...plan.stops.map(stop => {
    const row = document.createElement('div');
    row.className = 'route-stop';
    const symbol = document.createElement('span');
    symbol.className = 'stop-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = stop.symbol;
    const info = document.createElement('div');
    info.className = 'stop-info';
    const title = document.createElement('strong');
    title.textContent = stop.name;
    const meta = document.createElement('span');
    meta.textContent = `${stop.minutes} 分钟 / ${stop.price === 0 ? '免费' : `${stop.price} 元`}`;
    info.append(title, meta);
    row.append(symbol, info);
    return row;
  }));
  document.querySelector('#route-result').textContent = `安排好了：${plan.total} 元，约 ${plan.minutes} 分钟${rainInput.checked ? '，都在室内' : ''}`;
  if (animate && !reduceMotion.matches) {
    routeElement.classList.remove('route-updated');
    void routeElement.offsetWidth;
    routeElement.classList.add('route-updated');
  }
}
if (budgetInput && rainInput && routeElement) {
  budgetInput.addEventListener('input', () => updateRoute(false));
  budgetInput.addEventListener('change', () => updateRoute());
  rainInput.addEventListener('change', () => updateRoute());
  updateRoute(false);
}

document.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', () => document.getElementById(button.dataset.close).close());
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
});

const interestContent = {
  rowing: { title: '在艇上，看方向。', description: '我担任过赛艇队舵手，随队获得第五届鄂尔多斯赛艇大师赛大学生组女子八人单桨有舵手 1000 米第一名。' },
  climb: { title: '换一条路，上去。', description: '攀岩是我的兴趣之一。' },
  bike: { title: '骑远一点，再一点。', description: '工作和学习以外，我也喜欢骑行和飞盘。' }
};
const interestDialog = document.querySelector('#interest-dialog');
document.querySelectorAll('[data-interest]').forEach(button => {
  button.addEventListener('click', () => {
    const content = interestContent[button.dataset.interest];
    document.querySelector('#interest-title').textContent = content.title;
    document.querySelector('#interest-description').textContent = content.description;
    interestDialog.showModal();
  });
});

document.querySelector('#copy-email')?.addEventListener('click', async () => {
  const email = 'wangyilu2004@163.com';
  const status = document.querySelector('#copy-status');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(email);
    status.textContent = '已复制，可以粘贴啦。';
  } catch {
    // Local file and permission restrictions may disable the Clipboard API.
    const text = document.createElement('textarea');
    text.value = email;
    text.style.position = 'fixed';
    text.style.opacity = '0';
    text.setAttribute('readonly', '');
    document.body.append(text);
    text.select();
    const copied = document.execCommand('copy');
    text.remove();
    status.textContent = copied ? '已复制，可以粘贴啦。' : '请选中左侧邮箱复制。';
  }
});

const islandCharacterButton = document.querySelector('.island-character-button');
if (islandCharacterButton) {
  const board = islandCharacterButton.closest('.island-board');
  const wink = board.querySelector('.island-wink');

  function react() {
    board.classList.remove('is-saying-hello');
    // Replay the wink and sparkles for each greeting.
    wink.getBoundingClientRect();
    board.classList.add('is-saying-hello');
  }

  islandCharacterButton.addEventListener('click', react);
  islandCharacterButton.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') react();
  });
  wink.addEventListener('animationend', event => {
    if (event.target === wink) board.classList.remove('is-saying-hello');
  });
}
