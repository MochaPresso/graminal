const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadURL("http://localhost:3000");
  mainWindow.webContents.openDevTools();
  mainWindow.focus();
};

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("CommandOrControl+Left", () => {
    return;
  });
  globalShortcut.register("CommandOrControl+Right", () => {
    return;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
