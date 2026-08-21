let editor, terminal, currentFile = null;
let files = {}; 

// Initialize Monaco Editor Engine
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: "<!-- Click '+' in File Explorer to start coding! -->\n<h1>Hello, CodeFlow Live!</h1>",
        language: 'html',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        padding: { top: 12 },
        minimap: { enabled: false },
        cursorBlinking: "smooth"
    });

    // Auto-save buffer to file state
    editor.onDidChangeModelContent(() => {
        if (currentFile) {
            files[currentFile] = editor.getValue();
        }
    });

    initApp();
});

function initApp() {
    initTerminal();
    setupResizers();
    renderTree();
    lucide.createIcons();

    // Sidebar Toggle
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

// Dynamic Light/Dark Theme Switcher Logic
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

// Dynamic Panel Hide/Show Toggle (Preview & Terminal)
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    if (panel.style.display === 'none') {
        panel.style.display = 'flex';
    } else {
        panel.style.display = 'none';
    }
    setTimeout(() => editor.layout(), 150);
}

// File Explorer Functions
function addNewFile() {
    const fileName = prompt("Enter file name (e.g., index.html, style.css, script.js):");
    if (fileName && fileName.trim() !== "") {
        const trimmedName = fileName.trim();
        if (!files[trimmedName]) {
            files[trimmedName] = ""; 
            renderTree();
            switchFile(trimmedName);
            if (terminal) terminal.writeln(`\r\n\x1b[32m[+]\x1b[0m Created file: ${trimmedName}`);
        } else {
            alert("File with this name already exists!");
        }
    }
}

function renderTree() {
    const tree = document.getElementById('file-tree');
    tree.innerHTML = "";
    
    const fileKeys = Object.keys(files);
    if (fileKeys.length === 0) {
        tree.innerHTML = `<div style="padding: 12px; font-size: 12px; color: var(--text-secondary); text-align: center;">No files created yet.</div>`;
        return;
    }

    fileKeys.forEach(name => {
        const div = document.createElement('div');
        div.className = `tree-node ${name === currentFile ? 'active-file' : ''}`;
        
        let iconName = "file-code";
        if (name.endsWith('.html')) iconName = "file-type-2";
        else if (name.endsWith('.css')) iconName = "palette";
        else if (name.endsWith('.js')) iconName = "file-json";

        div.innerHTML = `
            <div style="display:flex; align-items:center;">
                <i data-lucide="${iconName}"></i>
                <span>${name}</span>
            </div>
            <i data-lucide="trash-2" style="width:13px; opacity:0.6; cursor:pointer;" onclick="deleteFile(event, '${name}')" title="Delete File"></i>
        `;
        div.onclick = (e) => {
            if (!e.target.closest('[data-lucide="trash-2"]')) {
                switchFile(name);
            }
        };
        tree.appendChild(div);
    });
    lucide.createIcons();
}

function deleteFile(event, fileName) {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
        delete files[fileName];
        if (currentFile === fileName) {
            currentFile = null;
            editor.setValue("// Select or create a file to start editing");
            document.getElementById('current-tab-name').innerText = "No File Open";
        }
        renderTree();
        if (terminal) terminal.writeln(`\r\n\x1b[31m[-]\x1b[0m Deleted file: ${fileName}`);
    }
}

function switchFile(name) {
    currentFile = name;
    const ext = name.split('.').pop().toLowerCase();
    const langMap = { html: 'html', css: 'css', js: 'javascript', py: 'python', json: 'json' };
    const langName = langMap[ext] || 'plaintext';
    
    monaco.editor.setModelLanguage(editor.getModel(), langName);
    editor.setValue(files[name]);
    
    document.getElementById('current-tab-name').innerText = name;
    const statusLang = document.getElementById('active-lang-status');
    if (statusLang) statusLang.innerText = langName.toUpperCase();
    
    renderTree();
}

// Live Preview Rendering Engine
function refreshPreview() {
    const frame = document.getElementById('preview-frame');
    if (!frame) return;
    
    const htmlContent = files['index.html'] || "";
    const cssContent = `<style>${files['style.css'] || ""}</style>`;
    const jsContent = `<script>${files['script.js'] || ""}<\/script>`;

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
    const htmlContent = files['index.html'] || "";
    const cssContent = `<style>${files['style.css'] || ""}</style>`;
    const jsContent = `<script>${files['script.js'] || ""}<\/script>`;

    const win = window.open();
    win.document.write(`<!DOCTYPE html><html><head>${cssContent}</head><body>${htmlContent}${jsContent}</body></html>`);
}

function downloadCurrentFile() {
    if (!currentFile) {
        alert("No active file selected to download!");
        return;
    }
    const blob = new Blob([files[currentFile]], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = currentFile;
    a.click();
}

// Terminal Shell & Resizer Layout Engine
function initTerminal() {
    terminal = new Terminal({
        theme: { background: '#050811', foreground: '#f8fafc' },
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        cursorBlink: true
    });
    const termContainer = document.getElementById('terminal-container');
    if (termContainer) {
        terminal.open(termContainer);
        terminal.writeln('\x1b[34m=== CodeFlow Live v5.0 Cloud Terminal ===\x1b[0m');
        terminal.writeln('Type code in editor and press "Run Project" to execute.\r\n');
    }
}

function clearTerminal() {
    if (terminal) terminal.clear();
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