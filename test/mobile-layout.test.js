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


test('dc page has single D section and includes C-1 total power analysis',()=>{
  const dMatches = appJs.match(/D\. 建議配置/g) || [];
  assert.equal(dMatches.length, 1);
  assert.ok(appJs.includes('C-1. 總用電分析'));
  ['IT + UPS 損耗','空調總用電','其他輔助用電','合計用電容量','合計電流'].forEach((label)=>{
    assert.ok(appJs.includes(label));
  });
});

test('dc result section order is A, B, C, C-1, D, E, F, G',()=>{
  const idx = (token)=>appJs.indexOf(token);
  const order = [
    "A. 機房空間",
    "B. 散熱評估",
    "C. 預估用電容量 / NFB 估算",
    "C-1. 總用電分析",
    "D. 建議配置",
    "E. 散熱比例圖",
    "F. 總用電比例圖",
    "G. 理論 PUE"
  ].map((token)=>idx(token));
  order.forEach((pos)=>assert.notEqual(pos, -1));
  for(let i=1;i<order.length;i+=1){
    assert.ok(order[i-1] < order[i]);
  }
});
