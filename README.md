# Readapt Chrome Extension

**A browser accessibility extension designed to make web reading more comfortable for people with dyslexia.**

Readapt Chrome Extension brings Readapt's accessibility approach directly into the browser. It lets users adapt the typography and reading layout of almost any web page without leaving the page they are reading.

## Features

- Enable or disable Readapt globally
- Disable Readapt for individual websites
- Choose between OpenDyslexic, Arial and Verdana
- Adjust font size
- Adjust letter spacing
- Adjust word spacing
- Adjust line height
- Enable a mouse-following reading ruler
- Synchronize preferences with `chrome.storage.sync`
- Local OpenDyslexic font asset

## Why a browser extension?

The Readapt web application helps users transform and consume accessible content. The Chrome extension complements it by bringing reading adaptations to existing websites, reducing the need to copy content into another application.

Together, they form part of the broader Readapt accessibility ecosystem.

## Tech Stack

- JavaScript
- HTML
- CSS
- Chrome Extensions API
- Manifest V3
- `chrome.storage.sync`
- DOM and CSS manipulation

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
└── popup/
    ├── popup.html
    ├── popup.css
    └── popup.js
```

### `content.js`

Applies the user's accessibility preferences to the current page and manages the reading ruler.

### `content.css`

Defines the accessibility styles injected into supported web pages and loads the bundled OpenDyslexic font.

### `popup/`

Provides the extension interface used to configure and persist reading preferences.

## Permissions

The extension uses:

- `storage` to save and synchronize accessibility preferences.
- `activeTab` so the popup can identify the current website when the user chooses to disable Readapt for that site.
- `<all_urls>` because the core purpose of the extension is to adapt the appearance of web pages the user visits.

Readapt does not require a remote AI API or embed an OpenAI API key in the extension.

## Local Installation

Until the extension is distributed through a browser store, it can be loaded locally in Chrome:

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Select the project directory.

## Privacy

The extension's reading preferences are stored using Chrome's synchronized storage. The extension does not need to send page content to an external AI service to provide its current accessibility features.

## Relationship with Readapt

This extension complements the main Readapt full-stack application, which provides AI-powered text adaptation, document processing and assisted reading features.

Main Readapt project: https://github.com/TonyLawrence85/readapt

## Future Improvements

- More robust handling of icon fonts and complex web applications
- Additional accessibility profiles
- Per-site configuration presets
- Keyboard shortcuts
- Improved reading ruler options
- Automated tests
- Chrome Web Store packaging and privacy documentation

## Author

**Tony Lawrence**  
Full-Stack & AI Software Developer

GitHub: https://github.com/TonyLawrence85

## License

All rights reserved unless otherwise stated.
