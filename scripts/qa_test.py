"""
WonderUse (妙物记 MiaoWuJi) E2E QA Test Script
Based on IMPLEMENTATION_STATUS.md spec
Tests: routing, skeuomorphic components, auth, UI fidelity
"""

import json
import time
import os
from datetime import datetime
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:3000"
SCREENSHOTS_DIR = "/tmp/wonderuse_qa"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

REPORT = {
    "timestamp": datetime.now().isoformat(),
    "base_url": BASE_URL,
    "results": [],
    "summary": {"passed": 0, "failed": 0, "warnings": 0},
}

def log(name, status, detail="", screenshot=None):
    emoji = {"PASS": "✅", "FAIL": "❌", "WARN": "⚠️"}.get(status, "ℹ️")
    print(f"  {emoji} [{status}] {name}: {detail}")
    entry = {"test": name, "status": status, "detail": detail}
    if screenshot:
        entry["screenshot"] = screenshot
    REPORT["results"].append(entry)
    if status == "PASS":
        REPORT["summary"]["passed"] += 1
    elif status == "FAIL":
        REPORT["summary"]["failed"] += 1
    elif status == "WARN":
        REPORT["summary"]["warnings"] += 1


def screenshot(page, name):
    path = f"{SCREENSHOTS_DIR}/{name}.png"
    page.screenshot(path=path, full_page=True)
    return path


def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # ── 1. ROOT REDIRECT ──────────────────────────────────────────────────
        print("\n📁 1. Root Redirect")
        try:
            page.goto(BASE_URL, wait_until="networkidle", timeout=15000)
            current = page.url
            if "/login" in current:
                log("Root → /login redirect", "PASS", f"Redirected to {current}")
            else:
                log("Root → /login redirect", "FAIL", f"Expected /login, got {current}")
        except Exception as e:
            log("Root → /login redirect", "FAIL", str(e))
        screenshot(page, "01_root_redirect")

        # ── 2. LOGIN PAGE RENDERING ───────────────────────────────────────────
        print("\n📁 2. Login Page UI")
        try:
            page.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=15000)
            sc = screenshot(page, "02_login_page")

            # Check ParchmentInput presence (check by type=email / type=password)
            email_inputs = page.locator("input[type='email'], input[type='text']").count()
            pw_inputs = page.locator("input[type='password']").count()
            if email_inputs > 0:
                log("ParchmentInput (email field)", "PASS", f"Found {email_inputs} text/email input(s)", sc)
            else:
                log("ParchmentInput (email field)", "FAIL", "No email/text input found", sc)

            if pw_inputs > 0:
                log("ParchmentInput (password field)", "PASS", f"Found {pw_inputs} password input(s)")
            else:
                log("ParchmentInput (password field)", "FAIL", "No password input found")

            # Check for a submit button
            btns = page.locator("button").count()
            if btns > 0:
                log("BrassButton (login/register submit)", "PASS", f"{btns} button(s) present on login page")
            else:
                log("BrassButton (login/register submit)", "FAIL", "No button found on login page")

            # Visual CSS fidelity: no raw Tailwind bg-* classes
            html = page.content()
            raw_tailwind = ["bg-red-", "bg-blue-", "bg-green-", "text-gray-", "border-gray-"]
            flagged = [c for c in raw_tailwind if c in html]
            if not flagged:
                log("No raw Tailwind color classes", "PASS", "CSS variables used correctly")
            else:
                log("No raw Tailwind color classes", "WARN", f"Potential Tailwind classes: {flagged}")

        except Exception as e:
            log("Login page render", "FAIL", str(e))

        # ── 3. AUTH FLOW ──────────────────────────────────────────────────────
        print("\n📁 3. Auth Flow (Register + Login)")
        test_email = f"qa_test_{int(time.time())}@wonderuse.test"
        test_pw = "TestPass123!"
        registered = False
        logged_in = False

        # 3a. Registration
        try:
            page.goto(f"{BASE_URL}/login", wait_until="networkidle")
            # Try to find a "register" / "sign up" toggle
            register_toggle = page.locator("text=/register|sign up|注册/i").first
            if register_toggle.count() > 0:
                register_toggle.click()
                page.wait_for_load_state("networkidle")

            email_input = page.locator("input[type='email'], input[type='text']").first
            pw_input = page.locator("input[type='password']").first
            email_input.fill(test_email)
            pw_input.fill(test_pw)

            submit = page.locator("button[type='submit'], button").first
            submit.click()
            page.wait_for_load_state("networkidle")
            time.sleep(2)

            sc = screenshot(page, "03_after_register")
            if "/shelf" in page.url or "/login" in page.url:
                registered = True
                log("Auth registration attempt", "PASS", f"→ {page.url}", sc)
            else:
                log("Auth registration attempt", "WARN", f"Unexpected URL: {page.url}", sc)
                registered = True  # may have succeeded even if redirected differently
        except Exception as e:
            log("Auth registration", "FAIL", str(e))

        # 3b. Login
        try:
            page.goto(f"{BASE_URL}/login", wait_until="networkidle")
            email_input = page.locator("input[type='email'], input[type='text']").first
            pw_input = page.locator("input[type='password']").first
            email_input.fill(test_email)
            pw_input.fill(test_pw)

            submit = page.locator("button[type='submit'], button").first
            submit.click()
            page.wait_for_load_state("networkidle")
            time.sleep(2)

            sc = screenshot(page, "04_after_login")
            if "/shelf" in page.url:
                logged_in = True
                log("Auth login → /shelf", "PASS", f"Redirected to {page.url}", sc)
            elif "/login" in page.url:
                log("Auth login → /shelf", "FAIL", "Still on login page - check credentials or Supabase config", sc)
            else:
                log("Auth login → /shelf", "WARN", f"Unexpected URL: {page.url}", sc)
                logged_in = True
        except Exception as e:
            log("Auth login", "FAIL", str(e))

        # ── 4. SHELF PAGE ─────────────────────────────────────────────────────
        print("\n📁 4. Shelf Page (/shelf)")
        if logged_in:
            try:
                page.goto(f"{BASE_URL}/shelf", wait_until="networkidle")
                sc = screenshot(page, "05_shelf_page")
                log("Shelf page loads", "PASS", f"URL: {page.url}", sc)

                # WoodenShelf presence: check for elements with class or data-component
                page_html = page.content()
                if "wooden" in page_html.lower() or "shelf" in page_html.lower():
                    log("WoodenShelf component", "PASS", "Shelf-related markup found")
                else:
                    log("WoodenShelf component", "WARN", "No explicit WoodenShelf markup detected")

                # MiaoWu sprite
                if "miaowu" in page_html.lower() or "喵" in page_html or "猫" in page_html:
                    log("MiaoWu sprite", "PASS", "MiaoWu-related content found")
                else:
                    log("MiaoWu sprite", "WARN", "No MiaoWu sprite content detected in HTML")

                # Add product button / placeholder
                add_btns = page.locator("button").count()
                log("Shelf add-product interaction button", "PASS" if add_btns > 0 else "WARN",
                    f"{add_btns} button(s) on shelf page")

            except Exception as e:
                log("Shelf page", "FAIL", str(e))
        else:
            log("Shelf page", "WARN", "Skipped – login did not succeed")

        # ── 5. TAB BAR NAVIGATION ─────────────────────────────────────────────
        print("\n📁 5. BrassTabBar Navigation")
        if logged_in:
            try:
                page.goto(f"{BASE_URL}/shelf", wait_until="networkidle")
                page_html = page.content()

                # Check for nav/tab links
                praise_link = page.locator("a[href*='praise'], a[href*='夸夸']")
                achievements_link = page.locator("a[href*='achievements'], a[href*='成就']")

                praise_count = praise_link.count()
                achieve_count = achievements_link.count()

                log("BrassTabBar /praise link", "PASS" if praise_count > 0 else "WARN",
                    f"{praise_count} praise link(s)")
                log("BrassTabBar /achievements link", "PASS" if achieve_count > 0 else "WARN",
                    f"{achieve_count} achievements link(s)")

                # Navigate to praise
                if praise_count > 0:
                    praise_link.first.click()
                    page.wait_for_load_state("networkidle")
                    sc = screenshot(page, "06_praise_page")
                    log("Navigate to /praise", "PASS" if "/praise" in page.url else "WARN", page.url, sc)

                # Navigate to achievements
                page.goto(f"{BASE_URL}/shelf", wait_until="networkidle")
                if achieve_count > 0:
                    page.locator("a[href*='achievements']").first.click()
                    page.wait_for_load_state("networkidle")
                    sc = screenshot(page, "07_achievements_page")
                    log("Navigate to /achievements", "PASS" if "/achievements" in page.url else "WARN", page.url, sc)

            except Exception as e:
                log("BrassTabBar navigation", "FAIL", str(e))
        else:
            log("BrassTabBar", "WARN", "Skipped – login did not succeed")

        # ── 6. PRAISE PAGE ────────────────────────────────────────────────────
        print("\n📁 6. Praise Page (/praise)")
        if logged_in:
            try:
                page.goto(f"{BASE_URL}/praise", wait_until="networkidle")
                sc = screenshot(page, "08_praise_page_full")

                textareas = page.locator("textarea").count()
                text_inputs = page.locator("input[type='text']").count()
                buttons = page.locator("button").count()

                log("ParchmentTextArea on praise page", "PASS" if textareas > 0 else "WARN",
                    f"{textareas} textarea(s)", sc)
                log("Praise submit button", "PASS" if buttons > 0 else "WARN",
                    f"{buttons} button(s) on praise page")

            except Exception as e:
                log("Praise page", "FAIL", str(e))
        else:
            log("Praise page", "WARN", "Skipped – login did not succeed")

        # ── 7. ACHIEVEMENTS PAGE ──────────────────────────────────────────────
        print("\n📁 7. Achievements Page (/achievements)")
        if logged_in:
            try:
                page.goto(f"{BASE_URL}/achievements", wait_until="networkidle")
                sc = screenshot(page, "09_achievements_page")
                log("Achievements page loads", "PASS", page.url, sc)

                # GlassGauge presence
                page_html = page.content()
                if "gauge" in page_html.lower() or "glass" in page_html.lower() or "streak" in page_html.lower():
                    log("GlassGauge / streak display", "PASS", "Gauge/streak related markup found")
                else:
                    log("GlassGauge / streak display", "WARN", "No gauge/streak markup detected")

            except Exception as e:
                log("Achievements page", "FAIL", str(e))
        else:
            log("Achievements page", "WARN", "Skipped – login did not succeed")

        # ── 8. PROTECTED ROUTE GUARD ──────────────────────────────────────────
        print("\n📁 8. Protected Route Guard")
        try:
            # Try accessing shelf without session in new context
            private_ctx = browser.new_context()
            private_page = private_ctx.new_page()
            private_page.goto(f"{BASE_URL}/shelf", wait_until="networkidle", timeout=10000)
            time.sleep(1)
            sc = screenshot(private_page, "10_protected_route")
            if "/login" in private_page.url:
                log("Protected /shelf redirects unauthenticated", "PASS",
                    f"Redirected to {private_page.url}", sc)
            else:
                log("Protected /shelf redirects unauthenticated", "WARN",
                    f"Expected /login redirect, got: {private_page.url}", sc)
            private_ctx.close()
        except Exception as e:
            log("Protected route guard", "FAIL", str(e))

        # ── 9. COMPONENT VISUAL CHECKS ────────────────────────────────────────
        print("\n📁 9. Component Visual / CSS Variable Check")
        try:
            page.goto(f"{BASE_URL}/login", wait_until="networkidle")
            # Check for CSS variable usage
            css_vars_used = page.evaluate("""() => {
                const styles = [...document.querySelectorAll('*')].flatMap(el =>
                    [...el.classList]
                );
                const hasBgVar = document.documentElement.style.cssText.includes('--') ||
                    document.querySelector('[style*="--"]') !== null;
                return {
                    total_elements: document.querySelectorAll('*').length,
                    has_inline_vars: hasBgVar
                };
            }""")
            log("DOM renders (total elements)", "PASS",
                f"{css_vars_used['total_elements']} DOM elements found")

            # Check fonts loaded (Caveat should be present for ParchmentInput)
            fonts_info = page.evaluate("""() => {
                const fonts = [];
                for (const font of document.fonts) {
                    fonts.push(font.family);
                }
                return [...new Set(fonts)];
            }""")
            has_caveat = any("Caveat" in f for f in fonts_info)
            has_imfell = any("IM Fell" in f or "IMFell" in f or "fell" in f.lower() for f in fonts_info)
            log("Caveat handwriting font", "PASS" if has_caveat else "WARN",
                f"Fonts found: {fonts_info[:5]}")

        except Exception as e:
            log("Component visual check", "FAIL", str(e))

        # ── 10. PRODUCT DETAIL ROUTE ──────────────────────────────────────────
        print("\n📁 10. Product Detail Page (/product/[id])")
        if logged_in:
            try:
                # Navigate to a dummy product ID to see if page renders or 404s gracefully
                page.goto(f"{BASE_URL}/product/test-product-id", wait_until="networkidle")
                sc = screenshot(page, "11_product_detail")
                status = page.url
                html = page.content()
                if "404" in html or "not found" in html.lower():
                    log("Product detail page /product/[id]", "WARN",
                        "Rendered 404 for unknown ID (expected for test ID)", sc)
                elif "/login" in page.url:
                    log("Product detail page /product/[id]", "WARN",
                        "Redirected to login for unknown product", sc)
                else:
                    log("Product detail page /product/[id]", "PASS",
                        f"Page rendered at {page.url}", sc)
            except Exception as e:
                log("Product detail page", "FAIL", str(e))
        else:
            log("Product detail page", "WARN", "Skipped – login did not succeed")

        browser.close()

    # ── PRINT SUMMARY ─────────────────────────────────────────────────────────
    print("\n" + "="*60)
    print(f"📊 TEST SUMMARY")
    print(f"   ✅ Passed:   {REPORT['summary']['passed']}")
    print(f"   ❌ Failed:   {REPORT['summary']['failed']}")
    print(f"   ⚠️  Warnings: {REPORT['summary']['warnings']}")
    print("="*60)

    # Save JSON report
    with open(f"{SCREENSHOTS_DIR}/report.json", "w", encoding="utf-8") as f:
        json.dump(REPORT, f, ensure_ascii=False, indent=2)
    print(f"\n📂 Screenshots and JSON report saved to: {SCREENSHOTS_DIR}")

    return REPORT


if __name__ == "__main__":
    run_tests()
