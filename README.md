# 💻 CodeFlow Live | Pro3 Cloud IDE

A fast, lightweight, and modern browser-based **Cloud IDE & Live Code Workspace** built with a **VS Code / Cursor-inspired Aesthetic**. Write, manage, and preview **HTML, CSS, JavaScript, and Python** in real-time with an integrated shell terminal and dynamic theme sync engine.

---

## ⚡ Cloud-Powered Architecture

This IDE is serverless, fast, and completely lightweight. All core assets are fetched directly from the cloud:

- **Zero-Local Heavy Dependencies:** Monaco Editor core engine streamed directly via CDN.
- **Dynamic Icons & Fonts:** Modern vector icon set via Lucide Icons and developer-grade typography with `JetBrains Mono` & `Inter`.
- **Browser Execution:** Direct client-side rendering with instant Webview isolated previews.

---

## 🚀 Key Features & Upgrades (v5.0 Pro)

- **VS Code / Cursor Aesthetic UI:** Re-designed layout featuring high-contrast Obsidian Dark (`#090d16`) and Clean Slate Light (`#f8fafc`) theme engines.
- **Dynamic Theme Synchronizer:** 1-Click dark/light toggle that automatically syncs the UI, Monaco Editor (`vs-dark` $\leftrightarrow$ `vs`), and Xterm.js Terminal background instantly.
- **Monaco Editor Core:** Powered by VS Code's editor engine with syntax highlighting, smooth cursor animations, auto-closing brackets, and language auto-detection.
- **Live Webview & Popout Preview:** Embedded sandbox preview pane with 1-click refresh and single-click "Open in New Tab" capabilities.
- **Integrated Terminal Shell:** Interactive Xterm.js terminal panel for live execution logging and system events.
- **File Explorer Management:** Complete file tree interface supporting interactive file creation, dynamic file-type icon badges, and file deletion.
- **Collapsible Workspace Panels:** Adjustable and toggleable sidebars, preview frame, and shell terminal with drag-to-resize support.

---

## 🛠️ Tech Stack

- **Frontend Core:** HTML5, Modern CSS3 (Custom Design System & CSS Variables), JavaScript (ES6)
- **Editor Engine:** Monaco Editor (`monaco-editor`)
- **Terminal Engine:** Xterm.js (`xterm.css` / `xterm.js`)
- **Icons & Typography:** Lucide Icons, Google Fonts (`Inter`, `JetBrains Mono`)

---

## 📂 Project Structure

```text
├── index.html        # Main IDE UI layout & navbar structure
├── style.css         # Design system, CSS variables & theme tokens
├── script.js        # Monaco initialization, theme switcher & workspace logic
└── README.md         # Comprehensive project documentation
```
