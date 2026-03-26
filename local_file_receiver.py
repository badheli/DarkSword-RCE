import http.server
import socketserver
import json
import os
import base64
from pathlib import Path

PORT = 8882
UPLOAD_DIR = "uploads"

class FileReceiverHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/stats':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                payload = json.loads(post_data.decode('utf-8'))
                
                device_uuid = payload.get('deviceUUID', 'unknown_device')
                category = payload.get('category', 'unknown_category')
                file_path_str = payload.get('path', 'unknown_path')
                base64_data = payload.get('data', '')
                
                # Sanitize to prevent path traversal
                device_uuid = os.path.basename(device_uuid)
                category = os.path.basename(category)
                
                # Sanitize filename from path, handle long names
                filename = os.path.basename(file_path_str)
                if not filename:
                    filename = "file.dat"

                # Create directory structure
                save_dir = Path(UPLOAD_DIR) / device_uuid / category
                save_dir.mkdir(parents=True, exist_ok=True)
                
                save_path = save_dir / filename
                
                # Decode and save the file
                file_data = base64.b64decode(base64_data)
                
                with open(save_path, 'wb') as f:
                    f.write(file_data)
                
                print(f"Received file: {file_path_str}")
                print(f"Saved to: {save_path}")
                print("-" * 20)

                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'OK')
            except Exception as e:
                print(f"Error processing request: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(b'Error')
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

Handler = FileReceiverHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Starting local file receiver server on port {PORT}")
    print(f"Files will be saved in the '{UPLOAD_DIR}' directory.")
    Path(UPLOAD_DIR).mkdir(exist_ok=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("
Stopping server.")
        httpd.shutdown()
