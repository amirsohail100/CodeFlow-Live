let editor, terminal, currentFile = null;
let files = {}; // Default files removed

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: "Click '+' to create a new file and start coding!",
        language: 'plaintext',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14
    });

    // Code update par auto-save logic
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
    document.getElementById('toggle-sidebar').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        const resizer = document.getElementById('resizer-side');
        sidebar.classList.toggle('collapsed');
        resizer.style.display = sidebar.classList.contains('collapsed') ? 'none' : 'block';
        this.classList.toggle('active-icon');
        editor.layout();
    });
}

// FIX: New File Logic
function addNewFile() {
    const fileName = prompt("Enter file name (e.g., index.html, style.css):");
    if (fileName && fileName.trim() !== "") {
        if (!files[fileName]) {
            files[fileName] = ""; // Create empty file
            renderTree();
            switchFile(fileName);
            terminal.writeln(`\r\n> Created file: ${fileName}`);
        } else {
            alert("File already exists!");
        }
    }
}

function renderTree() {
    const tree = document.getElementById('file-tree');
    tree.innerHTML = "";
    
    Object.keys(files).forEach(name => {
        const div = document.createElement('div');
        div.className = `tree-node ${name === currentFile ? 'active-file' : ''}`;
        div.innerHTML = `<i data-lucide="file-code" style="width:14px"></i> ${name}`;
        div.onclick = () => switchFile(name);
        tree.appendChild(div);
    });
    lucide.createIcons();
}

function switchFile(name) {
    currentFile = name;
    const ext = name.split('.').pop();
    const langMap = { html: 'html', css: 'css', js: 'javascript', py: 'python' };
    
    monaco.editor.setModelLanguage(editor.getModel(), langMap[ext] || 'plaintext');
    editor.setValue(files[name]);
    document.getElementById('current-tab-name').innerText = name;
    renderTree();
}

// FIX: Site Preview Logic
function refreshPreview() {
    const frame = document.getElementById('preview-frame');
    
    // Sabhi files ka content collect karna
    const htmlContent = files['index.html'] || "";
    const cssContent = `<style>${files['style.css'] || ""}</style>`;
    const jsContent = `<script>${files['script.js'] || ""}<\/script>`;

    // Ifame mein load karna
    const blob = new Blob([`
        <!DOCTYPE html>
        <html>
            <head>${cssContent}</head>
            <body>
                ${htmlContent}
                ${jsContent}
            </body>
        </html>
    `], { type: 'text/html' });

    frame.src = URL.createObjectURL(blob);
}

function executeCode() {
    terminal.writeln('\r\n$ Running project...');
    refreshPreview();
}

// Terminal & Resizers unchanged (working fine)
function initTerminal() {
    terminal = new Terminal({ theme: { background: '#000' }, fontSize: 13 });
    terminal.open(document.getElementById('terminal-container'));
}

function setupResizers() {
    const handleResize = (resizerId, callback) => {
        const resizer = document.getElementById(resizerId);
        resizer.addEventListener('mousedown', e => {
            document.getElementById('preview-frame').style.pointerEvents = 'none';
            const onMouseMove = m => callback(m);
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.getElementById('preview-frame').style.pointerEvents = 'auto';
                editor.layout();
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    };

    handleResize('resizer-side', m => {
        if (m.clientX > 50 && m.clientX < 400) document.getElementById('sidebar').style.width = (m.clientX - 50) + 'px';
    });

    handleResize('resizer-main', m => {
        const newWidth = window.innerWidth - m.clientX;
        if (newWidth > 100) document.getElementById('output-area').style.width = newWidth + 'px';
    });

    handleResize('resizer-term', m => {
        const newHeight = window.innerHeight - m.clientY;
        if (newHeight > 40) document.getElementById('terminal-pane').style.height = newHeight + 'px';
    });
}