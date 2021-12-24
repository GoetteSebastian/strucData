const fs = require("fs")
const path = require("path")
const { contextBridge, ipcRenderer } = require("electron")

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
contextBridge.exposeInMainWorld("ipc", {
  send: (channel, args) => {
    ipcRenderer.send(channel, args)
  },
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, args) => {
      callback(args)
    })
  },
  removeAll: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  }
})
