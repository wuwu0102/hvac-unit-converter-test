const conversionMap = {
  temp: {
    toBase(value, fromUnit) {
      return fromUnit === 'C' ? value : (value - 32) * (5 / 9);
    },
    fromBase(value, toUnit) {
      return toUnit === 'C' ? value : value * (9 / 5) + 32;
    }
  },
  airflow: {
    toBase(value, fromUnit) {
      const toM3s = {
        CFM: 0.000471947,
        CMH: 1 / 3600,
        'm3/s': 1,
        'L/s': 0.001,
        LPM: 1 / 60000,
        CMM: 1 / 60
      };
      return value * toM3s[fromUnit];
    },
    fromBase(value, toUnit) {
      const fromM3s = {
        CFM: 1 / 0.000471947,
        CMH: 3600,
        'm3/s': 1,
        'L/s': 1000,
        LPM: 60000,
        CMM: 60
      };
      return value * fromM3s[toUnit];
    }
  },
  pressure: {
    toBase(value, fromUnit) {
      const toPa = {
        Pa: 1,
        kPa: 1000,
        mmAq: 9.80665,
        bar: 100000,
        psi: 6894.76,
        'N/m2': 1
      };
      return value * toPa[fromUnit];
    },
    fromBase(value, toUnit) {
      const fromPa = {
        Pa: 1,
        kPa: 1 / 1000,
        mmAq: 1 / 9.80665,
        bar: 1 / 100000,
        psi: 1 / 6894.76,
        'N/m2': 1
      };
      return value * fromPa[toUnit];
    }
  },
  velocity: {
    toBase(value, fromUnit) {
      const toMs = {
        'm/s': 1,
        'ft/s': 1 / 3.28084,
        'mm/s': 1 / 1000,
        'cm/s': 1 / 100
      };
      return value * toMs[fromUnit];
    },
    fromBase(value, toUnit) {
      const fromMs = {
        'm/s': 1,
        'ft/s': 3.28084,
        'mm/s': 1000,
        'cm/s': 100
      };
      return value * fromMs[toUnit];
    }
  },
  'electrical-conversion': {
    toBase(value, fromUnit) {
      const toW = {
        W: 1,
        kW: 1000,
        MW: 1000000,
        HP: 745.7
      };
      return value * toW[fromUnit];
    },
    fromBase(value, toUnit) {
      const fromW = {
        W: 1,
        kW: 1 / 1000,
        MW: 1 / 1000000,
        HP: 1 / 745.7
      };
      return value * fromW[toUnit];
    }
  }
};

const unitMap = {
  airflow: ['CFM', 'CMH', 'm3/s', 'L/s', 'LPM', 'CMM'],
  pressure: ['Pa', 'kPa', 'mmAq', 'bar', 'psi', 'N/m2'],
  velocity: ['m/s', 'ft/s', 'mm/s', 'cm/s'],
  'electrical-conversion': ['W', 'kW', 'MW', 'HP']
};

const dpToPaMap = {
  kPa: 1000,
  mAq: 9806.65,
  bar: 100000,
  psi: 6894.76
};

const pipeSizeList = [
  { a: '15A', inchDn: '1/2" / DN15', innerDiameterMm: 15.8 },
  { a: '20A', inchDn: '3/4" / DN20', innerDiameterMm: 20.9 },
  { a: '25A', inchDn: '1" / DN25', innerDiameterMm: 26.6 },
  { a: '32A', inchDn: '1-1/4" / DN32', innerDiameterMm: 35.1 },
  { a: '40A', inchDn: '1-1/2" / DN40', innerDiameterMm: 40.9 },
  { a: '50A', inchDn: '2" / DN50', innerDiameterMm: 52.5 },
  { a: '65A', inchDn: '2-1/2" / DN65', innerDiameterMm: 62.7 },
  { a: '80A', inchDn: '3" / DN80', innerDiameterMm: 77.9 },
  { a: '100A', inchDn: '4" / DN100', innerDiameterMm: 102.3 },
  { a: '125A', inchDn: '5" / DN125', innerDiameterMm: 128.2 },
  { a: '150A', inchDn: '6" / DN150', innerDiameterMm: 154.1 }
];

function formatNumber(value) {
  return Number.isFinite(value) ? value.toFixed(4) : '-';
}

function parsePf(rawPf, defaultPf) {
  const pf = Number(rawPf ?? '');
  if (!Number.isFinite(pf) || pf <= 0) return defaultPf;
  if (pf > 1) return 1;
  return pf;
}

function renderList(resultList, units, textByUnit) {
  resultList.innerHTML = units
    .map((unit) => `<li class="result-row"><span class="result-unit">${unit}</span><span class="result-colon">:</span><span class="result-value">${textByUnit(unit)}</span></li>`)
    .join('');
}

function updateResultRow(container, keyClass, valueClass, label, value) {
  const rows = Array.from(container.querySelectorAll('li'));
  const row = rows.find((item) => item.querySelector(`.${keyClass}`)?.textContent.trim() === label);
  const valueEl = row?.querySelector(`.${valueClass}`);
  if (valueEl) {
    valueEl.textContent = value;
  }
}

function getPipe(pipeA) {
  return pipeSizeList.find((item) => item.a === pipeA);
}

function getPipeAreaM2(pipe) {
  const diameterM = pipe.innerDiameterMm / 1000;
  return Math.PI * (diameterM ** 2) / 4;
}

function initializePipeSuggestCard(card) {
  const flowInput = card.querySelector('[data-role="pipe-flow"]');
  const result = card.querySelector('[data-role="pipe-result"]');
  if (!flowInput || !result) return false;

  function reset() {
    updateResultRow(result, 'dp-key', 'dp-value', '建議管徑', '-');
    updateResultRow(result, 'dp-key', 'dp-value', '參考流速（m/s）', '-');
  }

  function update() {
    const raw = flowInput.value ?? '';
    if (raw.trim() === '') return reset();

    const flowLpm = Number(raw);
    if (!Number.isFinite(flowLpm) || flowLpm <= 0) return reset();

    const flowM3s = flowLpm / 60000;
    const candidate = pipeSizeList.find((pipe) => {
      const velocity = flowM3s / getPipeAreaM2(pipe);
      const limit = Number.parseInt(pipe.a, 10) <= 40 ? 1.2 : 3.0;
      return velocity <= limit;
    }) || pipeSizeList[pipeSizeList.length - 1];

    const velocity = flowM3s / getPipeAreaM2(candidate);
    updateResultRow(result, 'dp-key', 'dp-value', '建議管徑', `${candidate.a} / ${candidate.inchDn}`);
    updateResultRow(result, 'dp-key', 'dp-value', '參考流速（m/s）', formatNumber(velocity));
  }

  flowInput.addEventListener('input', update);
  update();
  return true;
}

function initializeDpFlowCard(card) {
  const measuredInput = card.querySelector('[data-role="dp-measured"]');
  const measuredUnit = card.querySelector('[data-role="dp-measured-unit"]');
  const pipeSelect = card.querySelector('[data-role="dp-pipe-size"]');
  const refFlowInput = card.querySelector('[data-role="dp-ref-flow"]');
  const refLossInput = card.querySelector('[data-role="dp-ref-loss"]');
  const refLossUnit = card.querySelector('[data-role="dp-ref-loss-unit"]');
  const result = card.querySelector('[data-role="dp-result"]');

  if (!measuredInput || !measuredUnit || !pipeSelect || !refFlowInput || !refLossInput || !refLossUnit || !result) return false;

  function reset() {
    updateResultRow(result, 'dp-key', 'dp-value', '預估流量（LPM）', '-');
  }

  function update() {
    const rawMeasured = measuredInput.value ?? '';
    if (rawMeasured.trim() === '') return reset();

    const measured = Number(rawMeasured);
    const refFlow = Number(refFlowInput.value ?? '');
    const refLoss = Number(refLossInput.value ?? '');
    const pipe = getPipe(pipeSelect.value);

    if (!Number.isFinite(measured) || measured <= 0 || !Number.isFinite(refFlow) || refFlow <= 0 || !Number.isFinite(refLoss) || refLoss <= 0 || !pipe) {
      return reset();
    }

    const measuredPa = measured * dpToPaMap[measuredUnit.value];
    const refDpPa = refLoss * dpToPaMap[refLossUnit.value];
    if (!Number.isFinite(measuredPa) || !Number.isFinite(refDpPa) || measuredPa <= 0 || refDpPa <= 0) {
      return reset();
    }

    const correctedFlowLpm = refFlow * Math.sqrt(measuredPa / refDpPa);
    updateResultRow(result, 'dp-key', 'dp-value', '預估流量（LPM）', formatNumber(correctedFlowLpm));
  }

  [measuredInput, measuredUnit, pipeSelect, refFlowInput, refLossInput, refLossUnit].forEach((el) => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  update();
  return true;
}

function initializePowerEstimateCard(card, type) {
  const voltageInput = card.querySelector('[data-role="voltage"]');
  const currentInput = card.querySelector('[data-role="current"]');
  const pfInput = card.querySelector('[data-role="pf"]');
  const resultRole = type === 'three-phase-power' ? 'three-phase-result' : 'single-phase-result';
  const result = card.querySelector(`[data-role="${resultRole}"]`);
  const defaultPf = type === 'three-phase-power' ? 0.85 : 1.0;

  if (!voltageInput || !currentInput || !pfInput || !result) return false;

  function reset() {
    updateResultRow(result, 'dp-key', 'dp-value', '視在功率（kVA）', '-');
    updateResultRow(result, 'dp-key', 'dp-value', '有效功率（kW）', '-');
  }

  function update() {
    const rawV = voltageInput.value ?? '';
    const rawA = currentInput.value ?? '';

    if (rawV.trim() === '' || rawA.trim() === '') return reset();

    const voltage = Number(rawV);
    const current = Number(rawA);
    if (!Number.isFinite(voltage) || !Number.isFinite(current) || voltage <= 0 || current <= 0) return reset();

    const pf = parsePf(pfInput.value, defaultPf);
    const factor = type === 'three-phase-power' ? Math.sqrt(3) : 1;

    const kva = factor * voltage * current / 1000;
    const kw = factor * voltage * current * pf / 1000;

    updateResultRow(result, 'dp-key', 'dp-value', '視在功率（kVA）', formatNumber(kva));
    updateResultRow(result, 'dp-key', 'dp-value', '有效功率（kW）', formatNumber(kw));
  }

  [voltageInput, currentInput, pfInput].forEach((el) => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  update();
  return true;
}

function initializeCurrentEstimateCard(card) {
  const powerInput = card.querySelector('[data-role="power"]');
  const powerUnit = card.querySelector('[data-role="power-unit"]');
  const voltageInput = card.querySelector('[data-role="voltage"]');
  const phaseSelect = card.querySelector('[data-role="phase"]');
  const pfInput = card.querySelector('[data-role="pf"]');
  const result = card.querySelector('[data-role="current-result"]');

  if (!powerInput || !powerUnit || !voltageInput || !phaseSelect || !pfInput || !result) return false;

  function reset() {
    updateResultRow(result, 'dp-key', 'dp-value', '預估電流（A）', '-');
  }

  function toKw(value, unit) {
    if (unit === 'W') return value / 1000;
    if (unit === 'HP') return value * 0.7457;
    return value;
  }

  function update() {
    const rawPower = powerInput.value ?? '';
    const rawVoltage = voltageInput.value ?? '';

    if (rawPower.trim() === '' || rawVoltage.trim() === '') return reset();

    const power = Number(rawPower);
    const voltage = Number(rawVoltage);
    if (!Number.isFinite(power) || !Number.isFinite(voltage) || power <= 0 || voltage <= 0) return reset();

    const pf = parsePf(pfInput.value, 0.85);
    const kw = toKw(power, powerUnit.value);
    const factor = phaseSelect.value === 'single' ? 1 : Math.sqrt(3);
    const current = kw * 1000 / (voltage * pf * factor);

    updateResultRow(result, 'dp-key', 'dp-value', '預估電流（A）', formatNumber(current));
  }

  [powerInput, powerUnit, voltageInput, phaseSelect, pfInput].forEach((el) => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  update();
  return true;
}

function initializeCard(card) {
  const type = card?.dataset?.type || 'unknown';

  if (type === 'pipe-suggest') return initializePipeSuggestCard(card);
  if (type === 'dp-flow') return initializeDpFlowCard(card);
  if (type === 'three-phase-power' || type === 'single-phase-power') return initializePowerEstimateCard(card, type);
  if (type === 'current-estimate') return initializeCurrentEstimateCard(card);

  const input = card.querySelector('input');
  const fromSelect = card.querySelector('[data-role="from-unit"], [data-role="power-unit"]');
  const result = card.querySelector('.result');
  const resultList = card.querySelector('[data-role="result-list"]');

  if (!conversionMap[type] || !input || !fromSelect) return false;

  function update() {
    const raw = input.value ?? '';
    const selectedUnit = fromSelect.value ?? '';

    if (raw.trim() === '') {
      if (resultList && unitMap[type]) {
        const outputUnits = unitMap[type].filter((unit) => unit !== selectedUnit);
        renderList(resultList, outputUnits, () => '-');
      } else if (result) {
        result.textContent = '結果：-';
      }
      return;
    }

    const value = Number(raw);
    if (!Number.isFinite(value)) {
      if (resultList && unitMap[type]) {
        const outputUnits = unitMap[type].filter((unit) => unit !== selectedUnit);
        renderList(resultList, outputUnits, () => '-');
      } else if (result) {
        result.textContent = '結果：-';
      }
      return;
    }

    const converter = conversionMap[type];
    const baseValue = converter.toBase(value, selectedUnit);

    if (resultList && unitMap[type]) {
      const outputUnits = unitMap[type].filter((unit) => unit !== selectedUnit);
      renderList(resultList, outputUnits, (unit) => formatNumber(converter.fromBase(baseValue, unit)));
      return;
    }

    if (result) {
      const targetUnit = selectedUnit === 'C' ? 'F' : 'C';
      const convertedValue = converter.fromBase(baseValue, targetUnit);
      result.textContent = `${targetUnit}：${formatNumber(convertedValue)}`;
    }
  }

  input.addEventListener('input', update);
  fromSelect.addEventListener('change', update);
  update();

  return true;
}

function initializeNavigation() {
  const pages = Array.from(document.querySelectorAll('.page'));
  const homeId = 'home-page';

  function showPage(pageId) {
    pages.forEach((page) => {
      page.classList.toggle('active', page.id === pageId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-nav-target]').forEach((button) => {
    button.addEventListener('click', () => showPage(button.dataset.navTarget));
  });

  document.querySelectorAll('[data-nav-home]').forEach((button) => {
    button.addEventListener('click', () => showPage(homeId));
  });
}


function initializeFeedbackForm() {
  const form = document.querySelector('#feedback-form');
  const messageInput = document.querySelector('#feedback-message');
  const contactInput = document.querySelector('#feedback-contact');
  const screenshotInput = document.querySelector('#feedback-screenshot');
  const fileHint = document.querySelector('#feedback-file-hint');

  if (!form || !messageInput || !contactInput || !screenshotInput || !fileHint) return false;

  screenshotInput.addEventListener('change', () => {
    fileHint.hidden = !screenshotInput.files || screenshotInput.files.length === 0;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const message = (messageInput.value || '').trim();
    if (!message) return;

    const contact = (contactInput.value || '').trim() || '未提供';
    const hasScreenshot = screenshotInput.files && screenshotInput.files.length > 0;
    const bodyLines = [
      `使用者留言：${message}`,
      `聯絡方式：${contact}`,
      `userAgent：${navigator.userAgent}`,
      hasScreenshot
        ? '提醒：由於系統限制，請在郵件開啟後手動附上剛剛選擇的截圖。'
        : '提醒：如需附圖，請在郵件開啟後手動附上截圖。'
    ];

    const subject = encodeURIComponent('HVAC Unit Converter 意見回饋');
    const body = encodeURIComponent(bodyLines.join('\n'));
    window.location.href = `mailto:your-email@example.com?subject=${subject}&body=${body}`;
  });

  return true;
}

function startApp() {
  const cards = Array.from(document.querySelectorAll('.card'));
  cards.forEach((card) => initializeCard(card));
  initializeNavigation();
  initializeFeedbackForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
