/* 输入与帧更新协调器：参数 → 规则 → 绘图 / 说明。无产品数据库或网络请求。 */
(() => {
  const rules = window.YGearLabRules, view = window.YGearLabView;
  let state = rules.normalize();
  const inputs = Object.fromEntries(Object.keys(rules.fields).map(k => [k, document.getElementById('lab-'+k)]));
  const grip = document.getElementById('lab-grip');
  const hand = document.getElementById('lab-hand-lines');
  const handles = document.querySelectorAll('[data-lab-handle]');
  let frame = 0;
  function draw() {
    frame = 0;
    const model = rules.map(state);
    view.hand(hand, model.hand);
    view.mouse(document.getElementById('lab-top-lines'), document.getElementById('lab-side-lines'), model.mouse);
    Object.entries(inputs).forEach(([k, input]) => {
      input.value = state[k];
      const value = k === 'fingers' ? (state[k] < 35 ? '偏短' : state[k] > 65 ? '偏长' : '居中') : state[k] + rules.fields[k].unit;
      document.getElementById('lab-'+k+'-value').textContent = value;
      input.setAttribute('aria-valuetext', value);
    });
    grip.value = state.grip;
    const h = model.hand;
    const points = { length: h.fingerTips[1], width: {x:h.left+h.palmWidth,y:h.palmTop+65}, fingers:h.fingerTips[0], thumb:h.thumbTip };
    handles.forEach(node => {
      const key=node.dataset.labHandle, p=points[key];
      node.setAttribute('cx',p.x);node.setAttribute('cy',p.y);
      node.setAttribute('aria-valuenow',state[key]);
      node.setAttribute('aria-valuetext',inputs[key].getAttribute('aria-valuetext'));
    });
    const copy = document.getElementById('lab-explanation');
    copy.replaceChildren(...window.YGearLabCopy(model).map(text => {const p=document.createElement('p');p.textContent=text;return p;}));
  }
  function update(patch, sync = true) {
    state = rules.normalize({...state,...patch});
    // 原有问卷与模型共用握法/手长方向，避免两个区域显示相互矛盾的选择。
    if (sync) {
      if ('grip' in patch) document.querySelector(`[data-group="grip"] [data-value="${state.grip}"]`).click();
      if ('length' in patch) document.querySelector(`[data-group="hand"] [data-value="${state.length<17?'small':state.length>19?'large':'medium'}"]`).click();
      invalidateReport();
    }
    if (!frame) frame=requestAnimationFrame(draw);
  }
  Object.entries(inputs).forEach(([k,input]) => input.addEventListener('input',()=>update({[k]:input.value})));
  grip.addEventListener('change',()=>update({grip:grip.value}));
  document.querySelectorAll('[data-group="grip"] button').forEach(b=>b.addEventListener('click',()=>update({grip:b.dataset.value},false)));
  document.querySelectorAll('[data-group="hand"] button').forEach(b=>b.addEventListener('click',()=>{
    const ranges={small:16,medium:18,large:20};
    // “不确定”保留探索值，不把它当作测量结果。
    if (b.dataset.value in ranges && (b.dataset.value !== (state.length<17?'small':state.length>19?'large':'medium'))) update({length:ranges[b.dataset.value]},false);
  }));
  document.getElementById('lab-reset').addEventListener('click',()=>update({...rules.normalize()}));
  const svg = document.getElementById('lab-hand');
  const point = event => {const p=new DOMPoint(event.clientX,event.clientY);return p.matrixTransform(svg.getScreenCTM().inverse());};
  let drag = null;
  handles.forEach(node => {
    const key=node.dataset.labHandle, field=rules.fields[key];
    node.setAttribute('aria-valuemin',field.min);node.setAttribute('aria-valuemax',field.max);
    node.addEventListener('keydown',event=>{
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();event.stopPropagation();
      const value=event.key==='Home'?field.min:event.key==='End'?field.max:state[key]+(['ArrowRight','ArrowUp'].includes(event.key)?1:-1)*field.step;
      update({[key]:Math.round(value*10)/10});
    });
    node.addEventListener('pointerdown',event=>{
      if (event.button!==0 || drag) return;
      event.preventDefault();node.focus({preventScroll:true});
      drag={id:event.pointerId,key,start:point(event),value:state[key]};
      node.setPointerCapture(event.pointerId);
    });
    node.addEventListener('pointermove',event=>{
      if (!drag || drag.id!==event.pointerId || drag.key!==key) return;
      const p=point(event),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
      const delta={length:-dy/7,width:dx/4,fingers:-dy,thumb:-dx*.7}[key];
      update({[key]:Math.round((drag.value+delta)/field.step)*field.step});
    });
    const end = event => {if(drag?.id===event.pointerId) drag=null;};
    node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end);node.addEventListener('lostpointercapture',end);
  });
  draw();
})();
