# 妙物记 (MiaoWuJi) - 已实现功能及 QA 测试指南

这份文档用于向前端和 QA 测试 Agent 说明当前已在项目中实现的功能、UI 组件以及对接的接口（Supabase Queries），以便进行端到端的测试与校验。

## 1. 已实现的 UI 组件 (Skeuomorphic Components)
所有纯 CSS 拟物化风格组件均已存放在 `src/components/skeuomorphic/` 目录下。

*   **`BrassButton` (复古黄铜按钮)**
    *   **Variants**: `primary` (默认，黄铜高光), `secondary` (暗色), `ghost` (透明无边框), `icon` (圆形图标按钮)。
    *   **测试点**: 悬停(hover)和点击(active)时是否有物理下压感及光影反馈。
*   **`LeatherCard` (真皮底板)**
    *   **特性**: 带有 `interactive` 模式（交互浮动）。
    *   **测试点**: 渲染是否带有真实的皮革纹理和缝线边框。
*   **`GlassGauge` (玻璃指示槽)**
    *   **特性**: 基于传递入的 `value` 属性（0-100）动态填充类似于温度计的刻度。
    *   **测试点**: 动画是否平滑，高光阴影是否体现“凸起玻璃管”质感。
*   **`ParchmentInput` / `ParchmentTextArea` (羊皮纸输入框)**
    *   **特性**: 原型为泛黄草纸，采用手写体（Caveat）。
    *   **测试点**: 焦点(focus)状态不破坏拟物沉浸感，文字书写手感对齐。
*   **`WoodenShelf` (实木陈列架)**
    *   **特性**: 带有底部 3D `lip` 切面的展架容器。
*   **`BrassTabBar` (底部全局导航)**
    *   **特性**: 沉浸式导航，通过路径判断当前高亮激活状态。
    *   **包含路由**: `/shelf`（展架）, `/praise`（夸夸）, `/achievements`（成就）。

## 2. 核心前端页面 (Application Pages)

所有页面采用 **Next.js 16 App Router** 结构，页面逻辑基于 Client Components 构建：

| 路由模式 | 路径名 | 描述 | 测试校验关键点 |
| :--- | :--- | :--- | :--- |
| `public` | `/` | 根路由重定向 | 自动跳转到 `/login`。 |
| `public` | `/login` | 登录/注册页 | 调用 Auth 接口；UI 渲染 `ParchmentInput`。登录或注册成功后路由应跳转至 `/shelf`。 |
| `protected` | `/(main)/shelf` | 首页面 (我的展架) | 渲染 `MiaoWu` 动画精灵。展示 `WoodenShelf` 和添加产品占位符。 |
| `protected` | `/(main)/praise` | 每日夸夸记录系统 | 用户在此为旧物撰写日志。包含文本框输入和保存动作按钮。 |
| `protected` | `/(main)/achievements` | 成就墙 | 展示火力值与 `WoodenShelf` 的成就列表。 |
| `protected` | `/(main)/product/[id]` | 单品详情记录页 | 根据 URL参数 `[id]` 请求 Supabase 获取数据，渲染该单品的过往所有 Praise（记录卡片），并计算其 GlassGauge 满载度。 |

## 3. 已实现的接口与数据交互 (Database & Queries)

所有数据库层面的交互统一封装在 `src/utils/supabase/queries.ts` 中。当前已启用 RLS 控制，所有方法在客户端上下文执行须在有效会话 (Auth) 状态下。

### Auth 交互 (`src/app/login/page.tsx`)
*   **注册**: `supabase.auth.signUp({ email, password })`
*   **登录**: `supabase.auth.signInWithPassword({ email, password })`

### 数据操作 (`src/utils/supabase/queries.ts`)
QA Agent 可测试这些基础方法是否在网络层正常通过（需有有效插入数据）：

1. **`getProfile(userId: string)`**
   *   **功能**: 拉取用户配置资料（如头像、名称）。
2. **`getProducts(userId: string)`**
   *   **功能**: 获取当前用户在 `products` 表下的所有物品集合。
3. **`addProduct(product: Object)`**
   *   **功能**: 往 `products` 表写入包含 `name, category, description, purchase_price` 等结构的新物品。
4. **`addPraise(entry: Object)`**
   *   **功能**: 发送日记记录至 `praise_entries` 表，关连给定的 `product_id`。
5. **`getStreak(userId: string)`**
   *   **功能**: 从 `streaks` 表读取用户连续活跃天数。
6. **`getUserAchievements(userId: string)`**
   *   **功能**: 联合查询 `user_achievements` 与 `achievements` 获取拥有的成就标识。

## 4. 喵呜 (MiaoWu) 动态反馈精灵

*   **路径**: `src/components/miaowu/MiaoWu.tsx`
*   **状态枚举 (`MiaoWuState`)**: 包含 `idle`, `happy`, `curious`, `surprised` 四种动作资源卡片。
*   **交互逻辑测试**: 
    1. 默认展示 `idle`。
    2. 当用户点击猫咪时，将会临时切换为 `surprised` 状态，之后会在 2 秒内恢复为初始状态。
    3. 组件可通过 `currentState` prop 向外暴露给页面控制器（例如：提交完夸夸表单时，可以传参强制要求精灵呈现 `happy` 状态）。

## 5. QA 建议介入流程

1. **环境准备**:
   建议在执行端运行 `npm run dev` 即可开始游览器 E2E 测试进程。
   *确保 `.env.local` 拥有正确的 Supabase URL 与 Anon Key。*
2. **场景连贯性跑通**:
   *   创建账号 -> 被导引至展架 -> 点击增加按钮 -> 返回后查看单品详情展示 -> 去执行每日夸夸并选择此单品保存。
3. **视觉走查**:
   *   确保没有使用 Tailwind 默认原子类（如 `bg-red-500`），保证全部渲染被 `var(--color-...)` 的 CSS Variables 兜底。

---

## 6. QA 阶段 Bug 修复记录 (基于 2026-03-28 QA_TEST_REPORT)

根据首轮 QA 测试报告，已针对性修复以下问题以提升可用性与安全性：

1. **[BUG-001] Protected Routes 无鉴权拦截 (Critical) ✅ 已验证**
   - **修复方案**: 在 `src/app/(main)/layout.tsx` 中加入 Server-Side 鉴权校验。通过 `await createClient()` 获取 Session，若用户未授权则自动 `redirect('/login')`。
   - **回归修复 (NEW-REG)**: 修复过程中引入了新 500 错误 `TypeError: cookieStore.get is not a function`。根因为 Next.js 15/16 的 `cookies()` 是异步 API，必须 `await`。已对以下两处进行修正：
     - `src/utils/supabase/server.ts`: `createClient` 改为 `async`，内部 `const cookieStore = await cookies()`
     - `src/app/(main)/layout.tsx`: 改为 `const supabase = await createClient()`
   - **验证结果**: QA 回归测试已在三条受保护路由（`/shelf`、`/praise`、`/achievements`）全部验证通过（截图证明于 `QA_REGRESSION_REPORT.md`）。

2. **[BUG-002] Supabase 注册邮件 Rate Limit (Major) ⚠️ 剩余**
   - **备注方案**: 确认系 Supabase 配置层限制，非代码逻辑异常。**建议二选一**：
     1. Supabase Dashboard → Authentication → Settings → 关闭 "Enable email confirmations"（MVP 开发阶段适用）
     2. 配置自定义 SMTP（如 Resend / Postmark）以提升发信速率上限
   - **影响**: 此问题导致 QA 在注册后无法完整走通 E2E 流程，BUG-004 等后续测试项处于 BLOCKED 状态。

3. **[BUG-003] `wood.jpg` 纹理贴图 404 (Major) ✅ 已验证**
   - **修复方案**: 移除了 `src/app/login/page.tsx` 中无效的 `backgroundImage: 'url(/textures/wood.jpg)'` 属性，拟物木质背景完全由 `.texture-wood` CSS gradient 实现，无外部图片依赖。
   - **验证结果**: QA 回归确认控制台已无本地 404 资源错误。

4. **[BUG-004] BrassTabBar 夸夸 Tab 点击区域偏小 (Minor) ➖ 代码已改，待下次回归**
   - **修复方案**: `src/components/skeuomorphic/BrassTabBar.tsx` 中将 `width: '33.33%'` 改为 `flex: 1`，并新增 `padding: var(--space-2) 0` 扩大点击热区。
   - **验证状态**: 因 BUG-002 Rate Limit 阻断了登录流程，此项无法在回归测试中验证，将在 BUG-002 解决后补充验证。
