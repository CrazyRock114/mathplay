# MathPlay 全面审查测试计划（S1–S4 产出）

## S1 被测系统画像（SFDIPOT 摘要）

纯静态前端站：`index.html` + `game.html`，数据层 = `js/games/registry.js`（28 款游戏元数据 + 两级标签体系）、
`js/i18n/strings-{a..f}.js`（8 locale 字典）、28 个 `js/games/<id>.js` 游戏工厂。状态 = localStorage
（mp_lang / mp_favs / mp_best_* / mp_plays / mp_last）。无后端。运行环境：python http.server + Chromium(IAB)。

## S2 风险表（概率×影响，1–3 分，依据列必填）

| ID | 风险 | P | I | 依据 |
|---|---|---|---|---|
| R1 | 某 locale 缺 key / 占位符不一致 → 界面显示裸 key 或错变量 | 2 | 3 | 6 个翻译文件手工维护 ×8 locale，增量三轮 |
| R2 | 注册表悬空引用（游戏文件/图标/分类/标签 id）→ 游戏页崩溃或空数据 | 2 | 3 | 三轮增量后未做过闭合审计 |
| R3 | 游戏逻辑缺陷：选项不唯一/无正确答案/生成越界/最佳分方向弄反 | 2 | 3 | 14+12 款游戏生成器各异，submit 第三参手工写 |
| R4 | 标签体系不一致：知识点 id 拼错、某知识点 0 游戏、chip 徽章数≠实际筛选数 | 2 | 2 | 两级体系刚重构，filter 曾出过按域过滤的 bug |
| R5 | 交互缺陷：destroy 泄漏定时器、语言切换中途重建、收藏/最近/搜索状态串扰 | 2 | 2 | 部分游戏 setTimeout 未跟踪 |
| R6 | 资产/CSS 闭包破损：类名拼写、图标缺失、引用了不存在的文件 | 2 | 2 | CSS 三轮追加、12 个新 SVG 图标 |
| R7 | 控制台错误 / 移动端横向溢出 | 2 | 2 | 多次渲染路径重构 |
| R8 | README/自述宣称与实际不符（L8） | 1 | 2 | 手写文档，经历过 14→26→28 演进 |

## S3 策略（Testing Trophy：静态审计为底 + 浏览器语义穿透）

- **Oracle A（发现级机判，零共享运行时）**：`tests/audit-static.js`（JavaScriptCore）直接读盘文件，
  沙箱求值数据层 + 源码正则审计。覆盖 L0/L1/L2静态/L3静态/L5/L8。
- **Oracle B（发现级语义，浏览器运行时）**：`tests/browser-sweep-*.js` 经 node_repl 注入执行，
  断言真实 DOM。覆盖 L1渲染/L2动态/L5级联/L6交互/L7签核。
- **互锁计数**：A 的 GAMES 数/游戏-知识点对数/8 locale key 数 必须等于 B 的 DOM 计数（tiles、徽章和、语言切换渲染数）。
- **明确不测**：游戏难度调平衡、音质、性能压测、安全（无后端）、Chromium 以外兼容性、长会话内存泄漏（仅做 destroy 静态审计 + 单例运行时验证）、视觉美学主观项。

## S4 用例与 oracle（gate：每条有预期）

| 用例族 | oracle（预期来源=规格，非实现） |
|---|---|
| A-i18n 闭合 | keys(en) ⊆ keys(locale)，占位符集合逐 key 相等 |
| A-注册表闭合 | 每条目：文件存在且定义工厂、icon/cat/knowledge/ability id 全部存在、age∈[3,18]、diff∈[1,3] |
| A-标签体系 | 领域 topics 并集 == KNOWLEDGE；每知识点 ≥1 游戏（打印计数） |
| A-最佳分方向 | registry bestHigh ↔ 源码 `submit(...,true)`；bestLow ↔ `false` |
| A-定时器卫生 | 用了 setInterval 的游戏，destroy 内必现 clearInterval（同理 timeout） |
| A-CSS/资产闭包 | JS/HTML 用到的类名（白名单动态模式后）⊆ style.css 定义；src 引用文件存在 |
| B-渲染签核 | 28 游戏 × zh-CN 全部 stage 非空 + 标签卡 ≥1 行；ja/de/zh-TW 抽样 4 款 |
| B-生成器 | 每生成器跑 N≥30：恰一正确项、选项唯一、答案为非负整数（分数题除外规则） |
| B-交互 Δ | 每游戏一次核心操作产生可观测 DOM/像素变化（逐游戏 oracle 见脚本内注释） |
| B-级联 | 领域筛选数==A 计数；知识点筛选数==徽章数；收藏流/最近玩过/搜索/404/中途换语言 |
| B-移动端 | 390px 下 document.scrollWidth ≤ innerWidth+2 |

退出判据：所有失败完成四态定性；真缺陷修复附疫苗（本目录脚本即回归资产，可重跑）；覆盖声明有代码输出指向。
