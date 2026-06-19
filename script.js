// Interactive DOM Targets Setup
const refreshBtn = document.querySelector('button[title="Generate New"]');
const passInput = document.getElementById('password-input');
const visibilityBtn = document.querySelector('button[title="Show/Hide"]');

let isVisible = false;
const securePass = "k9$L!pQ2vR&xZ1m*";

// Spin & Sync Event Handlers
refreshBtn.addEventListener('click', () => {
  const icon = refreshBtn.querySelector('span');
  icon.classList.add('animate-spin');
  
  setTimeout(() => {
    icon.classList.remove('animate-spin');
    passInput.value = isVisible ? securePass : "••••••••••••••••";
  }, 500);
});

// View Mask Toggle Handler
visibilityBtn.addEventListener('click', () => {
  isVisible = !isVisible;
  passInput.value = isVisible ? securePass : "••••••••••••••••";
  visibilityBtn.querySelector('span').textContent = isVisible ? 'visibility_off' : 'visibility';
});

// Active Click Animation Scaling Loops
document.querySelectorAll('button, a').forEach(el => {
  el.addEventListener('mousedown', () => el.style.transform = 'scale(0.96)');
  el.addEventListener('mouseup', () => el.style.transform = 'scale(1)');
  el.addEventListener('mouseleave', () => el.style.transform = 'scale(1)');
});