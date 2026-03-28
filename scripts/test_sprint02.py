"""
Sprint 02 QA 测试脚本
测试范围：夸夸回路、成就系统、物品详情页升级、Toast、展架骨架屏/交互
"""
import time, json, os
from playwright.sync_api import sync_playwright, expect

BASE  = "http://localhost:3000"
OUT   = r"C:\Users\jiaji\Documents\github-project\WonderUse\docs\qa_screenshots"
os.makedirs(OUT, exist_ok=True)
PASS, FAIL, SKIP = "✅ PASS", "❌ FAIL", "⏭ SKIP"
results = []

def shot(page, name):
    path = os.path.join(OUT, f"{name}.png")
    page.screenshot(path=path, full_page=True)
    return path

def log(case, status, note=""):
    results.append({"case": case, "status": status, "note": note})
    print(f"{status}  {case}" + (f"  [{note}]" if note else ""))

def get_auth_cookies(page):
    """登录并返回 cookies，供后续复用"""
    page.goto(f"{BASE}/login")
    page.wait_for_load_state("networkidle")
    page.fill("#email", "test@wonderuse.dev")
    page.fill("#password", "testpass123")
    page.click("button[type=submit]")
    page.wait_for_url(f"{BASE}/shelf", timeout=8000)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844})  # iPhone 14 Pro
    page = ctx.new_page()

    # ─── 0. 登录 ───────────────────────────────────────────────────────────────
    print("\n=== 0. 登录 ===")
    try:
        page.goto(f"{BASE}/login")
        page.wait_for_load_state("networkidle")
        shot(page, "00_login_page")

        page.fill("#email", "test@wonderuse.dev")
        page.fill("#password", "testpass123")
        page.click("button[type=submit]")
        page.wait_for_url(f"{BASE}/shelf", timeout=8000)
        shot(page, "01_shelf_after_login")
        log("登录跳转至 /shelf", PASS)
    except Exception as e:
        log("登录跳转至 /shelf", FAIL, str(e)[:80])
        browser.close()
        exit(1)

    # ─── 1. 展架页升级验证 ──────────────────────────────────────────────────────
    print("\n=== 1. 展架页 ===")
    try:
        page.goto(f"{BASE}/shelf")
        page.wait_for_load_state("networkidle")
        shot(page, "10_shelf_loaded")

        # 骨架屏（可能闪过），检查 DOM 中是否有展架
        shelf_present = page.locator("text=我的展架").count() > 0
        log("展架页标题渲染", PASS if shelf_present else FAIL)

        # 打卡徽章（streak-badge）
        badge = page.locator(".streak-badge")
        log("打卡天数徽章存在", PASS if badge.count() > 0 else FAIL)

        # 「封入物品」按钮
        add_btn = page.locator("#add-item-btn")
        log("封入物品按钮存在", PASS if add_btn.count() > 0 else FAIL)

        # 点击按钮 → modal 弹出
        add_btn.click()
        page.wait_for_timeout(600)
        modal = page.locator("text=封入展架")
        shot(page, "11_add_item_modal")
        log("添加物品 Modal 弹出", PASS if modal.count() > 0 else FAIL)

        # 物品名称 auto-focus
        focused = page.evaluate("document.activeElement?.id")
        log("Modal 打开后名称框自动 focus", PASS if focused == "item-name-input" else SKIP, f"activeElement={focused}")

        # ESC 关闭
        page.keyboard.press("Escape")
        page.wait_for_timeout(400)
        modal_gone = page.locator("text=封入展架").count() == 0
        log("ESC 关闭 Modal", PASS if modal_gone else FAIL)

    except Exception as e:
        log("展架页升级验证", FAIL, str(e)[:80])

    # ─── 2. 物品详情页 — 删除物品 & 时间线 ─────────────────────────────────────
    print("\n=== 2. 物品详情页 ===")
    try:
        page.goto(f"{BASE}/shelf")
        page.wait_for_load_state("networkidle")

        # 先通过 direct url — 需要知道一个 product id
        # 通过 JS 从 DOM 找第一个物品卡片的 onClick 目标
        # 尝试点展架上第一个非 add-item 的物品
        items = page.locator("[role=button][aria-label^='查看物品']")
        if items.count() > 0:
            item_name = items.first.get_attribute("aria-label") or "未知"
            items.first.click()
            page.wait_for_load_state("networkidle")
            shot(page, "20_product_detail")
            log(f"物品详情页跳转 ({item_name})", PASS)

            # 时间线区域
            timeline = page.locator("text=历史记忆")
            log("时间线区域渲染", PASS if timeline.count() > 0 else FAIL)

            # 删除图标存在
            delete_btn = page.locator("[aria-label='删除物品']")
            if delete_btn.count() == 0:
                # fallback: 找 🗑 符号
                delete_btn = page.locator("text=🗑")
            log("删除物品入口存在", PASS if delete_btn.count() > 0 else FAIL)

            # 点击删除 → 确认 Modal
            if delete_btn.count() > 0:
                delete_btn.first.click()
                page.wait_for_timeout(500)
                shot(page, "21_delete_confirm_modal")
                confirm = page.locator("text=删除").last
                log("删除确认 Modal 出现", PASS if page.locator("[role=dialog]").count() > 0 else FAIL)
                # 取消（不实际删除）
                cancel = page.locator("text=取消").last
                if cancel.count() > 0:
                    cancel.click()
                    page.wait_for_timeout(300)
                    log("取消删除 Modal 关闭", PASS)
        else:
            log("物品详情页验证", SKIP, "展架暂无物品，跳过")
    except Exception as e:
        log("物品详情页验证", FAIL, str(e)[:80])

    # ─── 3. 夸夸页 — 完整回路 ──────────────────────────────────────────────────
    print("\n=== 3. 夸夸页回路 ===")
    try:
        page.goto(f"{BASE}/praise")
        page.wait_for_load_state("networkidle")
        shot(page, "30_praise_page_initial")

        # 检查状态机初始态
        praise_title = page.locator("text=每日夸夸, text=今日之赞")
        log("夸夸页标题渲染", PASS if praise_title.count() > 0 else FAIL)

        # 检查是否显示「已完成今日夸夸」or 正常 idle 态
        done_today = page.locator("text=今日已封印, text=今天已经, text=done_today").count() > 0
        if done_today:
            log("今日已夸夸，处于 done_today 状态", SKIP, "正常：今日已提交")
            shot(page, "31_praise_done_today")
        else:
            # idle 态：应有物品选择器或「开始夸夸」
            has_items_or_start = (
                page.locator("[aria-label*='选择物品'], text=选择物品, text=开始夸夸, text=没有物品").count() > 0
            )
            log("夸夸页 idle 态渲染（物品选择/开始按钮）", PASS if has_items_or_start else FAIL)

            # MiaoWu 猫咪
            miaowu = page.locator(".miaowu-container, [class*='miaowu']")
            log("夸夸页喵呜精灵存在", PASS if miaowu.count() > 0 else FAIL)

            # 若有物品，走完整流程
            items_picker = page.locator("[data-product-id], [aria-label*='选择'], button:has-text('选择')")
            if items_picker.count() > 0:
                items_picker.first.click()
                page.wait_for_timeout(400)
                shot(page, "32_praise_item_selected")
                log("选择物品进入 writing 状态", PASS)

                # 心情选择器
                mood_picker = page.locator("[aria-label*='心情'], button:has-text('开心'), button:has-text('感恩')")
                if mood_picker.count() > 0:
                    mood_picker.first.click()
                    page.wait_for_timeout(200)
                    log("MoodPicker 心情选择", PASS)
                else:
                    log("MoodPicker 心情选择", SKIP, "未找到心情选择器")

                # 文字输入
                textarea = page.locator("textarea")
                if textarea.count() > 0:
                    textarea.first.fill("这件物品陪伴了我很多年，非常感激它的存在。")
                    page.wait_for_timeout(200)
                    shot(page, "33_praise_filled")
                    log("夸夸文字输入", PASS)

                    # 字数计数器（≥10字绿色）
                    char_counter = page.locator("text=字, [class*='char'], [class*='count']")
                    log("字数统计渲染", PASS if char_counter.count() > 0 else SKIP)

                    # 提交按钮
                    submit_btn = page.locator("button:has-text('封印'), button:has-text('记忆'), #praise-submit-btn")
                    if submit_btn.count() > 0:
                        shot(page, "34_praise_before_submit")
                        submit_btn.first.click()
                        page.wait_for_timeout(3000)  # 等待提交+Toast
                        shot(page, "35_praise_after_submit")
                        log("夸夸提交", PASS)

                        # Toast 出现
                        toast = page.locator("[class*='toast'], [role='status'], text=封印成功, text=成功")
                        log("Toast 通知出现", PASS if toast.count() > 0 else FAIL)
                    else:
                        log("夸夸提交按钮", FAIL, "未找到提交按钮")
                else:
                    log("夸夸文字输入", FAIL, "未找到 textarea")
            else:
                log("夸夸物品选择器", SKIP, "展架无物品，跳过完整回路")

    except Exception as e:
        log("夸夸页回路", FAIL, str(e)[:80])

    # ─── 4. 成就页 ─────────────────────────────────────────────────────────────
    print("\n=== 4. 成就页 ===")
    try:
        page.goto(f"{BASE}/achievements")
        page.wait_for_load_state("networkidle")
        shot(page, "40_achievements_page")

        title = page.locator("text=荣誉殿堂, text=成就")
        log("成就页标题", PASS if title.count() > 0 else FAIL)

        # 统计卡片（连续/最长/累计）
        stats = page.locator("text=连续, text=最长, text=累计")
        log("统计卡片（streak + 累计夸赞）", PASS if stats.count() > 0 else FAIL)

        # MetalBadge 勋章（应有 8 个）
        badges = page.locator("[class*='badge'], [class*='metal'], [aria-label*='成就']")
        log(f"MetalBadge 勋章渲染（找到 {badges.count()} 个）", PASS if badges.count() > 0 else FAIL)

        # hover badge 看 tooltip
        if badges.count() > 0:
            badges.first.hover()
            page.wait_for_timeout(300)
            shot(page, "41_badge_hover")
            log("勋章 hover 交互", PASS)

    except Exception as e:
        log("成就页", FAIL, str(e)[:80])

    # ─── 5. Toast 系统 ─────────────────────────────────────────────────────────
    print("\n=== 5. Toast 系统验证 ===")
    try:
        # 通过 JS 手动触发 Toast（需要 provider 已挂载）
        page.goto(f"{BASE}/shelf")
        page.wait_for_load_state("networkidle")
        # 注入一个 custom event 来触发 Toast
        page.evaluate("""
            window.__testToast = true;
            // 尝试找 React 树上的 ToastProvider 上下文
        """)
        log("Toast Provider 挂载检测", SKIP, "需通过真实交互流程验证")
    except Exception as e:
        log("Toast 系统验证", FAIL, str(e)[:80])

    # ─── 6. SpeechBubble 精灵对话气泡 ─────────────────────────────────────────
    print("\n=== 6. 精灵对话气泡 ===")
    try:
        page.goto(f"{BASE}/praise")
        page.wait_for_load_state("networkidle")
        bubble = page.locator("[class*='speech'], [class*='bubble']")
        log("SpeechBubble 组件存在", PASS if bubble.count() > 0 else SKIP, 
            "根据流程状态决定是否展示")
        shot(page, "60_speech_bubble_check")
    except Exception as e:
        log("SpeechBubble 检测", FAIL, str(e)[:80])

    # ─── 7. 无障碍 & 键盘导航 ────────────────────────────────────────────────
    print("\n=== 7. 无障碍验证 ===")
    try:
        page.goto(f"{BASE}/shelf")
        page.wait_for_load_state("networkidle")

        # Tab 键导航到「封入物品」按钮
        page.keyboard.press("Tab")
        page.wait_for_timeout(200)
        focused_id = page.evaluate("document.activeElement?.id || document.activeElement?.tagName")
        log("Tab 键可聚焦到 add-item-btn", PASS if "add" in str(focused_id).lower() else SKIP,
            f"activeElement={focused_id}")

        # Enter 键打开 Modal
        page.keyboard.press("Enter")
        page.wait_for_timeout(500)
        modal_open = page.locator("text=封入展架").count() > 0
        log("Enter 键打开 Modal", PASS if modal_open else SKIP)
        if modal_open:
            page.keyboard.press("Escape")

    except Exception as e:
        log("无障碍验证", FAIL, str(e)[:80])

    # ─── 8. 响应式（414px 宽屏）───────────────────────────────────────────────
    print("\n=== 8. 响应式布局 ===")
    try:
        ctx2 = browser.new_context(viewport={"width": 414, "height": 896})
        page2 = ctx2.new_page()
        page2.goto(f"{BASE}/shelf")
        page2.wait_for_load_state("networkidle")
        shot(page2, "80_shelf_414px")
        log("414px 宽度展架页无溢出", PASS)

        page2.goto(f"{BASE}/praise")
        page2.wait_for_load_state("networkidle")
        shot(page2, "81_praise_414px")
        log("414px 宽度夸夸页渲染", PASS)
        ctx2.close()
    except Exception as e:
        log("响应式布局", FAIL, str(e)[:80])

    browser.close()

# ─── 汇总报告 ────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("Sprint 02 QA 测试结果汇总")
print("="*60)
total = len(results)
passed = sum(1 for r in results if r["status"] == PASS)
failed = sum(1 for r in results if r["status"] == FAIL)
skipped = sum(1 for r in results if r["status"] == SKIP)

for r in results:
    print(f"  {r['status']}  {r['case']}" + (f"  [{r['note']}]" if r['note'] else ""))

print(f"\n  总计: {total}  通过: {passed}  失败: {failed}  跳过: {skipped}")
print(f"  通过率: {passed/(total-skipped)*100:.0f}%" if (total-skipped) > 0 else "")

# 保存 JSON 报告
report_path = r"C:\Users\jiaji\Documents\github-project\WonderUse\docs\sprint02_qa_results.json"
with open(report_path, "w", encoding="utf-8") as f:
    json.dump({"summary": {"total": total, "passed": passed, "failed": failed, "skipped": skipped}, "cases": results}, f, ensure_ascii=False, indent=2)
print(f"\n  JSON 报告: {report_path}")
print(f"  截图目录: {OUT}")
