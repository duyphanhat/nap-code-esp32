const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('enable-features', 'WebSerial');
app.commandLine.appendSwitch('enable-blink-features', 'WebSerial');

let server;
let serverPort = 9876;
let pendingPortCallback = null;
let mainWin = null;

function startLocalServer() {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      const filePath = path.join(__dirname, 'index.html');
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    server.listen(serverPort, '127.0.0.1', () => resolve());
    server.on('error', () => {
      serverPort++;
      server.listen(serverPort, '127.0.0.1', () => resolve());
    });
  });
}

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1200,
    height: 720,
    minWidth: 1050,
    minHeight: 620,
    title: 'NAP CODE CHI BIA TAP BAN',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: true,
    backgroundColor: '#d4d0c8',
    show: false,
  });

  Menu.setApplicationMenu(null);
  win = mainWin;

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);

  // Bat su kien chon serial port - hien hop thoai tu tao
  win.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();

    if (portList.length === 0) {
      // Khong co port nao
      win.webContents.executeJavaScript(`
        alert('Khong tim thay cong COM nao!\\nHay cam mach ESP32 vao USB truoc.');
      `);
      callback('');
      return;
    }

    // Luu callback lai
    pendingPortCallback = callback;

    // Gui danh sach port len renderer de hien hop chon
    win.webContents.send('show-port-picker', portList);
  });

  // Nhan ket qua chon tu renderer
  ipcMain.on('port-selected', (event, portId) => {
    if (pendingPortCallback) {
      pendingPortCallback(portId);
      pendingPortCallback = null;
    }
  });

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
