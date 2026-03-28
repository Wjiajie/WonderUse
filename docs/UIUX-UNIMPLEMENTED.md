# 妙物记 — 未实现 UI/UX 设计补充规范

> **文档用途**: 记录 PRD 中已设计但尚未在前端代码中实现的 UI/UX 设计  
> **参照文件**: `PRD.md` (功能需求) · `UIUX-DESIGN.md` (设计令牌)  
> **编写日期**: 2026-03-28  
> **优先级排序**: P0 (影响核心流程) → P1 (体验增强) → P2 (视觉打磨)

---

## 快速现状对比

| 功能 | PRD 要求 | 当前实现状态 |
|------|----------|------------|
| F1 登录页 | 完整 | ✅ 已实现（含品牌叙事、黄铜角花） |
| F2 添加妙物 | 完整表单 + 图片上传 | ⚠️ 仅有名称 + 类别两个字段，无图片上传 |
| F3 展架主页 | 分类标签栏 + 卡片网格 | ⚠️ 无分类筛选 Tab，物品仅一行无网格 |
| F4 每日夸夸 | 百宝箱动画 + 随机产品 + 引导问题 + 心情标签 | ❌ 仅有静态占位文本框，无任何核心逻辑 |
| F5 热爱值 | 产品卡片上显示进度 | ⚠️ 详情页有 GlassGauge，展架卡片无 |
| F6 连续打卡 | 主页显示 + 夸夸后更新 | ⚠️ Header 有徽章但数据未写入 |
| F7 成就勋章 | MetalBadge 组件 + 解锁动画 | ❌ 成就页只有空 WoodenShelf 占位 |
| F8 产品详情 | 大图 + 编辑/删除 + 时间线 | ⚠️ 无编辑/删除功能，记忆时间线简陋 |
| MiaoWu 对话气泡 | 奶油底色 + 手写字体气泡 | ❌ 完全未实现 |
| 百宝箱动画 | 8步序列动画 | ❌ 完全未实现 |
| 分类图标系统 | 铜质齿轮/指南针/衣架/书签 | ❌ 完全未实现 |
| prefers-reduced-motion | 动画降级 | ❌ 未实现 |

---

## F2 - 添加妙物：完整表单设计

**当前缺口**: 展架页弹窗仅有「名称 + 类别」两个字段，PRD 要求完整的6字段表单。

### 建议升级为多步骤弹窗

```
步骤 1 — 基本信息（必填）
  [ParchmentInput]  产品名称 *        placeholder: "例：祖母的旧相机"
  [CategoryPicker]  分类 *           4格图标选择器（见分类规范）

步骤 2 — 产品信息（选填）
  [ParchmentInput]  品牌              placeholder: "例：Apple / 无印良品"
  [DatePicker]      购买日期          拟物风格日期选择
  [ParchmentTextArea] 产品描述        placeholder: "简短描述这件物品..."

步骤 3 — 照片（选填）
  [ImageUploader]   产品图片          拖拽区域 + 相机图标
```

### 分类选择器 `CategoryPicker` 组件

```tsx
// 选中态: 黄铜边框 + 内嵌阴影 + 标签文字变深色
// 未选中态: 虚线边框 + 半透明
interface CategoryOption {
  id: 'electronics' | 'software' | 'clothing' | 'books';
  label: string;
  icon: React.ReactNode;  // 铜质风格 SVG
  description: string;
}
```

**4个分类的视觉规范：**

| 分类 | 图标隐喻 | SVG 形态 | 示例文字 |
|------|---------|--------|---------|
| 电子产品 | 齿轮 | 多齿圆形齿轮 + 轴心圆 | "手机、耳机、相机..." |
| 软件服务 | 指南针 | 菱形外框 + 四向指针 | "订阅软件、App..." |
| 服饰 | 衣架 | V形钩 + 横杆 | "衣服、鞋子、配饰..." |
| 书籍 | 书签 | 矩形 + 下V切口 | "纸质书、课程..." |

### 图片上传 `ImageUploader` 组件

```
视觉设计:
  宽: 100%  |  高: 160px
  背景: 斜纹羊皮纸图案
  边框: 2px dashed var(--color-brass)
  内容: [铜质相机 SVG] + "拖拽照片到此处 / 点击选择照片"
  悬停: 边框变实线 + 背景微亮

上传后状态:
  图片预览 object-fit:cover + 右上角 × 删除按钮（BrassButton icon 变体）
```

**技术实现**: 上传至 Supabase Storage `product-images` bucket  
路径: `{user_id}/{uuid}.{ext}`  
限制: 最大 5MB, 仅 JPG/PNG/WebP

### 喵呜互动文案（添加流程中）

- 分类选择后: `"好眼力！{分类名}是个好品类~"`
- 名称输入中: `"这件宝贝叫什么名字？"`
- 上传图片后: `"让我闻闻看~ 这件宝贝长这样！"`
- 提交成功后: `"已封入展架！喵~ 它一定很高兴被发现～"` (切换 `happy` 状态)

---

## F3 - 展架主页：分类筛选与网格布局

**当前缺口**: 物品以一行展示，无分类 Tab，无网格布局。

### 分类标签栏 `CategoryTabBar`

```
[全部]  [⚙ 电子]  [🧭 软件]  [👔 服饰]  [📖 书籍]
```

```css
/* 激活状态 */
.category-tab-active {
  background: linear-gradient(to bottom, var(--color-gold), var(--color-brass));
  color: var(--color-wood-dark);
  box-shadow: var(--shadow-raised), inset 0 1px 0 rgba(255,255,255,0.3);
  font-weight: bold;
}

/* 容器横向滚动 */
.category-tab-container {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  scrollbar-width: none;
  padding: var(--space-2) var(--space-4);
}
```

### 产品卡片网格

```
移动端 (< 768px): 2列网格，每张卡片高 140px
桌面端 (>= 768px): 4列网格
```

**产品卡片 V2 设计:**

```
┌──────────────────┐
│  [产品图/品类图标]  │  高 80px, object-fit: cover
├──────────────────┤
│ 产品名称（2行截断）  │  font-heading
│ 分类               │  text-muted, text-xs
│ [▓▓▓░░░░] 熟悉    │  GlassGauge mini + 等级名
└──────────────────┘
```

---

## F4 - 每日夸夸：完整交互流程

**当前缺口**: 仅有静态文本框占位，无任何核心交互逻辑。这是 **P0 核心功能**。

### 页面状态机

```
idle (进入时)
  ↓ 自动触发
opening (百宝箱动画播放)
  ↓ 动画完成
revealed (展示产品 + 引导问题 + 表单出现)
  ↓ 用户输入中
writing (实时字数计数)
  ↓ 点击提交
submitting (按钮 loading 状态)
  ↓ 成功
completed (喵呜跳舞 + 热爱值 +1 + 打卡天数更新)
  ↓ 次日重置
done_today (今日已完成状态)
```

### 百宝箱动画 `TreasureChestAnimation`

PRD 定义的8步动画序列（使用 Framer Motion）:

```
1. 箱子晃动     摇摆 ±5deg, 200ms × 3次
2. 锁具发光     radial glow 300ms
3. 箱盖打开     rotateX: 0 → -110deg, 500ms ease-out
4. 金光射出     radial-gradient 扩散 400ms
5. 产品升起     translateY: 40px→0, scale: 0.8→1, 500ms spring
6. 产品名淡入   fade-up 300ms, delay 400ms
7. 喵呜探入     anim-enter 600ms
8. 气泡弹出     scale: 0→1, 300ms spring
```

### 产品选择器（手动切换）

```
[产品缩略图]  [产品名 + 分类]  [换一件 →]  ← BrassButton ghost
```

### 心情标签 `MoodPicker` 组件

```tsx
type Mood = 'happy' | 'surprised' | 'grateful' | 'proud';

const MOODS = [
  { id: 'happy',     emoji: '😊', label: '开心' },
  { id: 'surprised', emoji: '😲', label: '惊喜' },
  { id: 'grateful',  emoji: '🙏', label: '感恩' },
  { id: 'proud',     emoji: '😌', label: '自豪' },
];
```

```css
/* 选中态 */
.mood-option-selected {
  background: linear-gradient(135deg, var(--color-gold), var(--color-brass));
  box-shadow: var(--shadow-pressed);
  transform: scale(0.97);
  border: 2px solid var(--color-wood-dark);
}

/* 未选中态 */
.mood-option {
  background: rgba(240,226,200,0.5);
  border: 2px dashed rgba(93,64,55,0.35);
  border-radius: var(--radius-md);
  width: 56px; height: 56px;
}
```

### 字数计数器

```css
.word-counter {
  font-family: var(--font-handwriting-stack);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-align: right;
  margin-top: var(--space-1);
}

/* 达到最少10字后变绿 */
.word-counter.min-met {
  color: var(--color-cat-eye);
}
```

### 引导问题池（随机选取）

```tsx
const GUIDE_QUESTIONS = [
  "说说这件宝贝最近让你开心的一件事？",
  "这件产品有什么功能是你最常用但没想过的？",
  "如果要向朋友推荐它，你会怎么描述？",
  "它在哪个时刻让你觉得'还好买了它'？",
  "用了这么久，你发现了什么隐藏技巧吗？",
  "这件产品和你的其他东西搭配使用效果怎么样？",
  "回想一下，它在什么关键时刻帮到了你？",
  "如果给它打个分，你会给几分？为什么？",
];
```

### 今日已完成状态

```
┌───────────────────────────────────────┐  ← LeatherCard
│   [喵呜 satisfied 表情]               │
│                                       │
│   今天的夸赞已封印 ✦                   │  font-heading, gold
│   "这个相机今天帮我留住了最美的夕阳..."  │  font-handwriting, 截断
│                                       │
│           连续打卡 7 天 🔥              │  streak-badge
│     明天再来发现新的惊喜吧~             │  text-muted
│                                       │
│         [随时可以再夸一件]              │  ghost button
└───────────────────────────────────────┘
```

---

## F5 - 热爱值：GlassGauge Mini 变体

**当前缺口**: 热爱值只出现在详情页，展架卡片上无显示。

```tsx
// 新增 size="mini" prop
<GlassGauge value={product.love_score} max={100} size="mini" />
```

```css
.gauge-mini {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.gauge-mini .gauge-track {
  flex: 1;
  height: 6px;   /* 比正常版细 */
  border-radius: var(--radius-full);
}

.gauge-mini .gauge-label {
  font-size: var(--text-xs);
  font-family: var(--font-handwriting-stack);
  color: var(--fill-color);
  min-width: 2em;
  text-align: right;
}
```

---

## F7 - 成就勋章：MetalBadge 组件 + 完整成就页

**当前缺口**: 成就页仅有空展架占位。`MetalBadge` 组件不存在。

### 成就页面布局

```
┌────────────────────────────────────────────────────┐
│ 荣誉殿堂                          [喵呜: proud]     │  ← header
├────────────────────────────────────────────────────┤
│  LeatherCard — 打卡连续纪元                         │
│  [篝火 SVG]  已连续发现物品价值 [n] 天              │
│  历史最长: [n] 天   累计夸赞: [n] 次               │
├────────────────────────────────────────────────────┤
│  WoodenShelf — 成就勋章墙                          │
│  [已解锁金色] [锁定灰色] [锁定] [锁定] ...          │
└────────────────────────────────────────────────────┘
```

### MetalBadge 组件规范

**路径**: `src/components/skeuomorphic/MetalBadge.tsx`

```tsx
interface MetalBadgeProps {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAt?: string;   // undefined = 未解锁
  onHover?: () => void;
}
```

**视觉规范:**

```
已解锁 (unlocked): 80×80px
  背景: 黄铜放射渐变
  边框: 3px solid var(--color-gold)
  阴影: shadow-raised + 金色 glow
  emoji: 2rem, 全亮

未解锁 (locked): 80×80px
  filter: grayscale(1) opacity(0.4)
  背景: var(--color-wood-medium)
  边框: 2px dashed rgba(93,64,55,0.3)
  标题文字: "隐藏成就 ?"
  cursor: default
```

```css
/* 未解锁悬停（暗示存在） */
.metal-badge-locked:hover {
  filter: grayscale(0.7) opacity(0.6);
  box-shadow: 0 0 12px rgba(218,165,32,0.2);
  transition: all 0.3s;
}
```

### 成就解锁动画序列

```
触发时机: 满足条件后，下次访问成就页或提交夸夸后

1. Toast 从顶部滑入: "🏆 成就解锁！[标题]"  (LeatherCard 样式)
2. 对应 MetalBadge: 灰色 → 金色过渡 (0.8s)
3. 喵呜从右侧跑来叼着勋章 (miaowu-enter + deliver 姿态)
4. 勋章弹起一次 (spring bounce)
```

### 8个成就完整规范

| ID | 标题 | emoji | 解锁条件 | 喵呜台词 |
|----|------|-------|---------|---------|
| `first_praise` | 初识之喜 | 🌱 | 完成第一次夸赞 | "第一步总是最难的，你做到了！" |
| `streak_7` | 七日之约 | 🎀 | 连续打卡 7 天 | "戴上围巾出来啦~连续7天！" |
| `streak_30` | 月度挚友 | 🎩 | 连续打卡 30 天 | "30天！喵呜戴上大礼帽向你致敬！" |
| `products_5` | 小小收藏家 | 🗝️ | 添加 5 件产品 | "5件宝贝！展架越来越丰富了~" |
| `products_20` | 宝物猎人 | 🏺 | 添加 20 件产品 | "哇，20件！你真是个宝物猎人！" |
| `praise_10` | 赞美达人 | ✨ | 累计 10 条夸赞 | "10次夸赞！说好话的人运气不会差！" |
| `praise_50` | 热爱大师 | 👑 | 累计 50 条夸赞 | "皇冠！50次，你是真正的热爱大师！" |
| `all_categories` | 全品类探索者 | 🗺️ | 4个分类都有产品 | "地图集齐！四个象限都有宝贝了！" |

---

## F8 - 产品详情 V2：编辑/删除/时间线

**当前缺口**: 无编辑/删除功能，记忆卡片样式简陋。

### Header 操作区升级

```
[← 返回]                    [✎ 编辑]  [🗑 删除]
```

### 删除二次确认弹窗

```
┌───────────────────────────────────┐  ← LeatherCard
│   [喵呜 surprised 表情]           │
│                                   │
│   确定要从展架移除这件宝贝？         │  font-heading
│   "[产品名]"                       │  font-handwriting, --color-gold
│                                   │
│   移除后，所有夸夸记忆将一并消失。   │  text-sm, text-muted
│                                   │
│        [取消]  [确认移除]          │
└───────────────────────────────────┘
```

```css
/* 危险按钮样式 */
.btn-danger {
  background: linear-gradient(135deg, #C0392B, #962d22);
  color: #FFF8E7;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.15), 0 3px 6px rgba(192,57,43,.4);
}
```

### 记忆时间线升级

**现状**: 记忆以 div 列表渲染，无时间轴视觉。

```css
.memory-timeline {
  position: relative;
  padding-left: var(--space-6);
}

/* 黄铜竖线 */
.memory-timeline::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0; bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--color-gold) 0%,
    rgba(184,134,11,0.3) 80%,
    transparent 100%
  );
  box-shadow: 0 0 4px rgba(218,165,32,0.3);
}

/* 节点圆点 */
.memory-node {
  position: absolute;
  left: 4px;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--color-gold);
  border: 2px solid var(--color-wood-dark);
  box-shadow: 0 0 6px rgba(218,165,32,0.5);
}
```

每条记忆显示：**日期 + 心情 emoji + 夸赞内容**（引用样式，手写字体）

---

## 喵呜 — 未实现状态与对话气泡

### 待实现状态（当前仅有 idle/happy/curious/surprised）

| ID | 场景 | 动画要点 |
|----|------|---------|
| `welcome` | 每日首次登录 | 伸懒腰，台词: "喵~ 你来啦！今天想发现什么宝贝？" |
| `listening` | 夸夸页输入中 | 歪头，尾巴慢摇，每 2s 随机微调头部角度 |
| `proud` | 成就解锁时 | 挺胸，前爪托勋章 |
| `deliver` | 勋章授予动画 | 叼着勋章从右侧走来 |
| `sleepy` | 3天未打卡 | 趴着，眼皮周期性下垂，台词: "Zzzz... 你都3天没来了..." |
| `satisfied` | 今日已完成夸夸 | 满足地闭眼，盘成一团 |

### SpeechBubble 对话气泡组件

**路径**: `src/components/miaowu/SpeechBubble.tsx`（当前不存在）

```tsx
interface SpeechBubbleProps {
  text: string;
  position?: 'left' | 'right' | 'top';  // 三角尖方向
  visible?: boolean;
  autoHide?: number;  // ms后自动隐藏
}
```

```css
.speech-bubble {
  position: absolute;
  max-width: 200px;
  padding: var(--space-2) var(--space-3);
  background: var(--color-cream);
  border: 2px solid var(--color-brass);
  border-radius: var(--radius-md);
  font-family: var(--font-handwriting-stack);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  line-height: 1.5;
  box-shadow: var(--shadow-raised);
  animation: bubble-pop var(--duration-normal) var(--ease-bounce) forwards;
}

/* 底部三角（position='bottom'时） */
.speech-bubble.pos-bottom::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 20px;
  width: 0;
  border: 8px solid transparent;
  border-top-color: var(--color-cream);
  border-bottom: none;
  filter: drop-shadow(0 2px 1px rgba(184,134,11,0.3));
}

@keyframes bubble-pop {
  0%   { transform: scale(0) translateY(8px); opacity: 0; }
  70%  { transform: scale(1.05) translateY(-2px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
```

---

## 全局 UX 模式 — 未实现部分

### Toast 通知系统

```
位置: position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999
样式: LeatherCard + 左侧 4px 彩色边条
自动消失: 2.5s 后 fadeOut

成功 Toast:  [金色边条] ✦ 封印成功！+1 热爱值
错误 Toast:  [红色边条] ⚠ 出错了，请稍后重试
成就 Toast:  [金色边条] 🏆 成就解锁：初识之喜

动画: slideDown 进入 → 停留 → fadeOut
```

### 全局加载状态补全

| 场景 | 当前 | 目标 |
|------|------|------|
| 展架加载 | ✅ 骨架屏 | 完成 |
| 详情页加载 | "翻阅档案中..." 文字 | LeatherCard 骨架屏 |
| 夸夸页加载 | 无 | 百宝箱"颤抖"待开状态 |
| 成就页加载 | 无 | MetalBadge 骨架屏（灰色圆形） |

### 空状态文案规范

| 页面 | 空状态文案 | 喵呜状态 | CTA 按钮 |
|------|-----------|---------|---------|
| 展架（无物品） | "展架还是空的，把你的第一件珍爱之物封入其中吧" | `curious` | 封入物品 |
| 成就（无成就） | "完成你的第一次夸夸，开启成就之旅！" | `idle` | 去夸夸 |
| 详情（无记忆） | "这件物品还在等待被你发现它的闪光点..." | `listening` | 立即夸夸 |
| 夸夸（无物品） | "展架是空的，先去添加你的宝贝吧！" | `surprised` | 添加妙物 |

### prefers-reduced-motion 降级

```css
@media (prefers-reduced-motion: reduce) {
  .anim-breathe,
  .anim-jump,
  .anim-enter,
  .anim-peek,
  .anim-fade-up,
  .anim-card-pop,
  .skeleton {
    animation: none !important;
  }
}
/* 提示: Framer Motion 组件层使用 useReducedMotion() hook */
```

### :focus-visible 铜质高亮轮廓

```css
/* 全局 focus 样式（在 globals.css 中补充） */
:focus-visible {
  outline: 2px solid var(--color-brass);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
  box-shadow: 0 0 0 4px rgba(184,134,11,0.2);
}

/* 已有 box-shadow 的 input */
.texture-parchment:focus-visible {
  outline: none;
  border-color: var(--color-brass);
  box-shadow: 0 0 0 3px rgba(184,134,11,0.2), var(--shadow-inset);
}
```

---

## 实现优先级建议

```
P0 (核心功能阻断):
  F4 每日夸夸 — 随机产品选择逻辑 + 提交写入 praise_entries
  F4 心情标签 MoodPicker 组件
  F4 字数校验（最少10字才可提交）

P1 (核心体验增强):
  F2 添加妙物完整表单（品牌 / 日期 / 描述 / 图片上传）
  F7 MetalBadge 组件 + 成就页完整布局
  F8 产品编辑 / 删除功能
  Toast 通知系统（成就解锁 / 提交反馈）
  SpeechBubble 气泡组件

P2 (视觉沉浸打磨):
  F4 百宝箱 TreasureChestAnimation（8步序列）
  F3 CategoryPicker + 分类 Tab 筛选
  F5 GlassGauge mini 变体（展架卡片内嵌）
  F8 记忆时间线黄铜竖线样式
  MiaoWu 新状态（welcome / listening / proud / deliver / sleepy / satisfied）
  prefers-reduced-motion 全局降级
```
