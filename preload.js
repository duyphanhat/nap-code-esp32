const { ipcRenderer } = require('electron');

ipcRenderer.on('port-list', (event, portList) => {
  // Hien hop chon COM voi ten that (COM3, COM4...)
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';

  const box = document.createElement('div');
  box.style.cssText = 'background:#d4d0c8;border:2px solid #808080;min-width:360px;font-family:Tahoma,sans-serif;box-shadow:4px 4px 10px rgba(0,0,0,0.6);';

  // Tao ten hien thi dep cho moi port
  const portOptions = portList.map((p, i) => {
    let name = p.portName || p.displayName || '';
    // portName thuong la "COM3", "COM4" tren Windows
    if (!name && p.portId) name = p.portId;
    if (!name) name = 'COM Port ' + (i + 1);
    const vid = p.usbVendorId ? ` [VID:${p.usbVendorId.toString(16).toUpperCase()}]` : '';
    return `<option value="${p.portId}">${name}${vid}</option>`;
  }).join('');

  box.innerHTML = `
    <div style="background:#000080;color:#fff;padding:5px 10px;font-weight:bold;font-size:13px;">
      Chon Cong COM - ESP32
    </div>
    <div style="padding:14px;">
      <p style="margin:0 0 8px;font-size:13px;">Chon cong COM cua mach ESP32:</p>
      <select id="_comSel" style="width:100%;padding:5px;font-size:13px;margin-bottom:14px;border:1px inset #808080;">
        ${portOptions}
      </select>
      <div style="display:flex;justify-content:flex-end;gap:8px;">
        <button id="_comOK" style="padding:4px 24px;font-size:13px;cursor:pointer;background:#d4d0c8;border:2px outset #fff;font-family:Tahoma;">Ket Noi</button>
        <button id="_comCancel" style="padding:4px 24px;font-size:13px;cursor:pointer;background:#d4d0c8;border:2px outset #fff;font-family:Tahoma;">Huy</button>
      </div>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById('_comOK').onclick = () => {
    const val = document.getElementById('_comSel').value;
    ipcRenderer.send('port-chosen', val);
    document.body.removeChild(overlay);
  };
  document.getElementById('_comCancel').onclick = () => {
    ipcRenderer.send('port-chosen', '');
    document.body.removeChild(overlay);
  };
});
