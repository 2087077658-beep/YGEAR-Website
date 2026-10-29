const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../lab-rules.js'),'utf8'),context);
const rules = context.window.YGearLabRules;
test('握法实际改变长度、背高、背峰及指姿',()=>{
 const a=rules.map({grip:'palm'}), b=rules.map({grip:'claw'}), c=rules.map({grip:'fingertip'});
 assert.ok(a.mouse.length>b.mouse.length&&b.mouse.length>c.mouse.length);
 assert.ok(b.mouse.height>a.mouse.height&&a.mouse.height>c.mouse.height);
 assert.ok(b.mouse.peak>a.mouse.peak&&a.mouse.peak>c.mouse.peak);
 assert.notEqual(a.hand.fingerTips[1].y,b.hand.fingerTips[1].y);
});
test('每个手部参数均改变手和鼠标几何',()=>{
 for(const [key,field] of Object.entries(rules.fields)){
  const a=rules.map({[key]:field.min}),b=rules.map({[key]:field.max});
  assert.notEqual(JSON.stringify(a.hand),JSON.stringify(b.hand),key+' hand');
  assert.notEqual(JSON.stringify(a.mouse),JSON.stringify(b.mouse),key+' mouse');
 }
});
test('全部边界组合均有效并位于绘图范围内',()=>{
 for(const length of [14,23])for(const width of [6,12])for(const fingers of [0,100])for(const thumb of [15,70])for(const grip of ['palm','claw','fingertip']){
  const m=rules.map({length,width,fingers,thumb,grip});
  const numbers=JSON.stringify(m);assert.ok(!numbers.includes('null'));
  for(const p of [...m.hand.fingerTips,m.hand.thumbTip]){assert.ok(p.x>0&&p.x<360);assert.ok(p.y>0&&p.y<410);}
  assert.ok(m.mouse.width>0&&m.mouse.length<260&&m.mouse.height>0&&m.mouse.peak>0&&m.mouse.peak<1);
 }
});
test('异常与越界输入使用默认值或边界',()=>{
 const p=rules.normalize({length:999,width:-10,fingers:NaN,thumb:Infinity,grip:'invalid'});
 assert.equal(p.length,23);assert.equal(p.width,6);assert.equal(p.fingers,50);assert.equal(p.thumb,40);assert.equal(p.grip,'palm');
});
