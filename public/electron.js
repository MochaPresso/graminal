const { app, BrowserWindow, Menu, MenuItem, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const pty = require("node-pty");

const shell = os.platform() === "win32" ? "powershell.exe" : "zsh";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 320,
    minHeight: 240,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const menu = Menu.getApplicationMenu();

  menu.append(
    new MenuItem({
      label: "SideBar",
      submenu: [
        {
          label: "Toggle",
          click: () => {
            mainWindow.webContents.send("sideBar.toggle");
          },
          accelerator: "CommandOrControl+T",
        },
      ],
    }),
  );
  menu.items.find((item) => item.role === "help").visible = false;

  Menu.setApplicationMenu(menu);

  mainWindow.loadURL("http://localhost:3000");
  mainWindow.webContents.openDevTools();
  mainWindow.focus();

  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cwd: process.env.HOME,
    env: process.env,
    cols: 80,
    rows: 30,
  });

  ipcMain.handle("terminal.keyStroke", (event, key) => {
    ptyProcess.write(`${key}\r`);
  });

  ptyProcess.onData((data) => {
    process.stdout.write(data);
    mainWindow.webContents.send("terminal.incomingData", data);
  });
};

app.whenReady().then(() => {
  createWindow();

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
