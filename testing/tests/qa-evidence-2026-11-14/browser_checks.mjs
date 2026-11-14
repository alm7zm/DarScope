import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, openSync, closeSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from './browser/node_modules/playwright/index.mjs';

const root = process.cwd();
const runtime = resolve('browser/runtime');
const history = [];
const errors = [];
mkdirSync(runtime, { recursive: true });
function start(program, args, cwd, name) {
  const log = openSync(resolve('evidence', name), 'w');
  const child = spawn(program, args, { cwd, stdio: ['ignore', log, log] });
  closeSync(log);
  return child;
}
async function up(url) {
  for (let i = 0; i < 130; i++) {
    try { if ((await fetch(url, { signal: AbortSignal.timeout(900) })).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error('Readiness timed out: ' + url);
}
async function stop(child) {
  if (child.exitCode === null && child.signalCode === null) {
    await new Promise(resolve => { child.once('exit', resolve); child.kill('SIGTERM'); });
  }
}
async function check(name, test) {
  try { await test(); history.push({ name, status: 'PASS' }); }
  catch (error) { history.push({ name, status: 'FAIL', detail: error.message }); }
  console.log(history.at(-1));
}
const jdk = execFileSync('/usr/libexec/java_home', ['-v', '21'], { encoding: 'utf8' }).trim();
const jar = resolve('project/backend/target/darscope-0.0.1-SNAPSHOT.jar');
const spring = start(jdk + '/bin/java', ['-Djava.io.tmpdir=' + resolve('tmp'), '-jar', jar,
  '--server.address=127.0.0.1'], runtime, 'browser-spring.log');
const web = start(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1',
  '--port', '5173', '--strictPort'], resolve('project/frontend'), 'browser-vite.log');
let browser;
try {
  const origin = 'http://127.0.0.1:5173';
  await Promise.all([up(origin), up('http://127.0.0.1:8080/api/v1/properties?size=1')]);
  browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true, args: ['--disable-crash-reporter', '--disable-breakpad'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(5500);
  page.on('pageerror', error => errors.push(String(error)));
  const title = name => page.getByRole('heading', { name, level: 1 });
  const field = label => {
    const literal = label.split('').map(c => '^$.*+?()[]{}|'.includes(c) ? String.fromCharCode(92) + c : c).join('');
    return page.getByLabel(new RegExp('^' + literal + '(.*required.*)?$','i'));
  };
  const props = '/api/v1/properties';
  await check('Dashboard and server-driven pagination through the Vite proxy', async () => {
    await page.goto(origin);
    await title('Dashboard').waitFor();
    await page.getByRole('link', { name: 'Properties', exact: true }).first().click();
    await title('Properties').waitFor();
    await field('Per page').selectOption('5');
    await page.getByText('Page 1 of 2').waitFor();
    assert.equal(await page.getByRole('row').count(), 6);
    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().includes(props + '?page=1&size=5')),
      page.getByRole('button', { name: 'Next', exact: true }).click(),
    ]);
    assert.equal(response.status(), 200);
    await page.getByText('Page 2 of 2').waitFor();
    assert.equal(await page.getByRole('row').count(), 4);
  });
  await check('Search matches Arabic seed district and opens a real by-ID route', async () => {
    await page.goto(origin + '/properties');
    const query = field('Search properties');
    await query.fill('النرجس');
    await query.press('Enter');
    const row = page.getByRole('rowheader', { name: 'RP-0002' });
    await row.waitFor();
    await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 1);
    const detail = page.waitForResponse(r => r.url().endsWith(props + '/2'));
    const link = row.getByRole('link');
    if (await link.count()) await link.click(); else await row.locator('..').getByRole('link').first().click();
    assert.equal((await detail).status(), 200);
    await title(/النرجس/).waitFor();
  });
  await check('Browser creates, reloads, edits and deletes a property', async () => {
    await page.goto(origin + '/properties/new');
    await field('City').selectOption('Riyadh');
    await field('District').selectOption('Al Malqa');
    await field('Size (m²)').fill('400');
    for (const [name,value] of [['Age (years)','3'],['Bedrooms','5'],['Bathrooms','4'],['Living rooms','2']]) {
      await field(name).selectOption(value);
    }
    await field('Yearly rent (SAR)').fill('120000');
    const [created] = await Promise.all([
      page.waitForResponse(r => r.url().endsWith(props) && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Save', exact: true }).click(),
    ]);
    assert.equal(created.status(), 201);
    const row = await created.json();
    await title(/Villa in Al Malqa/).waitFor();
    await page.reload();
    await title(/Villa in Al Malqa/).waitFor();
    await page.getByRole('link', { name: 'Edit', exact: true }).click();
    await field('Yearly rent (SAR)').fill('135000');
    const [updated] = await Promise.all([
      page.waitForResponse(r => r.url().endsWith(props + '/' + row.id) && r.request().method() === 'PUT'),
      page.getByRole('button', { name: 'Save', exact: true }).click(),
    ]);
    assert.equal(updated.status(), 200);
    const saved = await updated.json();
    assert.equal(saved.yearlyRentSar, 135000);
    assert.equal(saved.createdAt, row.createdAt);
    assert.notEqual(saved.updatedAt, row.updatedAt);
    await title(/Villa in Al Malqa/).waitFor();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const [removed] = await Promise.all([
      page.waitForResponse(r => r.url().endsWith(props + '/' + row.id) && r.request().method() === 'DELETE'),
      dialog.getByRole('button', { name: 'Delete', exact: true }).click(),
    ]);
    assert.equal(removed.status(), 204);
    await title('Properties').waitFor();
    await page.goto(origin + '/properties/RP-' + String(row.id).padStart(4, '0'));
    await title('Property not found').waitFor();
  });
  await check('About page at mobile width and standalone unknown-property URL', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin + '/about');
    await title('About').waitFor();
    await page.getByRole('heading', { name: 'Team' }).waitFor();
    await page.goto(origin + '/properties/RP-9999');
    await title('Property not found').waitFor();
  });
  await check('Backend outage shows a message through the still-running frontend', async () => {
    await stop(spring);
    await page.goto(origin + '/properties');
    await page.getByText(/server could not be reached/i).first().waitFor();
  });
  await check('No uncaught JavaScript errors in browser journeys', () => assert.deepEqual(errors, []));
} catch (error) {
  history.push({ name: 'Browser environment', status: 'BLOCKED', detail: error.message });
  console.error(error.message);
} finally {
  if (browser) await browser.close();
  await Promise.all([stop(spring), stop(web)]);
  writeFileSync(resolve('evidence/browser-checks.json'), JSON.stringify(history, null, 2) + '\n');
}
