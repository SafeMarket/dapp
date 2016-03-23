const app = require('app')
const BrowserWindow = require('browser-window')
const Menu = require('menu')
const Geth = require(`${__dirname}/modules/Geth.js`)

let areImagesEnabled = false
let isGethStarted = false

app.on('window-all-closed', () => {
  app.quit()
})

const template = [
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
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Full Screen',
        accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
          }
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.toggleDevTools()
          }
        }
      },
      {
        label: 'Toggle Remote Images (Unsafe)',
        type: 'checkbox',
        checked: areImagesEnabled,
        click(item, focusedWindow) {
          if (focusedWindow) {
            const htmlFile = areImagesEnabled ? 'index.html' : 'index.unsafe.html'
            focusedWindow.loadUrl(`file://${__dirname}/${htmlFile}`)
            areImagesEnabled = !areImagesEnabled
          }
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: 'SafeMarket',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit() }
      }
    ]
  })
}

app.on('ready', () => {
  const extension = process.platform === 'win32' ? '.exe' : ''
  const binPath = `${__dirname}/bin/${process.platform}-${process.arch}/geth${extension}`

  const geth = new Geth(binPath, [])

  app.on('before-quit', () => {
    geth.kill()
  })

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    'node-integration': false
  })

  mainWindow.loadUrl(`file://${__dirname}/index.html`)

  mainWindow.webContents.on('did-finish-load', () => {
    if (areImagesEnabled) {
      mainWindow.webContents.executeJavaScript('areImagesEnabled=true;alert("Remote images are now enabled. These remote images can be used to track your browsing.");')
    }

    if (isGethStarted) {
      return
    }

    isGethStarted = true

    geth.startRpc().then(() => {
      console.log('======= geth ready =======')
    }, (message) => {
      console.log('======= geth failed =======')
      const minimessage = message.trim().split("'").join('"')
      mainWindow.webContents.executeJavaScript(`alert('${minimessage}')`)
    })
  })
})
