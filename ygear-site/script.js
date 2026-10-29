// 异格 YGEAR：纯前端演示。建议基于一般握法与尺寸经验，不代表AI模型或实测数据。
const selections = { grip: 'palm', hand: 'medium', priority: 'comfort' };
const names = { palm:'趴握', claw:'抓握', fingertip:'指握', small:'小于17cm', medium:'17–19cm', large:'大于19cm', unknown:'手长不确定', comfort:'舒适', control:'精准控制', agility:'灵活移动' };
let lastReport = '';

document.querySelectorAll('[data-group]').forEach(group => {
  const groupName = group.dataset.group;
  group.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      group.querySelectorAll('button').forEach(b => {b.classList.remove('selected');b.setAttribute('aria-pressed','false');});
      button.classList.add('selected');button.setAttribute('aria-pressed','true');
      selections[groupName] = button.dataset.value;
    });
  });
});

function generateAdvice() {
  const {grip, hand, priority} = selections;
  const size = hand === 'small' ? '偏小尺寸' : hand === 'large' ? '中大尺寸' : hand === 'unknown' ? '中等尺寸作为起点' : '中等尺寸';
  const gripAdvice = {
    palm: {title:'贴合支撑型',desc:'优先观察背部支撑是否饱满、掌心是否自然贴合，以及长时间使用时手腕能否放松。'},
    claw: {title:'灵活控制型',desc:'可以从背部有适度隆起、两侧容易抓稳的对称或近对称外形开始比较。'},
    fingertip: {title:'轻巧灵活型',desc:'优先比较短一些、前端较低、便于指尖微调的鼠标，避免外壳妨碍手指活动。'}
  }[grip];
  const priorityAdvice = {
    comfort:'重点关注侧边曲率、握持压力和长时间使用的舒适度。',
    control:'重点关注稳定抓握、按键位置和停鼠时的控制感。',
    agility:'重点关注外壳是否容易抬起，以及移动时的灵活程度。'
  }[priority];
  const uncertainty = hand === 'unknown' ? '你还没确定手长，建议先测量，再缩小尺寸范围。' : '手长只是起点，手宽和实际握持姿势同样重要。';
  const description = `建议先试握${size}的${gripAdvice.title}鼠标。${gripAdvice.desc}${priorityAdvice}${uncertainty}`;
  document.getElementById('resultTitle').textContent = gripAdvice.title;
  document.getElementById('resultDescription').textContent = description;
  document.getElementById('resultTags').innerHTML = [names[grip],names[hand],names[priority]].map(v=>`<span>${v}</span>`).join('');
  document.getElementById('copyResult').disabled = false;
  lastReport = `异格 YGEAR · 鼠标选型初步建议\n握法：${names[grip]}\n手长：${names[hand]}\n关注：${names[priority]}\n推荐方向：${gripAdvice.title}\n${description}\n\n注：仅为启发式选型建议，请结合试握和具体型号数据。`;
}
document.getElementById('calculate').addEventListener('click',generateAdvice);
document.getElementById('copyResult').addEventListener('click',async()=>{
  if(!lastReport)return;
  const btn=document.getElementById('copyResult');
  try{await navigator.clipboard.writeText(lastReport);btn.textContent='已复制 ✓';}
  catch(e){const el=document.createElement('textarea');el.value=lastReport;document.body.appendChild(el);el.select();try{document.execCommand('copy');btn.textContent='已复制 ✓';}catch(_){btn.textContent='复制失败，请手动选择文字';}el.remove();}
  setTimeout(()=>{btn.textContent='复制选型结果 ↗';},2200);
});
const menu=document.getElementById('menuButton');const mobile=document.getElementById('mobileNav');
menu.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!expanded));mobile.hidden=expanded;menu.textContent=expanded?'☰':'×';});
mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.textContent='☰';}));
document.getElementById('year').textContent=new Date().getFullYear();
