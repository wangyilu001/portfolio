// Site sections share a viewport. Hashes keep navigation, deep links and history native.
const views = [...document.querySelectorAll('#main > [data-view]')];
const viewNames = {home:'首页',resume:'简历',education:'求学经历',internships:'实习',work:'作品',about:'关于我'};
const aliases = {'internship-cards':'internships','exp-gf':'internships','exp-cicc':'internships','exp-kwai':'internships','exp-byte':'internships','project-today':'work',contact:'about',main:'home',island:'home'};
function showView({focus=false}={}) {
  const hash=decodeURIComponent(location.hash.slice(1));
  const id=viewNames[hash]?hash:(aliases[hash]||'home');
  const previous=document.body.dataset.view;
  views.forEach(view=>{view.hidden=view.dataset.view!==id;});
  document.body.dataset.view=id;
  if(previous&&previous!==id&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const direction=Object.keys(viewNames).indexOf(id)>Object.keys(viewNames).indexOf(previous)?1:-1;
    const view=views.find(view=>view.dataset.view===id);
    view.getAnimations().forEach(animation=>animation.cancel());
    view.animate([{opacity:.4,transform:`translateY(${direction*32}px)`},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
  document.querySelectorAll('.page-nav a,.menu-row').forEach(a=>{
    const active=a.hash===`#${id}`;
    a.classList.toggle('is-current',active);
    if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  });
  document.title=`${viewNames[id]} · 王艺潞`;
  window.scrollTo(0,0);
  if(focus){const heading=views.find(view=>view.dataset.view===id)?.querySelector('h1,h2');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}
}
document.addEventListener('click',event=>{
  const a=event.target.closest('a[href]');
  if(!a||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target||a.hasAttribute('download'))return;
  const u=new URL(a.href,location.href);
  if(u.origin!==location.origin||u.pathname!==location.pathname)return;
  const hash=u.hash.slice(1);
  if(hash&&!viewNames[hash]&&!aliases[hash])return;
  event.preventDefault();
  const destination=hash||'home';
  if(location.hash===`#${destination}`)showView({focus:true});else location.hash=destination;
});
window.addEventListener('hashchange',()=>showView({focus:true}));
window.addEventListener('resize',()=>window.scrollTo(0,0));

// Navigation is explicit: illustration links and Back only.
showView();
