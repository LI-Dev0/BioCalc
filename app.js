const presets = {
  foodWaste: {
    label: 'Food waste',
    biogasYieldPerKgVs: 0.62,
    energyPerM3: 6.1,
    defaultDryMatter: 25,
    defaultVsFactor: 80,
  },
  cowManure: {
    label: 'Cow manure',
    biogasYieldPerKgVs: 0.24,
    energyPerM3: 5.8,
    defaultDryMatter: 18,
    defaultVsFactor: 75,
  },
  pigManure: {
    label: 'Pig manure',
    biogasYieldPerKgVs: 0.32,
    energyPerM3: 6.0,
    defaultDryMatter: 20,
    defaultVsFactor: 78,
  },
  energyCrop: {
    label: 'Energy crop',
    biogasYieldPerKgVs: 0.74,
    energyPerM3: 6.3,
    defaultDryMatter: 30,
    defaultVsFactor: 85,
  },
};

const form = document.querySelector('#biogas-form');
const feedstockSelect = document.querySelector('#feedstock');
const amountInput = document.querySelector('#feedAmount');
const unitSelect = document.querySelector('#feedUnit');
const hrtSelect = document.querySelector('#hrt');
const dryMatterInput = document.querySelector('#dryMatter');
const vsInput = document.querySelector('#vsFactor');
const assumptionList = document.querySelector('#assumption-list');
const biogasResult = document.querySelector('#biogasResult');
const energyResult = document.querySelector('#energyResult');
const electricityResult = document.querySelector('#electricityResult');
const serviceNote = document.querySelector('#serviceNote');

function formatNumber(value) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
}

function renderAssumptions() {
  const preset = presets[feedstockSelect.value];
  dryMatterInput.value = preset.defaultDryMatter;
  vsInput.value = preset.defaultVsFactor;

  assumptionList.innerHTML = `
    <li>Feedstock profile: ${preset.label}</li>
    <li>Biogas yield factor: ${preset.biogasYieldPerKgVs.toFixed(2)} m³ per kg VS</li>
    <li>Energy conversion: ${preset.energyPerM3.toFixed(1)} kWh per m³ biogas</li>
    <li>HRT scaling: ${hrtSelect.value}-day mesophilic cycle</li>
  `;
}

function estimateBiogas() {
  const preset = presets[feedstockSelect.value];
  const feedAmount = Number(amountInput.value || 0);
  const unitMultiplier = unitSelect.value === 'ton' ? 1000 : 1;
  const dryMatterPercent = Number(dryMatterInput.value || 0) / 100;
  const volatileSolidsPercent = Number(vsInput.value || 0) / 100;
  const hrtDays = Number(hrtSelect.value);

  const amountKg = feedAmount * unitMultiplier;
  const dryMatterKg = amountKg * dryMatterPercent;
  const volatileSolidsKg = dryMatterKg * volatileSolidsPercent;
  const hrtScale = hrtDays === 40 ? 0.92 : 1;

  const biogasM3PerDay = volatileSolidsKg * preset.biogasYieldPerKgVs * hrtScale;
  const energyKwhPerDay = biogasM3PerDay * preset.energyPerM3;
  const electricityKwhPerDay = energyKwhPerDay * 0.38;

  biogasResult.textContent = `${formatNumber(biogasM3PerDay)} m³/day`;
  energyResult.textContent = `${formatNumber(energyKwhPerDay)} kWh/day`;
  electricityResult.textContent = `${formatNumber(electricityKwhPerDay)} kWh/day`;

  if (biogasM3PerDay >= 150) {
    serviceNote.textContent = 'This level suggests strong potential for a larger on-site energy project, especially where heat and electricity demand are steady.';
  } else if (biogasM3PerDay >= 40) {
    serviceNote.textContent = 'This is a meaningful mid-scale profile that could support practical energy recovery and merits a deeper site assessment.';
  } else {
    serviceNote.textContent = 'This points to a smaller pilot-scale opportunity and is best treated as an early-stage feasibility estimate.';
  }
}

feedstockSelect.addEventListener('change', renderAssumptions);
hrtSelect.addEventListener('change', renderAssumptions);
form.addEventListener('submit', (event) => {
  event.preventDefault();
  estimateBiogas();
});

[feedstockSelect, amountInput, unitSelect, hrtSelect, dryMatterInput, vsInput].forEach((element) => {
  element.addEventListener('input', estimateBiogas);
  element.addEventListener('change', estimateBiogas);
});

renderAssumptions();
estimateBiogas();
