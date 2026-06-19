document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById('refresh-btn');
  const passInput = document.getElementById('password-input');
  const visibilityBtn = document.getElementById('visibility-btn');
  const scorePercentage = document.getElementById('score-percentage');
  const progressBar = document.getElementById('progress-bar');
  const mainCopyBtn = document.getElementById('copy-main-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  
  const crackTimeDisplay = document.getElementById('crack-time-display');
  const entropyDisplay = document.getElementById('entropy-display');
  const summaryFeedback = document.getElementById('summary-feedback');
  const avatarEmoji = document.getElementById('avatar-emoji');

  let currentLength = 16;
  let currentCharset = 'all';
  let isHidden = false; 

  // Character Constants Pools
  const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ"; 
  const LOWERCASE = "abcdefghijkmnopqrstuvwxyz";
  const NUMBERS = "23456789";
  const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  // Pseudo-Random Cryptographically Distributed Generator Engine
  function generatePassword(length, charsetType) {
    let pool = UPPERCASE + LOWERCASE + NUMBERS;
    if (charsetType === 'all') pool += SYMBOLS;
    
    let result = '';
    result += UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)];
    result += LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)];
    result += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    if (charsetType === 'all') {
      result += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }

    while (result.length < length) {
      result += pool[Math.floor(Math.random() * pool.length)];
    }
    
    return result.split('').sort(() => 0.5 - Math.random()).join('');
  }

  // Refreshes the suggestions footer array content
  function updateSuggestions() {
    document.querySelectorAll('.dynamic-suggestion').forEach(span => {
      span.textContent = generatePassword(14, currentCharset);
    });
  }

  // Real-time Shannon Entropy Calculation & Evaluation 
  function analyzePassword(pwd) {
    const metrics = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /[0-9]/.test(pwd),
      symbols: /[^A-Za-z0-9]/.test(pwd)
    };

    // Evaluate rules matrix
    Object.keys(metrics).forEach(key => {
      const li = document.querySelector(`[data-rule="${key}"]`);
      if (!li) return;
      const badge = li.querySelector('div');
      const icon = li.querySelector('span');
      
      if (metrics[key]) {
        li.classList.remove('text-on-surface-variant');
        li.classList.add('text-on-surface');
        badge.className = "w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary transition-colors";
        icon.textContent = "check";
      } else {
        li.classList.add('text-on-surface-variant');
        li.classList.remove('text-on-surface');
        badge.className = "w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant transition-colors";
        icon.textContent = "close";
      }
    });

    // Calculate Entropy Bits
    let poolSize = 0;
    if (metrics.uppercase) poolSize += 26;
    if (metrics.lowercase) poolSize += 26;
    if (metrics.numbers) poolSize += 10;
    if (metrics.symbols) poolSize += 32;
    
    let entropy = poolSize > 0 ? Math.floor(pwd.length * Math.log2(poolSize)) : 0;
    entropyDisplay.textContent = `${entropy} bits`;

    // Map Entropy metrics directly to UI Percentages
    let percentage = 0;
    if (pwd.length > 0) {
      percentage = Math.min(100, Math.floor((entropy / 96) * 100));
      if (pwd.length < 6) percentage = Math.min(percentage, 15);
    }

    scorePercentage.textContent = `${percentage}%`;
    progressBar.style.width = `${percentage}%`;

    // Dynamic UI styling configuration states
    if (percentage < 45) {
      progressBar.style.backgroundColor = '#ffb4ab'; 
      scorePercentage.style.color = '#ffb4ab';
      crackTimeDisplay.textContent = pwd.length <= 4 ? "Instantly" : "Minutes";
      summaryFeedback.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse"></span> Weak: Critical risk.`;
      avatarEmoji.textContent = "😨";
    } else if (percentage < 80) {
      progressBar.style.backgroundColor = '#facc15'; 
      scorePercentage.style.color = '#facc15';
      crackTimeDisplay.textContent = "Months";
      summaryFeedback.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span> Moderate: Good start.`;
      avatarEmoji.textContent = "😐";
    } else {
      progressBar.style.backgroundColor = '#8ed5ff'; 
      scorePercentage.style.color = '#8ed5ff';
      crackTimeDisplay.textContent = "Centuries";
      summaryFeedback.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Excellent: Highly secure!`;
      avatarEmoji.textContent = "😎";
    }
  }

  // Handle manual keyboard insertions
  passInput.addEventListener('input', (e) => {
    analyzePassword(e.target.value);
  });

  // Action Button Logic
  refreshBtn.addEventListener('click', () => {
    refreshBtn.querySelector('span').classList.add('animate-spin');
    const freshPassword = generatePassword(currentLength, currentCharset);
    passInput.value = freshPassword;
    analyzePassword(freshPassword);
    updateSuggestions();
    setTimeout(() => {
      refreshBtn.querySelector('span').classList.remove('animate-spin');
    }, 400);
  });

  // Masking Toggle View Layer
  visibilityBtn.addEventListener('click', () => {
    isHidden = !isHidden;
    if (isHidden) {
      passInput.type = "password";
      passInput.classList.add('masked-dots');
      visibilityBtn.querySelector('span').textContent = 'visibility_off';
    } else {
      passInput.type = "text";
      passInput.classList.remove('masked-dots');
      visibilityBtn.querySelector('span').textContent = 'visibility';
    }
  });

  // Structural Configuration controls: Length Selection
  document.querySelectorAll('#length-container button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#length-container button').forEach(b => {
        b.className = "flex-1 py-1 bg-surface-container-high text-on-surface-variant hover:text-primary rounded text-label-md transition-colors";
      });
      btn.className = "flex-1 py-1 bg-primary text-on-primary-container font-bold rounded text-label-md transition-colors";
      currentLength = parseInt(btn.getAttribute('data-length'));
      refreshBtn.click();
    });
  });

  // Structural Configuration controls: Character Selection
  document.querySelectorAll('#charset-container button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#charset-container button').forEach(b => {
        b.className = "w-full py-1 px-md bg-surface-container-high border border-transparent text-on-surface-variant rounded text-label-md text-left flex items-center justify-between transition-colors";
        b.querySelector('span:last-child').className = "material-symbols-outlined text-[16px]";
        b.querySelector('span:last-child').textContent = "radio_button_unchecked";
      });
      btn.className = "w-full py-1 px-md bg-primary/10 border border-primary/30 text-primary font-bold rounded text-label-md text-left flex items-center justify-between transition-colors";
      btn.querySelector('span:last-child').className = "material-symbols-outlined text-[16px] fill-icon";
      btn.querySelector('span:last-child').textContent = "radio_button_checked";
      
      currentCharset = btn.getAttribute('data-set');
      refreshBtn.click();
    });
  });

  // Inject suggestion array into target field on select click
  document.querySelectorAll('#suggestions-container button').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedValue = btn.querySelector('.dynamic-suggestion').textContent;
      passInput.value = selectedValue;
      analyzePassword(selectedValue);
      navigator.clipboard.writeText(selectedValue);
    });
  });

  // Primary clipboard execution hook
  mainCopyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(passInput.value).then(() => {
      copyBtnText.textContent = "Copied!";
      setTimeout(() => {
        copyBtnText.textContent = "Copy Password";
      }, 1800);
    });
  });

  // Scaler interaction transitions animations
  document.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('mousedown', () => el.style.transform = 'scale(0.97)');
    el.addEventListener('mouseup', () => el.style.transform = 'scale(1)');
    el.addEventListener('mouseleave', () => el.style.transform = 'scale(1)');
  });

  // Run initialization routines
  analyzePassword(passInput.value);
  updateSuggestions();
});