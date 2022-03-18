const {app, BrowserWindow, dialog, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
let mainWindow
var openFile = {
  path: "", //absolut path to the open file if already saved
  data: {}, //the data object, will be written as json string to the file, was parsed from the json string of the file
  isFile: false, //true = the file was already saved before, path exists, false = not jet saved as file
  unsavedChanges: false //true = there are unsaved changes in the data, false = there are no unsaved changes
}

const dataTypes = {
  text: {
    name: "Text",
    key: "text",
    isLink: false,
    default: ""
  },
  longText: {
    name: "Langer Text",
    key: "longText",
    isLink: false,
    default: ""
  },
  number: {
    name: "Nummer",
    key: "number",
    isLink: false,
    default: 0
  },
  link: {
    name: "Verknüpfung",
    key: "link",
    isLink: true,
    default: null
  },
  multiLink: {
    name: "Mehrfach Verknüpfung",
    key: "multiLink",
    isLink: true,
    default: []
  },
  boolean: {
    name: "Ja / Nein",
    key: "boolean",
    isLink: false,
    default: false
  },
  svg: {
    name: "SVG Grafik",
    key: "svg",
    isLink: false,
    default: ""
  },
  index: {
    name: "Index",
    key: "index",
    isLink: false,
    default: -1
  }
}

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
    if(openFile.unsavedChanges) {
      e.preventDefault()
      closeOnUnsavedData(true)
    }
  })

  mainWindow.on("close", (e) => {
    if(openFile.unsavedChanges) {
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
  if(openFile.isFile) {
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
        console.log("Saveing abored")
        return
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
    openFile.unsavedChanges = false
    openFile.isFile = true
    if(quitApp) app.quit()
    if(closeWindow) mainWindow.close()
  })
}

function getFile() {
  //todo: check if file with unsaved changes is active. If yes, ask to save the file, if no, open new file.
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
        openFile.unsavedChanges = false
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
  mainWindow.webContents.send("GET/lists.res", openFile.data)
})

ipcMain.on("GET/listEdit.req", (event, args) => {
  var listKeys = Object.keys(openFile.data)
  if(args.list !== -1) {
    listKeys.splice(listKeys.indexOf(args.list), 1)
  }
  var linkableLists = listKeys.map(key => {
    if(key != args.list) {
      var item = {key: key, name: openFile.data[key].name}
      item.prototype = openFile.data[key].prototype.filter(proto => {
        return !["index", "link", "multiLink"].includes(proto.type)
      })
      return item
    }
  })
  //todo: check if a proto entry can be deleted or if it is connected.
  if(args.list === -1) {
    var response = {
      name: "",
      sort: ["id"],
      prototype: [{name: "Id", key: "id", type: "index", rel: ""}],
      linkableLists: linkableLists,
      dataTypes: dataTypes
    }
  }
  else {
    var response = {
      prototype: openFile.data[args.list].prototype,
      name: openFile.data[args.list].name,
      sort: openFile.data[args.list].sort,
      linkableLists: linkableLists,
      dataTypes: dataTypes
    }
  }
  mainWindow.webContents.send("GET/listEdit.res", response)
})

ipcMain.on("POST/listEdit.req", (event, args) => {
  var newPrototype = args.prototype.map(proto => {
    return {name: proto.name, key: proto.key, type: proto.type, rel: proto.rel}
  })
  openFile.data[args.list].prototype = newPrototype
  var newEntries = args.prototype.filter(proto => proto.action == "new")
  newEntries.forEach((entry, index) => {
    openFile.data[args.list].content.forEach((item, i, array) => {
      array[i][entry.key] = dataTypes[entry.type].default
    })
  })
  mainWindow.webContents.send("POST/listEdit.res", {status: "success"})
  mainWindow.webContents.send("GET/lists.res", openFile.data)
  openFile.unsavedChanges = true
})

ipcMain.on("PUT/listEdit.req", (event, args) => {
  var newPrototype = args.list.prototype.map(proto => {
    return {name: proto.name, key: proto.key, type: proto.type, rel: proto.rel}
  })
  openFile.data[args.list.name] = {
    name: args.list.name,
    sort: args.list.sort,
    prototype: newPrototype,
    content: []
  }
  mainWindow.webContents.send("PUT/listEdit.res", {status: "success"})
  mainWindow.webContents.send("GET/lists.res", openFile.data)
  openFile.unsavedChanges = true
})

ipcMain.on("GET/entry.req", (event, args) => {
  if(args.list && typeof args.id == "number") {
    mainWindow.webContents.send("GET/entry.res", {
      content: openFile.data[args.list].content.find((item) => {return item.id === args.id}) || buildEntryContent(openFile.data[args.list].prototype),
      prototype: openFile.data[args.list].prototype
    })
  }
})

ipcMain.on("POST/entry.req", (event, args) => {
  const index = openFile.data[args.list].content.findIndex(item => item.id == args.id)
  if(index !== -1) {
    openFile.data[args.list].content[index] = args.entry
    mainWindow.webContents.send("PUT/entry.res", {status: "success"})
    mainWindow.webContents.send("GET/lists.res", openFile.data)
    openFile.unsavedChanges = true
  }
  else {
    mainWindow.webContents.send("PUT/entry.res", {status: "error"})
  }
})

ipcMain.on("PUT/entry.req", (event, args) => {
  var content = args.entry
  if(openFile.data[args.list].content.length === 0) {
    content.id = 0
    openFile.data[args.list].content.push(content)
  }
  else {
    content.id = Math.max.apply(Math, openFile.data[args.list].content.map((item) => item.id)) + 1
    openFile.data[args.list].content.push(content)
  }
  mainWindow.webContents.send("POST/entry.res", {status: "success"})
  mainWindow.webContents.send("GET/lists.res", openFile.data)
  openFile.unsavedChanges = true
})

ipcMain.on("DELETE/entry.req", (event, args) => {
  const index = openFile.data[args.list].content.findIndex(item => item.id == args.id)
  if(index !== -1) {
    //todo: check if element can be deleted or if it is used as link in other lists
    openFile.data[args.list].content.splice(index, 1)
    mainWindow.webContents.send("DELETE/entry.res", {status: "success"})
    mainWindow.webContents.send("GET/lists.res", openFile.data)
    openFile.unsavedChanges = true
  }
  else {
    mainWindow.webContents.send("DELETE/entry.res", {status: "error"})
  }
})

const buildEntryContent = (prototype) => {
  var content = {}
  prototype.map((proto, index) => {
    content[proto.key] = dataTypes[proto.type].default
  })
  return content
}
// PUT = Insert new Entry
// POST = Update existing Entry
// DELETE = Delete existing Entry
// GET = Get existing Entry
