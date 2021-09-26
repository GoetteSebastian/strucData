const {
    contextBridge,
    ipcRenderer
} = require("electron");

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
});

contextBridge.exposeInMainWorld("api", {
  send: (channel, args) => {
    if (["toMain"].includes(channel)) {
      ipcRenderer.send(channel, args);
    }
  },
  receive: (channel, callback) => {
    if (["fromMain"].includes(channel)) {
      ipcRenderer.on(channel, (event, args) => {
        callback(args);
      });
    }
  }
});
