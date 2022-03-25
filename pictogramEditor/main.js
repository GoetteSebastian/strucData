const {app, BrowserWindow, dialog, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
let mainWindow
var fileData = {
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
    default: 0
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

  app.on("before-quit", (e) => { //command+q
    if(fileData.unsavedChanges) {
      e.preventDefault()
      closeApp()
    }
  })

  mainWindow.on("close", (e) => { //command+w
    if(fileData.unsavedChanges) {
      e.preventDefault()
      closeApp()
    }
  })
})

const isMac = process.platform === 'darwin'

const template = [
  { role: 'appMenu' },
  {
    label: 'Datei',
    submenu: [
      {
        label: 'Öffnen',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          openFile()
        }
      },
      {
        label: "Speichern",
        accelerator: "CmdOrCtrl+s",
        click: () => {
          saveFile()
        }
      },
      {
        label: "Speichern unter...",
        accelerator: "CmdOrCtrl+Shift+s",
        click: () => {
          saveFileAs()
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

const openFile = () => {
  if(fileData.unsavedChanges) {
    dialog.showMessageBox(mainWindow, {
      message: "Die Datei enthält ungespeicherte Inhalte. Was willst du tun?",
      type: "question",
      buttons: [
        "Datei speichern und andere Datei öffnen",
        "Datei öffnen ohne zu speichern",
        "Weiter arbeiten"
      ],
      defaultId: 0,
      cancleId: 2
    }).then(answer => {
      switch(answer.response) {
        case 0:
          saveFile().then((result) => {
            readFile()
          })
          break
        case 1:
          fileData.unsavedChanges = false
          readFile()
          break
        case 2:
          //do nothing
          break
        default:
          //do nothing
      }
    })
  }
  else readFile()
}

const readFile = () => {
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
    fileData.path = result.filePaths[0]
    fs.readFile(fileData.path, 'utf-8', (err, data) => {
      if(err) {
        alert("An error ocurred reading the file :" + err.message)
        return
      }
      fileData.data = JSON.parse(data)
      fileData.isFile = true
      mainWindow.webContents.send("PUSH/setTitle", {title: fileData.path})
      mainWindow.webContents.send("GET/lists.res", fileData.data)
    })
  })
}

const saveFile = async () => {
  return new Promise((resolve, reject) => {
    fileData.isFile ? writeFile().then(result => {
      resolve()
    }) : saveFileAs().then(result => {
      resolve()
    })
  })
}

const saveFileAs = async () => {
  return new Promise((resolve, reject) => {
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
        reject() //return
      }
      fileData.path = result.filePath
      mainWindow.webContents.send("PUSH/setTitle", {title: fileData.path})
      writeFile().then(result => {
        resolve()
      })
    }).catch(err => {
      console.log(err)
      reject()
    })
  })
}

const writeFile = async () => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileData.path, JSON.stringify(fileData.data), "utf8", function(err) {
      if(err) {
        mainWindow.webContents.send("PUSH/notification", {type: "error", text: "Datei konnte nicht gespeichert werden: "})
        reject() //return
      }
      mainWindow.webContents.send("PUSH/notification", {type: "success", text: "Datei wurde erfolgreich gespeichert. "})
      fileData.unsavedChanges = false
      fileData.isFile = true
      resolve()
    })
  })
}

const closeApp = () => {
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
        console.log("got option 0")
        saveFile().then(result => {
          app.quit()
        })
        break
      case 1:
        console.log("got option 1")
        fileData.unsavedChanges = false
        app.quit()
        break
      case 2:
        console.log("got option 2")
        //do nothing
        break
      default:
        //do nothing
    }
  })
}

ipcMain.on("GET/lists.req", (event, args) => {
  mainWindow.webContents.send("GET/lists.res", fileData.data)
})

ipcMain.on("GET/listEdit.req", (event, args) => {
  var listKeys = Object.keys(fileData.data)
  if(args.list !== -1) {
    listKeys.splice(listKeys.indexOf(args.list), 1)
  }
  var linkableLists = listKeys.filter(key => key != args.list).map(key => {
    var item = {key: key, name: fileData.data[key].name, inUse: false}
    if(args.list !== -1) {
      item.inUse = fileData.data[args.list].prototype.filter(proto => key == proto.name).length < 0 ? true : false
    }
    item.prototype = fileData.data[key].prototype.filter(proto => {
      return !["index", "link", "multiLink"].includes(proto.type)
    })
    return item
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
      prototype: fileData.data[args.list].prototype,
      name: fileData.data[args.list].name,
      sort: fileData.data[args.list].sort,
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
  fileData.data[args.list].prototype = newPrototype
  var newEntries = args.prototype.filter(proto => proto.action == "new")
  newEntries.forEach((entry, index) => {
    fileData.data[args.list].content.forEach((item, i, array) => {
      array[i][entry.key] = dataTypes[entry.type].default
    })
  })
  fileData.data[args.list].sort = args.sort
  if(fileData.data[args.list].name !== args.name) {
    Object.keys(dataTypes).filter((key) => {
      return dataTypes[key].isLink
    }).forEach((key) => {
      Object.keys(fileData.data).forEach((list) => {
        fileData.data[list].prototype.forEach((proto, index) => {
          if(proto.key == args.list) {
            fileData.data[list].prototype[index].key = args.name
            fileData.data[list].prototype[index].name = args.name
            fileData.data[list].content.forEach((item, i) => {
              fileData.data[list].content[i][args.name] = fileData.data[list].content[i][args.list]
              delete fileData.data[list].content[i][args.list]
            })
          }
        })
      })
    })
    fileData.data[args.list].name = args.name
    fileData.data[args.name] = fileData.data[args.list]
    delete fileData.data[args.list]
  }
  fileData.unsavedChanges = true
  mainWindow.webContents.send("POST/listEdit.res", {status: "success"})
  mainWindow.webContents.send("GET/lists.res", fileData.data)
})

ipcMain.on("PUT/listEdit.req", (event, args) => {
  var newPrototype = args.list.prototype.map(proto => {
    return {name: proto.name, key: proto.key, type: proto.type, rel: proto.rel}
  })
  fileData.data[args.list.name] = {
    name: args.list.name,
    sort: args.list.sort,
    prototype: newPrototype,
    content: []
  }
  mainWindow.webContents.send("PUT/listEdit.res", {status: "success"})
  mainWindow.webContents.send("GET/lists.res", fileData.data)
  fileData.unsavedChanges = true
})

ipcMain.on("GET/entry.req", (event, args) => {
  var entry = {content: {}, prototype: fileData.data[args.list].prototype, isDeletable: false}
  if(args.id === -1) {
    fileData.data[args.list].prototype.map((proto, index) => {
      entry.content[proto.key] = dataTypes[proto.type].default
    })
  }
  else {
    entry.content = fileData.data[args.list].content.find((item) => {return item.id === args.id})
    entry.isDeletable = isEntryDeletable({list: args.list, id: entry.content.id})
  }
  mainWindow.webContents.send("GET/entry.res", entry)
})

ipcMain.on("POST/entry.req", (event, args) => {
  const index = fileData.data[args.list].content.findIndex(item => item.id == args.id)
  if(index !== -1) {
    fileData.data[args.list].content[index] = args.entry
    mainWindow.webContents.send("PUT/entry.res", {status: "success"})
    mainWindow.webContents.send("GET/lists.res", fileData.data)
    fileData.unsavedChanges = true
  }
  else {
    mainWindow.webContents.send("PUT/entry.res", {status: "error"})
  }
})

ipcMain.on("PUT/entry.req", (event, args) => {
  var content = args.entry
  if(fileData.data[args.list].content.length === 0) {
    content.id = 0
    fileData.data[args.list].content.push(content)
  }
  else {
    content.id = Math.max.apply(Math, fileData.data[args.list].content.map((item) => item.id)) + 1
    fileData.data[args.list].content.push(content)
  }
  mainWindow.webContents.send("POST/entry.res", {status: "success"})
  mainWindow.webContents.send("GET/lists.res", fileData.data)
  fileData.unsavedChanges = true
})

ipcMain.on("DELETE/entry.req", (event, args) => {
  const index = fileData.data[args.list].content.findIndex(item => item.id == args.id)
  if(index !== -1 && isEntryDeletable({list: args.list, id: args.id})) {
    fileData.data[args.list].content.splice(index, 1)
    mainWindow.webContents.send("DELETE/entry.res", {status: "success"})
    mainWindow.webContents.send("GET/lists.res", fileData.data)
    fileData.unsavedChanges = true
  }
  else {
    mainWindow.webContents.send("DELETE/entry.res", {status: "error"})
  }
})

const isEntryDeletable = (args) => {
  var result = false
  Object.keys(fileData.data).filter(list => {
    return list !== args.list && fileData.data[list].prototype.filter(proto => {return proto.key == args.list && Object.keys(dataTypes).filter(type => dataTypes[type].isLink).includes(proto.type)}).length > 0
  }).forEach((list) => {
    fileData.data[list].content.forEach((e) => {
      if(Array.isArray(e[args.list])) result = e[args.list].includes(args.id) ? false : true
      else result = e[args.list] == args.id ? false : true
    })
  })
  return result
}

// PUT = Insert new Entry
// POST = Update existing Entry
// DELETE = Delete existing Entry
// GET = Get existing Entry
