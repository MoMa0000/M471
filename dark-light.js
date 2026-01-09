/* Button for switching between dark and light mode.
   Persist theme choice in localStorage so it applies across all pages.
   This version is DOM-safe and respects system preference if no saved choice. */

const storageKey = 'theme-preference';

function applyTheme(theme) {
  // Use `body` so existing CSS continues to work, but also add to html
  // in case you want to target :root for theme variables.
  if (theme === 'dark') {
    if (document.body) document.body.classList.add('dark-mode');
    if (document.documentElement) document.documentElement.classList.add('dark-mode');
  } else {
    if (document.body) document.body.classList.remove('dark-mode');
    if (document.documentElement) document.documentElement.classList.remove('dark-mode');
  }
}

function safeGetStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    // localStorage can throw when running from file:// or with strict privacy settings
    return null;
  }
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // ignore errors when storage isn't available
  }
}

function getPreferredTheme() {
  const stored = safeGetStorage(storageKey);
  if (stored === 'dark' || stored === 'light') return stored;

  // Fallback: respect user's OS-level preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'dark';
}

// Apply theme as early as possible on load
applyTheme(getPreferredTheme());

// Ensure transitions are only enabled after the first paint so the
// initial theme application doesn't animate (prevents flash/FOIT).
function enableThemeTransitionsSoon() {
  try {
    // Use requestAnimationFrame + setTimeout to run after paint
    requestAnimationFrame(() => setTimeout(() => {
      document.documentElement.classList.add('theme-transition');
    }, 0));
  } catch (e) {
    // fallback
    document.documentElement.classList.add('theme-transition');
  }
}

// If DOM is already interactive/loaded, enable transitions now, otherwise wait.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  enableThemeTransitionsSoon();
} else {
  document.addEventListener('DOMContentLoaded', enableThemeTransitionsSoon);
}

// Hook up toggle button when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return; // no toggle on this page

  // Reflect current state on the toggle (aria-pressed for accessibility)
  const current = getPreferredTheme();
  themeToggle.setAttribute('aria-pressed', current === 'dark');

  themeToggle.addEventListener('click', () => {
    // Toggle preference
    const newTheme = (getPreferredTheme() === 'dark') ? 'light' : 'dark';

    // Save and apply (safe storage)
    safeSetStorage(storageKey, newTheme);
    applyTheme(newTheme);

    // Update button state for a11y
    themeToggle.setAttribute('aria-pressed', newTheme === 'dark');
  });
});



