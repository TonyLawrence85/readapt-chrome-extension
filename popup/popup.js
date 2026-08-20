// Readapt – popup
// Lit et écrit le profil dans chrome.storage.sync.

const DEFAULT_PROFILE = {
  enabled: false,
  font: "opendyslexic",
  fontSize: 100,
  letterSpacing: 0.05,
  wordSpacing: 0.15,
  lineHeight: 1.8,
  ruler: false,
  rulerHeight: 32,
  disabledSites: []
};

const $ = (id) => document.getElementById(id);
let currentHost = null;
let profile = { ...DEFAULT_PROFILE };

function formatOutputs() {
  $("fontSizeOut").textContent = `${profile.fontSize} %`;
  $("letterSpacingOut").textContent = `${profile.letterSpacing} em`;
  $("wordSpacingOut").textContent = `${profile.wordSpacing} em`;
  $("lineHeightOut").textContent = profile.lineHeight;
}

function render() {
  $("enabled").checked = profile.enabled;
  $("font").value = profile.font;
  $("fontSize").value = profile.fontSize;
  $("letterSpacing").value = profile.letterSpacing;
  $("wordSpacing").value = profile.wordSpacing;
  $("lineHeight").value = profile.lineHeight;
  $("ruler").checked = profile.ruler;
  $("siteToggle").checked = currentHost
    ? profile.disabledSites.includes(currentHost)
    : false;
  formatOutputs();
}

function save(partial) {
  Object.assign(profile, partial);
  chrome.storage.sync.set(partial);
  formatOutputs();
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    currentHost = new URL(tab.url).hostname || null;
  } catch {
    currentHost = null;
  }

  chrome.storage.sync.get(DEFAULT_PROFILE, (stored) => {
    profile = { ...DEFAULT_PROFILE, ...stored };
    render();
  });
}

$("enabled").addEventListener("change", (e) => save({ enabled: e.target.checked }));
$("font").addEventListener("change", (e) => save({ font: e.target.value }));
$("fontSize").addEventListener("input", (e) => save({ fontSize: Number(e.target.value) }));
$("letterSpacing").addEventListener("input", (e) => save({ letterSpacing: Number(e.target.value) }));
$("wordSpacing").addEventListener("input", (e) => save({ wordSpacing: Number(e.target.value) }));
$("lineHeight").addEventListener("input", (e) => save({ lineHeight: Number(e.target.value) }));
$("ruler").addEventListener("change", (e) => save({ ruler: e.target.checked }));

$("siteToggle").addEventListener("change", (e) => {
  if (!currentHost) return;
  const sites = new Set(profile.disabledSites);
  e.target.checked ? sites.add(currentHost) : sites.delete(currentHost);
  save({ disabledSites: [...sites] });
});

$("reset").addEventListener("click", () => {
  profile = { ...DEFAULT_PROFILE };
  chrome.storage.sync.set(DEFAULT_PROFILE);
  render();
});

init();
