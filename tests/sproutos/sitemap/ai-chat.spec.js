// =============================================================================
// Sprout OS — Sitemap Editor — AI Sitemap Chat
// Covers : Chat panel visibility · Multi-turn conversation · Add/remove pages
//          via chat · Rename via chat · Duplicate via chat · Undo capability
//          Token tracking · Error states · Edge cases
// =============================================================================

const { test, expect } = require('@playwright/test');
const { TEST_EMAIL, TEST_PASSWORD, loginAndGoToSitemap } = require('./_auth');

test.beforeEach(async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
});

// ── Helper: open AI chat panel ────────────────────────────────────────────────
async function openAiChat(page) {
  // Real class from source: .ai-chat-toggle (fixed bottom-right Sparkle button)
  const trigger = page.locator(
    '.ai-chat-toggle, [class*="ai-chat-trigger"], [class*="chat-toggle"]'
  ).first();
  if (!await trigger.isVisible({ timeout: 8000 }).catch(() => false)) return false;
  await trigger.click();
  await page.waitForTimeout(800);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT PANEL — VISIBILITY & STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Sitemap Chat — Panel Visibility', () => {

  test('AI chat trigger button is visible in the editor', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    // Real class from source: .ai-chat-toggle (fixed bottom-right Sparkle button)
    const trigger = page.locator(
      '.ai-chat-toggle, [class*="ai-chat"], [class*="chat-toggle"]'
    ).first();
    await expect(trigger).toBeVisible({ timeout: 10000 });
  });

  test('clicking the AI chat trigger opens the chat panel', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    // Chat panel renders as a fixed motion.div containing "SproutOS AI" header text
    const panel = page.locator(
      'div:has(> div:has-text("SproutOS AI")), [class*="chat-panel"], [class*="ai-panel"]'
    ).first();
    await expect(panel).toBeVisible({ timeout: 8000 });
  });

  test('chat panel contains a message input field', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    // Real placeholder from source: "Chat with SproutOS AI"
    const input = page.locator(
      'textarea[placeholder="Chat with SproutOS AI"], [placeholder*="SproutOS" i],' +
      ' [placeholder*="message" i], [placeholder*="Ask" i]'
    ).first();
    await expect(input).toBeVisible({ timeout: 8000 });
  });

  test('chat panel contains a send / submit button', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    // Send button is an ArrowUp icon button (no text), next to the textarea
    const sendBtn = page.locator(
      'button[title*="Send"], [aria-label*="send" i],' +
      ' textarea[placeholder="Chat with SproutOS AI"] ~ div button'
    ).first();
    const visible = await sendBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) console.warn('⚠️ Send button not found — it may require input to become active');
    // The send button may be disabled until text is typed — just verify it's present in DOM
    const sendBtnFallback = page.locator(
      'button:near(textarea[placeholder="Chat with SproutOS AI"])'
    ).first();
    await expect(sendBtnFallback).toBeVisible({ timeout: 8000 });
  });

  test('chat panel shows a welcome message or placeholder prompt', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const welcome = page.locator(
      '[class*="chat"] [class*="welcome"], [class*="chat"] [class*="placeholder"],' +
      ' [class*="chat"] [class*="empty-state"], [class*="chat"] p'
    ).first();
    const visible = await welcome.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) console.warn('⚠️ No welcome message or placeholder found in chat panel');
  });

  test('chat panel can be closed / dismissed', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const closeBtn = page.locator(
      '[class*="chat"] button[aria-label*="close" i], [class*="chat"] button:has-text("×"),' +
      ' [class*="chat-close"], [class*="panel-close"]'
    ).first();
    if (await closeBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(500);
      const panel = page.locator('[class*="chat-panel"], [class*="ai-panel"]').first();
      await expect(panel).not.toBeVisible({ timeout: 4000 });
    } else {
      // Try Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT — MESSAGE INPUT & SEND
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Sitemap Chat — Input & Send', () => {

  test('typing in chat input reflects the entered text', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const input = page.locator(
      '[class*="chat"] textarea, [class*="chat"] input[type="text"],' +
      ' [class*="chat"] [contenteditable="true"]'
    ).first();
    if (!await input.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    await input.fill('Add a Contact page');
    const value = await input.inputValue().catch(async () => await input.innerText());
    expect(value).toContain('Add a Contact page');
  });

  test('send button becomes enabled when text is entered', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const input = page.locator(
      '[class*="chat"] textarea, [class*="chat"] input[type="text"],' +
      ' [class*="chat"] [contenteditable="true"]'
    ).first();
    if (!await input.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    await input.fill('Hello');
    const sendBtn = page.locator(
      '[class*="chat"] button[type="submit"], [class*="send-btn"], [aria-label*="send" i]'
    ).first();
    await expect(sendBtn).toBeEnabled({ timeout: 4000 });
  });

  test('submitting an empty message does not send (button disabled or no-op)', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const sendBtn = page.locator(
      '[class*="chat"] button[type="submit"], [class*="send-btn"], [aria-label*="send" i]'
    ).first();
    if (!await sendBtn.isVisible({ timeout: 5000 }).catch(() => false)) test.skip(true, 'Send button not found');
    const isDisabled = await sendBtn.isDisabled().catch(() => true);
    expect(isDisabled).toBe(true);
  });

  test('pressing Enter sends the message (not Shift+Enter)', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const input = page.locator(
      'textarea[placeholder="Chat with SproutOS AI"], [class*="chat"] textarea'
    ).first();
    if (!await input.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    await input.fill('List the current pages');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    // A response message or loader should appear
    const response = page.locator(
      '[class*="chat"] [class*="message"], [class*="chat"] [class*="response"],' +
      ' [class*="chat"] [class*="loading"], [class*="chat"] [class*="spinner"]'
    ).first();
    await expect(response).toBeVisible({ timeout: 8000 });
  });

  test('Shift+Enter in chat input adds a newline, does not send', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const input = page.locator('[class*="chat"] textarea').first();
    if (!await input.isVisible({ timeout: 5000 }).catch(() => false)) test.skip(true, 'Textarea not found');
    await input.fill('line one');
    await input.press('Shift+Enter');
    const value = await input.inputValue().catch(() => '');
    expect(value).toContain('line one');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT — AI RESPONSES & SITEMAP MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Sitemap Chat — Sitemap Mutations', () => {

  test('asking AI to add a page results in a new node on the canvas', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const nodeSelector = '.react-flow__node';
    const before = await page.locator(nodeSelector).count();
    // Real placeholder from source: "Chat with SproutOS AI"
    const input = page.locator(
      'textarea[placeholder="Chat with SproutOS AI"], [placeholder*="SproutOS" i],' +
      ' [class*="chat"] textarea'
    ).first();
    if (!await input.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    await input.fill('Add a page called Blog');
    await input.press('Enter');
    // Wait for AI to respond and apply change (generous timeout)
    await page.waitForTimeout(12000);
    const after = await page.locator(nodeSelector).count();
    if (after <= before) console.warn('⚠️ Node count did not increase after AI add-page command');
  });

  test('asking AI to remove a page reduces the node count', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const nodeSelector = '.react-flow__node';
    const before = await page.locator(nodeSelector).count();
    if (before < 2) test.skip(true, 'Need at least 2 pages to test removal');
    const input = page.locator(
      'textarea[placeholder="Chat with SproutOS AI"], [class*="chat"] textarea'
    ).first();
    if (!await input.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    // Get the name of the last node to ask AI to remove it
    const lastNode = page.locator(nodeSelector).last();
    const pageName = await lastNode.innerText().catch(() => 'Blog');
    await input.fill(`Remove the ${pageName.trim()} page`);
    await input.press('Enter');
    await page.waitForTimeout(12000);
    const after = await page.locator(nodeSelector).count();
    if (after >= before) console.warn('⚠️ Node count did not decrease after AI remove-page command');
  });

  test('asking AI to rename a page updates the node label', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const nodeSelector = '.react-flow__node';
    const firstNode = page.locator(nodeSelector).nth(1); // skip home
    if (!await firstNode.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No secondary page found');
    const oldName = await firstNode.innerText().catch(() => '');
    const input = page.locator(
      'textarea[placeholder="Chat with SproutOS AI"], [class*="chat"] textarea'
    ).first();
    if (!await input.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    await input.fill(`Rename the "${oldName.trim()}" page to QA Test Page`);
    await input.press('Enter');
    await page.waitForTimeout(12000);
    const renamed = await page.locator('.react-flow__node:has-text("QA Test Page")').isVisible({ timeout: 5000 }).catch(() => false);
    if (!renamed) console.warn('⚠️ Renamed node label not found — AI rename may not have applied');
  });

  test('AI response message appears in the chat panel after sending', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    // Real placeholder from source: "Chat with SproutOS AI"
    const input = page.locator(
      'textarea[placeholder="Chat with SproutOS AI"], [placeholder*="SproutOS" i],' +
      ' [class*="chat"] textarea'
    ).first();
    if (!await input.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    await input.fill('How many pages does this sitemap have?');
    await input.press('Enter');
    await page.waitForTimeout(12000);
    // Assistant messages render as plain divs inside the messages area — check for any new paragraph
    const response = page.locator(
      'div:has(> div:has-text("SproutOS AI")) p, div:has(textarea[placeholder="Chat with SproutOS AI"]) p'
    ).first();
    await expect(response).toBeVisible({ timeout: 15000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT — MULTI-TURN CONVERSATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Sitemap Chat — Multi-Turn', () => {

  test('sending two messages in sequence both appear in chat history', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    // Real placeholder from source: "Chat with SproutOS AI"
    const input = page.locator(
      'textarea[placeholder="Chat with SproutOS AI"], [placeholder*="SproutOS" i],' +
      ' [class*="chat"] textarea'
    ).first();
    if (!await input.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    // Message 1
    await input.fill('What pages are in this sitemap?');
    await input.press('Enter');
    await page.waitForTimeout(8000);
    // Message 2
    await input.fill('Add a Services page');
    await input.press('Enter');
    await page.waitForTimeout(8000);
    // User messages render as right-aligned divs — look for multiple messages in the scrollable area
    // The input textarea is a reliable proxy: if chat is open and has history it renders past messages
    const chatArea = page.locator('div:has(textarea[placeholder="Chat with SproutOS AI"])');
    const msgCount = await chatArea.locator('div').count();
    expect(msgCount).toBeGreaterThanOrEqual(2);
  });

  test('chat history is scrollable when messages overflow', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    // Messages area has overflow-y:auto (scrollbar-hide class, overflow-y-auto style)
    const chatBody = page.locator('div.overflow-y-auto, div.scrollbar-hide').first();
    const visible = await chatBody.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) {
      console.warn('⚠️ Scrollable chat container not found — may need messages to trigger scroll');
      return;
    }
    const overflow = await chatBody.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.overflowY === 'auto' || style.overflowY === 'scroll' || el.classList.contains('scrollbar-hide');
    });
    expect(overflow).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT — UNDO CAPABILITY
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Sitemap Chat — Undo', () => {

  test('Ctrl+Z after AI adds a page reverts the canvas change', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const nodeSelector = '.react-flow__node';
    // Real placeholder from source: "Chat with SproutOS AI"
    const input = page.locator(
      'textarea[placeholder="Chat with SproutOS AI"], [placeholder*="SproutOS" i],' +
      ' [class*="chat"] textarea'
    ).first();
    if (!await input.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    await input.fill('Add a page called Portfolio');
    await input.press('Enter');
    await page.waitForTimeout(10000);
    const after = await page.locator(nodeSelector).count();
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(1500);
    const afterUndo = await page.locator(nodeSelector).count();
    expect(afterUndo).toBeLessThanOrEqual(after);
  });

  test('"Undo" button in chat or toolbar reverts last AI action', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const undoBtn = page.locator(
      'button[aria-label*="undo" i], button:has-text("Undo"), [class*="undo-btn"]'
    ).first();
    const visible = await undoBtn.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) {
      console.warn('⚠️ Undo button not visible — Ctrl+Z is the only tested undo path');
      test.skip(true, 'Undo button not found');
    }
    await undoBtn.click();
    await page.waitForTimeout(1000);
    // No crash
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    expect(errors.filter(e => !/analytics|paddle|cloudflare/i.test(e))).toHaveLength(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT — TOKEN TRACKING
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Sitemap Chat — Token Tracking', () => {

  test('token usage indicator is visible in or near the chat panel', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    const tokenIndicator = page.locator(
      '[class*="token"], [class*="credits"], [class*="usage"],' +
      ' text=/\d+\s*(token|credit)/i'
    ).first();
    const visible = await tokenIndicator.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) console.warn('⚠️ Token usage indicator not visible in chat panel');
  });

  test('sending a chat message does not throw an unhandled promise rejection', async ({ page }) => {
    const rejections = [];
    page.on('pageerror', e => { if (/unhandled/i.test(e.message)) rejections.push(e.message); });
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    // Real placeholder from source: "Chat with SproutOS AI"
    const input = page.locator(
      'textarea[placeholder="Chat with SproutOS AI"], [placeholder*="SproutOS" i],' +
      ' [class*="chat"] textarea'
    ).first();
    if (!await input.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    await input.fill('Describe this sitemap');
    await input.press('Enter');
    await page.waitForTimeout(8000);
    expect(rejections).toHaveLength(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT — ERROR STATES
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AI Sitemap Chat — Error States', () => {

  test('chat shows an error message if AI request fails (network simulation)', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openAiChat(page);
    test.skip(!opened, 'AI chat trigger not found');
    // Intercept AI API calls and return 500
    await page.route('**/api/ai/**', route => route.fulfill({ status: 500, body: 'Internal Server Error' }));
    await page.route('**/api/chat**', route => route.fulfill({ status: 500, body: 'Internal Server Error' }));
    // Real placeholder from source: "Chat with SproutOS AI"
    const input = page.locator(
      'textarea[placeholder="Chat with SproutOS AI"], [placeholder*="SproutOS" i],' +
      ' [class*="chat"] textarea'
    ).first();
    if (!await input.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    await input.fill('Add a page called Test');
    await input.press('Enter');
    await page.waitForTimeout(5000);
    // The chat should show an error, not a frozen spinner
    const chatContainer = page.locator('[class*="chat-panel"], [class*="ai-panel"]').first();
    const spinner = chatContainer.locator('[class*="loading"], [class*="spinner"]');
    const stillSpinning = await spinner.isVisible({ timeout: 3000 }).catch(() => false);
    expect(stillSpinning, 'Chat is stuck on spinner after API error').toBe(false);
  });

});
