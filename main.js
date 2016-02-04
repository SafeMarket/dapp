var app = require('app')
  ,BrowserWindow = require('browser-window')
  ,Menu = require('menu')
  ,Geth = require(__dirname+'/modules/Geth.js')

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null
  ,areImagesEnabled = false
  ,isGethStarted = false

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
      },
      {
        label: 'Toggle Remote Images (Unsafe)',
        type: 'checkbox',
        checked: areImagesEnabled,
        click: function(item, focusedWindow) {
          console.log('enable images ? ', !areImagesEnabled)
          if (focusedWindow){
            var htmlFile = areImagesEnabled ? '/index.html' : '/index.unsafe.html'
            focusedWindow.loadUrl('file://' + __dirname + htmlFile);
            areImagesEnabled = !areImagesEnabled
          }
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

  var binPath = __dirname+'/bin/'+ process.platform +'-'+ process.arch + '/geth'

  if(process.platform === 'win32')
      binPath += '.exe';

  console.log('binPath',binPath)

  var userdir =  app.getPath('userData')
    ,datadir = userdir+'/node'
    ,geth = new Geth(binPath,[])

  app.on('before-quit',function(){
    geth.kill()
  })

  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  var mainWindow = new BrowserWindow({width: 800, height: 600, "node-integration": false});

  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', function() {

    if(areImagesEnabled)
      mainWindow.webContents.executeJavaScript("areImagesEnabled=true;alert('Remote images are now enabled. These remote images can be used to track your browsing.');");

    if(isGethStarted)
      return
    else
      isGethStarted = true

    geth.startRpc().then(function(){
      console.log('================================== geth ready ==================================')
    },function(message){
      console.log('================================== geth failed ==================================')
      mainWindow.webContents.executeJavaScript("alert('"+message.trim().split("'").join('"')+"');");
    })
  });

});
