// Runtime Global Architecture State Maps
let configLength = 16;
let configMode = 'symbols'; 
let isPlaintextVisible = true;
let currentSystemPassword = "";

// Element DOM Selectors Mapping Registry
const passInput = document.getElementById('password-input');
const regenBtn = document.getElementById('regen-btn');
const visibilityBtn = document.getElementById('visibility-btn');
const copyBtn = document.getElementById('copy-btn');
const securityPercent = document.getElementById('security-percent');
const securityProgressBar = document.getElementById('security-progress-bar');
const statCrackTime = document.getElementById('stat-crack-time');
const statEntropy = document.getElementById('stat-entropy');
const verdictPulse = document.getElementById('verdict-pulse');
const verdictAvatar = document.getElementById('verdict-avatar');
const analysisVerdictLabel = document.querySelector('#analysis-verdict-label span:last-child');
const suggestionsShelf = document.getElementById('suggestions-shelf');

const CHAR_POOLS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

// Start Setup Initializations
document.addEventListener('DOMContentLoaded', () => {
  setupInteractiveControls();
  generateNewSystemPassword();
  
  // Track continuous manual string typing changes
  passInput.addEventListener('input', (e) => {
    currentSystemPassword = e.target.value;
    runStrengthAnalysisEngine(currentSystemPassword);
  });
});

function setupInteractiveControls() {
  // Configuration length toggle arrays
  const lenButtons = document.querySelectorAll('#length-picker button');
  lenButtons.forEach(btn => {
    if(parseInt(btn.getAttribute('data-len')) === configLength) applyActiveBtn(btn);
    else applyInactiveBtn(btn);

    btn.addEventListener('click', () => {
      configLength = parseInt(btn.getAttribute('data-len'));
      lenButtons.forEach(b => applyInactiveBtn(b));
      applyActiveBtn(btn);
      generateNewSystemPassword();
    });
  });

  // Character pool choices handlers
  const charsetButtons = document.querySelectorAll('#charset-picker button');
  charsetButtons.forEach(btn => {
    if(btn.getAttribute('data-mode') === configMode) applyActiveRadio(btn);
    else applyInactiveRadio(btn);

    btn.addEventListener('click', () => {
      configMode = btn.getAttribute('data-mode');
      charsetButtons.forEach(b => applyInactiveRadio(b));
      applyActiveRadio(btn);
      generateNewSystemPassword();
    });
  });

  // Core Click Triggers Action Listeners
  regenBtn.addEventListener('click', () => {
    const icon = regenBtn.querySelector('span');
    icon.classList.add('animate-spin');
    setTimeout(() => icon.classList.remove('animate-spin'), 450);
    generateNewSystemPassword();
  });

  visibilityBtn.addEventListener('click', () => {
    isPlaintextVisible = !isPlaintextVisible;
    renderDisplayValue();
  });

  copyBtn.addEventListener('click', () => {
    copyToClipboardAction(currentSystemPassword);
  });

  // Scale down click feedback hooks
  document.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('mousedown', () => el.style.transform = 'scale(0.97)');
    el.addEventListener('mouseup', () => el.style.transform = 'scale(1)');
    el.addEventListener('mouseleave', () => el.style.transform = 'scale(1)');
  });
}

// Utility styling toggles
function applyActiveBtn(el) { el.className = "flex-1 py-1 bg-primary text-on-primary-container font-bold rounded text-label-md transition-colors"; }
function applyInactiveBtn(el) { el.className = "flex-1 py-1 bg-surface-container-high text-on-surface-variant hover:text-primary rounded text-label-md transition-colors"; }
function applyActiveRadio(el) {
  el.className = "w-full py-2 px-md bg-primary/10 border border-primary/40 text-primary font-bold rounded text-label-md text-left flex items-center justify-between transition-colors";
  el.querySelector('span:last-child').textContent = "radio_button_checked";
  el.querySelector('span:last-child').classList.add('fill-icon');
}
function applyInactiveRadio(el) {
  el.className = "w-full py-2 px-md bg-surface-container-high text-on-surface-variant rounded text-label-md text-left flex items-center justify-between transition-colors border border-transparent";
  el.querySelector('span:last-child').textContent = "radio_button_unchecked";
  el.querySelector('span:last-child').classList.remove('fill-icon');
}

// Generation Actions
function generateNewSystemPassword() {
  currentSystemPassword = createRandomString(configLength, configMode);
  renderDisplayValue();
  runStrengthAnalysisEngine(currentSystemPassword);
  refreshAlternativeShelf();
}

function createRandomString(len, mode) {
  let combinedPool = CHAR_POOLS.lower + CHAR_POOLS.upper + CHAR_POOLS.numbers;
  if (mode === 'symbols') combinedPool += CHAR_POOLS.symbols;

  let strResult = [
    CHAR_POOLS.lower[Math.floor(Math.random() * CHAR_POOLS.lower.length)],
    CHAR_POOLS.upper[Math.floor(Math.random() * CHAR_POOLS.upper.length)],
    CHAR_POOLS.numbers[Math.floor(Math.random() * CHAR_POOLS.numbers.length)]
  ];
  if(mode === 'symbols') strResult.push(CHAR_POOLS.symbols[Math.floor(Math.random() * CHAR_POOLS.symbols.length)]);

  while(strResult.length < len) {
    strResult.push(combinedPool[Math.floor(Math.random() * combinedPool.length)]);
  }
  return strResult.sort(() => 0.5 - Math.random()).join('');
}

function renderDisplayValue() {
  if (isPlaintextVisible) {
    passInput.value = currentSystemPassword;
    visibilityBtn.querySelector('span').textContent = 'visibility';
  } else {
    passInput.value = "•".repeat(currentSystemPassword.length);
    visibilityBtn.querySelector('span').textContent = 'visibility_off';
  }
}

// Realtime Engine Analytics Calculations Engine
function runStrengthAnalysisEngine(passwordStr) {
  if(!passwordStr) {
    securityPercent.textContent = "0%";
    securityProgressBar.style.width = "0%";
    statCrackTime.textContent = "Instant";
    statEntropy.textContent = "0 bits";
    return;
  }

  const matrices = {
    len: passwordStr.length >= 10,
    upper: /[A-Z]/.test(passwordStr),
    lower: /[a-z]/.test(passwordStr),
    numbers: /[0-9]/.test(passwordStr),
    symbols: /[^A-Za-z0-9]/.test(passwordStr)
  };

  Object.keys(matrices).forEach(k => {
    const row = document.querySelector(`#matrix-list li[data-criterion="${k}"]`);
    if(!row) return;
    const box = row.querySelector('.indicator-icon');
    const icon = row.querySelector('.indicator-icon span');

    if(matrices[k]) {
      row.className = "flex items-center gap-sm text-on-surface transition-all opacity-100";
      box.className = "indicator-icon w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary";
      icon.textContent = "check";
    } else {
      row.className = "flex items-center gap-sm text-on-surface-variant opacity-40 transition-all";
      box.className = "indicator-icon w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant";
      icon.textContent = "close";
    }
  });

  let poolWeightSize = 0;
  if (/[a-z]/.test(passwordStr)) poolWeightSize += 26;
  if (/[A-Z]/.test(passwordStr)) poolWeightSize += 26;
  if (/[0-9]/.test(passwordStr)) poolWeightSize += 10;
  if (/[^A-Za-z0-9]/.test(passwordStr)) poolWeightSize += 32;

  const calculatedEntropy = Math.round(passwordStr.length * Math.log2(poolWeightSize || 1));
  statEntropy.textContent = `${calculatedEntropy} bits`;

  let ratingScore = Math.min(100, Math.round((calculatedEntropy / 120) * 100));
  if(passwordStr.length < 6) ratingScore = Math.min(ratingScore, 10);

  securityPercent.textContent = `${ratingScore}%`;
  securityProgressBar.style.width = `${ratingScore}%`;

  if(ratingScore < 45) {
    securityProgressBar.style.background = '#ffb4ab'; 
    securityPercent.className = "text-[10px] text-label-caps font-bold uppercase tracking-wider text-error";
    statCrackTime.textContent = "Minutes";
    verdictPulse.className = "w-1.5 h-1.5 rounded-full bg-error animate-pulse";
    analysisVerdictLabel.textContent = "Weak: Highly Vulnerable";
    verdictAvatar.textContent = "😨";
  } else if(ratingScore < 78) {
    securityProgressBar.style.background = '#facc15'; 
    securityPercent.className = "text-[10px] text-label-caps font-bold uppercase tracking-wider text-yellow-400";
    statCrackTime.textContent = passwordStr.length > 11 ? "Years" : "Months";
    verdictPulse.className = "w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse";
    analysisVerdictLabel.textContent = "Moderate: Could be enhanced";
    verdictAvatar.textContent = "😐";
  } else {
    securityProgressBar.style.background = 'linear-gradient(90deg, #ffb4ab 0%, #facc15 50%, #8ed5ff 100%)';
    securityPercent.className = "text-[10px] text-label-caps font-bold uppercase tracking-wider text-primary";
    statCrackTime.textContent = "Centuries";
    verdictPulse.className = "w-1.5 h-1.5 rounded-full bg-primary animate-pulse";
    analysisVerdictLabel.textContent = "Excellent: Highly Secure!";
    verdictAvatar.textContent = "😎";
  }
}

// Bottom Row Alternative Options Generator
function refreshAlternativeShelf() {
  suggestionsShelf.innerHTML = "";
  for(let i = 0; i < 3; i++) {
    const alternativeVariant = createRandomString(Math.max(configLength, 12), configMode);
    const btn = document.createElement('button');
    btn.className = "flex items-center justify-between bg-surface-container-high/40 border border-outline-variant/30 hover:border-primary/50 p-2 rounded-lg transition-all group/suggest overflow-hidden text-left";
    btn.innerHTML = `
      <span class="text-label-caps text-on-surface truncate text-xs mr-2 select-all">${alternativeVariant}</span>
      <span class="material-symbols-outlined text-primary text-[16px] opacity-60 group-hover/suggest:opacity-100 transition-opacity flex-shrink-0">content_copy</span>
    `;
    btn.addEventListener('click', () => copyToClipboardAction(alternativeVariant));
    suggestionsShelf.appendChild(btn);
  }
}

// Action Copy Toast Messenger Utilities
function copyToClipboardAction(textStr) {
  if(!textStr) return;
  navigator.clipboard.writeText(textStr).then(() => {
    showToastNotification("Copied securely to clipboard!");
  }).catch(() => {
    const area = document.createElement("textarea");
    area.value = textStr; document.body.appendChild(area); area.select();
    document.execCommand("copy"); document.body.removeChild(area);
    showToastNotification("Copied to clipboard!");
  });
}

function showToastNotification(msgText) {
  const oldToast = document.getElementById('app-toast-alert');
  if(oldToast) oldToast.remove();

  const elementToast = document.createElement('div');
  elementToast.id = "app-toast-alert";
  elementToast.className = "toast-popup fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 bg-primary text-on-primary-container px-md py-xs rounded-full font-bold text-label-md shadow-2xl z-50 flex items-center gap-xs";
  elementToast.innerHTML = `<span class="material-symbols-outlined text-[16px] fill-icon">check_circle</span><span>${msgText}</span>`;
  document.body.appendChild(elementToast);

  setTimeout(() => {
    elementToast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => elementToast.remove(), 300);
  }, 2200);
}