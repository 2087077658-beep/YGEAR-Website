/* 探索规则 v1。所有鼠标数值均为 SVG 绘图单位，不是毫米、产品尺寸或适配结论。
 * 未来数据库检索应消费 parameters；不要把 geometry 当作实测产品记录。
 */
window.YGearLabRules = (() => {
  const fields = {
    length: { min: 14, max: 23, step: 0.1, initial: 18, label: '手长', unit: 'cm' },
    width: { min: 6, max: 12, step: 0.1, initial: 8.5, label: '掌宽', unit: 'cm' },
    fingers: { min: 0, max: 100, step: 1, initial: 50, label: '手指长度倾向', unit: '' },
    thumb: { min: 15, max: 70, step: 1, initial: 40, label: '拇指张角', unit: '°' }
  };
  const grips = {
    palm: { label: '趴握', length: 1, height: 1, peak: 0.49, curl: 1 },
    claw: { label: '抓握', length: 0.93, height: 1.12, peak: 0.64, curl: 0.78 },
    fingertip: { label: '指握', length: 0.85, height: 0.78, peak: 0.43, curl: 0.93 }
  };
  function clamp(key, value) {
    const f = fields[key];
    const n = Number(value);
    const bounded = Math.max(f.min, Math.min(f.max, Number.isFinite(n) ? n : f.initial));
    return Number((Math.round(bounded / f.step) * f.step).toFixed(1));
  }
  function normalize(input = {}) {
    return Object.fromEntries([...Object.keys(fields).map(k => [k, clamp(k, input[k] ?? fields[k].initial)]), ['grip', grips[input.grip] ? input.grip : 'palm']]);
  }
  function map(input) {
    const parameters = normalize(input);
    const { length, width, fingers, thumb, grip } = parameters;
    const g = grips[grip];
    const l = (length - 14) / 9, w = (width - 6) / 6, f = fingers / 100;
    const total = 250 + l * 60;
    const palmWidth = 96 + w * 48;
    const fingerLength = total * (0.37 + f * 0.14) * g.curl;
    const palmTop = 360 - total * (0.60 - f * 0.08);
    const left = 190 - palmWidth / 2;
    const fingerTips = [0.88, 1, 0.93, 0.72].map((ratio, i) => ({
      x: left + palmWidth * (i + 0.5) / 4,
      y: palmTop - fingerLength * ratio,
      base: palmTop + 22,
      radius: palmWidth / 4 * 0.40
    }));
    const thumbBase = { x: left + 12, y: palmTop + 75 };
    const rad = thumb * Math.PI / 180;
    const thumbTip = { x: thumbBase.x - Math.sin(rad) * total * 0.27, y: thumbBase.y - Math.cos(rad) * total * 0.27 };
    const mouseLength = (186 + l * 38 + f * 12) * g.length;
    const mouseWidth = 88 + w * 36;
    const waist = 0.79 + (thumb - 15) / 55 * 0.12 - f * 0.04;
    const height = (47 + w * 8 + l * 5) * g.height;
    const peak = g.peak + (f - 0.5) * 0.06;
    return { parameters, hand: { palmWidth, palmTop, left, fingerTips, thumbBase, thumbTip }, mouse: { length: mouseLength, width: mouseWidth, waist, height, peak } };
  }
  return { fields, grips, clamp, normalize, map };
})();
