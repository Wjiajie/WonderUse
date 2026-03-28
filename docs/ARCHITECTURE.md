# 妙物记 (MiaoWuJi) — 技术架构设计

> **版本**: v1.0 MVP | **日期**: 2026-03-28

---

## 1. 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **框架** | Next.js | 16.2.x | App Router + API Routes，全栈框架 |
| **UI 库** | React | 19.2.x | 配合 React Compiler 自动优化 |
| **动画** | Framer Motion | 12.38.x | 拟物化交互动画、页面转场 |
| **数据库** | Supabase (PostgreSQL) | Cloud | 数据存储 + RLS 安全 |
| **认证** | Supabase Auth | Cloud | 邮箱注册/登录 |
| **存储** | Supabase Storage | Cloud | 产品图片 |
| **样式** | 自定义 CSS | - | 拟物化设计系统，CSS Variables |
| **语言** | TypeScript | 5.x | 全栈类型安全 |
| **部署** | Vercel | - | 前端 + Serverless API |

---

## 2. 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Next.js 16 App Router                │  │
│  │                                                   │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │ Pages   │ │Components│ │Skeuomorphic CSS  │  │  │
│  │  │ (RSC)   │ │(React 19)│ │+ Framer Motion   │  │  │
│  │  └────┬────┘ └────┬─────┘ └──────────────────┘  │  │
│  │       │           │                               │  │
│  │  ┌────┴───────────┴────┐                         │  │
│  │  │    Supabase Client  │                         │  │
│  │  │    (Browser SDK)    │                         │  │
│  │  └──────────┬──────────┘                         │  │
│  └─────────────┼─────────────────────────────────────┘  │
│                │                                         │
└────────────────┼─────────────────────────────────────────┘
                 │ HTTPS
┌────────────────┼─────────────────────────────────────────┐
│                │          Supabase Cloud                   │
│  ┌─────────────┴──────────────┐                          │
│  │        API Gateway         │                          │
│  │     (PostgREST + GoTrue)   │                          │
│  └──┬──────────┬──────────┬───┘                          │
│     │          │          │                               │
│  ┌──┴───┐  ┌──┴───┐  ┌──┴──────┐                       │
│  │ Auth │  │  DB   │  │ Storage │                       │
│  │(邮箱)│  │(PgSQL)│  │ (图片)  │                       │
│  └──────┘  └──────┘  └─────────┘                       │
│                                                          │
│  [V2] ┌────────────────────────┐                        │
│       │ Edge Functions         │                        │
│       │ (豆包/DeepSeek/MiniMax)│                        │
│       └────────────────────────┘                        │
└──────────────────────────────────────────────────────────┘
```

---

## 3. 数据库设计

### 3.1 Supabase 项目信息

| 属性 | 值 |
|------|-----|
| 组织 | Wjiajie's Org (`azblouvqxqbonnjvphva`) |
| 项目名 | `miaowuji` |
| 区域 | `ap-southeast-1` (新加坡) |

### 3.2 完整 Schema (SQL)

```sql
-- ============================================
-- 1. 用户扩展表 (Supabase Auth 管理基础用户)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    consumer_type TEXT CHECK (consumer_type IN ('explorer', 'practical', 'collector')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. 产品表
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT NOT NULL CHECK (category IN ('electronics', 'software', 'clothing', 'books')),
    image_url TEXT,
    description TEXT,
    love_score INT DEFAULT 0,
    purchased_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);

-- ============================================
-- 3. 夸赞条目
-- ============================================
CREATE TABLE praise_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) >= 10),
    prompt_used TEXT,
    mood TEXT CHECK (mood IN ('happy', 'surprised', 'grateful', 'proud')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_praise_product_id ON praise_entries(product_id);
CREATE INDEX idx_praise_user_id ON praise_entries(user_id);
CREATE INDEX idx_praise_created_at ON praise_entries(created_at DESC);

-- ============================================
-- 4. 成就
-- ============================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- ============================================
-- 5. 连续打卡
-- ============================================
CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_praise_date DATE
);

-- ============================================
-- 6. 触发器: 新用户自动创建 profile 和 streak
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

    INSERT INTO streaks (user_id, current_streak, longest_streak)
    VALUES (NEW.id, 0, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 7. 触发器: 夸赞后自动更新 love_score
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_praise()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET love_score = love_score + 1, updated_at = NOW()
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_praise_created
    AFTER INSERT ON praise_entries
    FOR EACH ROW EXECUTE FUNCTION handle_new_praise();

-- ============================================
-- 8. RLS 策略
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE praise_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- products
CREATE POLICY "Users read own products" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- praise_entries
CREATE POLICY "Users read own praises" ON praise_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own praises" ON praise_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- achievements
CREATE POLICY "Users read own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- streaks
CREATE POLICY "Users read own streak" ON streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own streak" ON streaks FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 9. Storage Bucket
-- ============================================
-- 在 Supabase Dashboard 或通过 API 创建:
-- Bucket: product-images
-- Public: false
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- Max file size: 5MB
```

### 3.3 ER 关系图

```
profiles (1) ──── (N) products
profiles (1) ──── (N) praise_entries
profiles (1) ──── (N) achievements
profiles (1) ──── (1) streaks
products (1) ──── (N) praise_entries
```

### 3.4 成就类型注册表

```typescript
export const ACHIEVEMENTS = {
  first_praise:    { title: '初识之喜',     condition: '完成第一次夸赞',   icon: '👍' },
  streak_7:        { title: '七日之约',     condition: '连续打卡7天',     icon: '🧣' },
  streak_30:       { title: '月度挚友',     condition: '连续打卡30天',    icon: '🎩' },
  products_5:      { title: '小小收藏家',   condition: '添加5件产品',     icon: '📦' },
  products_20:     { title: '宝物猎人',     condition: '添加20件产品',    icon: '🗺️' },
  praise_10:       { title: '赞美达人',     condition: '累计10条夸赞',    icon: '👏' },
  praise_50:       { title: '热爱大师',     condition: '累计50条夸赞',    icon: '👑' },
  all_categories:  { title: '全品类探索者', condition: '4个分类都有产品', icon: '🌍' },
} as const;
```

---

## 4. 项目结构

```
miaowuji/
├── public/
│   ├── textures/              # 纹理资源 (木纹/皮革/纸张)
│   ├── miaowu/                # 喵呜猫咪 SVG/PNG 素材
│   │   ├── idle.svg
│   │   ├── happy.svg
│   │   ├── curious.svg
│   │   ├── surprised.svg
│   │   ├── proud.svg
│   │   ├── sleepy.svg
│   │   ├── deliver-badge.svg
│   │   └── welcome.svg
│   └── icons/                 # 拟物化分类图标
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # 全局布局 + 字体 + 元数据
│   │   ├── page.tsx           # Landing 页
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx     # 含底部 TabBar
│   │   │   ├── shelf/page.tsx         # 妙物展架
│   │   │   ├── praise/page.tsx        # 每日夸夸
│   │   │   ├── product/[id]/page.tsx  # 产品详情
│   │   │   └── achievements/page.tsx  # 成就陈列柜
│   │   └── api/
│   │       ├── products/route.ts
│   │       ├── praise/route.ts
│   │       └── achievements/route.ts
│   ├── components/
│   │   ├── skeuomorphic/      # 拟物化基础组件
│   │   │   ├── BrassButton.tsx
│   │   │   ├── LeatherCard.tsx
│   │   │   ├── GlassGauge.tsx
│   │   │   ├── MetalBadge.tsx
│   │   │   ├── ParchmentInput.tsx
│   │   │   ├── ParchmentTextArea.tsx
│   │   │   ├── WoodenShelf.tsx
│   │   │   ├── BrassModal.tsx
│   │   │   └── BrassTabBar.tsx
│   │   ├── miaowu/            # 喵呜组件
│   │   │   ├── MiaoWu.tsx
│   │   │   ├── SpeechBubble.tsx
│   │   │   └── animations.ts
│   │   ├── product/
│   │   ├── praise/
│   │   └── achievement/
│   ├── styles/
│   │   ├── globals.css        # 设计令牌 + 全局样式
│   │   ├── textures.css       # 纹理 CSS
│   │   ├── skeuomorphic.css   # 拟物组件样式
│   │   └── animations.css     # 动画关键帧
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # createBrowserClient
│   │   │   └── server.ts      # createServerClient
│   │   ├── achievements.ts    # 成就判定逻辑
│   │   └── streaks.ts         # 打卡逻辑
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   ├── usePraise.ts
│   │   ├── useStreak.ts
│   │   └── useMiaoWu.ts
│   └── types/
│       └── database.ts        # Supabase 自动生成的类型
├── docs/                      # 设计文档（本目录）
├── supabase/
│   └── migrations/
└── package.json
```

---

## 5. API 路由设计

### 5.1 产品 CRUD

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/products` | 获取当前用户所有产品（支持 `?category=` 筛选） |
| POST | `/api/products` | 创建新产品 |
| PATCH | `/api/products/[id]` | 更新产品信息 |
| DELETE | `/api/products/[id]` | 删除产品 |

### 5.2 夸赞系统

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/praise/today` | 获取今日夸赞状态 + 随机产品 |
| POST | `/api/praise` | 提交夸赞（自动触发 love_score +1） |
| GET | `/api/praise/history/[productId]` | 获取某产品的夸赞历史 |

### 5.3 成就 & 打卡

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/achievements` | 获取用户所有成就 |
| POST | `/api/achievements/check` | 检查并解锁新成就 |
| GET | `/api/streak` | 获取打卡状态 |

---

## 6. 认证流程

```
注册: 用户填写邮箱+密码 → Supabase Auth signUp → 触发器自动创建 profile+streak → 跳转主页
登录: 用户填写邮箱+密码 → Supabase Auth signIn → 获取 session → 跳转主页
登出: 调用 signOut → 清除 session → 跳转登录页
路由守卫: middleware.ts 检查 session，未登录重定向到 /login
```

---

## 7. 图片上传流程

```
用户选择图片 → 前端压缩（max 1MB）→ 上传到 Supabase Storage (product-images bucket)
→ 获取 signed URL → 保存 URL 到 products.image_url
```

---

## 8. V2 AI 接入规划（仅架构预留）

```
┌──────────┐    ┌──────────────────┐    ┌─────────────┐
│  Client  │───→│ Supabase Edge    │───→│ 豆包 API    │
│          │    │ Function         │    │ DeepSeek API│
│          │    │ (ai-recommend)   │    │ MiniMax API │
└──────────┘    └──────────────────┘    └─────────────┘
```

Edge Function 统一封装 AI 调用，支持多 provider 切换。MVP 阶段不实现。

---

## 9. 部署架构

```
Git Push → Vercel Auto Deploy → Preview / Production
                                      │
                                      ├── Next.js SSR (Serverless Functions)
                                      ├── Static Assets (CDN)
                                      └── API Routes (Serverless)

Supabase Cloud (ap-southeast-1)
├── PostgreSQL Database
├── Auth Service
├── Storage (product-images)
└── [V2] Edge Functions
```

---

## 10. 开发环境搭建

```bash
# 1. 初始化 Next.js 16 项目
npx -y create-next-app@latest ./ --typescript --app --src-dir --no-tailwind

# 2. 安装依赖
npm install @supabase/supabase-js @supabase/ssr framer-motion

# 3. 配置环境变量 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# 4. 启动开发服务器
npm run dev
```
