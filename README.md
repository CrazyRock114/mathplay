# MathPlay — 多语言数学游戏门户

一个受经典游戏门户（如 coolmathgames.com）版式与体验启发的**原创**网页游戏站。
未使用原站任何素材、商标或代码：品牌、图标、翻译与全部 14 款游戏均为原创实现。

## 运行方式

```bash
cd /Users/crazyrock/ZCodeProject/coolmathgame
python3 -m http.server 8123
# 打开 http://localhost:8123
```

也可以直接双击 `index.html`（无构建、无依赖，纯静态站点，file:// 协议同样可用）。

## 多语言支持（8 种）

英语 · 简体中文 · 繁体中文 · 日本語 · 汉语 · Italiano · Français · Deutsch

- 通过右上角 🌐 按钮或页脚"语言"栏切换，选择保存在 localStorage，全部 UI、游戏标题、玩法说明即时切换。
- "汉语"为泛中文选项：按浏览器语言自动解析为简体或繁体。
- 检测顺序：localStorage → `?lang=` 参数 → 浏览器语言 → 英语。
- 新增语言：在 `js/i18n/` 中照抄一个字典文件并加入 `I18N_LOCALES` 即可。

## 功能

- 首页：精选轮播、8 大分类、**两级知识点筛选（5 领域 → 20 知识点，含游戏数徽章）**、❤️ 免登录收藏、最近玩过、实时搜索、🎲 随机游戏
- **数学标签体系（两级）**：
  - 领域：数与运算 / 代数与规律 / 几何与空间 / 度量 / 思维训练
  - 知识点（20）：加减、乘除、混合运算、分数、小数、百分比、因数与倍数、乘方与平方、方程、数列规律、平面图形、角度、对称、坐标系、时间、货币找零、数感估算、逻辑推理、记忆观察、反应协调
  - 每款游戏还标注 **8 项数学能力**、**适合年龄**、**难度**
- 游戏页：说明、最佳成绩、游玩次数、收藏、同类推荐
- 全部游戏支持键盘 + 触屏（滑动/虚拟方向键），移动端自适应

## 游戏列表（28 款）

| 游戏 | 分类 | 知识点 |
|---|---|---|
| Number Merge（2048 玩法） | 数字 | 乘方、乘除、数感 |
| Speed Math 速算挑战 | 数字 | 加减、乘除、混合运算 |
| Guess the Number 猜数字 | 数字 | 数感 |
| Fraction Match 分数配对 | 数字 | 分数、数感 |
| Change Master 找零高手 | 数字 | 货币、小数、加减 |
| Next Number 数列推理 | 数字 | 数列规律、乘方、加减、乘除 |
| Percent Dash 百分比冲刺 | 数字 | 百分比、数感 |
| Minesweeper 扫雷 | 逻辑 | 逻辑推理、数感 |
| Mini Sudoku 迷你数独 | 逻辑 | 逻辑推理 |
| Coordinate Hunt 坐标寻宝 | 逻辑 | 坐标系、逻辑推理 |
| Balance Scales 天平方程 | 逻辑 | 方程、加减、乘除 |
| Clock Rush 时钟挑战 | 逻辑 | 时间与钟表 |
| Shape Detective 图形侦探 | 逻辑 | 平面图形、角度、对称 |
| Neon Snake 贪吃蛇 | 技巧 | 反应协调、逻辑 |
| Dot Whack 疯狂打点 | 技巧 | 反应协调 |
| Quick Reflex 反应力测试 | 技巧 | 反应协调 |
| Number Runner 数字快跑 | 技巧 | 加减、乘除、混合运算 |
| Angle Shooter 角度射手 | 技巧 | 角度、数感与估算 |
| Number Typer 数字速打 | 技巧 | 反应协调、数感 |
| Memory Match 记忆配对 | 记忆 | 记忆观察 |
| Color Echo 色彩回声 | 记忆 | 记忆观察、规律 |
| Tic Tac Toe 井字棋 | 策略 | 逻辑推理 |
| Four in a Row 四子连珠 | 策略 | 逻辑推理 |
| Dots & Boxes 点格棋 | 策略 | 逻辑推理、平面图形 |
| Block Drop 落块堆叠 | 益智 | 平面图形、对称、反应协调 |
| Sliding 15 数字华容道 | 益智 | 逻辑推理 |
| Math Quiz 数学问答 | 问答 | 混合运算、因数倍数、乘方、时间 |
| Math Duel 双人速算对决 | 双人对战 | 加减、乘除、混合运算 |

## 目录结构

```
├── index.html / game.html     # 首页与游戏页
├── css/style.css
└── js/
    ├── i18n/                  # core.js + 两个翻译字典文件
    ├── games/registry.js      # 游戏元数据、图标、GameKit 工具
    ├── games/*.js             # 每款游戏一个文件
    ├── main.js                # 首页逻辑
    └── game-page.js           # 游戏页逻辑
```

新增游戏：在 `registry.js` 的 `GAMES` 里加一条元数据，并新建
`js/games/<id>.js`，向 `GameFactories` 注册一个 `(stage, ctx) => ({destroy})` 工厂即可，
首页、搜索、推荐、最佳成绩会自动生效。
