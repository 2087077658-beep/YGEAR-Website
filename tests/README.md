# 手感实验室检查

无依赖规则检查：

```sh
node tests/lab-rules.test.cjs
```

浏览器交互检查使用 Node.js 24 自带 WebSocket 和 Chromium CDP，不安装浏览器驱动。先在两个独立终端启动本地服务和无头 Chromium（端口可调整）：

```sh
python3 -m http.server 8002 --bind 127.0.0.1 --directory /workspace/YGEAR-Website
chromium --headless --no-sandbox --disable-dev-shm-usage --user-data-dir=/tmp/ygear-test-browser --remote-debugging-port=9222 about:blank
```

然后执行：

```sh
LAB_URL=http://127.0.0.1:8002/ node tests/lab-browser.mjs
```

`CDP_URL` 可覆盖调试地址。默认 `LAB_URL` 使用 onboarding 本地 `/YGEAR-Website/` 模拟地址；服务未启动时需显式提供实际地址。检查滑块、握法的几何差异、控制点键盘操作、重置、旧报告失效、四种屏幕宽度和真实鼠标拖动；截图写到 `/tmp/ygear-lab.png`。手机触摸及 Safari 仍需实机确认。

# 模块边界

- `lab-rules.js`：字段范围、输入校验与纯几何映射。手部数值是用户输入参考，鼠标输出仅为 SVG 坐标，禁止当作毫米或产品尺寸。
- `lab-view.js`：把几何数据画成多层手型、鼠标俯视及侧视轮廓。
- `lab-copy.js`：解释形态变化与试握提醒，不产生分数或实测结论。
- `lab.js`：滑块、选择、拖动、键盘与 requestAnimationFrame 更新；同步原问卷的握法/手长方向，并使旧报告失效。

未来产品数据库可使用 `map(input).parameters` 作为查询输入；必须单独验证真实记录，不可将 `mouse` 绘图值冒充产品尺寸或科学最优模具。
