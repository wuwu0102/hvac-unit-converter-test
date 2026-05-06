# Project Architecture

This project is an HVAC / Data Center Engineering Toolkit, not just a unit converter.

## Goals

- Provide practical HVAC and data center engineering calculations.
- Keep formulas transparent and maintainable.
- Support mobile-first usage.
- Make future AI-assisted development safer and more consistent.

## Suggested Structure

src/
  components/
    common/
    calculators/
  data/
    pipeSizes.ts or pipeSizes.js
  utils/
    engineering/
      pressure.ts or pressure.js
      flow.ts or flow.js
      velocity.ts or velocity.js
      units.ts or units.js
  pages/
  styles/
docs/
scripts/

## Separation Rules

- UI components should display and collect data.
- Calculation utilities should perform formulas.
- Data files should store engineering lookup tables.
- Pages should compose UI and utilities.
- Scripts should validate calculations or deployment.

## Current Priority

1. Make existing tools stable.
2. Improve engineering credibility.
3. Add controlled engineering inputs.
4. Add validation and warnings.
5. Avoid expanding too many features before the structure is stable.
