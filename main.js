const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('enable-features', 'WebSerial');
app.commandLine.appendSwitch('enable-blink-features', 'WebSerial');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 720, minWidth: 1050, minHeight: 620,
    title: 'NAP CODE CHI BIA TAP BAN',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: true, backgroundColor: '#d4d0c8', show: false,
  });

  Menu.setApplicationMenu(null);
  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);

  let pendingCallback = null;

  win.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();
    pendingCallback = callback;
    // Gui danh sach port co ten that len trang
    win.webContents.send('port-list', portList);
  });

  ipcMain.on('port-chosen', (event, portId) => {
    if (pendingCallback) { pendingCallback(portId); pendingCallback = null; }
  });

  win.loadFile('index.html');
  win.once('ready-to-show', () => { win.show(); win.focus(); });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { app.quit(); });
