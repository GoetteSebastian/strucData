const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
const md5 = require('md5')

let mainWindow
var fileData = { //global data object
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
    default: -1
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
    isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './build/index.html')}`
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
          saveFileAs().then(result => {
            console.log("done")
          }, reason => {
            console.log("fucked")
          })
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
  else {
    readFile()
  }
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
      sendListsToFrontend()
    })
  })
}

const saveFile = async () => {
  return new Promise((resolve, reject) => {
    fileData.isFile ? writeFile().then(result => {
      resolve()
    }) : saveFileAs().then(result => {
      console.log("file saved")
      resolve()
    }, (reason) => {
      console.log("file not saved")
      reject()
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
        reject()
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
        reject()
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
  sendListsToFrontend()
})

ipcMain.on("GET/listsX.req", (event, args) => {
  sendListsToFrontend()
})

ipcMain.on("GET/listEdit.req", (event, args) => {
  var listKeys = Object.keys(fileData.data)
  var linkableLists = listKeys.filter(key => (fileData.data[key].prototype.filter(proto => Object.keys(dataTypes).filter(type => !dataTypes[type].isLink && type !== "index").includes(proto.type)).length > 0 && key !== args.list)).map(key => {
    var list = {value: key, label: key}
    if(args.list !== -1) {
      list.inUse = fileData.data[args.list].prototype.filter(proto => proto.key == key).length > 0 ? true : false
    }
    list.attributes = fileData.data[key].prototype.filter(proto => Object.keys(dataTypes).filter(type => !dataTypes[type].isLink && type !== "index").includes(proto.type)).map(proto => {
      return {value: proto.key, label: proto.name}
    })
    return list
  })
  if(args.list === -1) {
    var response = {
      name: "",
      sort: ["id"],
      prototype: [{name: "Id", key: "id", type: "index", rel: "", sort: 0, isDeletable: false, uid: md5("id")}],
      linkableLists: linkableLists,
      dataTypes: dataTypes,
      isDeletable: false
    }
  }
  else {
    var response = {
      prototype: fileData.data[args.list].prototype.map(proto => {
        proto.isDeletable = isPrototypeDeletable({prototype: proto, list: args.list})
        proto.action = ""
        proto.uid = md5(proto.key)
        return proto
      }),
      name: fileData.data[args.list].name,
      sort: fileData.data[args.list].sort,
      linkableLists: linkableLists,
      dataTypes: dataTypes,
      isDeletable: isListDeletable({list: args.list})
    }
  }
  mainWindow.webContents.send("GET/listEdit.res", response)
})

ipcMain.on("POST/listEdit.req", (event, args) => { // Update existing List
  var newPrototype = args.prototype.filter(proto => !(isPrototypeDeletable({prototype: proto, list: args.list}) && proto.action == "delete")).sort((a, b) => a.sort - b.sort).map((proto, index) => {
    return {name: proto.name, key: proto.key, type: proto.type, rel: proto.rel, sort: index}
  })
  var deletedPrototypes = args.prototype.filter(proto => isPrototypeDeletable({prototype: proto, list: args.list}) && proto.action == "delete")
  fileData.data[args.list].prototype = newPrototype
  deletedPrototypes.forEach((proto) => {
    fileData.data[args.list].content.forEach((item, index) => {
      delete fileData.data[args.list].content[index][proto.key]
    })
  })
  var newEntries = args.prototype.filter(proto => proto.action == "new")
  newEntries.forEach((entry) => {
    fileData.data[args.list].content.forEach((item, index, array) => {
      array[index][entry.key] = dataTypes[entry.type].default
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
  sendListsToFrontend()
})

ipcMain.on("PUT/listEdit.req", (event, args) => {
  var newPrototype = args.list.prototype.map(proto => {
    return {name: proto.name, key: proto.key, type: proto.type, rel: proto.rel, sort: proto.sort}
  })
  fileData.data[args.list.name] = {
    name: args.list.name,
    sort: args.list.sort,
    prototype: newPrototype,
    content: []
  }
  mainWindow.webContents.send("PUT/listEdit.res", {status: "success"})
  mainWindow.webContents.send("GET/lists.res", fileData.data)
  sendListsToFrontend()
  fileData.unsavedChanges = true
})

ipcMain.on("DELETE/listEdit.req", (event, args) => {
  if(isListDeletable({list: args.list})) {
    delete fileData.data[args.list]
    mainWindow.webContents.send("DELETE/listEdit.res", {status: "success"})
    mainWindow.webContents.send("GET/lists.res", fileData.data)
    sendListsToFrontend()
    fileData.unsavedChanges = true
  }
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
    sendListsToFrontend()
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
  sendListsToFrontend()
  fileData.unsavedChanges = true
})

ipcMain.on("DELETE/entry.req", (event, args) => {
  const index = fileData.data[args.list].content.findIndex(item => item.id == args.id)
  if(index !== -1 && isEntryDeletable({list: args.list, id: args.id})) {
    fileData.data[args.list].content.splice(index, 1)
    mainWindow.webContents.send("DELETE/entry.res", {status: "success"})
    mainWindow.webContents.send("GET/lists.res", fileData.data)
    sendListsToFrontend()
    fileData.unsavedChanges = true
  }
  else {
    mainWindow.webContents.send("DELETE/entry.res", {status: "error"})
  }
})

const isEntryDeletable = (args) => {
  var result = true
  Object.keys(fileData.data).filter(list => { //filter list keys and pass only the ones which are linked to the list of the validating entry
    return list !== args.list && //true if the given list is unequal to the list of the validating entry, else false
      fileData.data[list].prototype.filter(proto => { //filter prototypes to validate if there is a link to the given list
        return proto.key === args.list && //true if prototype key equals to the list of the validating entry (link to the given list is existent), else false
        Object.keys(dataTypes).filter(type => dataTypes[type].isLink).includes(proto.type)}).length > 0 //true if prototype is of type link, else false
  }).forEach(list => { //loop list keys which have been filtered and have a link to the list of the validating entry
    fileData.data[list].content.forEach(entry => { //loop data (content) of the list so validate if the validating entry is linked to on of the entries
      if(Array.isArray(entry[args.list])) result = entry[args.list].includes(args.id) ? false : result //if the entry value is an array (multi link): true if the array of values includes the id of the validating entry, else false
      else result = entry[args.list] === args.id ? false : result //else (not multi link): true if entry value equals to the validating entry id, else false
    })
  })
  return result
}

const isListDeletable = (args) => {
  var result = false
  Object.keys(fileData.data).filter(list => list !== args.list).forEach(list => {
    result = fileData.data[list].prototype.find(proto => {return (proto.key == args.list && Object.keys(dataTypes).filter(type => dataTypes[type].isLink).includes(proto.type))}) ? false : true
  })
  return result
}

const isPrototypeDeletable = (args) => {
  var result = Object.keys(fileData.data).filter(list =>
      list != args.list && //list is not the current list
      fileData.data[list].prototype.filter(proto =>
        proto.rel == args.prototype.key && // Some field relates to the current prototype
        proto.key == args.list && // Some field is linked to the current list
        Object.keys(dataTypes).filter(type =>
          dataTypes[type].isLink
        ).includes(proto.type) // Some field is of type link or index
      ).length > 0 // amount of links found
    ).length == 0 && args.prototype.type != "index" ? true
  : false
  return result
}

const sendListsToFrontend = () => {
  mainWindow.webContents.send("GET/listsX.res", Object.keys(fileData.data))
}

// PUT = Insert new Entry
// POST = Update existing Entry
// DELETE = Delete existing Entry
// GET = Get existing Entry
