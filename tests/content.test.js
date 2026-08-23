const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.resolve(__dirname, "../content.js"), "utf8");

function createStyle() {
  const values = new Map();
  return {
    setProperty(name, value) { values.set(name, String(value)); },
    removeProperty(name) { values.delete(name); },
    getPropertyValue(name) { return values.get(name) || ""; }
  };
}

function createElement(tagName, document) {
  const attributes = new Map();
  const element = {
    tagName: tagName.toUpperCase(),
    id: "",
    style: createStyle(),
    textContent: "",
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.has(name) ? attributes.get(name) : null; },
    removeAttribute(name) { attributes.delete(name); },
    remove() {
      if (this.id) document.elements.delete(this.id);
      this.removed = true;
    }
  };
  return element;
}

function buildContext(stored = {}, hostname = "example.com") {
  const listeners = new Map();
  const document = {
    elements: new Map(),
    createElement(tag) { return createElement(tag, document); },
    getElementById(id) { return document.elements.get(id) || null; },
    addEventListener(type, handler) { listeners.set(type, handler); },
    removeEventListener(type, handler) {
      if (listeners.get(type) === handler) listeners.delete(type);
    }
  };
  document.documentElement = createElement("html", document);
  document.documentElement.appendChild = (element) => {
    if (element.id) document.elements.set(element.id, element);
    return element;
  };

  let storageListener;
  const chrome = {
    runtime: { getURL: (resource) => `chrome-extension://test/${resource}` },
    storage: {
      sync: { get(defaults, callback) { callback({ ...defaults, ...stored }); } },
      onChanged: { addListener(callback) { storageListener = callback; } }
    }
  };

  const context = vm.createContext({
    chrome,
    document,
    location: { hostname },
    console,
    Object,
    Set,
    Map
  });
  vm.runInContext(source, context);

  return {
    document,
    listeners,
    storageChanged(changes, area = "sync") { storageListener(changes, area); }
  };
}

test("keeps page unchanged when Readapt is disabled", () => {
  const { document } = buildContext({ enabled: false });

  assert.equal(document.documentElement.getAttribute("data-readapt"), null);
  assert.equal(document.documentElement.style.getPropertyValue("--readapt-font-size"), "");
  assert.equal(document.getElementById("readapt-ruler"), null);
});

test("applies typography preferences when enabled", () => {
  const { document } = buildContext({
    enabled: true,
    font: "verdana",
    fontSize: 115,
    letterSpacing: 0.08,
    wordSpacing: 0.2,
    lineHeight: 2
  });

  assert.equal(document.documentElement.getAttribute("data-readapt"), "on");
  assert.equal(document.documentElement.style.getPropertyValue("--readapt-font"), "Verdana, Geneva, sans-serif");
  assert.equal(document.documentElement.style.getPropertyValue("--readapt-font-size"), "115%");
  assert.equal(document.documentElement.style.getPropertyValue("--readapt-letter-spacing"), "0.08em");
  assert.equal(document.documentElement.style.getPropertyValue("--readapt-word-spacing"), "0.2em");
  assert.equal(document.documentElement.style.getPropertyValue("--readapt-line-height"), "2");
});

test("does not activate Readapt on a disabled site", () => {
  const { document } = buildContext({ enabled: true, disabledSites: ["example.com"] });

  assert.equal(document.documentElement.getAttribute("data-readapt"), null);
  assert.equal(document.documentElement.style.getPropertyValue("--readapt-font"), "");
});

test("reacts to synchronized preference changes", () => {
  const extension = buildContext({ enabled: false });

  extension.storageChanged({
    enabled: { newValue: true },
    fontSize: { newValue: 125 }
  });

  assert.equal(extension.document.documentElement.getAttribute("data-readapt"), "on");
  assert.equal(extension.document.documentElement.style.getPropertyValue("--readapt-font-size"), "125%");
});

test("creates and removes the reading ruler", () => {
  const extension = buildContext({ enabled: true, ruler: true, rulerHeight: 40 });
  const ruler = extension.document.getElementById("readapt-ruler");

  assert.ok(ruler);
  assert.ok(extension.listeners.has("mousemove"));
  extension.listeners.get("mousemove")({ clientY: 100 });
  assert.equal(ruler.style.getPropertyValue("--readapt-ruler-top"), "80px");
  assert.equal(ruler.style.getPropertyValue("--readapt-ruler-height"), "40px");

  extension.storageChanged({ ruler: { newValue: false } });
  assert.equal(extension.document.getElementById("readapt-ruler"), null);
  assert.equal(extension.listeners.has("mousemove"), false);
});
