/* 只绘制 geometry，不做推荐或尺寸推断。 */
window.YGearLabView = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs = {}) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  };
  function path(parent, d, style = 'lab-outline') { parent.append(make('path', { d, class: style })); }
  function contours(parent, d, cx, cy) {
    path(parent, d);
    const inner = make('g', { transform: `translate(${cx} ${cy}) scale(.92) translate(${-cx} ${-cy})` });
    path(inner, d, 'lab-contour'); parent.append(inner);
  }
  function hand(root, h) {
    root.replaceChildren();
    const { left: x, palmWidth: w, palmTop: y } = h;
    path(root, 'M190 30V390 M55 360H295', 'lab-guide');
    const palm = `M${x} ${y+24} Q${x-5} ${y+85} ${x+20} 330 L${x+25} 365 L${x+w-25} 365 L${x+w-20} 330 Q${x+w+5} ${y+85} ${x+w} ${y+24} Q190 ${y} ${x} ${y+24}Z`;
    contours(root, palm, 190, 280);
    h.fingerTips.forEach(({ x: fx, y: fy, base, radius: r }) => {
      const d = `M${fx-r} ${base} L${fx-r} ${fy+r} C${fx-r} ${fy-r*.3} ${fx+r} ${fy-r*.3} ${fx+r} ${fy+r} L${fx+r} ${base}`;
      contours(root, d, fx, base);
      [0.38, 0.7].forEach(t => path(root, `M${fx-r*.7} ${fy+(base-fy)*t} Q${fx} ${fy+(base-fy)*t+4} ${fx+r*.7} ${fy+(base-fy)*t}`, 'lab-joint'));
    });
    const b = h.thumbBase, t = h.thumbTip;
    const dx=t.x-b.x, dy=t.y-b.y, len=Math.hypot(dx,dy), nx=-dy/len*12, ny=dx/len*12;
    contours(root, `M${b.x+nx} ${b.y+ny} L${t.x+nx} ${t.y+ny} Q${t.x+dx/len*20} ${t.y+dy/len*20} ${t.x-nx} ${t.y-ny} L${b.x-nx} ${b.y-ny}`, b.x,b.y);
    path(root, `M${b.x+dx*.55+nx*.7} ${b.y+dy*.55+ny*.7} L${b.x+dx*.55-nx*.7} ${b.y+dy*.55-ny*.7}`, 'lab-joint');
    path(root, `M${x+20} ${y+65} Q190 ${y+95} ${x+w-16} ${y+63} M${x+28} 320 Q190 300 ${x+w-28} 320 M${x+28} 349H${x+w-28}`, 'lab-joint');
  }
  function mouse(top, side, m) {
    top.replaceChildren(); side.replaceChildren();
    const x=170, y=45, w=m.width/2, l=m.length, front=w*m.waist;
    path(top, `M170 24V310 M80 ${y+l/2}H260`, 'lab-guide');
    const d=`M${x} ${y} C${x+front} ${y} ${x+front} ${y+l*.16} ${x+w*.87} ${y+l*.38} C${x+w} ${y+l*.62} ${x+w*1.12} ${y+l} ${x} ${y+l} C${x-w*1.12} ${y+l} ${x-w} ${y+l*.62} ${x-w*.87} ${y+l*.38} C${x-front} ${y+l*.16} ${x-front} ${y} ${x} ${y}Z`;
    contours(top,d,x,y+l/2);
    path(top,`M170 ${y+8}V${y+l*.38} M${x-front*.8} ${y+l*.35}Q170 ${y+l*.42} ${x+front*.8} ${y+l*.35}`, 'lab-joint');
    top.append(make('rect',{x:165,y:y+22,width:10,height:28,rx:5,class:'lab-joint'}));
    // 侧视：左为鼠标前端，右为尾部；peak 从前端起算。
    const start=45, base=200, peak=start+l*m.peak, py=base-m.height;
    path(side,`M25 ${base}H315 M${peak} ${py-18}V${base+12}`, 'lab-guide');
    contours(side,`M${start} ${base-14} C${start+l*.12} ${base-18} ${peak-l*.23} ${py} ${peak} ${py} C${peak+l*.22} ${py} ${start+l} ${base-30} ${start+l} ${base-9} Q${start+l} ${base} ${start+l-15} ${base} H${start+8} Q${start} ${base} ${start} ${base-14}Z`,start+l/2,base);
    path(side,`M${start+6} ${base-10}H${start+l-7}`, 'lab-joint');
  }
  return { hand, mouse };
})();
