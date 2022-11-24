const { contextBridge, ipcRenderer } = require("electron");
const os = require("os");
const path = require("path");
const fs = require("fs");

const directoryContents = async (directoryPath) => {
  const results = await fs.promises.readdir(directoryPath, {
    withFileTypes: true,
  });
  const resultsWithoutHiddenFiles = results.filter(
    (file) => file.name[0] !== ".",
  );

  for (const entry of resultsWithoutHiddenFiles) {
    const packageJsonPath = path.join(
      directoryPath,
      entry.name,
      "package.json",
    );

    if (fs.existsSync(packageJsonPath)) {
      entry.existJsonFile = true;

      const fileData = fs.readFileSync(packageJsonPath);
      entry.scriptsList = Object.keys(JSON.parse(fileData.toString()).scripts);
    } else {
      entry.existJsonFile = false;
    }
  }

  return resultsWithoutHiddenFiles
    .map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file",
      existJsonFile: entry.existJsonFile,
      scriptsList: entry.scriptsList,
    }))
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

const relativePath = (from, to) => {
  return path.relative(from, to);
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
  showContextMenu: (channel, data) => {
    let validChannels = ["sideBar.showContextMenu"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  contextMenuCommand: (channel, func) => {
    let validChannels = ["sideBar.contextMenuCommand"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});

contextBridge.exposeInMainWorld("directory", {
  directoryContents,
  homeDirectory,
  relativePath,
});
