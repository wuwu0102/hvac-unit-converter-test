const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const indexHtml = read('index.html');
const appJs = read('app.js');

test('版本更新為 Web V0.28', () => {
  assert.ok(indexHtml.includes('Web V0.28'));
});

test('首頁為工具入口架構，不是只有 A-F 純文字總覽', () => {
  assert.ok(indexHtml.includes('data-group="A"'));
  assert.ok(indexHtml.includes('data-group="F"'));
  assert.ok(appJs.includes('function renderHome()'));
  assert.ok(appJs.includes('class="entry"'));
  assert.ok(appJs.includes('openTool(e.dataset.id)'));
});

test('首頁工具設定包含多個可點擊入口，且包含壓差估算流量', () => {
  const toolDefs = [...appJs.matchAll(/\['([^']+)'\s*,\s*'([A-F])'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\]/g)];
  assert.ok(toolDefs.length >= 8, `工具入口數量不足: ${toolDefs.length}`);
  const labels = toolDefs.map((m) => m[3]);
  assert.ok(labels.includes('基礎單位換算') || labels.includes('溫度換算'));
  assert.ok(labels.includes('風量估算'));
  assert.ok(labels.includes('機房散熱評估'));
  assert.ok(labels.includes('預估耗電量'));
  assert.ok(labels.includes('壓差估算流量'));
});

test('壓差估算流量入口會開啟對應標題頁面', () => {
  assert.ok(appJs.includes("if(id==='dp'){panel('壓差估算流量'"));
  assert.ok(!appJs.includes('壓差估算流量（設備修正）'));
});

test('首頁不應退化為純靜態分類 fallback', () => {
  assert.ok(!appJs.includes('首頁 fallback'));
  assert.ok(appJs.includes('renderHome();'));
});
