# Readapt Chrome Extension

[![CI](https://github.com/TonyLawrence85/readapt-chrome-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/TonyLawrence85/readapt-chrome-extension/actions/workflows/ci.yml)

**Make any website easier to read.**

Readapt Chrome Extension is a browser accessibility tool designed to make web reading more comfortable for people with dyslexia. It adapts typography and page layout directly in the browser, without requiring users to copy content into another application.

<p align="center">
  <img src="docs/screenshots/readapt-extension-adapted-text_v2.png" alt="Web page adapted with Readapt Chrome Extension" width="900">
</p>

## Adapt any webpage instantly

Readapt works directly on the website the user is already reading. Once enabled, the extension applies the selected accessibility preferences to supported page content while preserving the browsing experience.

The user can open the Readapt popup at any time to adjust the reading experience and immediately see the changes on the page.

<p align="center">
  <img src="docs/screenshots/readapt-extension-adapted-text.png" alt="Readapt Chrome Extension enabled on a web page" width="900">
</p>

## Personalize the reading experience

The extension provides a compact control panel for adjusting how web content is displayed. Preferences can be changed without leaving the current page.

<p align="center">
  <img src="docs/screenshots/popup-readapt-extension.png" alt="Readapt Chrome Extension accessibility controls" width="900">
</p>

Users can:

- enable or disable Readapt globally
- choose an accessible reading font, including OpenDyslexic
- adjust text size
- adjust letter spacing
- adjust word spacing
- adjust line height
- enable a reading ruler
- disable Readapt for individual websites
- reset preferences at any time

Preferences are persisted using `chrome.storage.sync`.

## Why a browser extension?

The main Readapt web application transforms imported content into an assisted reading experience. The Chrome extension solves a different problem: much of what people read already exists on websites.

Instead of moving that content into another application, Readapt brings accessibility adjustments directly to the page being viewed. This makes the extension the browser-facing component of the broader Readapt ecosystem.

## How it works

```text
Web page
   |
   v
Readapt content script
   |
   +--> Load user preferences
   |
   +--> Apply accessible typography
   |
   +--> Adjust text size and spacing
   |
   +--> Apply line-height preferences
   |
   +--> Optional reading ruler
   |
   v
Adapted page
```

The popup acts as the control interface. Changes are stored through the Chrome Extensions API and applied to the current browsing experience by the extension's content layer.

## Features

- Global enable / disable control
- Per-site disable option
- OpenDyslexic, Arial and Verdana font options
- Adjustable font size
- Adjustable letter spacing
- Adjustable word spacing
- Adjustable line height
- Mouse-following reading ruler
- Synchronized preferences with `chrome.storage.sync`
- Bundled OpenDyslexic font asset
- Manifest V3 architecture
- No remote AI API required for page adaptation

## Tech Stack

| Area | Technologies |
| --- | --- |
| Extension | Chrome Extensions API, Manifest V3 |
| Frontend | JavaScript, HTML, CSS |
| Persistence | `chrome.storage.sync` |
| Page adaptation | DOM manipulation, CSS custom properties |
| Accessibility | OpenDyslexic, configurable typography, reading ruler |
| Testing | Node.js native test runner, `node:assert`, VM-based browser API mocks |
| CI | GitHub Actions |

## Architecture

```text
readapt-chrome-extension/
├── manifest.json
├── content.js
├── content.css
├── fonts/
│   └── OpenDyslexic-Regular.otf
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── tests/
│   ├── manifest.test.js
│   └── content.test.js
└── docs/
    └── screenshots/
```

### `content.js`

Applies the user's accessibility preferences to the current page and manages interactive behavior such as the reading ruler. It also listens for synchronized preference changes and reapplies the profile without requiring a page reload.

### `content.css`

Defines the accessibility styles applied to supported web content and supports the bundled OpenDyslexic font.

### `popup/`

Provides the user interface for configuring, persisting and resetting reading preferences.

### `tests/`

Contains zero-dependency Node.js tests for manifest integrity and content-script behavior. A lightweight mocked DOM and Chrome API environment keeps tests fast and independent of a real browser.

## Permissions

The extension uses:

- `storage` to save and synchronize accessibility preferences.
- `activeTab` so the popup can identify the current website when necessary.
- `<all_urls>` because the extension's core purpose is to adapt web pages across the sites the user chooses to visit.

Readapt does not require a remote AI service or expose an OpenAI API key in the browser extension.

## Privacy

The current extension performs its accessibility adaptations locally in the browser. Reading preferences are stored through Chrome's synchronized storage.

Page content does not need to be sent to the Readapt AI application or another remote AI service for the extension's current typography and layout features to work.

## Testing and CI

The repository includes **8 automated tests** executed by GitHub Actions on pushes and pull requests to `main`.

The suite currently verifies:

- Manifest V3 configuration
- required storage permission
- existence of local resources referenced by the manifest, including wildcard resources
- no page adaptation while Readapt is disabled
- typography and spacing preferences when Readapt is enabled
- per-site disabling
- live response to synchronized preference changes
- creation, positioning and removal of the reading ruler

The CI also validates `manifest.json` and performs JavaScript syntax checks before running the test suite.

Run the same checks locally with:

```bash
python -m json.tool manifest.json > /dev/null
node --check content.js
find popup tests -type f -name '*.js' -print0 | xargs -0 -r -n1 node --check
node --test tests/*.test.js
```

No npm package installation is required for the current test suite.

## Local Installation

Until the extension is distributed through the Chrome Web Store, it can be loaded locally:

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Select the project directory.
6. Open a text-heavy webpage and activate Readapt from the extensions menu.

## Readapt Ecosystem

Readapt consists of two complementary products.

### Readapt Web

The AI-powered Rails application handles deeper content transformation, including text adaptation, PDF and image processing, text-to-speech and synchronized assisted reading.

[Explore the Readapt Web repository](https://github.com/TonyLawrence85/readapt)

### Readapt Chrome Extension

This repository provides the browser accessibility layer, allowing users to apply reading preferences directly to existing websites.

Together, the two projects explore how AI-assisted content transformation and browser-level accessibility can complement each other in a single reading ecosystem.

## Engineering Decisions

**Keep page adaptation local.** The extension's current typography and layout features do not need a remote AI call. This reduces latency, avoids exposing API credentials in the browser and means page content does not need to leave the browser for these features.

**Use synchronized preferences.** `chrome.storage.sync` allows the same reading profile to persist across browser sessions and lets the content script react to changes as they happen.

**Keep testing lightweight.** The extension uses Node's built-in test runner instead of introducing a package manager and testing framework solely for a small test suite. Browser APIs and the DOM are mocked only to the extent required to exercise the content script's behavior.

## What This Project Demonstrates

This extension demonstrates browser extension development, JavaScript, DOM and CSS manipulation, Chrome APIs, persistent user preferences, Manifest V3, accessibility-oriented interface design, automated testing, CI and product integration across a broader application ecosystem.

## Future Improvements

- More robust handling of icon fonts and complex web applications
- Additional accessibility profiles
- Per-site configuration presets
- Keyboard shortcuts
- Additional reading ruler options
- End-to-end tests in a real browser environment
- Chrome Web Store packaging
- Privacy documentation for store distribution
- Improved compatibility testing across complex websites

## Project Status

Readapt Chrome Extension is under active development and complements the main Readapt AI web application.

## Author

**Tony Lawrence**  
Full-Stack & AI Software Developer

Focus areas: Ruby on Rails, JavaScript, AI-powered web applications, OpenAI API integration, browser extensions and workflow automation.

[GitHub profile](https://github.com/TonyLawrence85)

## License

This project is currently intended for portfolio and demonstration purposes. All rights reserved unless otherwise stated.
