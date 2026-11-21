import os
import sys
import webview

def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

if __name__ == '__main__':
    # static फोल्डर के अंदर की index.html का पाथ
    html_file = get_resource_path(os.path.join('static', 'index.html'))
    
    window = webview.create_window(
        title='CodeFlow Live',
        url=html_file,
        width=1000,
        height=700,
        resizable=True
    )
    webview.start()