(() => {
  const email = 'wangyilu2004@163.com';
  const phone = '13287998950';
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
  `;

  document.body.append(trigger, dialog);
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
