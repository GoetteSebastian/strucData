const {app, BrowserWindow, dialog, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
let mainWindow
var openFile = {
  path: "",
  data: {},
  isFile: false,
  unsavedChanges: false
}
var unsavedFile = false

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  })

  mainWindow.loadURL(
    isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`
   )

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on("before-quit", (e) => {
    if(unsavedFile) {
      e.preventDefault()
      closeOnUnsavedData(true)
    }
  })

  mainWindow.on("close", (e) => {
    if(unsavedFile) {
      e.preventDefault()
      closeOnUnsavedData(false)
    }
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

const isMac = process.platform === 'darwin'

const template = [
  { role: 'appMenu' },
  {
    label: 'File',
    submenu: [
      {
        label: 'Open file...',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          getFile();
        }
      },
      {
        label: "Save file...",
        accelerator: "CmdOrCtrl+s",
        click: () => {
          mainWindow.webContents.send("fromMain", {action: "get library for saving", data: {close: false}});
        }
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  { role: 'editMenu' },
  { role: 'viewMenu' },
  { role: 'windowMenu' }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

function saveFile(data, closeWindow, quitApp) {
  if(openFile.path.length > 0) {
    writeFile(openFile.path, openFile.data, closeWindow, quitApp);
  }
  else {
    dialog.showSaveDialog(mainWindow, {
      buttonLabel: "Speichern",
      properties: ['createDirectory'],
      filters: [
        {
          name: "JSON Libraries", extensions: ['json']
        }
      ]
    }).then(result => {
      if(result.canceled) {
        console.log("Saveing abored");
        return;
      }
      writeFile(result.filePath, data, closeWindow, quitApp)
    }).catch(err => {
      console.log(err)
    })
  }
}

function writeFile(filePath, data, closeWindow, quitApp) {
  fs.writeFile(filePath, data, "utf8", function(err) {
    if(err) {
      mainWindow.webContents.send("fromMain", {action: "notification", data: {text: "Datei konnte nicht gespeichert werden: " + err, type: "error"}})
      return
    }
    mainWindow.webContents.send("fromMain", {action: "notification", data: {text: "Datei wurde erfolgreich gespeichert. ", type: "success"}})
    mainWindow.webContents.send("fromMain", {action: "set title", data: {fileName: filePath}})
    openFile.path = filePath
    unsavedFile = false
    if(quitApp) app.quit()
    if(closeWindow) mainWindow.close()
  })
}

function getFile() {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      {
        name: "JSON Libraries", extensions: ['json']
      }
    ]
  }).then(result => {
    if(result.canceled) {
      console.log("No file selected")
      return
    }
    fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
      if(err) {
        alert("An error ocurred reading the file :" + err.message)
        return
      }
      openFile.path = result.filePaths[0]
      openFile.data = JSON.parse(data)
      openFile.isFile = true
      mainWindow.webContents.send("GET/lists.res", openFile.data)
    })
  })
}

function closeOnUnsavedData(quit) {
  dialog.showMessageBox(mainWindow, {
    message: "Die Datei enthält ungespeicherte Inhalte. Was willst du tun?",
    type: "question",
    buttons: [
      "Datei speichern und Fenster schliessen",
      "Fenster schliessen ohne zu speichern",
      "Weiter arbeiten"
    ],
    defaultId: 0,
    cancleId: 2
  }).then(answer => {
    switch(answer.response) {
      case 0:
        mainWindow.webContents.send("fromMain", {action: "get library for saving", data: {close: true, quit: quit}})
        break
      case 1:
        unsavedFile = false
        if(quit) app.quit()
        mainWindow.close()
        break
      case 2:
        //do nothing
        break
      default:
        //do nothing
    }
  })
}

ipcMain.on("GET/lists.req", (event, args) => {
  if(openFile.isFile) {
    mainWindow.webContents.send("GET/lists.res", openFile.data)
  }
})
ipcMain.on("GET/entry.req", (event, args) => {
  if(openFile.isFile && args.list && typeof args.id == "number") {
    mainWindow.webContents.send("GET/entry.res", {
      content: openFile.data[args.list].content.find((item) => {return item.id === args.id}),
      prototype: openFile.data[args.list].prototype
    })
  }
})
