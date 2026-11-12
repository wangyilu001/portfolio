(() => {
  const email = 'wangyilu2004@163.com';
  const phone = '13287998950';
  const lettersEndpoint = 'https://yilu-portfolio-letters.wangyiu04lydia.chatgpt.site/api/letters';
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'contact-trigger';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'contact-dialog');
  trigger.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3"/>
      <path d="m4 7 8 6 8-6"/>
    </svg>
    <span class="contact-trigger-en" lang="en">Contact Me</span>
    <span class="contact-trigger-zh">联系我</span>
  `;

  const dialog = document.createElement('dialog');
  dialog.className = 'contact-dialog';
  dialog.id = 'contact-dialog';
  dialog.setAttribute('aria-labelledby', 'contact-dialog-title');
  dialog.innerHTML = `
    <form method="dialog">
      <button class="contact-close" aria-label="关闭联系方式" autofocus>×</button>
    </form>
    <h2 id="contact-dialog-title">联系我 <span lang="en">Contact Me</span></h2>
    <dl class="contact-details">
      <div class="contact-row">
        <dt>我的邮箱</dt>
        <dd>${email}</dd>
      </div>
      <div class="contact-row">
        <dt>我的手机号</dt>
        <dd><a href="tel:${phone}">${phone}</a></dd>
      </div>
    </dl>
    <details class="contact-letter">
      <summary>给我写一封信</summary>
      <form class="contact-letter-form">
        <label>署名（可选）<input name="name" maxlength="60" autocomplete="nickname"></label>
        <label>你想说的话<textarea name="message" rows="4" maxlength="2000" required></textarea></label>
        <label hidden>请留空<input name="website" tabindex="-1" autocomplete="off"></label>
        <button type="submit">投递留言</button>
        <p role="status" class="contact-letter-status"></p>
      </form>
    </details>
  `;

  document.body.append(trigger, dialog);
  const form = dialog.querySelector('.contact-letter-form');
  const status = form.querySelector('[role="status"]');
  const submit = form.querySelector('button');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const {name, message, website} = Object.fromEntries(new FormData(form));
    if (!message.trim()) {
      status.textContent = '请先写一点想说的话。';
      form.elements.message.focus();
      return;
    }
    submit.disabled = true;
    status.textContent = '投递中…';
    try {
      const response = await fetch(lettersEndpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, message, website})
      });
      const result = await response.json();
      if (response.status === 201 && result.received === true) {
        form.reset();
        status.textContent = '留言已送到我的收件箱，谢谢你写信给我。';
      } else {
        status.textContent = result.error || '暂时无法投递，你写的内容还在。';
      }
    } catch {
      status.textContent = '暂时无法投递，你写的内容还在。';
    } finally {
      submit.disabled = false;
    }
  });
  trigger.addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.close();
    }
  });
})();
