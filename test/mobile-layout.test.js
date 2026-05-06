const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const css = fs.readFileSync('styles.css','utf8').replace(/\s+/g,' ');

test('mobile overflow guard css exists',()=>{
  assert.match(css,/\*,\*::before,\*::after\{[^}]*box-sizing:border-box/);
  assert.match(css,/html,body\{[^}]*max-width:100%[^}]*overflow-x:hidden/);
  assert.match(css,/main,.page,.card,.panel,.tool,.result-box,.field,.grid,input,select,button,table,.table-wrap,.sub,.note\{max-width:100%;min-width:0;box-sizing:border-box\}/);
  assert.match(css,/@media \(max-width:640px\)\{[^]*\.grid,.grid.two,.grid.three\{grid-template-columns:1fr;width:100%\}/);
});
