const {app, BrowserWindow, dialog, MessageChannelMain, ipcMain, Menu} = require('electron');
const path = require('path');
const fs = require('fs');
let mainWindow;
var openFile;
var unsavedFile = false;

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
  });

  mainWindow.loadFile('content/index.html');
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on('toMain', (event, args) => {
    if(args.action === "open file") {
      dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          {
            name: "JSON Libraries", extensions: ['json']
          }
        ]
      }).then(result => {
        if(result.canceled) {
          console.log("No file selected");
          return;
        }
        fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
          if(err) {
            alert("An error ocurred reading the file :" + err.message);
            return;
          }
          mainWindow.webContents.send("fromMain", {action: "load file", data: data});
          openFile = result.filePaths[0];
        });
      });
    }
    else if(args.action == "save file") {
      saveLibrary(args.data, false);
    }
    else if(args.action == "open file changed") {
      unsavedFile = args.data.state;
      console.log(unsavedFile);
    }
    else if(args.action == "send library for saving") {
      saveLibrary(args.data, true);
    }
  });

  mainWindow.on("close", (e) => {
    if(unsavedFile) {
      e.preventDefault();
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
            mainWindow.webContents.send("fromMain", {action: "get library for saving", data: {}});
            break;
          case 1:
            unsavedFile = false;
            mainWindow.close();
            break;
          case 2:
            //do nothing
            break;
          default:
            //do nothing
        }
      });
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

function saveLibrary(data, closeWindow) {
  if(openFile) {
    writeFile(openFile, data, closeWindow);
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
      writeFile(result.filePath, data, closeWindow);
    }).catch(err => {
      console.log(err);
    });
  }
}

function writeFile(filePath, data, closeWindow) {
  fs.writeFile(filePath, data, "utf8", function(err) {
    if(err) {
      mainWindow.webContents.send("fromMain", {action: "notification", data: {text: "Datei konnte nicht gespeichert werden: " + err, type: "error"}});
      return;
    }
    mainWindow.webContents.send("fromMain", {action: "notification", data: {text: "Datei wurde erfolgreich gespeichert. ", type: "success"}});
    openFile = filePath;
    unsavedFile = false;
    if(closeWindow) mainWindow.close();
  });
}
