# 💻 CodeFlow Live | Pro3 Cloud IDE

A fast, browser-based **Cloud IDE & Live Workspace** built with a **VS Code / Cursor-inspired Aesthetic**. Write multi-level nested files, run interactive shell commands, customize Monaco editor preferences, and export full projects as ZIP archives.

---

## ⚡ Cloud Architecture & Libraries

- **Zero-Local Dependencies:** Monaco Editor engine streamed directly via CDN.
- **Client-Side Project Export:** JSZip CDN integration for client-side multi-folder project zip creation.
- **Interactive Shell Engine:** Powered by Xterm.js with real-time command processing.

---

## 🚀 Key Features (v5.2 Pro Updates)

- **Nested Folder & File System:** Create, expand, collapse, and manage multi-level folders and sub-files seamlessly.
- **1-Click ZIP Archive Export:** Export your complete workspace folder structure as a `.zip` file alongside single-file download capabilities.
- **Functional Settings Modal:** Customize editor preferences on the fly (Font size, Tab spaces, Minimap toggle, Word Wrap).
- **Interactive Terminal Shell:** Run terminal commands (`ls`, `cd`, `pwd`, `cat`, `touch`, `mkdir`, `node`, `clear`, `help`).
- **Dynamic Theme Sync:** 1-Click Dark/Light mode sync for UI, Monaco Editor, and Shell Terminal.

---

## ⌨️ Terminal Commands Reference

| Command          | Action                                     |
| :--------------- | :----------------------------------------- |
| `ls`             | List current directory contents            |
| `cd <dir>`       | Change directory (`cd ..` to go up)        |
| `pwd`            | Show working directory path                |
| `cat <file>`     | Display file contents in shell             |
| `touch <file>`   | Create a new file                          |
| `mkdir <folder>` | Create a new folder                        |
| `node <file>`    | Execute JS file logic directly in terminal |
| `clear`          | Clear shell screen                         |
| `help`           | Display command list                       |

---

## 📂 File Structure

```text
├── index.html        # IDE markup, navbar, settings modal, and JSZip hooks
├── style.css         # Obsidian dark/light design system & nested tree UI
├── script.js        # Recursive file tree engine, JSZip exporter, and shell parser
└── README.md         # Updated project documentation
```
