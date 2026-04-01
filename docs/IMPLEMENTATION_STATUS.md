# Sprint 2 实现文档

**完成日期**: 2026-03-28  
**Sprint 目标**: 完成"夸夸"核心回路闭环，联动成就系统与全局交互反馈

---

## 实现概览

Sprint 2 在 Sprint 1 基础架构之上，完成了 MiaoWuJi 最核心的用户价值回路：用户可以选择展架上的物品、记录心情与感想、提交夸赞并收到实时反馈，同时触发连续打卡追踪与成就解锁。

---

## 新增文件

### 全局通知系统

| 文件 | 说明 |
|---|---|
| `src/components/ui/ToastProvider.tsx` | Toast 通知 Context Provider + 显示逻辑。提供 `useToast()` Hook，支持 `success / error / achievement` 三种类型，动画使用 Framer Motion spring 弹入/淡出，自动 2800ms 后消失。已挂载至 `src/app/layout.tsx` 根级别。 |

**使用方式**:
```tsx
const { showToast } = useToast();
showToast('封印成功！热爱值 +1 ✦', 'success');
showToast('🏆 成就解锁：初识之喜', 'achievement');
showToast('出了点问题，请稍后重试', 'error');
```

### 交互精灵组件

| 文件 | 说明 |
|---|---|
| `src/components/miaowu/SpeechBubble.tsx` | 对话气泡组件。接受 `text / position / visible` props，支持 `left / right / top` 三个方向的三角指针，通过 CSS `::after` 伪元素实现。动画: spring 弹入，`visible=false` 时淡出。 |

**SpeechBubble Props**:
```tsx
interface SpeechBubbleProps {
  text: string;
  position?: 'left' | 'right' | 'top'; // 三角尖方向，默认 right
  visible?: boolean;
}
```

### 拟物化 UI 组件

| 文件 | 说明 |
|---|---|
| `src/components/skeuomorphic/MoodPicker.tsx` | 心情标签 4 选 1 选择器。选项: 😊开心 / 😲惊喜 / 🙏感恩 / 😌自豪，对应数据库 `mood` 字段枚举值。选中态: 黄铜渐变背景 + 内阴影 + 轻微按压缩放。|
| `src/components/skeuomorphic/MetalBadge.tsx` | 成就勋章组件。已解锁: 黄铜放射渐变 + 金色光晕，hover 放大 1.08x。未解锁: 灰度 + 低透明度 + 问号遮挡。支持 tooltip 展示成就名与解锁日期。 |

### 业务逻辑层

| 文件 | 说明 |
|---|---|
| `src/lib/achievements.ts` | 成就判定逻辑（8 个成就定义 + 条件函数 + 写库）。`checkAndUnlockAchievements(userId, supabase)` 读取用户统计、比对已有成就、插入新解锁记录，返回本次新解锁列表。幂等设计（DB UNIQUE 约束保障）。 |
| `src/lib/streaks.ts` | 打卡连续天数更新逻辑。按 UTC 日期判断：今日已记录则 no-op；昨日有记录则 streak+1；更早则重置为 1。同时更新 `longest_streak`。 |

---

## 修改文件

### 页面层

#### `src/app/(main)/praise/page.tsx` — **完整重写**

实现了完整的夸夸状态机：

```
loading → idle / no_products / done_today
idle → writing (点击"开始夸夸")
writing → submitting (点击"封印记忆")
submitting → done_today (成功) / writing (失败回滚)
```

**核心功能**:
- 初始化并行加载: 用户物品列表 + 今日夸夸记录
- 物品横向滑动选择器（idle 状态显示）+ "换一件" 按钮
- 7 条随机引导问题（`GUIDE_QUESTIONS`）
- `MoodPicker` 心情选择（可选）
- `ParchmentTextArea` 文字输入 + 实时字数统计（<10字红色警告, ≥10字绿色确认）
- 提交后: 调用 `updateStreak` + `checkAndUnlockAchievements` + 多条 Toast 反馈
- `done_today` 状态显示今日已封印内容，允许"随时可以再夸一件"
- 喵呜精灵状态随流程切换: idle → curious → happy

**数据流**:
```
[提交] → INSERT praise_entries → updateStreak → checkAndUnlockAchievements → Toast + MiaoWu
```

#### `src/app/(main)/achievements/page.tsx` — **完整重写**

**核心功能**:
- 并行加载: 用户成就列表 + streak 统计 + 夸赞总数
- 顶部 `LeatherCard` 展示: 当前连续天数、历史最长、累计夸赞次数
- `MetalBadge` 4x2 网格: 全 8 个成就渲染，已解锁高亮，未解锁灰色锁定
- 逐个 badge 错落 spring 动画入场
- 骨架屏加载态

#### `src/app/(main)/product/[id]/page.tsx` — **升级**

**新增功能**:
- 删除物品: 右上角 🗑 图标 → 底部弹出确认 Modal（含物品名、归零风险提示、红色确认按钮）
- Toast 反馈删除结果
- 🕐 **黄铜竖线时间线**: 连续竖线 + 节点圆点 (最新条目金色发光) + 日期 + 心情标签气泡 + 引导问题标注 + `<blockquote>` 样式内容
- 夸赞记录按 `created_at` 降序排列（最新在上）
- 优化加载态: 骨架屏替代文字 Loading
- 优化空态: 引导用户去夸夸页

### 数据层

#### `src/utils/supabase/queries.ts` — **扩展**

新增方法:
- `deleteProduct(productId: string)` — 删除产品（配合 RLS 保障只能删自己的）
- `getTodayPraise(userId: string)` — 获取今日 UTC 内的夸赞记录，返回 null 表示尚未夸赞
- `getUserAchievements(userId: string)` — 获取用户全部成就，按解锁时间升序
- `getPraiseCount(userId: string)` — 获取用户累计夸赞数（count 查询）
- `getStreak(userId: string)` — 获取 streak 记录

### 全局层

#### `src/app/layout.tsx`
- 新增: `<ToastProvider>` 包裹 children，使全局组件均可调用 `useToast()`

#### `src/styles/globals.css`
- 新增: `:focus-visible` 黄铜 2px outline + 4px 毛边光晕
- 新增: `.texture-parchment:focus-visible` 特化样式（隐藏 outline，加强 border 颜色）
- 新增: `@media (prefers-reduced-motion: reduce)` 禁用所有动画类

---

## 成就定义一览

| 成就类型 | 标题 | 触发条件 |
|---|---|---|
| `first_praise` | 初识之喜 🌱 | 完成第 1 次夸赞 |
| `streak_7` | 七日之约 🎀 | 连续打卡 7 天 |
| `streak_30` | 月度挚友 🎩 | 连续打卡 30 天 |
| `products_5` | 小小收藏家 🗝️ | 添加 5 件产品 |
| `products_20` | 宝物猎人 🏺 | 添加 20 件产品 |
| `praise_10` | 赞美达人 ✨ | 累计 10 条夸赞 |
| `praise_50` | 热爱大师 👑 | 累计 50 条夸赞 |
| `all_categories` | 全品类探索者 🗺️ | 4 个不同分类都有产品 |

---

## 数据库依赖确认

Sprint 2 不需要任何新的 DB Migration。所有依赖表与字段均已在 Sprint 1 中建立：

| 表 | 关键字段 | 状态 |
|---|---|---|
| `praise_entries` | `mood` (CHECK: happy/surprised/grateful/proud) | ✅ 已存在 |
| `streaks` | `current_streak`, `longest_streak`, `last_praise_date` | ✅ 已存在 |
| `achievements` | `achievement_type`, `title`, `icon`, `unlocked_at` | ✅ 已存在 |

---

## 接口汇总

### Client-side Hooks

```tsx
// Toast 通知
const { showToast } = useToast();
showToast(message: string, type?: 'success' | 'error' | 'achievement') => void

// Supabase 客户端
const supabase = createClient(); // browser-only
```

### Server-side 工具函数

```typescript
// src/lib/achievements.ts
checkAndUnlockAchievements(userId, supabase) → Promise<AchievementDef[]>
ACHIEVEMENT_DEFINITIONS: AchievementDef[]

// src/lib/streaks.ts
updateStreak(userId, supabase) → Promise<void>
```

### DB 查询工具 (src/utils/supabase/queries.ts)

```typescript
getProfile(userId)
getProducts(userId)
addProduct(product)
deleteProduct(productId)
addPraise(entry, client?)
getTodayPraise(userId)
getStreak(userId)
getUserAchievements(userId)
getPraiseCount(userId)
```

---

## 待完善 (Sprint 3 Backlog)

- [ ] F8 产品编辑（名称、分类修改表单）
- [ ] 百宝箱序列动画（8步）
- [ ] GlassGauge mini 变体（展架卡片热爱值角标）
- [ ] 分类筛选 Tab（展架页）
- [ ] 时区支持（当前按 UTC 日期判断今日）

---

## QA 回归修复 (2026-04-01)

> 修复依据: `QA_SPRINT02_REPORT.md` — 下一步建议 + Bug 汇总

### BUG-S02-001 修复 — `mood` 字段写入为 null

**根因分析**

| 层次 | 原有行为 | 问题 |
|------|---------|------|
| `praise/page.tsx` L47 | `useState<Mood>('happy')` | 有默认值，逻辑上没问题 |
| `praise/page.tsx` L358 | `<MoodPicker value={mood \|\| 'happy'}>` | `\|\|` fallback 掩盖了 null 可能性；若测试账号在旧 schema 下 mood 字段过滤掉了默认值则写 null |
| `handleSubmit` | 仅检查 `!selectedProduct && content < 10` | 未检验 mood 非空 |

**修复方案（最小变更）**

1. **`src/app/(main)/praise/page.tsx`**
   - `useState<Mood>('happy')` → `useState<Mood | null>(null)`：强制要求用户主动选择，消除静默 null
   - `handleSubmit` 入口守卫：`if (... || mood === null) return;`
   - `canSubmit` 校验：追加 `&& mood !== null`
   - MoodPicker 绑定：`value={mood}` (移除 `|| 'happy'` fallback)
   - 心情标题标注：选择前显示红色「（必选）」，选中后变绿 `✓`
   - 「再夸一件」重置：`setMood('happy')` → `setMood(null)`

**影响文件**
- `src/app/(main)/praise/page.tsx` — 4 处修改

---

### BUG-S02-002 修复 — Toast 可见时长不足

**根因分析**

原 `setTimeout` 为 **4500ms**（文档误记为 2800ms），QA 截图窗口约 3–4 秒，恰好在消失边缘。

**修复方案**

- **`src/components/ui/ToastProvider.tsx`** L38：`4500` → `5000`

此改动在 dev / prod 均有效，确保 QA 工具 Playwright 在 `networkidle` 后有充足窗口截图 Toast。

---

### 修复后验证清单

- [x] TypeScript `tsc --noEmit` 零错误
- [x] 自动化测试：进入 /praise → 不选心情 → 「封印记忆」按钮保持禁用，标题显示红色「（必选）」✅
- [x] 自动化测试：选择心情 → 标题变绿 ✓ → 按钮激活 → 提交成功，DB `mood` 字段写入非 null ✅
- [x] 自动化测试：Toast 通知「封印成功！」在提交后约 5s 消失，满足 ≥5s 要求 ✅
- [x] 成就页验证：「初识之喜 🌱」徽章金色高亮，「成就解锁 1 项」统计正确 ✅

> 验证执行时间：2026-04-01 · 执行工具：Playwright 浏览器自动化

---

## QA 观察项处理 (2026-04-01)

> 来源：`QA_SPRINT02_BUGFIX_REGRESSION.md` § 观察到的潜在问题

### OBS-01 修复 — 提交 loading 时长约 4s

**根因**：`handleSubmit` 串行等待三个 Supabase 调用（insert → updateStreak → checkAndUnlockAchievements），总耗时叠加约 4s。

**修复方案：乐观 UI（praise/page.tsx）**

1. `praise_entries.insert()` 成功后**立即**切换到 `done_today` 态并弹出 Toast
2. `updateStreak` + `checkAndUnlockAchievements` 改为 `Promise.all()` 后台并发执行（不再阻塞 UI）
3. 成就 Toast 延迟 600ms 弹出，避免与封印 Toast 重叠
4. 网络失败时仅记录 catch，不影响用户已完成的主操作

**效果**：用户点击提交后 ~1s 即可看到成功态，消除 "submitting 一直转" 的等待感。

---

### OBS-02 修复 — streak 文案缺数字

**根因分析**：`streaks.ts` 中 `.single()` 在记录不存在时返回 error，`if (error || !streak) return` 导致首次夸夸后 streak 行**从未被创建**，`current_streak` 始终从 DB 读到 null。

**修复方案（两处）**

1. **`src/lib/streaks.ts`**：`.single()` → `.maybeSingle()`；记录不存在时改为 `upsert` 初始行（streak=1）
2. **`src/app/(main)/achievements/page.tsx`**：streak=0 时显示「完成首次夸夸，开启连续纪录」，streak>0 时显示「已连续发现物品价值 N 天」

---

### OBS-03 — 「1 Issue」红色徽标

**结论**：Next.js 开发环境内置提示，生产构建中不会出现，无需修复。
