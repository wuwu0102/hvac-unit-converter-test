const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const css = fs.readFileSync('styles.css','utf8').replace(/\s+/g,' ');
const appJs = fs.readFileSync('app.js','utf8');

test('mobile overflow guard css exists',()=>{
  assert.match(css,/html,body\{[^}]*width:100%[^}]*max-width:100%[^}]*overflow-x:clip/);
  assert.match(css,/\.shell\{[^}]*width:min\(100%,1100px\)[^}]*max-width:100%/);
  assert.match(css,/\.tool-card\{[^}]*width:100%[^}]*max-width:100%[^}]*overflow-x:clip/);
  assert.match(css,/input,select,textarea\{[^}]*width:100%[^}]*max-width:100%[^}]*min-width:0/);
  assert.match(css,/@media \(max-width:640px\)\{[^]*\.grid,.grid.two,.grid.three\{grid-template-columns:minmax\(0,1fr\);width:100%\}/);
});

test('no known overflow anti-patterns',()=>{
  assert.ok(!css.includes('width:max-content'));
  assert.ok(!css.includes('width:min-content'));
  assert.ok(!css.includes('white-space:nowrap'));
});

test('pipe and dp pages keep wrapped long Chinese text',()=>{
  assert.ok(appJs.includes('超出表內管徑，請分管或加大管徑。'));
  assert.ok(appJs.includes('壓差估算流量'));
});
