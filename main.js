const { app, BrowserWindow, Menu, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('enable-features', 'WebSerial');
app.commandLine.appendSwitch('enable-blink-features', 'WebSerial');

let server;
let serverPort = 9876;

function startLocalServer() {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      const filePath = path.join(__dirname, 'index.html');
      const content = fs.readFileSync(filePath);
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      });
      res.end(content);
    });
    server.listen(serverPort, '127.0.0.1', () => {
      resolve();
    });
    server.on('error', () => {
      serverPort++;
      server.listen(serverPort, '127.0.0.1', () => resolve());
    });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 720,
    minWidth: 1050,
    minHeight: 620,
    title: 'NAP CODE CHI BIA TAP BAN',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: true,
    backgroundColor: '#d4d0c8',
    show: false,
  });

  Menu.setApplicationMenu(null);

  // Cho phep Web Serial khong hoi quyen
  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);

  // Load qua localhost de Web Serial hoat dong
  win.loadURL(`http://127.0.0.1:${serverPort}`);

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });
}

app.whenReady().then(async () => {
  await startLocalServer();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (server) server.close();
  app.quit();
});
