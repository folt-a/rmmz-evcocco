const openWindows = [];

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
function onDOMContentLoaded(event) {
  if (Store.get('isAlwaysOnTop')) {
    document.getElementById('bringFrontIcon').classList.add('enabled');
  }
}

document.getElementById('minimize').addEventListener('click', (e) => {
  // //他の画面も最小化する
  for (const openWindow of openWindows) {
    openWindow.minimize();
  }
  Browser.minimizeAll();
});

document.getElementById('bringFront').addEventListener('click', (e) => {
  IpcRenderer.send('bringfront_menu');
  document.getElementById('bringFrontIcon').classList.toggle('enabled');
});

document.getElementById('close').addEventListener('click', (e) => {
  Browser.closeAll();
});

// イベントメニュー画面を開く
document.getElementById('eventMenu').addEventListener('click', (e) => {
  IpcRenderer.send('open_window', {
    options: {
      width: 570,
      height: 880,
      show: false,
      resizable: true,
      maximizable: false,
      minimizable: false,
    },
    url: 'eventMenu',
  });
});

// イベント画面を開く
document.getElementById('event').addEventListener('click', (e) => {
  IpcRenderer.send('open_event', {
    options: {
      width: 1280,
      height: 880,
      resizable: true,
      maximizable: false,
      minimizable: false,
    },
    url: 'event',
  });
});

// シナリオコンバート画面を開く
document.getElementById('convert').addEventListener('click', (e) => {
  IpcRenderer.send('open_window', {
    options: {
      width: 500,
      height: 700,
      resizable: true,
      maximizable: false,
      minimizable: false,
    },
    url: 'convert',
    x: 50,
    y: 50,
  });
});

// シナリオ編集画面を開く
document.getElementById('scenario').addEventListener('click', (e) => {
  IpcRenderer.send('open_window', {
    options: {
      width: 1280,
      height: 880,
      resizable: true,
      maximizable: true,
      minimizable: true,
    },
    url: 'scenario',
  });
});