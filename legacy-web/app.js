const tabs = Array.from(document.querySelectorAll('.tool-tab'));
const cards = Array.from(document.querySelectorAll('.tool-card'));

function formatNum(value, digits = 3) {
  return Number.isFinite(value) ? value.toFixed(digits) : '-';
}

function activateTab(id) {
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === id));
  cards.forEach((card) => card.classList.toggle('active', card.dataset.panel === id));
}

tabs.forEach((tab) => tab.addEventListener('click', () => activateTab(tab.dataset.tab)));

const ucValue = document.getElementById('uc-value');
const ucMode = document.getElementById('uc-mode');
const ucResult = document.getElementById('uc-result');

function updateUnitConverter() {
  const value = Number(ucValue.value);
  if (!Number.isFinite(value)) {
    ucResult.textContent = 'Result: -';
    return;
  }

  let a = '-';
  let b = '-';
  switch (ucMode.value) {
    case 'kw_btu':
      a = `${formatNum(value)} kW`;
      b = `${formatNum(value * 3412.142, 2)} BTU/h`;
      break;
    case 'kw_rt':
      a = `${formatNum(value)} kW`;
      b = `${formatNum(value / 3.517, 3)} RT`;
      break;
    case 'cfm_m3h':
      a = `${formatNum(value)} CFM`;
      b = `${formatNum(value * 1.699, 2)} m³/h`;
      break;
    case 'c_f':
      a = `${formatNum(value)} °C`;
      b = `${formatNum((value * 9) / 5 + 32, 2)} °F`;
      break;
    default:
      break;
  }

  ucResult.textContent = `Result: ${a} ⇄ ${b}`;
}

[ucValue, ucMode].forEach((el) => el.addEventListener('input', updateUnitConverter));
[ucMode].forEach((el) => el.addEventListener('change', updateUnitConverter));

const clArea = document.getElementById('cl-area');
const clDensity = document.getElementById('cl-density');
const clResult = document.getElementById('cl-result');

function updateCoolingLoad() {
  const area = Number(clArea.value);
  const density = Number(clDensity.value);
  if (!Number.isFinite(area) || !Number.isFinite(density) || area <= 0 || density <= 0) {
    clResult.textContent = 'Estimated Cooling Load: - kW';
    return;
  }
  const loadKw = (area * density) / 1000;
  clResult.textContent = `Estimated Cooling Load: ${formatNum(loadKw, 2)} kW`;
}

[clArea, clDensity].forEach((el) => el.addEventListener('input', updateCoolingLoad));

const afKw = document.getElementById('af-kw');
const afDt = document.getElementById('af-dt');
const afResult = document.getElementById('af-result');

function updateAirflow() {
  const kw = Number(afKw.value);
  const dt = Number(afDt.value);
  if (!Number.isFinite(kw) || !Number.isFinite(dt) || kw <= 0 || dt <= 0) {
    afResult.textContent = 'Estimated Airflow: - m³/s';
    return;
  }
  const airflow = kw / (1.2 * 1.006 * dt);
  afResult.textContent = `Estimated Airflow: ${formatNum(airflow, 3)} m³/s`;
}

[afKw, afDt].forEach((el) => el.addEventListener('input', updateAirflow));

const dcRacks = document.getElementById('dc-racks');
const dcPower = document.getElementById('dc-power');
const dcFactor = document.getElementById('dc-factor');
const dcResult = document.getElementById('dc-result');

function updateDataCenter() {
  const racks = Number(dcRacks.value);
  const power = Number(dcPower.value);
  const factor = Number(dcFactor.value);
  if (!Number.isFinite(racks) || !Number.isFinite(power) || !Number.isFinite(factor) || racks <= 0 || power <= 0 || factor <= 0) {
    dcResult.textContent = 'Estimated IT Cooling Capacity: - kW';
    return;
  }
  const total = racks * power * factor;
  dcResult.textContent = `Estimated IT Cooling Capacity: ${formatNum(total, 2)} kW`;
}

[dcRacks, dcPower, dcFactor].forEach((el) => el.addEventListener('input', updateDataCenter));
