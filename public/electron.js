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

  const viewMenu = menu.items.find((item) => item.label === "View");
  viewMenu.submenu.items.find((item) => item.role === "reload").visible = false;

  Menu.setApplicationMenu(menu);

  mainWindow.loadURL("http://localhost:3000");
  mainWindow.webContents.openDevTools();
  mainWindow.focus();
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.meta && input.key.toLowerCase() === "r") {
      event.preventDefault();
    }
  });

  let userInput = false;

  const buffer = (timeout, maxSize) => {
    let chunk = "";
    let sender = null;

    return (data) => {
      chunk += data;

      if (chunk.length > maxSize && userInput) {
        userInput = false;
        mainWindow.webContents.send("terminal.incomingData", chunk);
        chunk = "";

        if (sender) {
          clearTimeout(sender);
          sender = null;
        }
      } else if (!sender) {
        sender = setTimeout(() => {
          mainWindow.webContents.send("terminal.incomingData", chunk);
          chunk = "";
          sender = null;
        }, timeout);
      }
    };
  };

  const send = buffer(10, 262144);

  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cwd: process.env.HOME,
    env: process.env,
    cols: 80,
    rows: 30,
  });

  ipcMain.on("terminal.keyStroke", (event, key) => {
    ptyProcess.write(`${key}\r`);
    userInput = true;
  });

  ptyProcess.onData((data) => {
    process.stdout.write(data);
    send(data);
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
