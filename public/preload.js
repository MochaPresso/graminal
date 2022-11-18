const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("terminal", {
  keyStroke: (channel, data) => {
    let validChannels = ["terminal.keyStroke"];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
  incomingData: (channel, func) => {
    let validChannels = ["terminal.incomingData"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
