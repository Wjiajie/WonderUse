# 妙物记 (MiaoWuJi) — UI/UX 设计规范

> **设计风格**: 拟物化 (Skeuomorphism) — 探险家书房 / 百宝箱
> **版本**: v1.0 MVP | **日期**: 2026-03-28

---

## 1. 设计灵感

> **19 世纪博物学家的书房。** 木质展架上摆满了珍奇收藏，铜质仪器散发着温暖的金属光泽，一只银色虎斑美短猫正在好奇地检查每一件宝贝。烛光摇曳，羊皮纸上记录着每一次发现的喜悦。

**Mood Board 关键词**: 温暖、复古、手工感、木头、皮革、黄铜、玻璃、探险、发现、收藏、猫咪

---

## 2. 设计令牌 (Design Tokens)

### 2.1 色彩体系

```css
:root {
  /* 主色调 (Warm Amber) */
  --color-primary: #D4A574;
  --color-primary-dark: #C4956A;
  --color-primary-light: #E8C9A0;
  /* 木质系 (Walnut) */
  --color-wood-dark: #3E2723;
  --color-wood-medium: #5D4037;
  --color-wood-light: #8D6E63;
  /* 金属系 (Brass) */
  --color-brass: #B8860B;
  --color-gold: #DAA520;
  --color-bronze: #CD7F32;
  /* 背景系 (Parchment) */
  --color-cream: #FFF8E7;
  --color-parchment: #F5E6CC;
  --color-linen: #FAF0E6;
  /* 猫咪系 */
  --color-cat-silver: #A8A8A8;
  --color-cat-eye: #7CB342;
  /* 文字色 */
  --color-text-primary: #2C1810;
  --color-text-secondary: #4A3728;
  --color-text-muted: #8D6E63;
  --color-text-on-brass: #FFF8E7;
  /* 热爱值等级色 */
  --love-level-1: #87CEEB;   /* 相识 - 浅蓝 */
  --love-level-2: #7CB342;   /* 熟悉 - 绿色 */
  --love-level-3: #DAA520;   /* 喜欢 - 暖黄 */
  --love-level-4: #E67E22;   /* 热爱 - 橙色 */
  --love-level-5: #C0392B;   /* 挚爱 - 红色 */
}
```

### 2.2 字体系统

```css
:root {
  --font-heading: 'Noto Serif SC', 'Playfair Display', Georgia, serif;
  --font-body: 'Noto Sans SC', 'Inter', -apple-system, sans-serif;
  --font-handwriting: 'LXGW WenKai', 'Caveat', cursive;
  --text-xs: 0.75rem; --text-sm: 0.875rem; --text-base: 1rem;
  --text-lg: 1.125rem; --text-xl: 1.25rem; --text-2xl: 1.5rem; --text-3xl: 1.875rem;
}
```

### 2.3 间距 & 圆角

```css
:root {
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem; --space-8: 2rem; --space-10: 2.5rem; --space-12: 3rem;
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px; --radius-full: 9999px;
}
```

### 2.4 拟物化阴影系统

```css
:root {
  --shadow-raised: 0 2px 4px rgba(62,39,35,.15), 0 4px 8px rgba(62,39,35,.1), 0 8px 16px rgba(62,39,35,.05);
  --shadow-pressed: inset 0 2px 4px rgba(62,39,35,.2), 0 1px 2px rgba(62,39,35,.1);
  --shadow-inset: inset 0 2px 6px rgba(62,39,35,.2), inset 0 1px 2px rgba(62,39,35,.15);
  --shadow-hover: 0 4px 8px rgba(62,39,35,.2), 0 8px 16px rgba(62,39,35,.12), 0 12px 24px rgba(62,39,35,.06);
  --shadow-shelf: 0 4px 0 var(--color-wood-dark), 0 6px 12px rgba(62,39,35,.3);
  --shadow-glass-inner: inset 0 -2px 4px rgba(255,255,255,.3), inset 0 2px 4px rgba(62,39,35,.1);
  --ease-bounce: cubic-bezier(0.34,1.56,0.64,1);
  --ease-smooth: cubic-bezier(0.4,0,0.2,1);
  --duration-fast: 150ms; --duration-normal: 300ms; --duration-slow: 500ms;
}
```

---

## 3. 纹理 CSS 实现

### 木纹
```css
.texture-wood {
  background-color: var(--color-wood-medium);
  background-image: repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,.03) 20px, rgba(0,0,0,.03) 21px),
    repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,.02) 4px, rgba(255,255,255,.02) 5px);
}
```

### 皮革
```css
.texture-leather {
  background-color: var(--color-primary-dark);
  background-image: radial-gradient(ellipse at 30% 50%, rgba(255,255,255,.05) 0%, transparent 70%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.15), inset 0 -1px 0 rgba(0,0,0,.1), var(--shadow-raised);
}
```

### 黄铜
```css
.texture-brass {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-brass) 30%, var(--color-bronze) 60%, var(--color-brass) 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.3), inset 0 -1px 0 rgba(0,0,0,.2), 0 2px 4px rgba(62,39,35,.3);
}
```

### 玻璃
```css
.texture-glass {
  background: linear-gradient(180deg, rgba(255,255,255,.4) 0%, rgba(255,255,255,.1) 40%, rgba(255,255,255,.05) 100%);
  box-shadow: var(--shadow-glass-inner);
  border: 1px solid rgba(255,255,255,.2);
}
```

---

## 4. 核心组件规范

### 4.1 BrassButton（黄铜按钮）

| State | 效果 |
|-------|------|
| Default | 黄铜渐变 + 顶部高光 + 浮起阴影 |
| Hover | translateY(-1px) + 阴影加深 + 光泽增强 |
| Active | translateY(1px) + 内嵌阴影 |
| Disabled | opacity: 0.5 |

变体: `Primary`(金色), `Secondary`(青铜), `Ghost`(无背景), `Icon`(圆形)

### 4.2 LeatherCard（皮革卡片）

皮革纹理背景 + 多层 box-shadow + 圆角。`interactive` 变体有 hover 浮起效果。

### 4.3 GlassGauge（玻璃温度计）

显示"热爱值"。液面颜色根据等级变化（0→透明, 1-5→浅蓝, 6-15→绿, 16-30→暖黄, 31-50→橙, 51+→红）。Framer Motion 做液面动画。

### 4.4 MetalBadge（金属勋章）

两种状态: `locked`(灰色剪影) / `unlocked`(金属光泽)。

### 4.5 ParchmentInput / ParchmentTextArea（羊皮纸输入）

羊皮纸背景 + 内嵌阴影 + 手写字体 placeholder + 铜质边框。

### 4.6 WoodenShelf（木质展架）

木板正面深色木纹 + 顶面浅色高光 + 底部阴影。产品卡片"摆放"在展架上。

### 4.7 BrassTabBar（底部导航）

Fixed bottom, 黄铜质感背景，活跃项有凹槽高亮。三个 Tab: 展架 / 每日夸夸 / 成就。

---

## 5. 喵呜 (MiaoWu) 角色规范

### 5.1 角色设定

| 属性 | 值 |
|------|-----|
| 品种 | 美短猫 (American Shorthair), 银色虎斑 |
| 体型 | 圆润可爱，微胖 |
| 眼睛 | 大圆眼，猫眼绿 (#7CB342) |
| 性格 | 好奇、活泼、鼓励型 |
| 画风 | 宫崎骏式手绘感，线条柔和 |

### 5.2 表情/姿态列表

| ID | 姿态 | 场景 |
|----|------|------|
| `idle` | 蹲坐，偶尔眨眼 | 默认待机 |
| `welcome` | 伸懒腰打招呼 | 每日首次登录 |
| `curious` | 竖耳歪头嗅探 | 添加新产品 |
| `listening` | 歪头，尾巴慢摇 | 用户输入夸赞 |
| `happy` | 跳起来笑脸 | 提交成功 |
| `surprised` | 瞪大眼竖耳 | 发现新功能 |
| `proud` | 挺胸得意 | 获得成就 |
| `deliver` | 叼着勋章走来 | 授予勋章 |
| `sleepy` | 趴着打瞌睡 | 3天未打卡 |

### 5.3 对话气泡

奶油底色 + 琥珀边框 + 手写字体 + 底部三角指向喵呜。max-width: 200px。

### 5.4 动画（CSS Keyframes）

```css
@keyframes miaowu-breathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.02)} }
@keyframes miaowu-tail-wag { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
@keyframes miaowu-jump { 0%{transform:translateY(0)} 30%{transform:translateY(-20px) scale(1.1)} 100%{transform:translateY(0)} }
@keyframes miaowu-enter { 0%{transform:translateX(-100%) scale(.8);opacity:0} 100%{transform:translateX(0) scale(1);opacity:1} }
```

---

## 6. 页面布局

### 6.1 响应式断点（Mobile First）

`375px`(小屏手机) → `428px`(大屏手机) → `768px`(平板) → `1024px`(桌面)

### 6.2 全局结构

Header(仅桌面) → Main Content(木纹背景, padding 16px, 可滚动) → Bottom TabBar(fixed, h60px)

### 6.3 产品卡片网格

Mobile: 2列 | Tablet: 3列 | Desktop: 4列

---

## 7. 动画规范

| 动画 | 技术 | 时长 |
|------|------|------|
| 页面转场 | Framer Motion AnimatePresence | 300ms |
| 百宝箱打开 | CSS + Framer Motion | 800ms |
| 卡片 hover/tap | Framer Motion spring | 150ms |
| 热爱值变化 | Framer Motion animate | 800ms |
| 喵呜表情切换 | CSS Keyframes | 500ms |

百宝箱动画序列: 箱子晃动 → 箱盖打开 → 金光射出 → 产品飘出 → 喵呜探头

---

## 8. 可访问性

- `:focus-visible` 铜质高亮轮廓
- 所有图片有 `alt` 文本
- WCAG AA 色彩对比度
- `prefers-reduced-motion` 动画降级
- 最小触摸目标 44×44px
