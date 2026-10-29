// 异格 YGEAR：纯前端演示。建议基于一般握法与尺寸经验，不代表AI模型或实测数据。
const selections = { grip: 'palm', hand: 'medium', priority: 'comfort' };
const names = { palm:'趴握', claw:'抓握', fingertip:'指握', small:'小于17cm', medium:'17–19cm', large:'大于19cm', unknown:'手长不确定', comfort:'舒适', control:'精准控制', agility:'灵活移动' };
let lastReport = '';
let reportRevision = 0;

document.querySelectorAll('[data-group]').forEach(group => {
  const groupName = group.dataset.group;
  group.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      if (selections[groupName] === button.dataset.value) return;
      group.querySelectorAll('button').forEach(b => {b.classList.remove('selected');b.setAttribute('aria-pressed','false');});
      button.classList.add('selected');button.setAttribute('aria-pressed','true');
      selections[groupName] = button.dataset.value;
      invalidateReport();
    });
  });
});

function generateAdvice() {
  reportRevision++;
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
  const description = `建议先比较${size}的${gripAdvice.title}鼠标；这是试握起点，不是具体型号或毫米尺寸推荐。`;
  const reasons = [`握法：${names[grip]}。${gripAdvice.desc}`, `手长：${names[hand]}。${uncertainty}`, `偏好：${names[priority]}。${priorityAdvice}`];
  const checks = ['对照厂商尺寸图，检查长度、宽度、背部隆起位置与现用鼠标的区别。', '实际试握时，确认手指自然落在按键上，侧边不会挤手，移动和抬起时不必用力夹紧。', '尝试连续移动、点击和停鼠，留意手腕是否放松；购买前查看可靠评测与退换政策。'];
  document.getElementById('resultTitle').textContent = gripAdvice.title;
  document.getElementById('resultDescription').textContent = description;
  const fillList = (id, items) => document.getElementById(id).replaceChildren(...items.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  fillList('resultReasons', reasons);
  fillList('resultChecks', checks);
  document.getElementById('resultTags').innerHTML = [names[grip],names[hand],names[priority]].map(v=>`<span>${v}</span>`).join('');
  document.getElementById('resultContent').hidden = false;
  document.getElementById('resultStatus').textContent = '已根据当前选项生成初步方向。';
  document.getElementById('copyResult').disabled = false;
  clearCopyFeedback();
  lastReport = ['异格 YGEAR · 鼠标选型初步建议', '形态与尺寸方向', description, '推荐原因', ...reasons, '购买与试握检查', ...checks, '注：基础规则建议，未接入 AI 模型，请结合实际试握。'].join('\n');
  if (matchMedia('(max-width: 760px)').matches) {
    const title = document.getElementById('resultTitle');
    title.focus({preventScroll:true});
    title.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
  }
}
function clearCopyFeedback() {
  document.getElementById('copyStatus').textContent = '';
  document.getElementById('manualCopy').hidden = true;
  document.getElementById('reportText').value = '';
}
function invalidateReport() {
  reportRevision++;
  lastReport = '';
  document.getElementById('resultContent').hidden = true;
  document.getElementById('resultTitle').textContent = '等待重新生成';
  document.getElementById('resultStatus').textContent = '选项已更新，请重新生成结果';
  document.getElementById('copyResult').disabled = true;
  clearCopyFeedback();
}
document.getElementById('calculate').addEventListener('click',generateAdvice);
document.getElementById('copyResult').addEventListener('click',async()=>{
  if(!lastReport)return;
  const report = lastReport;
  const revision = reportRevision;
  try {
    await navigator.clipboard.writeText(report);
    if (revision !== reportRevision) return;
    clearCopyFeedback();
    document.getElementById('copyStatus').textContent = '已复制选型结果。';
  } catch {
    if (revision !== reportRevision) return;
    document.getElementById('copyStatus').textContent = '自动复制失败，请使用下方文本手动复制。';
    document.getElementById('manualCopy').hidden = false;
    const text = document.getElementById('reportText');
    text.value = report;
    text.focus();
    text.select();
  }
});
const menu=document.getElementById('menuButton');const mobile=document.getElementById('mobileNav');
menu.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!expanded));mobile.hidden=expanded;menu.textContent=expanded?'☰':'×';});
mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.textContent='☰';}));
document.getElementById('year').textContent=new Date().getFullYear();

// 在现有内容区之间切换，保留可分享的 hash 与浏览器前进/后退。
const pages = [...document.querySelectorAll('main > section')];
function showPage() {
  const page = pages.find(p => '#' + p.id === location.hash) || pages[0];
  pages.forEach(p => { p.hidden = p !== page; });
  document.querySelectorAll('nav a').forEach(a => {
    if (a.hash === '#' + page.id) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  mobile.hidden = true;
  menu.setAttribute('aria-expanded', 'false');
  menu.textContent = '☰';
  window.scrollTo({top:0, behavior:'instant'});
}
document.documentElement.classList.add('paged');
window.addEventListener('hashchange', showPage);
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link && link.hash === location.hash) { event.preventDefault(); showPage(); }
});
document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
      !['ArrowLeft', 'ArrowRight'].includes(event.key) ||
      event.target.closest('input, textarea, select, button, a, summary, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="tab"], [role="combobox"], [role="listbox"], [role="spinbutton"], [role="textbox"]')) return;
  const index = pages.findIndex(p => !p.hidden);
  const next = index + (event.key === 'ArrowRight' ? 1 : -1);
  if (pages[next]) { event.preventDefault(); location.hash = pages[next].id; }
});
showPage();
