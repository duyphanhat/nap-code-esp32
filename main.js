const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Bat Web Serial API tren file:// protocol
app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('enable-features', 'WebSerial');
app.commandLine.appendSwitch('enable-blink-features', 'WebSerial');
// Cho phep Web Serial hoat dong tren file:// (quan trong nhat)
app.commandLine.appendSwitch('unsafely-treat-insecure-origin-as-secure', 'file://');
app.commandLine.appendSwitch('allow-running-insecure-content');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 720, minWidth: 1050, minHeight: 620,
    title: 'NAP CODE CHI BIA TAP BAN',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Tat web security de Serial + module hoat dong tren file://
    },
    frame: true,
    backgroundColor: '#d4d0c8',
    show: false,
  });

  Menu.setApplicationMenu(null);

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);

  win.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();
    if (portList.length > 0) callback(portList[0].portId);
    else callback('');
  });

  // Load file truc tiep - type=module hoat dong tot
  win.loadFile('index.html');

  win.once('ready-to-show', () => { win.show(); win.focus(); });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => { app.quit(); });
