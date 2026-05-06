# Release Checklist

Before each release:

## Functional Check

- [ ] Existing calculator pages still open.
- [ ] Unit conversion results are correct.
- [ ] No result displays NaN, Infinity, or undefined.
- [ ] Pressure conversion works for Pa, kPa, bar, and mH2O.
- [ ] Flow calculations show units.
- [ ] Velocity checks show m/s.

## Mobile Check

- [ ] iPhone Safari layout is readable.
- [ ] Keyboard does not hide important results.
- [ ] Dropdowns work on mobile.
- [ ] Result cards do not overflow.
- [ ] Text does not overlap.

## Engineering Check

- [ ] Estimated values are labeled as estimated.
- [ ] Engineering warnings are shown when values are outside recommended ranges.
- [ ] Formulas are documented.
- [ ] Constants are not hidden inside UI components.

## Deployment Check

- [ ] npm install succeeds.
- [ ] npm run build succeeds.
- [ ] GitHub Pages deployment is not broken.
- [ ] README is updated if user-facing behavior changed.
