# 妙物记 Sprint 1 迭代回顾

> **Sprint 周期**: 2026-03-28  
> **目标**: Complete MVP skeleton — auth, shelf, praise placeholder, component library  
> **整体评价**: ✅ **骨架搭建完成，核心回路尚未闭环**

---

## 1. 已交付功能清单

### 1.1 基础设施

| 项目 | 状态 | 备注 |
|------|------|------|
| Next.js 16.2.1 项目初始化 | ✅ | App Router, Turbopack |
| React 19.2.4 + Framer Motion 12.38.x | ✅ | |
| Supabase 客户端/服务端双模式集成 | ✅ | `client.ts` + `server.ts` + `queries.ts` |
| `.env.local` 配置 | ✅ | Supabase URL + Anon Key |
| Google Fonts (Playfair Display, Lora, Caveat) | ✅ | CSS Variables 绑定 |

### 1.2 拟物化设计系统 (6 组件)

| 组件 | 路径 | Variants | 质量 |
|------|------|----------|------|
| `BrassButton` | `src/components/skeuomorphic/` | primary / secondary / ghost / icon | ⭐⭐⭐⭐ 金属渐变+内阴影 |
| `LeatherCard` | 同上 | default / interactive | ⭐⭐⭐⭐ 皮革纹理+缝线 |
| `GlassGauge` | 同上 | 带 value prop, 0-100 | ⭐⭐⭐⭐ 温度计玻璃管质感 |
| `ParchmentInput` / `ParchmentTextArea` | 同上 | — | ⭐⭐⭐⭐ 手写体+羊皮纸 |
| `WoodenShelf` | 同上 | — | ⭐⭐⭐⭐ 3D 切面底架 |
| `BrassTabBar` | 同上 | 3 路由 tab (shelf/praise/achievements) | ⭐⭐⭐⭐ 路径高亮判断 |

### 1.3 喵呜吉祥物 (MiaoWu)

| 项目 | 状态 |
|------|------|
| 4 状态图片素材 (idle/happy/curious/surprised) | ✅ AI 生成 PNG |
| `MiaoWu.tsx` 状态切换组件 | ✅ Framer Motion 过渡 |
| 点击交互 (idle → surprised → 自动恢复) | ✅ |
| 3 种尺寸 (small/medium/large) | ✅ |
| **未实现**: 对话气泡 SpeechBubble | ❌ |
| **未实现**: welcome/listening/proud/deliver/sleepy/satisfied 状态 | ❌ |

### 1.4 页面路由

| 路由 | 页面 | 实现深度 |
|------|------|---------|
| `/` | 根重定向 → `/login` | ✅ 完整 |
| `/login` | 登录/注册页 | ✅ **高质量** — 品牌叙事、黄铜角花、SVG 分隔线、Framer 入场动画 |
| `/(main)/shelf` | 展架主页 | ✅ **核心功能完整** — 物品 CRUD、骨架屏、EmptyState、粒子特效、ESC/Enter 快捷键 |
| `/(main)/praise` | 每日夸夸 | ⚠️ **仅 UI 占位** — 无产品选择、无提交逻辑、无心情标签 |
| `/(main)/achievements` | 成就殿堂 | ⚠️ **仅 UI 占位** — 硬编码 0 天、空成就架 |
| `/(main)/product/[id]` | 物品详情 | ⚠️ **基础可用** — 有 GlassGauge，无编辑/删除，时间线简陋 |

### 1.5 后端交互 (Supabase)

| API | 实现 | 页面调用 |
|-----|------|---------|
| `auth.signUp` | ✅ | login |
| `auth.signInWithPassword` | ✅ | login |
| `products` SELECT | ✅ | shelf (直接调用) |
| `products` INSERT | ✅ | shelf Modal (直接调用) |
| `streaks` SELECT | ✅ | shelf Header |
| `queries.ts` 封装层 (getProfile/addPraise 等 6 方法) | ✅ 代码存在 | ⚠️ 未被页面引用 |
| Server-side Auth Guard (`(main)/layout.tsx`) | ✅ | async session check + redirect |

### 1.6 CSS 文件体系

| 文件 | 用途 | 行数 |
|------|------|------|
| `globals.css` | 设计令牌 + Reset + 排版 | ~190 |
| `skeuomorphic.css` | 核心拟物样式(按钮/卡片/展架) | ~85 |
| `skeuomorphic-variants.css` | 变体样式(secondary/ghost/icon) | ~80 |
| `animations.css` | 动画关键帧 | ~100 |
| `textures.css` | 材质纹理类 | ~60 |

---

## 2. 已修复 Bug 汇总 (6 个)

| ID | 严重级 | 描述 | 状态 |
|----|--------|------|------|
| BUG-001 | 🔴 Critical | 受保护路由无鉴权拦截 | ✅ Fixed — `server.ts` async cookies + `layout.tsx` await |
| BUG-002 | 🟡 Major | Supabase 注册邮件 Rate Limit | ✅ Fixed — Dashboard 关闭 Email Confirmation |
| BUG-003 | 🟡 Major | `wood.jpg` 纹理贴图 404 | ✅ Fixed — 纹理由 CSS gradient 实现，移除无效引用 |
| BUG-004 | 🟢 Minor | 夸夸 Tab 点击区域偏小 | ✅ Fixed — `flex: 1 + height: 100%` |
| BUG-005 | 🟡 Major | 添加物品按钮无功能 | ✅ Fixed — 完整 Modal 表单实现 |
| DB-001 | 🟡 Major | products.category CHECK 约束 (英文枚举) | ✅ Fixed — Migration 改为长度约束 |

---

## 3. 未实现功能 (Sprint 2 Backlog)

按优先级排序，来源于 PRD 对比分析：

### P0 — 核心功能未闭环

| 功能 | 具体缺口 | 影响 |
|------|---------|------|
| **F4 每日夸夸** | 整个页面仅静态占位，无核心逻辑 | **产品核心回路断裂 — 用户无法完成"夸夸→热爱值+1"** |
| 产品选择器 | 夸夸页无法选择要夸赞的物品 | 同上 |
| 心情标签 MoodPicker | 组件不存在 | 同上 |
| 夸夸提交写入 `praise_entries` | 无写入逻辑 | 同上 |
| 字数校验 (≥10字) | 无 | 同上 |

### P1 — 核心体验增强

| 功能 | 具体缺口 |
|------|---------|
| F2 添加妙物完整表单 | 缺品牌、日期、描述、图片上传字段 |
| F7 成就勋章系统 | `MetalBadge` 组件不存在；成就页空壳 |
| F8 产品编辑/删除 | 详情页无任何编辑/删除操作 |
| Toast 通知系统 | 全局反馈缺失 |
| SpeechBubble 对话气泡 | 喵呜无法"说话" |
| 连续打卡实际写入 | 展架显示 streak 数据但夸夸不更新 |

### P2 — 视觉打磨

| 功能 | 具体缺口 |
|------|---------|
| F4 百宝箱动画 | 8 步序列动画 (TreasureChestAnimation) |
| F3 分类筛选 Tab | 展架无 CategoryPicker / CategoryTabBar |
| F5 GlassGauge mini | 展架卡片无内嵌热爱值 |
| F8 记忆时间线样式 | 黄铜竖线 + 节点圆点 |
| 分类图标系统 | 铜质齿轮/指南针等 SVG |
| MiaoWu 扩展状态 | welcome/listening/proud/deliver/sleepy/satisfied |
| `prefers-reduced-motion` | 全局动画降级 |
| `:focus-visible` 铜质轮廓 | 无障碍增强 |

---

## 4. 代码质量观察

### ✅ 做得好的
- **设计令牌一致性**: 全程使用 `var(--color-*)` / `var(--space-*)` / `var(--text-*)`, 零 Tailwind 泄漏
- **Framer Motion 用法**: AnimatePresence + spring 物理动画，交互流畅
- **展架页质量极高**: 骨架屏、空状态、粒子特效、ESC 快捷键、auto-focus、ARIA 标注一应俱全
- **登录页品牌感强**: SVG 角花、分隔线、handwriting tagline, 沉浸感一流

### ⚠️ 需要改进的
- **`queries.ts` 未被使用**: 封装了 6 个方法但实际页面直接调用 Supabase client，两套写法共存
- **`/praise` 和 `/achievements` 实现极浅**: 仅有占位 UI，无任何交互逻辑
- **`product/[id]` 详情页缺功能**: 无编辑、删除、回到展架的合理导航
- **inline style 过多**: 展架页 562 行中大量 inline style，应抽取到 CSS 文件
- **Supabase client 在 `queries.ts` 顶层实例化**: 可能在 SSR 环境下引发问题

---

## 5. 文件盘点

### 源代码 (src/)

```
src/
├── app/
│   ├── layout.tsx          # Root layout (fonts, meta, CSS imports)
│   ├── page.tsx             # Root redirect → /login
│   ├── favicon.ico
│   ├── login/
│   │   └── page.tsx         # 282 lines — 登录/注册，高质量
│   └── (main)/
│       ├── layout.tsx       # Auth guard (server-side)
│       ├── shelf/
│       │   └── page.tsx     # 562 lines — 展架核心页，功能完整
│       ├── praise/
│       │   └── page.tsx     # 46 lines — 占位页
│       ├── achievements/
│       │   └── page.tsx     # 31 lines — 占位页
│       └── product/
│           └── [id]/        # 详情页 (未查看具体行数)
├── components/
│   ├── skeuomorphic/        # 6 组件
│   │   ├── BrassButton.tsx
│   │   ├── BrassTabBar.tsx
│   │   ├── GlassGauge.tsx
│   │   ├── LeatherCard.tsx
│   │   ├── ParchmentInput.tsx
│   │   └── WoodenShelf.tsx
│   └── miaowu/
│       └── MiaoWu.tsx       # 88 lines — 状态切换精灵
├── styles/                  # 5 CSS 文件
│   ├── globals.css
│   ├── skeuomorphic.css
│   ├── skeuomorphic-variants.css
│   ├── animations.css
│   └── textures.css
└── utils/
    └── supabase/
        ├── client.ts        # Browser client
        ├── server.ts        # Server client (async cookies)
        └── queries.ts       # 6 封装方法 (未被页面引用)
```

### 资产 (public/)

```
public/
├── miaowu/
│   ├── idle.png             # 495 KB
│   ├── happy.png            # 737 KB
│   ├── curious.png          # 737 KB
│   ├── surprised.png        # 695 KB
│   └── (4 个原始文件名副本)   # ⚠️ 重复, 可清理
└── (Next.js 默认 SVG 图标)  # file.svg, globe.svg, etc.
```

---

## 6. Sprint 2 建议焦点

```
🎯 Sprint 2 目标: 闭环"夸夸"核心回路

核心交付物:
  1. /praise 页面完整实现 (产品选择 + 引导问题 + 心情标签 + 提交)
  2. praise_entries 写入 → love_score +1 → streak 更新
  3. /achievements 接入真实数据 (streak + 成就条件判断)
  4. Toast 通知系统 (提交反馈 + 成就解锁)
  5. SpeechBubble 对话气泡 (喵呜互动文案)

技术债务:
  - 统一 Supabase 调用方式 (页面不应直接 new client)
  - 将 inline styles 抽取为 CSS classes
  - 清理 public/miaowu 重复文件
```

---

## 7. 上线前必须配置

> [!WARNING]
> **生产部署前，务必在 Supabase Dashboard 重新开启 Email Confirmation!**  
> 当前关闭状态仅适用于开发/测试阶段。

---

*文档生成时间: 2026-03-28 14:57*  
*生成者: Self-Evolving Agent (Architect 角色)*  
*数据来源: code-explorer 全量扫描 + QA 三轮测试报告交叉核验*
