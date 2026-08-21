let editor, terminal, currentFilePath = "index.html";

// Clean baseline file structure without unnecessary dummy folders/files
let fileSystem = {
    "index.html": {
        type: "file",
        content: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <link rel=\"stylesheet\" href=\"style.css\">\n  <title>CodeFlow Live App</title>\n</head>\n<body>\n  <div class=\"container\">\n    <h1>Hello, CodeFlow Live!</h1>\n    <p>Start editing your workspace in real-time.</p>\n  </div>\n  <script src=\"script.js\"></script>\n</body>\n</html>"
    },
    "style.css": {
        type: "file",
        content: "/* Clean Starter Styles */\n* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\nbody {\n  font-family: 'Inter', sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background-color: #f8fafc;\n  color: #0f172a;\n}\n\n.container {\n  text-align: center;\n  padding: 2.5rem;\n  border-radius: 12px;\n  background: #ffffff;\n  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);\n}\n\nh1 {\n  color: #2563eb;\n  margin-bottom: 0.5rem;\n}"
    },
    "script.js": {
        type: "file",
        content: "// Client-side script\nconsole.log('CodeFlow Live App Ready!');"
    }
};

// Virtual Shell State
let termCommand = "";
let currentShellPath = [];

// Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: getFileContent("index.html"),
        language: 'html',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        tabSize: 4,
        wordWrap: "on",
        minimap: { enabled: false },
        fontFamily: "'JetBrains Mono', monospace",
        padding: { top: 12 },
        cursorBlinking: "smooth"
    });

    editor.onDidChangeModelContent(() => {
        if (currentFilePath) {
            setFileContent(currentFilePath, editor.getValue());
        }
    });

    initApp();
});

function initApp() {
    initInteractiveTerminal();
    setupResizers();
    renderTree();
    refreshPreview();
    lucide.createIcons();

    const toggleBtn = document.getElementById('toggle-sidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            const resizer = document.getElementById('resizer-side');
            sidebar.classList.toggle('collapsed');
            resizer.style.display = sidebar.classList.contains('collapsed') ? 'none' : 'block';
            this.classList.toggle('active');
            setTimeout(() => editor.layout(), 200);
        });
    }
}

/* ==========================================================================
   Panel Toggle Handlers (Preview & Terminal Buttons)
   ========================================================================== */

function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    const btnId = panelId === 'preview-frame-container' ? 'btn-preview' : 'btn-terminal';
    const resizerId = panelId === 'preview-frame-container' ? 'resizer-main' : 'resizer-term';
    
    const btn = document.getElementById(btnId);
    const resizer = document.getElementById(resizerId);

    if (!panel) return;

    const isHidden = window.getComputedStyle(panel).display === 'none';

    if (isHidden) {
        panel.style.display = 'flex';
        if (btn) btn.classList.add('active');
        if (resizer) resizer.style.display = 'block';
    } else {
        panel.style.display = 'none';
        if (btn) btn.classList.remove('active');
        if (resizer) resizer.style.display = 'none';
    }

    setTimeout(() => { if (editor) editor.layout(); }, 150);
}

/* ==========================================================================
   File System Utilities
   ========================================================================== */

function getItemByPath(pathStr) {
    if (!pathStr) return null;
    const parts = pathStr.split('/');
    let current = fileSystem;
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
            return current[part] || null;
        } else {
            if (current[part] && current[part].type === 'folder') {
                current = current[part].children;
            } else {
                return null;
            }
        }
    }
    return null;
}

function getFileContent(pathStr) {
    const item = getItemByPath(pathStr);
    return item && item.type === 'file' ? item.content : "";
}

function setFileContent(pathStr, newContent) {
    const item = getItemByPath(pathStr);
    if (item && item.type === 'file') {
        item.content = newContent;
    }
}

function deleteItemByPath(pathStr) {
    const parts = pathStr.split('/');
    let current = fileSystem;
    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]].children;
    }
    delete current[parts[parts.length - 1]];
}

/* ==========================================================================
   Recursive File Explorer Tree Renderer
   ========================================================================== */

function renderTree() {
    const treeContainer = document.getElementById('file-tree');
    treeContainer.innerHTML = "";
    
    function buildTreeHTML(nodeObj, parentPath = "") {
        const fragment = document.createDocumentFragment();

        Object.keys(nodeObj).forEach(key => {
            const item = nodeObj[key];
            const fullPath = parentPath ? `${parentPath}/${key}` : key;
            const nodeDiv = document.createElement('div');

            if (item.type === 'file') {
                nodeDiv.className = `tree-node ${fullPath === currentFilePath ? 'active-file' : ''}`;
                
                let iconName = "file-code";
                if (key.endsWith('.html')) iconName = "file-type-2";
                else if (key.endsWith('.css')) iconName = "palette";
                else if (key.endsWith('.js')) iconName = "file-json";

                nodeDiv.innerHTML = `
                    <div class="tree-node-left">
                        <i data-lucide="${iconName}"></i>
                        <span>${key}</span>
                    </div>
                    <div class="tree-node-actions">
                        <i data-lucide="trash-2" onclick="deleteTreeItem(event, '${fullPath}')" title="Delete File"></i>
                    </div>
                `;
                nodeDiv.onclick = (e) => {
                    if (!e.target.closest('.tree-node-actions')) {
                        switchFile(fullPath);
                    }
                };
                fragment.appendChild(nodeDiv);
            } 
            else if (item.type === 'folder') {
                nodeDiv.className = 'tree-node folder-node';
                nodeDiv.innerHTML = `
                    <div class="tree-node-left">
                        <i data-lucide="chevron-right" class="folder-arrow ${item.expanded ? 'open' : ''}"></i>
                        <i data-lucide="${item.expanded ? 'folder-open' : 'folder'}"></i>
                        <span style="font-weight:600;">${key}</span>
                    </div>
                    <div class="tree-node-actions">
                        <i data-lucide="file-plus" onclick="addNewItemToPath(event, '${fullPath}', 'file')" title="New File inside ${key}"></i>
                        <i data-lucide="folder-plus" onclick="addNewItemToPath(event, '${fullPath}', 'folder')" title="New Subfolder inside ${key}"></i>
                        <i data-lucide="trash-2" onclick="deleteTreeItem(event, '${fullPath}')" title="Delete Folder"></i>
                    </div>
                `;

                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'folder-children';
                childrenContainer.style.paddingLeft = '14px';
                childrenContainer.style.display = item.expanded ? 'flex' : 'none';

                nodeDiv.onclick = (e) => {
                    if (!e.target.closest('.tree-node-actions')) {
                        item.expanded = !item.expanded;
                        renderTree();
                    }
                };

                childrenContainer.appendChild(buildTreeHTML(item.children, fullPath));
                
                fragment.appendChild(nodeDiv);
                fragment.appendChild(childrenContainer);
            }
        });

        return fragment;
    }

    treeContainer.appendChild(buildTreeHTML(fileSystem));
    lucide.createIcons();
}

function addNewRootItem(type) {
    const inputName = prompt(`Enter ${type} name for root directory:`);
    if (!inputName || !inputName.trim()) return;

    const trimmed = inputName.trim();
    if (type === 'file') {
        fileSystem[trimmed] = { type: 'file', content: `// ${trimmed}` };
        renderTree();
        switchFile(trimmed);
    } else {
        fileSystem[trimmed] = { type: 'folder', expanded: true, children: {} };
        renderTree();
    }
}

function addNewItemToPath(event, parentPath, type) {
    if (event) event.stopPropagation();
    const itemName = prompt(`Enter ${type} name inside '${parentPath}':`);
    if (!itemName || !itemName.trim()) return;

    const name = itemName.trim();
    const targetFolder = getItemByPath(parentPath);

    if (targetFolder && targetFolder.type === 'folder') {
        targetFolder.expanded = true;
        const fullItemPath = `${parentPath}/${name}`;

        if (type === 'file') {
            targetFolder.children[name] = { type: 'file', content: `// ${name}` };
            renderTree();
            switchFile(fullItemPath);
        } else {
            targetFolder.children[name] = { type: 'folder', expanded: true, children: {} };
            renderTree();
        }
    }
}

function deleteTreeItem(event, pathStr) {
    if (event) event.stopPropagation();
    if (confirm(`Delete ${pathStr}?`)) {
        deleteItemByPath(pathStr);
        if (currentFilePath === pathStr) {
            currentFilePath = null;
            editor.setValue("// Select or create a file");
            document.getElementById('current-tab-name').innerText = "No File Open";
        }
        renderTree();
    }
}

function switchFile(pathStr) {
    const item = getItemByPath(pathStr);
    if (!item || item.type !== 'file') return;

    currentFilePath = pathStr;
    const ext = pathStr.split('.').pop().toLowerCase();
    const langMap = { html: 'html', css: 'css', js: 'javascript', py: 'python', json: 'json' };
    const langName = langMap[ext] || 'plaintext';

    monaco.editor.setModelLanguage(editor.getModel(), langName);
    editor.setValue(item.content);

    document.getElementById('current-tab-name').innerText = pathStr;
    document.getElementById('active-lang-status').innerText = langName.toUpperCase();
    renderTree();
}

/* ==========================================================================
   Project ZIP & Single File Download Engine
   ========================================================================== */

function downloadCurrentFile() {
    if (!currentFilePath) {
        alert("No active file selected!");
        return;
    }
    const content = getFileContent(currentFilePath);
    const fileName = currentFilePath.split('/').pop();
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}

function downloadProjectZip() {
    if (typeof JSZip === "undefined") {
        alert("Zip library loading...");
        return;
    }
    const zip = new JSZip();

    function addNodesToZip(nodeObj, currentZipFolder) {
        Object.keys(nodeObj).forEach(key => {
            const item = nodeObj[key];
            if (item.type === 'file') {
                currentZipFolder.file(key, item.content);
            } else if (item.type === 'folder') {
                const newFolder = currentZipFolder.folder(key);
                addNodesToZip(item.children, newFolder);
            }
        });
    }

    addNodesToZip(fileSystem, zip);

    zip.generateAsync({ type: "blob" }).then(function(content) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = "CodeFlow-Project.zip";
        a.click();
        if (terminal) terminal.writeln('\r\n\x1b[32m[+] Project exported as CodeFlow-Project.zip\x1b[0m');
    });
}

/* ==========================================================================
   Interactive Shell Terminal Engine
   ========================================================================== */

function initInteractiveTerminal() {
    terminal = new Terminal({
        theme: { background: '#050811', foreground: '#f8fafc', cursor: '#3b82f6' },
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        cursorBlink: true
    });
    const termContainer = document.getElementById('terminal-container');
    if (termContainer) {
        terminal.open(termContainer);
        terminal.writeln('\x1b[34m=== CodeFlow Live v5.3 Interactive Shell ===\x1b[0m');
        terminal.writeln('Type \x1b[33mhelp\x1b[0m to list available terminal commands.\r\n');
        promptShell();

        terminal.onData(e => {
            switch (e) {
                case '\r': // Enter
                    terminal.writeln('');
                    handleShellCommand(termCommand.trim());
                    termCommand = "";
                    promptShell();
                    break;
                case '\u007F': // Backspace
                    if (termCommand.length > 0) {
                        termCommand = termCommand.slice(0, -1);
                        terminal.write('\b \b');
                    }
                    break;
                default:
                    if (e >= ' ' && e <= '~') {
                        termCommand += e;
                        terminal.write(e);
                    }
            }
        });
    }
}

function promptShell() {
    const pathStr = currentShellPath.length === 0 ? '/' : '/' + currentShellPath.join('/');
    terminal.write(`\x1b[36mcodeflow:${pathStr}$\x1b[0m `);
}

function getCurrentShellFolder() {
    let current = fileSystem;
    for (let p of currentShellPath) {
        if (current[p] && current[p].type === 'folder') {
            current = current[p].children;
        } else {
            return null;
        }
    }
    return current;
}

function handleShellCommand(cmdStr) {
    if (!cmdStr) return;
    const parts = cmdStr.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const arg = parts[1];

    const currentDir = getCurrentShellFolder();

    switch (mainCmd) {
        case 'help':
            terminal.writeln('Available Commands:');
            terminal.writeln('  \x1b[33mls\x1b[0m            - List files and directories');
            terminal.writeln('  \x1b[33mcd <dir>\x1b[0m      - Change directory (use "cd .." to go back)');
            terminal.writeln('  \x1b[33mpwd\x1b[0m           - Print current working directory');
            terminal.writeln('  \x1b[33mcat <file>\x1b[0m    - View content of a file');
            terminal.writeln('  \x1b[33mtouch <file>\x1b[0m  - Create a new file');
            terminal.writeln('  \x1b[33mmkdir <dir>\x1b[0m   - Create a new directory');
            terminal.writeln('  \x1b[33mnode <file>\x1b[0m   - Run JS file in terminal console');
            terminal.writeln('  \x1b[33mclear\x1b[0m         - Clear terminal output');
            break;

        case 'ls':
            if (currentDir) {
                const items = Object.keys(currentDir).map(k => {
                    return currentDir[k].type === 'folder' ? `\x1b[34m${k}/\x1b[0m` : k;
                });
                terminal.writeln(items.join('  ') || 'Directory empty');
            }
            break;

        case 'pwd':
            terminal.writeln('/' + currentShellPath.join('/'));
            break;

        case 'cd':
            if (!arg || arg === '/') {
                currentShellPath = [];
            } else if (arg === '..') {
                currentShellPath.pop();
            } else {
                if (currentDir && currentDir[arg] && currentDir[arg].type === 'folder') {
                    currentShellPath.push(arg);
                } else {
                    terminal.writeln(`\x1b[31mcd: no such directory: ${arg}\x1b[0m`);
                }
            }
            break;

        case 'cat':
            if (currentDir && currentDir[arg] && currentDir[arg].type === 'file') {
                terminal.writeln(currentDir[arg].content);
            } else {
                terminal.writeln(`\x1b[31mcat: ${arg}: No such file\x1b[0m`);
            }
            break;

        case 'touch':
            if (arg) {
                currentDir[arg] = { type: 'file', content: `// ${arg}` };
                renderTree();
                terminal.writeln(`Created file ${arg}`);
            } else {
                terminal.writeln('Usage: touch <filename>');
            }
            break;

        case 'mkdir':
            if (arg) {
                currentDir[arg] = { type: 'folder', expanded: true, children: {} };
                renderTree();
                terminal.writeln(`Created directory ${arg}`);
            } else {
                terminal.writeln('Usage: mkdir <dirname>');
            }
            break;

        case 'node':
            if (currentDir && currentDir[arg] && currentDir[arg].type === 'file') {
                try {
                    terminal.writeln(`\x1b[32m[Output of ${arg}]:\x1b[0m`);
                    const originalLog = console.log;
                    console.log = function(...args) {
                        terminal.writeln(args.join(' '));
                        originalLog.apply(console, args);
                    };
                    new Function(currentDir[arg].content)();
                    console.log = originalLog;
                } catch (err) {
                    terminal.writeln(`\x1b[31mRuntime Error: ${err.message}\x1b[0m`);
                }
            } else {
                terminal.writeln(`\x1b[31mnode: ${arg}: File not found\x1b[0m`);
            }
            break;

        case 'clear':
            terminal.clear();
            break;

        default:
            terminal.writeln(`\x1b[31mCommand not found: ${cmdStr}\x1b[0m. Type "help" for options.`);
    }
}

function clearTerminal() {
    if (terminal) terminal.clear();
}

/* ==========================================================================
   Settings Modal Handler
   ========================================================================== */

function openSettingsModal() {
    document.getElementById('settings-modal').classList.add('open');
}

function closeSettingsModal() {
    document.getElementById('settings-modal').classList.remove('open');
}

function applySettings() {
    const fontSize = parseInt(document.getElementById('setting-font-size').value, 10);
    const tabSize = parseInt(document.getElementById('setting-tab-size').value, 10);
    const minimap = document.getElementById('setting-minimap').checked;
    const wordWrap = document.getElementById('setting-word-wrap').checked ? "on" : "off";

    if (editor) {
        editor.updateOptions({
            fontSize: fontSize,
            tabSize: tabSize,
            minimap: { enabled: minimap },
            wordWrap: wordWrap
        });
    }

    document.getElementById('status-tab-size').innerText = `Spaces: ${tabSize}`;
    closeSettingsModal();
}

/* ==========================================================================
   Preview & Theme Engine
   ========================================================================== */

function refreshPreview() {
    const frame = document.getElementById('preview-frame');
    if (!frame) return;
    
    const htmlContent = getFileContent('index.html');
    const cssContent = `<style>${getFileContent('style.css')}</style>`;
    const jsContent = `<script>${getFileContent('script.js')}<\/script>`;

    const blob = new Blob([`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                ${cssContent}
            </head>
            <body>
                ${htmlContent}
                ${jsContent}
            </body>
        </html>
    `], { type: 'text/html' });

    frame.src = URL.createObjectURL(blob);
}

function executeCode() {
    if (terminal) terminal.writeln('\r\n\x1b[33m[*]\x1b[0m Executing live project preview...');
    refreshPreview();
}

function openPreviewNewTab() {
    const htmlContent = getFileContent('index.html');
    const cssContent = `<style>${getFileContent('style.css')}</style>`;
    const jsContent = `<script>${getFileContent('script.js')}<\/script>`;

    const win = window.open();
    win.document.write(`<!DOCTYPE html><html><head>${cssContent}</head><body>${htmlContent}${jsContent}</body></html>`);
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const isDark = body.classList.contains('dark-theme');

    if (isDark) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeIcon.setAttribute('data-lucide', 'moon');
        monaco.editor.setTheme('vs');
        if (terminal) {
            terminal.options.theme = { background: '#f8fafc', foreground: '#0f172a', cursor: '#0f172a' };
        }
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeIcon.setAttribute('data-lucide', 'sun');
        monaco.editor.setTheme('vs-dark');
        if (terminal) {
            terminal.options.theme = { background: '#050811', foreground: '#f8fafc', cursor: '#f8fafc' };
        }
    }
    lucide.createIcons();
}

function setupResizers() {
    const handleResize = (resizerId, callback) => {
        const resizer = document.getElementById(resizerId);
        if (!resizer) return;
        resizer.addEventListener('mousedown', e => {
            const previewFrame = document.getElementById('preview-frame');
            if (previewFrame) previewFrame.style.pointerEvents = 'none';
            const onMouseMove = m => callback(m);
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                if (previewFrame) previewFrame.style.pointerEvents = 'auto';
                if (editor) editor.layout();
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    };

    handleResize('resizer-side', m => {
        if (m.clientX > 120 && m.clientX < 450) {
            document.getElementById('sidebar').style.width = (m.clientX - 48) + 'px';
        }
    });

    handleResize('resizer-main', m => {
        const newWidth = window.innerWidth - m.clientX;
        if (newWidth > 120) {
            document.getElementById('preview-frame-container').style.width = newWidth + 'px';
        }
    });

    handleResize('resizer-term', m => {
        const newHeight = window.innerHeight - m.clientY;
        if (newHeight > 50 && newHeight < window.innerHeight - 100) {
            document.getElementById('terminal-pane').style.height = newHeight + 'px';
        }
    });
}