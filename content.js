// Readapt – content script
// Applique les adaptations de lecture sur la page courante,
// en fonction du profil stocké dans chrome.storage.sync.

const READAPT_ATTR = "data-readapt";
const RULER_ID = "readapt-ruler";

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

let profile = { ...DEFAULT_PROFILE };
let rulerEl = null;

function injectFontFace() {
  if (document.getElementById("readapt-fontface")) return;
  const url = chrome.runtime.getURL("fonts/OpenDyslexic-Regular.otf");
  const style = document.createElement("style");
  style.id = "readapt-fontface";
  style.textContent = `
    @font-face {
      font-family: "OpenDyslexic";
      src: url("${url}") format("opentype");
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.documentElement.appendChild(style);
}

function fontStack(key) {
  switch (key) {
    case "opendyslexic": return `"OpenDyslexic", "Comic Sans MS", sans-serif`;
    case "arial": return `Arial, Helvetica, sans-serif`;
    case "verdana": return `Verdana, Geneva, sans-serif`;
    default: return null;
  }
}

function applyProfile() {
  const host = location.hostname;
  const active = profile.enabled && !profile.disabledSites.includes(host);

  if (!active) {
    document.documentElement.removeAttribute(READAPT_ATTR);
    document.documentElement.style.removeProperty("--readapt-font");
    removeRuler();
    return;
  }

  injectFontFace();
  document.documentElement.setAttribute(READAPT_ATTR, "on");

  const vars = document.documentElement.style;
  const stack = fontStack(profile.font);
  if (stack) {
    vars.setProperty("--readapt-font", stack);
    document.documentElement.setAttribute("data-readapt-font", "on");
  } else {
    vars.removeProperty("--readapt-font");
    document.documentElement.removeAttribute("data-readapt-font");
  }

  vars.setProperty("--readapt-font-size", `${profile.fontSize}%`);
  vars.setProperty("--readapt-letter-spacing", `${profile.letterSpacing}em`);
  vars.setProperty("--readapt-word-spacing", `${profile.wordSpacing}em`);
  vars.setProperty("--readapt-line-height", profile.lineHeight);

  profile.ruler ? enableRuler() : removeRuler();
}

function enableRuler() {
  if (rulerEl) return;
  rulerEl = document.createElement("div");
  rulerEl.id = RULER_ID;
  document.documentElement.appendChild(rulerEl);
  document.addEventListener("mousemove", moveRuler, { passive: true });
}

function moveRuler(e) {
  if (!rulerEl) return;
  const h = profile.rulerHeight;
  rulerEl.style.setProperty("--readapt-ruler-top", `${e.clientY - h / 2}px`);
  rulerEl.style.setProperty("--readapt-ruler-height", `${h}px`);
}

function removeRuler() {
  if (!rulerEl) return;
  document.removeEventListener("mousemove", moveRuler);
  rulerEl.remove();
  rulerEl = null;
}

chrome.storage.sync.get(DEFAULT_PROFILE, (stored) => {
  profile = { ...DEFAULT_PROFILE, ...stored };
  applyProfile();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  for (const [key, { newValue }] of Object.entries(changes)) {
    profile[key] = newValue;
  }
  applyProfile();
});
