const { app, Menu, BrowserWindow, Tray, ipcMain, MessageChannelMain } = require('electron');

const Store = require('electron-store');
Store.initRenderer();

const store = new Store();
let mainWindow;

let Windows = [];

const isOpenDevTools = false;

(
    /**
     * Electronメイン処理
     */
    function main() {
        function createMainMenu() {
            let options = {
                width: 600,
                height: 50,
                show: false,
                frame: false,
                resizable: false,
                transparent: true,
                titleBarStyle: 'customButtonsOnHover',
                icon: __dirname + '/img/icon.png',
                webPreferences: {
                    nodeIntegration: false,
                    enableRemoteModule: true,
                    contextIsolation: false,
                    preload: __dirname + '/preload.js',
                },
            };

            // 前回位置記憶
            if (store.has('windowPosition')) {
                const pos = store.get('windowPosition');
                options['center'] = false;
                options['x'] = pos.x;
                options['y'] = pos.y;
            } else {
                options['center'] = true;
            }
            if (store.has('isAlwaysOnTop')) {
                const isAlwaysOnTop = store.get('isAlwaysOnTop');
                options['alwaysOnTop'] = isAlwaysOnTop;
            } else {
                options['alwaysOnTop'] = true;
                store.set('isAlwaysOnTop', true);
            }


            mainWindow = new BrowserWindow(options);

            mainWindow.loadURL('file://' + __dirname + '/html/menu.html');

            if (isOpenDevTools) {
                // 開発ツールを有効化
                mainWindow.webContents.openDevTools();
            }

            Menu.setApplicationMenu(null);

            mainWindow.on('moved', () => {
                store.set('windowPosition', {
                    x: mainWindow.getPosition()[0],
                    y: mainWindow.getPosition()[1],
                });
            });

            mainWindow.on('closed', () => {
                mainWindow = null;
                app.quit();
            });

            mainWindow.once('ready-to-show', () => {
                mainWindow.show();
            });
        }

        app.on('ready', createMainMenu);

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            if (mainWindow === null) {
                createMainMenu();
                global.mainWindow = mainWindow;
            }
        });

        // イベントメニューからイベント管理にデータ転送
        ipcMain.on('bringfront_menu', (event, args) => {
            store.set('isAlwaysOnTop', !mainWindow.isAlwaysOnTop());
            const toggleAlways = !mainWindow.isAlwaysOnTop()
            mainWindow.setAlwaysOnTop(toggleAlways, 'screen');
            for (const w of Windows.filter(i => typeof i === "object")) {
                w.setAlwaysOnTop(toggleAlways, 'screen');
            }
        });

    })();


(
    /**
     * 設定値初期設定
     */
    function storeInit() {
        //初期値
        if (store.has('favorites')) {
            store.set('favorites', [{
                id: 125,
                title: '文章の表示',
                class: 'is-link',
                mycommands: [{
                    id: 221,
                    type: 'text',
                    maxlength: 10,
                    name: '名前',
                    value: 'ゆうしゃ',
                },
                {
                    id: 222,
                    type: 'textarea',
                    maxlength: 20,
                    name: '文章',
                    rows: 4,
                    cols: 24,
                    value: 'ああああああ\nいいいいいい',
                },
                ],
                isListVisible: true,
            },
            { id: 126, title: '選択肢の表示', class: 'is-link', isListVisible: true },
            {
                id: 127,
                title: 'スイッチの操作',
                class: 'is-link',
                mycommands: [
                    { id: 224, type: 'code', maxlength: 5, name: '番号', value: '15' },
                    {
                        id: 225,
                        type: 'span',
                        maxlength: 20,
                        name: '名前',
                        value: 'なんとかスイッチ',
                    },
                    { id: 226, type: 'checkbox', count: 2, name: '値', value: false },
                ],
                isListVisible: true,
            },
            {
                id: 128,
                title: 'スイッチの操作',
                class: 'is-link',
                mycommands: [
                    { id: 227, type: 'code', maxlength: 5, name: '番号', value: '15' },
                    {
                        id: 228,
                        type: 'span',
                        maxlength: 20,
                        name: '名前',
                        value: 'なんとかスイッチ',
                    },
                    { id: 229, type: 'checkbox', count: 2, name: '値', value: true },
                ],
                isListVisible: false,
            },
            ]);
        }
    })();

(
    /**
     * イベント管理（旧）
     */
    function events() {
        let events = [];

        ipcMain.on('open_event', (event, args) => {
            args.options['alwaysOnTop'] = false;
            args.options['x'] = mainWindow.getPosition()[0] + args.x;
            args.options['y'] = mainWindow.getPosition()[1] + args.y;
            args.options['center'] = false;
            args.options['webPreferences'] = {
                nodeIntegration: false,
                enableRemoteModule: true,
                contextIsolation: false,
                preload: __dirname + '/preload.js',
            };
            args.options['icon'] = __dirname + '/img/icon.png';
            let subWindow = new BrowserWindow(args.options); //サブウィンドウを生成
            // subWindow();
            subWindow.loadURL('file://' + __dirname + '/html/' + args.url + '.html');

            if (isOpenDevTools) {
                // 開発ツールを有効化
                subWindow.webContents.openDevTools();
            }

            const num = events.push(subWindow);
            subWindow.on('closed', () => {
                events.pop(num);
                subWindow = null;
            });
            subWindow.once('ready-to-show', () => {
                subWindow.show();
            });

            mainWindow.on('restore', () => {
                if (subWindow != null) {
                    subWindow.focus();
                }
            });
            subWindow.on('restore', () => {
                mainWindow.show();
            });
        });

        // イベントメニューからイベント管理にデータ転送
        ipcMain.on('event_add', (event, args) => {
            events.forEach((ev) => {
                if (ev) {
                    const { port1, port2 } = new MessageChannelMain();
                    ev.webContents.postMessage('event_add', args, [port1]);
                }
            });
        });
    }
)();

(function windowsUtils(params) {

    ipcMain.on('open_window', (event, args) => {
        // TODO IDがいい感じにならない
        let calledWindow = null;
        if (args.options['parent'] != undefined
            && args.options['parent'] != null) {
            calledWindow = Windows.filter(i => typeof i === "object").find(i => i.webContents.id === args.options['parent']);
            args.options['parent'] = calledWindow;
        }

        // 前回位置記憶
        if (store.has(args.url + '_' + 'windowPosition')) {
            const pos = store.get(args.url + '_' + 'windowPosition');
            args.options['center'] = false;
            args.options['x'] = pos.x;
            args.options['y'] = pos.y;
        } else {
            args.options['center'] = true;
        }
        if (store.has('isAlwaysOnTop')) {
            const isAlwaysOnTop = store.get('isAlwaysOnTop');
            args.options['alwaysOnTop'] = isAlwaysOnTop;
        }
        if (store.has(args.url + '_' + 'windowSize')) {
            const pos = store.get(args.url + '_' + 'windowSize');
            args.options['width'] = pos.w;
            args.options['height'] = pos.h;
        }

        args.options['webPreferences'] = {
            nodeIntegration: false,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: __dirname + '/preload.js',
        };
        args.options['show'] = false;
        let openWindow = new BrowserWindow(args.options); //サブウィンドウを生成
        // subWindow();
        openWindow.loadURL('file://' + __dirname + '/html/' + args.url + '.html');

        Windows[openWindow.webContents.id] = openWindow;

        if (isOpenDevTools) {
            // 開発ツールを有効化
            openWindow.webContents.openDevTools();
        }

        openWindow.on('moved', () => {
            store.set(args.url + '_' + 'windowPosition', {
                x: openWindow.getPosition()[0],
                y: openWindow.getPosition()[1],
            });
        });
        openWindow.on('resize', () => {
            store.set(args.url + '_' + 'windowSize', {
                w: openWindow.getSize()[0],
                h: openWindow.getSize()[1],
            });
        });
        openWindow.on('closed', () => {
            openWindow = null;
        });
        openWindow.once('ready-to-show', () => {
            openWindow.show();
        });

        mainWindow.on('restore', () => {
            if (openWindow != null) {
                openWindow.focus();
            }
        });
        openWindow.on('restore', () => {
            mainWindow.show();
        });
        if (calledWindow != null) {
            calledWindow.on('close', () => {
                if (openWindow != null) {
                    openWindow.close();
                    openWindow = null;
                }
            });
            calledWindow.on('restore', () => {
                if (openWindow != null) {
                    openWindow.focus();
                }
            });
        }
    });

    ipcMain.on('open_modalwindow', (event, args) => {
        const calledWindow = Windows[args.options['parent']];
        args.options['parent'] = calledWindow;
        args.options['x'] = calledWindow.getPosition()[0] + (calledWindow.getSize()[0] / 2);
        args.options['y'] = calledWindow.getPosition()[1] + (calledWindow.getSize()[1] / 2);
        args.options['modal'] = true;
        args.options['center'] = false;
        args.options['webPreferences'] = {
            nodeIntegration: false,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: __dirname + '/preload.js',
        };
        if (store.has('isAlwaysOnTop')) {
            const isAlwaysOnTop = store.get('isAlwaysOnTop');
            args.options['alwaysOnTop'] = isAlwaysOnTop;
        }
        // args.options['modal'] = true
        args.options['icon'] = __dirname + '/img/icon.png';
        let subWindow = new BrowserWindow(args.options); //サブウィンドウを生成
        // subWindow();
        subWindow.loadURL('file://' + __dirname + '/html/' + args.url + '.html');

        // subWindow.webContents.openDevTools();

        subWindow.on('closed', () => {
            subWindow = null;
        });
        subWindow.once('ready-to-show', () => {
            subWindow.show();
        });

        mainWindow.on('restore', () => {
            if (subWindow != null) {
                subWindow.focus();
            }
        });
        subWindow.on('restore', () => {
            mainWindow.show();
        });
    });

    ipcMain.on('bringfront', (event, args) => {

        args.isBringFront =
            store.set('isAlwaysOnTop', !mainWindow.isAlwaysOnTop());
        mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop(), 'screen');
    });
})();

// イベントメニューからイベント管理にデータ転送
ipcMain.on('event_add', (event, args) => {
    events.forEach((ev) => {
        if (ev) {
            const { port1, port2 } = new MessageChannelMain();
            ev.webContents.postMessage('event_add', args, [port1]);
        }
    });
});