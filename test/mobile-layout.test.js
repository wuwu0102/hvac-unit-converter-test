const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const appJs = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

const normalize = (text) => text.replace(/\s+/g, ' ');
const cssFlat = normalize(css);

test('mobile layout smoke test: global overflow guard exists', () => {
  assert.match(cssFlat, /html,body\{max-width:100%;overflow-x:hidden\}/);
  assert.match(cssFlat, /\*,\*::before,\*::after\{[^}]*box-sizing:border-box[^}]*max-width:100%[^}]*min-width:0[^}]*overflow-wrap:anywhere[^}]*word-break:break-word/);
});

test('mobile layout smoke test: key containers are width constrained', () => {
  assert.match(cssFlat, /main,.page,.shell,.tool-card,.card,.result-box,.sub,.field,input,select,textarea,button,table,.table-wrap\{max-width:100%;min-width:0\}/);
  assert.match(cssFlat, /@media \(max-width:640px\)\{[^}]*body\{padding:max\(8px,env\(safe-area-inset-top\)\) 8px max\(8px,env\(safe-area-inset-bottom\)\)\}/);
  assert.ok(cssFlat.includes('.card-grid,.grid.two,.grid.three{grid-template-columns:minmax(0,1fr)}'));

});

test('mobile layout smoke test: pipe page overflow-prone strings remain wrappable', () => {
  assert.ok(appJs.includes("依設計流量（LPM）建議管徑與流速。"));
  assert.ok(appJs.includes('超出表內管徑，請分管或加大管徑。'));
  assert.match(cssFlat, /\.sub\{display:block;color:var\(--muted\)\}/);
  assert.match(cssFlat, /\.result-box\{display:block;width:100%/);
});

test('mobile layout smoke test: all tool pages still exist and pipe supports 5000 LPM input flow path', () => {
  const requiredTools = ['temp','flow','press','vel','punit','pipe','dp','vent','cool','air','dc','heat','power','dc3','kwi','tpow','spow','feedback'];
  for (const tool of requiredTools) {
    assert.ok(appJs.includes(`if(id==='${tool}')`) || appJs.includes(`includes(id)`), `missing tool handler: ${tool}`);
  }
  assert.ok(appJs.includes("const lpm=parseNumber(qLpm.value);"));
  assert.ok(appJs.includes("if(!best){r.innerHTML='超出表內管徑，請分管或加大管徑。';return;}"));
});
