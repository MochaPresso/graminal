const {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  ipcMain,
  nativeImage,
} = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");
const os = require("os");
const pty = require("node-pty");

const shell = os.platform() === "win32" ? "powershell.exe" : "zsh";

const image = nativeImage.createFromPath(
  path.join(__dirname, "../src/images/icons/512x512.png"),
);

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
    icon: path.join(__dirname, "../src/images/icons/512x512.png"),
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

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`,
  );
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

  ipcMain.on("terminal.keyStroke", (channel, key) => {
    ptyProcess.write(`${key}\r`);
    userInput = true;
  });

  ipcMain.on("sideBar.showContextMenu", (channel, event) => {
    const scriptsList = [{ type: "separator" }];

    if (event.scriptsList) {
      event.scriptsList.forEach((element) => {
        scriptsList.push({
          label: `npm run ${element}`,
          click: () => {
            ptyProcess.write(`cd ${event.moveDirectory}\r`);
            setTimeout(() => ptyProcess.write(`npm run ${element}\r`), 500);
          },
        });
      });
    }

    const template = [
      {
        label: "Move Directory",
        click: () => {
          ptyProcess.write(`cd ${event.moveDirectory}\r`);
        },
      },
      ...(event.existJsonFile
        ? [
            { type: "separator" },
            {
              label: "npm install",
              click: () => {
                ptyProcess.write(`cd ${event.moveDirectory}\r`);
                ptyProcess.write("npm install\r");
              },
            },
          ]
        : []),
      ...(event.scriptsList ? scriptsList : []),
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  });

  ptyProcess.onData((data) => {
    process.stdout.write(data);
    send(data);
  });
};

app.dock.setIcon(image);

app.setAboutPanelOptions({
  applicationName: "GRAMINAL",
  applicationVersion: "Version",
  version: "0.9.1",
});

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
