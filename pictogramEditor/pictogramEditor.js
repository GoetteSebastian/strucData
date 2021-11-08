const {app, BrowserWindow, dialog, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
let mainWindow
var openFile
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

  mainWindow.loadFile('content/index.html')
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on("before-quit", (e) => {
    if(unsavedFile) {
      e.preventDefault()
      closeOnUnsavedData(true)
    }
  })

  ipcMain.on('toMain', (event, args) => {
    if(args.action == "open file changed") {
      unsavedFile = args.data.state
    }
    else if(args.action == "send library for saving") {
      saveFile(args.data.json, args.data.close, args.data.quit)
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
  if(openFile) {
    writeFile(openFile, data, closeWindow, quitApp);
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
    openFile = filePath
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
      mainWindow.webContents.send("fromMain", {action: "load file", data: {json: data, file: result.filePaths[0]}})
      openFile = result.filePaths[0]
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
