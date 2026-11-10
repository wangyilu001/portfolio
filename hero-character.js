(()=>{
 const intro=document.querySelector('#island-intro');
 const button=intro?.querySelector('.hero-character');
 const media=window.HERO_MOTION;
 if(!button||intro.hidden||!media||!window.HeroOilMotion)return;
 const poster=button.querySelector('.hero-poster'),sprite=button.querySelector('.hero-sprite');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let ready=false,visible=true;
 const paint=HeroOilMotion.createCssSpriteRenderer(sprite,media.columns,media.rows);
 function rest(){
  sprite.hidden=true;
  poster.hidden=false;
  button.dataset.frame='neutral';
 }
 function frameForAngle(angle){
  const a=media.timeline.anchors;
  for(let i=1;i<a.length;i++)if(angle<=a[i].angle){
   const t=(angle-a[i-1].angle)/(a[i].angle-a[i-1].angle);
   const source=a[i-1].sourceFrame+t*(a[i].sourceFrame-a[i-1].sourceFrame);
   const frames=media.timeline.sampledSourceFrames.slice(0,media.timeline.circularFrameCount);
   let index=0;for(let k=1;k<frames.length;k++)if(Math.abs(frames[k]-source)<Math.abs(frames[index]-source))index=k;
   return index;
  }return 0;
 }
 function look(angle){
  if(!ready||!visible||intro.hidden||reduced.matches)return;
  const frame=frameForAngle(angle);
  if(button.dataset.frame!==String(frame)){
   paint(frame);
   button.dataset.frame=frame;
  }
  sprite.hidden=false;
  poster.hidden=true;
 }
 function pointer(e){
  if(e.pointerType==='touch'&&!e.buttons)return;
  if(!ready||!visible||intro.hidden||reduced.matches)return;
  const r=button.getBoundingClientRect();
  const x=e.clientX-r.left-r.width*.5,y=e.clientY-r.top-r.height*.39;
  if(Math.hypot(x,y)<r.width*.10){rest();return;}
  look((Math.atan2(x,-y)*180/Math.PI+360)%360);
 }
 window.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')pointer(e);},{passive:true});
 button.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){button.setPointerCapture(e.pointerId);pointer(e);}});
 button.addEventListener('pointermove',e=>{if(e.pointerType==='touch')pointer(e);},{passive:true});
 button.addEventListener('pointerup',e=>{if(e.pointerType==='touch')rest();});
 button.addEventListener('pointercancel',rest);
 document.documentElement.addEventListener('pointerleave',rest);window.addEventListener('blur',rest);
 button.addEventListener('click',()=>{button.setAttribute('aria-label','你好呀，我是艺潞。移动鼠标，和我对个眼神。');});
 button.addEventListener('keydown',e=>{const angles={ArrowUp:0,ArrowRight:90,ArrowDown:180,ArrowLeft:270};if(e.key in angles){e.preventDefault();look(angles[e.key]);}else if(e.key==='Escape')rest();});
 reduced.addEventListener('change',()=>{if(reduced.matches)rest();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)rest();});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)rest();if(intro.hidden)observer.disconnect();},{threshold:.05});
 observer.observe(button);
 const image=new Image();image.onload=async()=>{try{await Promise.race([image.decode(),new Promise(done=>setTimeout(done,750))]);}catch{}sprite.style.backgroundImage=`url("${media.image}")`;ready=true;button.dataset.motionReady='true';};image.onerror=rest;image.src=media.image;
 rest();
})();
