# 💻 CodeFlow Live | Pro3 Cloud IDE

**CodeFlow Live** is a browser-based, zero-installation Cloud IDE & Live Code Workspace designed with a VS Code / Cursor-inspired aesthetic. It features real-time Monaco Code Editor integration, nested file/folder management with strict validation, live multi-file web preview, an interactive shell terminal, dark/light theme switching, and full ZIP project export capabilities.

---

## 🌟 Key Features & Highlights

- 🎨 **VS Code / Obsidian Aesthetic:** Clean dark and light theme options synchronized with code editor and terminal palettes.
- ⚡ **Monaco Editor Core:** Full syntax highlighting, auto-indentation, and customizable tab spaces powered by VS Code's editor engine.
- 📁 **Strict Nested File Tree System:**
  - Dynamic folder creation and subfolder nesting.
  - Inline `+ File` and `+ Folder` actions on every directory node.
  - **Strict Naming Validation:** Prevents garbage input, duplicate files, or invalid file extensions.
- 🌐 **Real-time Live Preview Pane:** Instant preview of HTML, CSS, and JS execution with independent theme background handling.
- 🐚 **Xterm.js Interactive Shell:** Embedded terminal with standard bash-like commands (`ls`, `cd`, `pwd`, `cat`, `touch`, `mkdir`, `node`, `clear`).
- 📦 **One-Click Export:** Download active files individually or export the full workspace structure as a `.zip` archive via JSZip.

---

## 🛡️ File Structure & Validation Rules

To maintain workspace integrity and prevent system errors, all created files and folders are strictly validated against the following rules:

1. **Extension Enforcement:** Files **must** have a valid extension. Allowed extensions are:
   - `.html`, `.css`, `.js`, `.json`, `.py`, `.md`, `.txt`
2. **Allowed Characters:** Item names can only contain alphanumeric characters (`a-z`, `A-Z`, `0-9`), hyphens (`-`), underscores (`_`), and dots (`.`). No empty names or spaces are permitted.
3. **Duplicate Prevention:** No two files or folders with the exact same name can exist within the same directory level.

---

## 📂 Project Architecture

```text
├── index.html        # Main IDE structural layout, toolbars, settings modal, and pane wrappers
├── style.css         # Modern design tokens, responsive resizers, light/dark theme variables
├── script.js         # Monaco setup, strict file tree validation, virtual FS, and shell logic
└── README.md         # Comprehensive project documentation and usage guidelines
```
