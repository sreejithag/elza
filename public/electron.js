const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const electronDl = require('electron-dl')
const { download } = require('electron-dl')
const { autoUpdater } = require('electron-updater')
const contextMenu = require('electron-context-menu')
const log = require('electron-log')
const fs = require('fs')
const path = require('path')
const tor = require('./tor.js')
const configFilePath = app.getPath('userData') + '/preferences.json'
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

global.platform = process.platform
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.warn('test log')
let downloads = {}
let askLocation
Menu.setApplicationMenu(null)
let mainWindow
let newWindow

let initialConfig = {
  searchEngine: 'google',
  downloadLocation: app.getPath('downloads')
}
try {
  fs.writeFileSync(configFilePath, JSON.stringify(initialConfig), {
    flag: 'wx'
  })
} catch (error) {}

let downloadLocation = require(configFilePath).downloadLocation
if (downloadLocation == 'ask') askLocation = true
else askLocation = false
app.on('window-all-closed', function () {
  app.quit()
})
updateDownload = () => {
  mainWindow.webContents.send('downloads_changed', downloads)
}

tor.connect_tor()
if (require(configFilePath).isTorEnabled) {
  app.commandLine.appendSwitch('proxy-server', 'socks5://127.0.0.1:9050')
}

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    title: 'Elza Browser',
    titleBarStyle: 'hiddenInset',
    show: false,
    icon: path.join(__dirname, '/icon.png'),
    resizable: true,
    width: 1000,
    height: 600,
    minWidth: 700,
    minHeight: 350,
    frame: false,
    webPreferences: {
      enableRemoteModule: true,
      webSecurity: false,
      webviewTag: true,
      nodeIntegration: true
    }
  })
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.openDevTools()
  } else {
    mainWindow.loadFile('./build/index.html')
    autoUpdater.checkForUpdatesAndNotify()
    //mainWindow.openDevTools()
  }
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.maximize()
  })
})
app.on('web-contents-created', (e, contents) => {
  if (contents.getType() == 'webview') {
    contextMenu({
      prepend: (defaultActions, params, browserWindow) => [
        {
          label: 'Open in New Tab',
          visible: params.linkURL.trim().length > 0,
          click: () => {
            mainWindow.webContents.send('openin_newtab', params.linkURL)
          }
        },
        {
          label: 'Open Image in New Tab',
          visible: params.mediaType === 'image',
          click: () => {
            mainWindow.webContents.send('openin_newtab', params.srcURL)
          }
        },
        {
          label: 'Open New Window',
          visible: true,
          click: () => {
            newWindow = new BrowserWindow({
              title: 'Elza Browser',
              titleBarStyle: 'hidden',
              show: false,
              icon: path.join(__dirname, '/icon.png'),
              resizable: true,
              width: 1000,
              height: 600,
              minWidth: 700,
              minHeight: 350,
              frame: false,
              webPreferences: {
                enableRemoteModule: true,
                webSecurity: false,
                webviewTag: true,
                nodeIntegration: true
              }
            })
            if (isDev) newWindow.loadURL('http://localhost:3000')
            else newWindow.loadFile('./build/index.html')
            newWindow.once('ready-to-show', () => {
              newWindow.show()
              newWindow.maximize()
            })
          }
        }
      ],
      labels: {
        saveImage: 'Download Image',
        saveLinkAs: 'Download Link'
      },
      showSaveImage: true,
      showInspectElement: true,
      showCopyImageAddress: true,
      showCopyImage: true,
      showSaveLinkAs: true,
      showSearchWithGoogle: false,
      window: contents
    })
  }
})
electronDl({
  saveAs: askLocation,
  showBadge: true,
  directory: downloadLocation,
  onStarted: function (item) {
    var downloadItem = new Object()
    downloadItem.name = item.getFilename()
    downloadItem.totalBytes = item.getTotalBytes()
    downloadItem.receivedBytes = 0
    var d = new Date()
    var downloadID = d.getTime()
    downloadItem.status = 'started'
    downloadItem.path = item.getSavePath()
    downloads[downloadID] = downloadItem
    updateDownload()
    item.once('done', (event, state) => {
      if (state === 'completed') {
        downloads[downloadID].status = 'done'
        updateDownload()
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          downloads[downloadID].receivedBytes = item.getReceivedBytes()
          updateDownload()
        }
      }
    })
  }
})
ipcMain.on('getdownloads', event => {
  event.reply('senddownloads', downloads)
})
ipcMain.on('change_download_setting', (event, pref) => {
  downloadLocation = pref.downloadLocation
  if (downloadLocation == 'ask') askLocation = true
})
ipcMain.on('app_version', event => {
  event.sender.send('app_version', { version: app.getVersion() })
})
ipcMain.on('new_download', (event, argv) => {
  console.log(argv)
  download(mainWindow, argv.url, {
    onProgress: function (item) {
      console.log(item)
    },
    onStarted: function (item) {
      var downloadItem = new Object()
      downloadItem.name = item.getFilename()
      downloadItem.totalBytes = item.getTotalBytes()
      downloadItem.receivedBytes = 0
      var d = new Date()
      var downloadID = d.getTime()
      downloadItem.status = 'started'
      downloadItem.path = item.getSavePath()
      downloads[downloadID] = downloadItem
      updateDownload()
      item.once('done', (event, state) => {
        if (state === 'completed') {
          downloads[downloadID].status = 'done'
          updateDownload()
        } else {
          console.log(`Download failed: ${state}`)
        }
      })
      item.on('updated', (event, state) => {
        if (state === 'interrupted') {
          console.log('Download is interrupted but can be resumed')
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            console.log('Download is paused')
          } else {
            downloads[downloadID].receivedBytes = item.getReceivedBytes()
            updateDownload()
          }
        }
      })
    }
  })
  return () => {
    electron.ipcRenderer.removeAllListeners('new_download')
  }
})
autoUpdater.on('error', error => {
  console.log(error)
})
ipcMain.on('torwindow', event => {
  app.commandLine.appendSwitch('proxy-server', 'socks5://127.0.0.1:9050')
  setTimeout(() => {
    newWindow = new BrowserWindow({
      title: 'Elza Browser',
      titleBarStyle: 'hidden',
      show: false,
      icon: path.join(__dirname, '/icon.png'),
      resizable: true,
      width: 1000,
      height: 600,
      minWidth: 700,
      minHeight: 350,
      frame: false,
      webPreferences: {
        enableRemoteModule: true,
        webSecurity: false,
        webviewTag: true,
        nodeIntegration: true
      }
    })
    try {
      mainWindow.close()
    } catch (error) {}
    if (isDev) newWindow.loadURL('http://localhost:3000')
    else newWindow.loadFile('./build/index.html')
    newWindow.once('ready-to-show', () => {
      newWindow.show()
      newWindow.maximize()
    })
  }, 1000)
})
