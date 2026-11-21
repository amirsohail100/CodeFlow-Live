import os
import urllib.request

def download_libraries():
    # web/libs फोल्डर का रास्ता बनाएं
    libs_dir = os.path.join("web", "libs")
    os.makedirs(libs_dir, exist_ok=True)

    # डाउनलोड करने वाली फाइलों की लिस्ट (URL और उनका लोकल नाम)
    files_to_download = {
        "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js": "jszip.min.js",
        "https://cdn.jsdelivr.net/npm/xterm@5.1.0/css/xterm.css": "xterm.css",
        "https://cdn.jsdelivr.net/npm/xterm@5.1.0/lib/xterm.js": "xterm.js",
        "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs/loader.min.js": "loader.min.js",
        "https://unpkg.com/lucide@latest/dist/umd/lucide.min.js": "lucide.min.js"
    }

    print("लाइब्रेरीज़ डाउनलोड होना शुरू हो रही हैं...\n")

    for url, filename in files_to_download.items():
        file_path = os.path.join(libs_dir, filename)
        try:
            print(f"다운लोड हो रहा है: {filename}...")
            urllib.request.urlretrieve(url, file_path)
            print(f"सफलतापूर्वक सेव हुआ: {file_path}")
        except Exception as e:
            print(f"डेटा डाउनलोड करने में एरर ({filename}): {e}")

    print("\nसभी लाइब्रेरीज़ सफलतापूर्वक 'web/libs' फोल्डर में सेव हो चुकी हैं!")

if __name__ == "__main__":
    download_libraries()