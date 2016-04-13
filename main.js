const app = require('app')
const BrowserWindow = require('browser-window')
const Menu = require('menu')
const Geth = require(`${__dirname}/modules/Geth.js`)
const dialog = require('electron').dialog
const q = require('q')
const cp = require('child_process')

const extension = process.platform === 'win32' ? '.exe' : ''
const binPath = `${__dirname}/geth/${process.platform}-${process.arch}/geth${extension}`

let areImagesEnabled = false
let isGethStarted = false
let geth
let mainWindow

app.on('window-all-closed', () => {
  app.quit()
})

const template = [
  {
    label: 'SafeMarket',
    submenu: [
      {
        label: 'Reset Chain',
        click() { resetChain() }
      }
    ]
  },
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
  template[0].submenu.push({
    label: 'Quit',
    accelerator: 'Command+Q',
    click() { app.quit() }
  })
}

function resetChain() {

  const doReset = dialog.showMessageBox(
    mainWindow,
    {
      type: 'question',
      buttons: ['Cancel', 'Ok'],
      title: 'Reset Chain',
      message: 'Are you sure you want to reset the chain? You will have to start node sync from scratch.'
    }
  )

  console.log('resetChain', doReset)

  if (doReset === 0) { return }

  console.log('killing geth')

  geth.kill().then(() => {
    console.log('killed geth')
    console.log('removing db')
    removedb().then(() => {
      console.log('starting rpc')
      geth.startRpc()
    })
  })

}

function removedb() {
  const deferred = q.defer()

  cp.spawn('bin/removedb', ['geth']).stdout.on('data', (data) => {
    process.stdout.write(data.toString())
    if (data.indexOf('Fatal') > -1) {
      deferred.reject(data)
    }
    if (data.indexOf('Removed') > -1) {
      deferred.resolve()
    }
  })

  return deferred.promise
}

app.on('ready', () => {

  geth = new Geth(binPath, [])

  app.on('before-quit', () => {
    geth.kill()
  })

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow = new BrowserWindow({
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
