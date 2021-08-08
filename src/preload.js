const electron = require('electron');

const Store = require('electron-store');
const iconv = require('iconv-lite');
const fs = require('fs');
const path = require('path');
const isPackaged = require('electron-is-packaged').isPackaged;
const rootPath = require('electron-root-path').rootPath;
const xlsx = require('xlsx');
const csvParser = require('csv-string');

let mainWindow;

process.once('loaded', () => {
  global.ipcRenderer = electron.ipcRenderer;
  global.xlsx = xlsx;
  global.app = electron.remote.app;
  global.remote = electron.remote;

  global.store = new Store();
  // global.store = electron.remote.getGlobal('store');

  global.clipboard = {};
  global.clipboard.write = function (json) {
    const buffer = iconv.encode(JSON.stringify(json, 'utf-8'), 'utf-8');
    electron.remote.clipboard.writeBuffer('application/rpgmz-event', buffer);
  };
  global.clipboard.writeEvent = function (json) {
    const buffer = iconv.encode(JSON.stringify(json, 'utf-8'), 'utf-8');
    electron.remote.clipboard.writeBuffer('application/rpgmz-event', buffer);
  };
  global.clipboard.writeText = function (str) {
    electron.remote.clipboard.writeText(str);
  };
  global.clipboard.readTable = function () {
    const str = electron.remote.clipboard.readText();
    return csvParser.parse(str, '\t', '"');
  };
  global.clipboard.writeCommand = function (json) {
    const buffer = iconv.encode(JSON.stringify(json, 'utf-8'), 'utf-8');
    electron.remote.clipboard.writeBuffer('application/rpgmz-EventCommand', buffer);
  };
  global.clipboard.readCommand = function () {
    const buffer = electron.remote.clipboard.readBuffer('application/rpgmz-EventCommand');
    return JSON.parse(iconv.decode(buffer, 'utf-8'));
  };

  global.Browser = {};
  // global.Browser.createWindow = function(options, url) {
  //     let newWindow = new electron.remote.BrowserWindow(options);
  //     options['webPreferences'] = {
  //         nodeIntegration: false,
  //         enableRemoteModule: true,
  //         contextIsolation: false,
  //         preload: __dirname + '/preload.js'
  //     }
  //     options['parent'] = electron.remote.getGlobal('mainWindow');

  //     newWindow.loadURL('file://' + __dirname + '/html/' + url + '.html');
  //     newWindow.webContents.openDevTools();
  //     newWindow.on('closed', () => {
  //         newWindow = null;
  //     });
  //     newWindow.once('ready-to-show', () => {
  //         newWindow.show()
  //     })
  //     return newWindow;
  // };

  // mainWindow = electron.remote.BrowserWindow.getAllWindows()[0];

  // global.Browser.getMainWindow = function() {
  //     return mainWindow;
  // };

  global.Browser.minimizeAll = function () {
    const allWindows = electron.remote.BrowserWindow.getAllWindows();
    for (const openWindow of allWindows) {
      openWindow.minimize();
    }
  };
  global.Browser.closeAll = function () {
    const allWindows = electron.remote.BrowserWindow.getAllWindows();
    for (const openWindow of allWindows) {
      openWindow.close();
    }
  };
  global.Browser.showAll = function () {
    const allWindows = electron.remote.BrowserWindow.getAllWindows();
    for (const openWindow of allWindows) {
      openWindow.showInactive();
    }
  };

  global.fs = {};
  global.fs.writeFileSync = function (fileName, outputPath, json) {
    fs.writeFileSync(path.join(outputPath, fileName + '.json'), JSON.stringify(json), 'utf-8');
  };
  global.fs.mkdirSync = function (dirName) {
    // fs.mkdir(path.join(global.rootPath, dirName));
    return fs.mkdirSync(dirName);
  };
  global.fs.existsSync = function (dirName) {
    // fs.mkdir(path.join(global.rootPath, dirName));
    return fs.existsSync(dirName);
  };
  global.fs.readFileSync = function (fileName, options) {
    return fs.readFileSync(__dirname + fileName, options);
  };

  global.path = {};
  global.path.join = async function (a, b) {
    return path.join(a, b);
  };

  global.dialog = {};
  global.dialog.showMessageBox = async function (e) {
    await electron.remote.dialog.showMessageBox(e);
  };
  global.dialog.showSaveDialog = async function (e) {
    await electron.remote.dialog.showSaveDialog(e);
  };
  global.dialog.showOpenDialog = async function (e) {
    await electron.remote.dialog.showOpenDialog(e);
  };

  // fs.mkdir(path.join(global.outputPath, 'output'));

  // global.dialog.showMessageBox = function(e){electron.dialog.showMessageBox(e)};
  // global.dialog.showSaveDialog = function(e){electron.dialog.showSaveDialog(e)};

  // electron.contextBridge.exposeInMainWorld(
  //     "api", {
  //         send: (channel, data) => {
  //             // whitelist channels
  //             let validChannels = ["toMain"];
  //             if (validChannels.includes(channel)) {
  //                 ipcRenderer.send(channel, data);
  //             }
  //         },
  //         receive: (channel, func) => {
  //             let validChannels = ["fromMain"];
  //             if (validChannels.includes(channel)) {
  //                 // Deliberately strip event as it includes `sender`
  //                 ipcRenderer.on(channel, (event, ...args) => func(...args));
  //             }
  //         }
  //     }
  // );
});
