const productStages=[
 {file:'01-wish.png',label:'表达愿望',alt:'今天去哪的愿望输入与心情选择界面',title:'先理解今天的状态',description:'心情、同行人、时间与预算，共同组成一次出行的起点'},
 {file:'02-options.png',label:'比较方案',alt:'今天去哪的主推荐和探索、购物等备选方案界面',title:'同一句愿望，也可以有不同走法',description:'松弛、探索、购物等体验节奏并列呈现，让用户保留选择权'},
 {file:'03-itinerary.png',label:'查看行程',alt:'今天去哪的时间线、店铺和推荐理由界面',title:'每一站，都有安排它的理由',description:'停留时间、预计花费、楼层与推荐理由一起呈现，帮助开始执行'},
 {file:'04-adjustment.png',label:'途中调整',alt:'预算降低后移除咖啡店并保留其他站点的演示界面',title:'计划变了，继续安排',description:'答辩演示：预算降到 50，调整后人均预计消费从 ¥103 变为 ¥25'},
 {file:'05-community.png',section:'community',label:'商圈互动',alt:'商圈社区的路线分享、店铺体验和商圈问答界面',title:'把逛过的路线分享给别人',description:'浏览路线分享、店铺体验和商圈问答，把其他用户的经验带进自己的行程'},
 {file:'06-points.png',section:'profile',label:'个人积分',alt:'个人积分、等级进度、我的足迹和积分任务界面',title:'用积分记录逛过的地方',description:'查看原型中的个人积分、等级进度和出行足迹'}
];
const productTabs=[...document.querySelectorAll('[data-product-stage]')];
let productStageIndex=0;
function selectProductStage(index,{focus=false}={}){
 productStageIndex=index;const stage=productStages[index];
 productTabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
 const img=document.querySelector('#product-screen');img.src=`assets/today-project/${stage.file}`;img.alt=stage.alt;
 document.querySelector('#product-stage-panel').setAttribute('aria-labelledby',`product-tab-${index}`);
 document.querySelector('.product-stage-index').textContent=String(index+1).padStart(2,'0');
 document.querySelector('#product-stage-title').textContent=stage.title;
 document.querySelector('#product-stage-description').textContent=stage.description;
 const device=document.querySelector('[data-open-product-image]');
 const section=stage.section || 'home';
 device.dataset.screen=index;
 device.querySelector('.product-phone-community').hidden=section!=='community';
 device.querySelectorAll('[data-phone-section]').forEach(item=>{
  item.classList.toggle('is-active', item.dataset.phoneSection===section);
 });
 const sectionLabel=device.querySelector('.product-phone-nav .is-active').textContent.trim();
 device.setAttribute('aria-label',`放大查看${sectionLabel}的${stage.label}界面`);
 if(focus)productTabs[index].focus();
}
productTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>selectProductStage(index));
 tab.addEventListener('keydown',event=>{
  let next;
  if(event.key==='ArrowRight')next=(index+1)%productTabs.length;
  if(event.key==='ArrowLeft')next=(index+productTabs.length-1)%productTabs.length;
  if(event.key==='Home')next=0;if(event.key==='End')next=productTabs.length-1;
  if(next!==undefined){event.preventDefault();selectProductStage(next,{focus:true});}
 });
});
document.querySelector('[data-open-product-image]')?.addEventListener('click',()=>{
 const stage=productStages[productStageIndex],img=document.querySelector('#product-image-full');
 img.src=`assets/today-project/${stage.file}`;img.alt=stage.alt;
 document.querySelector('#product-image-title').textContent=`${stage.label} · 答辩演示界面`;
 document.querySelector('#product-image-dialog').showModal();
});
