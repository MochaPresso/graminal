const { contextBridge, ipcRenderer } = require("electron");
const os = require("os");
const { readdir } = require("fs").promises;

const directoryContents = async (path) => {
  const results = await readdir(path, { withFileTypes: true });
  const resultsWithoutHiddenFiles = results.filter(
    (file) => file.name[0] !== ".",
  );

  return resultsWithoutHiddenFiles
    .map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file",
    }))
    .filter((name) => name[0] !== ".")
    .sort((a, b) => {
      if (a.type === b.type) {
        return 0;
      } else if (a.type === "directory") {
        return -1;
      } else if (a.type === "file") {
        return 1;
      }
    });
};

const terminalUserName = () => {
  return `${os.userInfo().username}@${os.hostname().split(".")[0]}`;
};

const homeDirectory = () => {
  return os.userInfo().homedir;
};

contextBridge.exposeInMainWorld("terminal", {
  keyStroke: (channel, data) => {
    let validChannels = ["terminal.keyStroke"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  incomingData: (channel, func) => {
    let validChannels = ["terminal.incomingData"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  terminalUserName,
});

contextBridge.exposeInMainWorld("sideBar", {
  toggle: (channel, func) => {
    let validChannels = ["sideBar.toggle"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});

contextBridge.exposeInMainWorld("directory", {
  directoryContents,
  homeDirectory,
});
