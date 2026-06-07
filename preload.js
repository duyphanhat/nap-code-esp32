const { contextBridge, ipcRenderer } = require('electron');

// Inject hop chon COM vao trang web
ipcRenderer.on('show-port-picker', (event, portList) => {
  // Tao hop thoai chon COM
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: 99999;
    display: flex; align-items: center; justify-content: center;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: #d4d0c8; border: 2px solid #808080;
    padding: 16px; min-width: 320px; font-family: 'Tahoma', sans-serif;
    box-shadow: 3px 3px 8px rgba(0,0,0,0.5);
  `;

  const title = document.createElement('div');
  title.style.cssText = `
    background: #000080; color: white; padding: 4px 8px;
    margin: -16px -16px 12px -16px; font-weight: bold; font-size: 13px;
  `;
  title.textContent = 'Chon Cong COM';

  const label = document.createElement('p');
  label.style.cssText = 'margin: 0 0 8px; font-size: 13px;';
  label.textContent = 'Chon cong COM cua ESP32:';

  const select = document.createElement('select');
  select.style.cssText = 'width: 100%; padding: 4px; font-size: 13px; margin-bottom: 12px;';

  portList.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.portId;
    opt.textContent = p.displayName || p.portName || p.portId;
    select.appendChild(opt);
  });

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display: flex; justify-content: flex-end; gap: 8px;';

  const btnOK = document.createElement('button');
  btnOK.textContent = 'Ket Noi';
  btnOK.style.cssText = `
    padding: 4px 20px; font-size: 13px; cursor: pointer;
    background: #d4d0c8; border: 2px outset #fff;
  `;

  const btnCancel = document.createElement('button');
  btnCancel.textContent = 'Huy';
  btnCancel.style.cssText = `
    padding: 4px 20px; font-size: 13px; cursor: pointer;
    background: #d4d0c8; border: 2px outset #fff;
  `;

  btnOK.onclick = () => {
    ipcRenderer.send('port-selected', select.value);
    document.body.removeChild(overlay);
  };

  btnCancel.onclick = () => {
    ipcRenderer.send('port-selected', '');
    document.body.removeChild(overlay);
  };

  btnRow.appendChild(btnOK);
  btnRow.appendChild(btnCancel);
  box.appendChild(title);
  box.appendChild(label);
  box.appendChild(select);
  box.appendChild(btnRow);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
});
