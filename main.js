var app = require('app')
  ,BrowserWindow = require('browser-window')
  ,Menu = require('menu')
  ,Geth = require('./modules/Geth.js')

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit();
});

var template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      }
    ]
  }
];

if (process.platform == 'darwin') {
  template.unshift({
    label: 'SafeMarket',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      },
    ]
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

  var binPath = './bin/'+ process.platform +'-'+ process.arch + '/geth'

  if(process.platform === 'win32')
      binPath += '.exe';

  console.log('binPath',binPath)

  var Geth = require('./modules/geth.js')
    ,datadir = app.getPath('userData')+'/node'
    ,geth = new Geth(binPath,['--datadir',datadir])

  app.on('before-quit',function(){
    geth.kill()
  })

  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  var mainWindow = new BrowserWindow({width: 800, height: 600});

  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  geth.quickstart('password').then(function(){
    console.log('================================== geth ready ==================================')
  },function(message){
    console.log('================================== geth failed ==================================')
    mainWindow.webContents.executeJavaScript("alert('"+message.trim().split("'").join('"')+"');window.close();");
  })
});
