const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const pty = require("node-pty");

const shell = os.platform() === "win32" ? "powershell.exe" : "zsh";

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

  const ptyProcess = pty.spawn(shell, [], {
    cwd: process.env.HOME,
    env: process.env,
  });

  ptyProcess.onData((data) => {
    process.stdout.write(data);
    mainWindow.webContents.send("terminal.incomingData", data);
  });

  ipcMain.on("terminal.keyStroke", (event, key) => {
    if (key === "exit") {
      ptyProcess.write("\x03\r");
    }

    ptyProcess.write(key + "\r");
  });
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
