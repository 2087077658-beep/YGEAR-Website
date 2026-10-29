import assert from 'node:assert/strict';
// Requires running Chromium with --remote-debugging-port=9222 and a local static server.
const tabs=await (await fetch((process.env.CDP_URL || 'http://127.0.0.1:9222')+'/json')).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)(m);pending.delete(m.id)}};
const call=(method,params={})=>new Promise(r=>{const n=++id;pending.set(n,r);ws.send(JSON.stringify({id:n,method,params}))});
await call('Page.enable');await call('Page.navigate',{url:process.env.LAB_URL || 'http://127.0.0.1:8001/YGEAR-Website/'});
for(let i=0;i<50;i++){const r=await call('Runtime.evaluate',{expression:'document.readyState'});if(r.result?.result?.value==='complete')break;await new Promise(r=>setTimeout(r,100))}

const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.equal(r.result.exceptionDetails,undefined,JSON.stringify(r.result.exceptionDetails));return r.result.result.value};

const result=await evaluate(`(async()=>{
const check=(v,m)=>{if(!v)throw Error(m)};
const tick=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
location.hash='selector';await new Promise(r=>setTimeout(r,30));
const snapshot=()=>['lab-hand-lines','lab-top-lines','lab-side-lines'].map(id=>document.getElementById(id).innerHTML);
for(const key of ['length','width','fingers','thumb']){
 const input=document.getElementById('lab-'+key);input.value=input.min;input.dispatchEvent(new Event('input'));await tick();const before=snapshot();
 input.value=input.max;input.dispatchEvent(new Event('input'));await tick();const after=snapshot();
 check(after[0]!==before[0],key+' hand');check(after[1]!==before[1],key+' top');
 if(key!=='thumb')check(after[2]!==before[2],key+' side');
 check(!after.join('').match(/NaN|Infinity/),'finite SVG');
}
const shapes=[];for(const value of ['palm','claw','fingertip']){
 const select=document.getElementById('lab-grip');select.value=value;select.dispatchEvent(new Event('change'));await tick();shapes.push(snapshot());
 check(document.querySelector('[data-group="grip"] .selected').dataset.value===value,'grip sync');
}
check(new Set(shapes.map(s=>s[1])).size===3&&new Set(shapes.map(s=>s[2])).size===3,'grip geometry');
const handle=document.querySelector('[data-lab-handle="width"]');const before=Number(handle.getAttribute('aria-valuenow'));handle.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));await tick();check(Number(handle.getAttribute('aria-valuenow'))<before,'handle keyboard');check(location.hash==='#selector','no paging from handle');
document.getElementById('lab-reset').click();await tick();check(document.getElementById('lab-length').value==='18','reset');
document.getElementById('calculate').click();const input=document.getElementById('lab-thumb');input.value=50;input.dispatchEvent(new Event('input'));await tick();check(document.getElementById('copyResult').disabled,'old report invalidated');
return {sliders:true,gripGeometry:true,keyboard:true,reset:true,invalidation:true};})()`);
console.log(result);
for(const width of [320,375,760,1280]){
 await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<=760});
 console.log(await evaluate(`(async()=>{await new Promise(r=>setTimeout(r,50));if(document.documentElement.scrollWidth>innerWidth)throw Error('overflow');return {width:innerWidth,noOverflow:true}})()`));
}
await call('Emulation.setDeviceMetricsOverride',{width:1280,height:1000,deviceScaleFactor:1,mobile:false});
for(const key of ['length','width','fingers','thumb']){
 const position=await evaluate(`(async()=>{document.getElementById('lab-reset').click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const h=document.querySelector('[data-lab-handle="${key}"]');h.scrollIntoView({block:'center',behavior:'instant'});const b=h.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2,value:Number(h.getAttribute('aria-valuenow'))}})()`);
 await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:position.x,y:position.y});
 await call('Input.dispatchMouseEvent',{type:'mousePressed',x:position.x,y:position.y,button:'left',clickCount:1});
 await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:position.x+15,y:position.y-15,button:'left',buttons:1});
 await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:position.x+15,y:position.y-15,button:'left',clickCount:1});
 const value=await evaluate(`new Promise(r=>requestAnimationFrame(()=>r(Number(document.querySelector('[data-lab-handle="${key}"]').getAttribute('aria-valuenow')))))`);
 assert.notEqual(value,position.value,key+' drag');console.log({drag:key,changed:true});
}
await evaluate(`document.querySelector('.feel-lab').scrollIntoView({block:'start',behavior:'instant'})`);
const shot=await call('Page.captureScreenshot',{format:'png'});
await (await import('node:fs/promises')).writeFile('/tmp/ygear-lab.png',Buffer.from(shot.result.data,'base64'));
ws.close();
