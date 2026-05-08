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
});

test('mobile readable layout test @390x844 rules exist',()=>{
  assert.match(css,/@media \(max-width:640px\)\{[^]*body\{[^}]*font-size:22px[^}]*line-height:1\.6/);
  assert.match(css,/@media \(max-width:640px\)\{[^]*input,select,button\{[^}]*font-size:1\.3rem[^}]*min-height:58px/);
  assert.match(css,/@media \(max-width:640px\)\{[^]*\.entry\{[^}]*min-height:56px/);
});

test('mobile no horizontal overflow protections for key pages',()=>{
  assert.match(css,/html,body\{[^}]*overflow-x:clip/);
  assert.match(css,/@media \(max-width:640px\)\{[^]*\.card-grid,.grid,.grid.two,.grid.three\{grid-template-columns:minmax\(0,1fr\);width:100%\}/);
  assert.match(css,/@media \(max-width:640px\)\{[^]*\.table-wrap\{overflow-x:clip\}/);
  assert.match(css,/@media \(max-width:640px\)\{[^]*table\.mobile-hide\{display:none\}/);
});

test('mobile table replacement uses result cards on dc page',()=>{
  assert.ok(appJs.includes('renderMobileResultCards'));
  assert.ok(appJs.includes("<table class='mobile-hide'>"));
  assert.ok(appJs.includes("class='mobile-result-list'"));
});

test('desktop table remains available',()=>{
  assert.ok(css.includes('.mobile-result-list{display:none}'));
  assert.ok(css.includes('table{width:100%;border-collapse:collapse'));
});

test('dc page includes section navigation anchors',()=>{
  assert.ok(appJs.includes("class='dc-nav'"));
  assert.ok(appJs.includes("href='#dc-space'"));
  assert.ok(appJs.includes("href='#dc-heat'"));
  assert.ok(appJs.includes("href='#dc-power'"));
  assert.ok(appJs.includes("href='#dc-advice'"));
  assert.ok(appJs.includes("href='#dc-chart'"));
  assert.ok(appJs.includes("href='#dc-pue'"));
});
