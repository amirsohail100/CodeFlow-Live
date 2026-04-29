let editor, terminal, currentFile = null;
let files = JSON.parse(localStorage.getItem('miya-cloud-fs')) || { 'index.html': '<h1>Miya IDE</h1>' };

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: files['index.html'],
        language: 'html',
        theme: 'vs-dark',
        automaticLayout: true, // Auto adjustment enabled
        fontSize: 14,
        minimap: { enabled: false }
    });

    editor.onDidChangeModelContent(() => {
        if (currentFile) {
            files[currentFile] = editor.getValue();
            localStorage.setItem('miya-cloud-fs', JSON.stringify(files));
        }
    });

    initApp();
});

function initApp() {
    initTerminal();
    setupResizers();
    renderTree();
    lucide.createIcons();
    switchFile(Object.keys(files)[0]);

    document.getElementById('toggle-sidebar').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        // Layout recalculation after sidebar animation
        setTimeout(() => editor.layout(), 210);
    });
}

function renderTree() {
    const tree = document.getElementById('file-tree');
    tree.innerHTML = "";
    Object.keys(files).forEach(name => {
        const div = document.createElement('div');
        div.className = `tree-node ${name === currentFile ? 'active-file' : ''}`;
        div.innerHTML = `
            <div class="file-info"><i data-lucide="file-code" style="width:14px"></i> ${name}</div>
            <i data-lucide="trash-2" class="delete-icon" onclick="deleteFile(event, '${name}')"></i>
        `;
        div.onclick = () => switchFile(name);
        tree.appendChild(div);
    });
    lucide.createIcons();
}

// ?

function deleteFile(e, name) {
    e.stopPropagation();
    if (Object.keys(files).length <= 1) return alert("At least one file is required!");
    if (confirm(`Delete ${name}?`)) {
        delete files[name];
        localStorage.setItem('miya-cloud-fs', JSON.stringify(files));
        renderTree();
        if (currentFile === name) switchFile(Object.keys(files)[0]);
    }
}

// ?

function switchFile(name) {
    currentFile = name;
    const ext = name.split('.').pop();
    const langMap = { html: 'html', css: 'css', js: 'javascript', py: 'python' };
    monaco.editor.setModelLanguage(editor.getModel(), langMap[ext] || 'plaintext');
    editor.setValue(files[name]);
    document.getElementById('current-tab-name').innerText = name;
    renderTree();
}

function deleteFile(e, name) {
    e.stopPropagation();
    if (Object.keys(files).length <= 1) return alert("At least one file is required!");
    if (confirm(`Delete ${name}?`)) {
        delete files[name];
        localStorage.setItem('miya-cloud-fs', JSON.stringify(files));
        renderTree();
        switchFile(Object.keys(files)[0]);
    }
}

// function setupResizers() {
//     const attachResize = (id, type, callback) => {
//         const el = document.getElementById(id);
//         el.addEventListener('mousedown', (e) => {
//             document.body.style.cursor = type === 'horizontal' ? 'col-resize' : 'row-resize';
//             const move = (m) => {
//                 callback(m);
//                 editor.layout(); // Force update editor
//             };
//             const up = () => {
//                 document.body.style.cursor = 'default';
//                 document.removeEventListener('mousemove', move);
//                 document.removeEventListener('mouseup', up);
//             };
//             document.addEventListener('mousemove', move);
//             document.addEventListener('mouseup', up);
//         });
//     };

//     attachResize('resizer-side', 'horizontal', (m) => {
//         const w = m.clientX - 50;
//         if (w > 100 && w < 400) document.getElementById('sidebar').style.width = w + 'px';
//     });

//     attachResize('resizer-main', 'horizontal', (m) => {
//         const w = window.innerWidth - m.clientX;
//         if (w > 200 && w < window.innerWidth - 300) document.getElementById('output-area').style.width = w + 'px';
//     });

//     attachResize('resizer-term', 'vertical', (m) => {
//         const h = window.innerHeight - m.clientY;
//         if (h > 60 && h < 500) document.getElementById('terminal-pane').style.height = h + 'px';
//     });
// }

function setupResizers() {
    let activeResizer = null;

    document.addEventListener('mousedown', e => {
        if (e.target.id === 'resizer-side') activeResizer = 'sidebar';
        if (e.target.id === 'resizer-main') activeResizer = 'preview';
        if (e.target.id === 'resizer-term') activeResizer = 'terminal';
        
        if(activeResizer) document.body.classList.add('resizing');
    });

    document.addEventListener('mousemove', e => {
        if (!activeResizer) return;

        if (activeResizer === 'sidebar') {
            const w = e.clientX - 50;
            if (w > 50 && w < 400) document.getElementById('sidebar').style.width = w + 'px';
        } else if (activeResizer === 'preview') {
            const w = window.innerWidth - e.clientX;
            if (w > 0 && w < window.innerWidth - 200) document.getElementById('preview-frame-container').style.width = w + 'px';
        } else if (activeResizer === 'terminal') {
            const h = window.innerHeight - e.clientY;
            if (h > 30 && h < 600) document.getElementById('terminal-pane').style.height = h + 'px';
        }
        editor.layout();
    });

    document.addEventListener('mouseup', () => {
        activeResizer = null;
        document.body.classList.remove('resizing');
    });
}



// ?

function togglePanel(id) {
    const panel = document.getElementById(id);
    panel.classList.toggle('hidden');
    setTimeout(() => editor.layout(), 150);
}

// ?

function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    body.classList.toggle('light-theme', !isDark);
    monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
    document.getElementById('theme-icon').setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    terminal.options.theme = isDark 
        ? { background: '#000000', foreground: '#0eef0e' } 
        : { background: '#f9fafb', foreground: '#1f2937', cursor: '#1f2937' };
    lucide.createIcons();
}


function executeCode() {
    const frame = document.getElementById('preview-frame');
    const html = currentFile.endsWith('.html') ? files[currentFile] : (files['index.html'] || "");
    const css = `<style>${files['style.css'] || ""}</style>`;
    const js = `<script>${files['script.js'] || ""}<\/script>`;
    frame.srcdoc = `<!DOCTYPE html><html><head>${css}</head><body>${html}${js}</body></html>`;
    terminal.writeln("\r\n> Build successful. Preview updated.");
}

function initTerminal() {
    terminal = new Terminal({ theme: { background: '#000', foreground: '#0eef0e' }, fontSize: 13 });
    terminal.open(document.getElementById('terminal-container'));
    terminal.writeln("Miya-Shell v5.2 initialized...");
}

function addNewFile() {
    const name = prompt("File name:");
    if (name && !files[name]) {
        files[name] = "";
        renderTree();
        switchFile(name);
    }
}

function downloadCurrentFile() {
    if (!currentFile) return;
    const blob = new Blob([files[currentFile]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile;
    a.click();
}