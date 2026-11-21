import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test.describe.serial('CF-903 learning and lab journey', () => {
  let context: BrowserContext;
  let page: Page;
  let targetIp: string;
  let terminalOutput = '';

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    page.on('websocket', (socket) => {
      if (!socket.url().endsWith('/rooms/cf903-e2e-lab/terminal')) return;
      socket.on('framereceived', ({ payload }) => {
        terminalOutput += payload.toString();
      });
    });
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test('registers with zero EXP and Novice rank', async () => {
    const suffix = randomUUID().slice(0, 12);
    await page.goto('/register');
    await page.getByLabel('Email').fill(`e2e-${suffix}@example.test`);
    await page.getByLabel('Tên người dùng').fill(`e2e_${suffix}`);
    await page.locator('input[name="password"]').fill('E2ePassword123!');
    await page
      .getByRole('button', { name: /tạo tài khoản/i })
      .last()
      .click();
    await expect(page).toHaveURL(/\/$/);
    await page.getByRole('button', { name: 'Tài khoản' }).click();
    await expect(page.getByText(/Novice · 0 EXP ·/)).toBeVisible();
  });

  test('starts a real lab and receives its IP', async () => {
    await page.goto('/rooms/cf903-e2e-lab');
    await expect(page.getByRole('heading', { name: 'CF-903 E2E Lab' })).toBeVisible();
    const startedAt = Date.now();
    await page.getByRole('button', { name: 'Khởi chạy máy lab' }).click();
    const target = page.getByText(/Target: /);
    await expect(target).toBeVisible();
    const text = await target.textContent();
    targetIp = text?.match(/Target: (\d{1,3}(?:\.\d{1,3}){3})/)?.[1] ?? '';
    expect(targetIp).toMatch(/^\d{1,3}(?:\.\d{1,3}){3}$/);
    expect(Date.now() - startedAt).toBeLessThan(3000);
  });

  test('runs a command through the real Web Terminal sidecar', async () => {
    const terminal = page.getByRole('region', { name: 'Terminal lab' });
    await expect(terminal.getByRole('status')).toHaveText('Đã kết nối');
    await terminal.locator('.xterm-screen').click();
    await page.keyboard.type(`wget -qO- http://${targetIp}:8080/flag.txt`);
    await page.keyboard.press('Enter');
    await expect.poll(() => terminalOutput).toContain('CF{e2e_lab_verified}');
  });

  test('submits the flag and earns EXP and day-one streak', async () => {
    await page.getByLabel('Câu 1: What is the flag?').fill('CF{e2e_lab_verified}');
    await page.getByRole('button', { name: 'Nộp đáp án' }).click();
    await expect(page.getByText('Chính xác! +50 EXP')).toBeVisible();
    await page.getByRole('button', { name: 'Tài khoản' }).click();
    await expect(page.getByText(/Novice · 50 EXP ·.*1 ngày liên tiếp/)).toBeVisible();
  });
});
