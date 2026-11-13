"""Run against the existing preview: python3 tests/browser/redirect_regression.py.

Requires preinstalled Playwright. Evidence goes to /tmp/browser/redirect-regression.
Uses only an injected session for read-only views. Logout is intercepted locally:
this exercises the real UI/cache/storage flow but NEVER revokes the real session.
Google consent, real server logout and student-role checks remain human-required.
"""
import asyncio
import json
import os
from pathlib import Path

from playwright.async_api import async_playwright

ORIGIN = "http://localhost:8080"
OUTPUT = Path("/tmp/browser/redirect-regression")
PROTECTED = ["/dashboard", "/payments", "/devices", "/redeem", "/admin",
             "/admin/settings", "/admin/payments"]


async def signed_out(page):
    await page.wait_for_url(ORIGIN + "/auth")
    await page.get_by_role("button", name="Continue with Google").wait_for()
    assert await page.get_by_role("navigation", name="Student navigation").count() == 0
    assert await page.get_by_role("navigation", name="Admin navigation").count() == 0
    assert await page.get_by_role("button", name="Sign out", exact=True).count() == 0
    assert await page.locator("input[type=file]").count() == 0
    assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth")


async def exercise(browser, width, height):
    context = await browser.new_context(viewport={"width": width, "height": height})
    page = await context.new_page()
    failures = []
    private_reads = {}
    logout_requests = []
    page.on("pageerror", lambda error: failures.append(str(error)))
    page.on("console", lambda message: failures.append(message.text)
            if message.type == "error" else None)

    def capture(request):
        if "_serverFn" in request.url and request.method == "POST":
            private_reads[request.url] = request.post_data or "{}"

    await page.goto(ORIGIN + "/auth", wait_until="networkidle")
    await signed_out(page)
    for cycle in range(3):
        for path in PROTECTED:
            await page.goto(ORIGIN + path, wait_until="networkidle")
            await signed_out(page)
            await page.reload(wait_until="networkidle")
            await signed_out(page)
        print(f"PASS {width}: anonymous cycle {cycle + 1}, hard entry + refresh")

    session_text = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
    storage_key = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
    if os.environ.get("LOVABLE_BROWSER_AUTH_STATUS") == "injected" and session_text and storage_key:
        cookies = json.loads(os.environ.get("LOVABLE_BROWSER_SUPABASE_COOKIES_JSON") or "[]")
        if cookies:
            await context.add_cookies([{**cookie, "url": ORIGIN} for cookie in cookies])
        await page.evaluate("([k,v]) => localStorage.setItem(k,v)", [storage_key, session_text])
        page.on("request", capture)
        await page.goto(ORIGIN + "/dashboard", wait_until="networkidle")
        await page.get_by_role("navigation", name="Student navigation").wait_for()
        await page.get_by_role("link", name="Payments", exact=True).click()
        await page.get_by_role("heading", name="Payments", exact=True).wait_for()
        await page.reload(wait_until="networkidle")
        await page.get_by_role("navigation", name="Student navigation").wait_for()
        await page.goto(ORIGIN + "/admin/settings", wait_until="networkidle")
        # This requesting account is the existing admin; never impersonate a student.
        await page.get_by_role("navigation", name="Admin navigation").wait_for()
        await page.screenshot(path=str(OUTPUT / f"signed-in-{width}.png"))

        async def local_logout(route):
            logout_requests.append(True)
            await route.fulfill(status=200, content_type="application/json", body="{}")

        await page.route("**/auth/v1/logout**", local_logout)
        await page.get_by_role("button", name="Sign out", exact=True).click()
        await signed_out(page)
        assert logout_requests, "Sign-out must call the intercepted endpoint"
        await context.clear_cookies()
        assert await page.evaluate("k => localStorage.getItem(k)", storage_key) is None
        await page.go_back(wait_until="networkidle")
        await signed_out(page)
        await page.reload(wait_until="networkidle")
        await signed_out(page)
        for path in PROTECTED:
            await page.goto(ORIGIN + path, wait_until="networkidle")
            await signed_out(page)
        # Replay private read calls with NO bearer in a fresh request context.
        denied = 0
        for url, body in private_reads.items():
            response = await context.request.post(url,
                headers={"content-type": "text/plain", "origin": ORIGIN,
                         "sec-fetch-site": "same-origin", "x-tsr-serverFn": "true"})
            # Start returns an RPC error envelope (HTTP 200); middleware still
            # denies access. Require an absent result and the exact auth error.
            response_text = await response.text()
            payload = json.loads(response_text)
            values = dict(zip(payload["p"]["k"], payload["p"]["v"]))
            assert values["result"] == {"t": 2, "s": 1}
            assert values["error"]["s"]["message"]["s"] == "Unauthorized: No authorization header provided"
            denied += 1
        assert denied >= 2, "Must exercise both student and admin server authorization"
        print(f"PASS {width}: signed-in reads, local-only UI logout, Back, refresh; {denied} private calls denied")
    else:
        print(f"BLOCKED {width}: no injected session; signed-in/local logout not exercised")

    await page.screenshot(path=str(OUTPUT / f"final-{width}.png"))
    (OUTPUT / f"errors-{width}.json").write_text(json.dumps(failures, indent=2))
    assert not failures, f"{width}: {len(failures)} console/page errors; see redacted-free runtime log"
    print(f"PASS {width}: zero console/page errors, no private UI or horizontal overflow")
    await context.close()


async def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        try:
            for dimensions in [(1280, 1800), (390, 844)]:
                await exercise(browser, *dimensions)
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())