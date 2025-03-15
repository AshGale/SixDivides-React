from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class PublicDirectoryHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Set the directory to 'public'
        super().__init__(*args, directory='public', **kwargs)

    def end_headers(self):
        # Prevent caching
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    server_address = ('', 8080)
    httpd = HTTPServer(server_address, PublicDirectoryHandler)
    print('Server running at http://localhost:8080')
    print('Serving files from: ' + os.path.abspath('public'))
    httpd.serve_forever()
