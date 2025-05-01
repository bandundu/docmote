const { app, BrowserWindow, shell, ipcMain, Tray, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

let win;
let tray = null;

const settingsPath = path.join(
  app.getPath("userData"),
  "docmote-settings.json"
);

function getStoredURL() {
  if (fs.existsSync(settingsPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      return config.instanceUrl;
    } catch (e) {
      return null;
    }
  }
  return null;
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });

  function createWindow() {
    const storedUrl = getStoredURL();
    const isMac = process.platform === "darwin";
    let baseOrigin = null;

    if (storedUrl) {
      try {
        baseOrigin = new URL(storedUrl).origin;
      } catch (e) {
        baseOrigin = null;
      }
    }

    win = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 600,
      minHeight: 600,
      icon: path.join(__dirname, "assets", isMac ? "docmost.icns" : "docmost.png"),
      frame: !isMac,
      titleBarStyle: isMac ? "hidden" : undefined,
      ...(isMac && {
        trafficLightPosition: { x: 10, y: 13 }
      }),
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    if (storedUrl) {
      win.loadURL(storedUrl);
    } else {
      win.loadFile(path.join(__dirname, "dist/index.html"));
    }

    win.webContents.setWindowOpenHandler(({ url }) => {
      if (baseOrigin && url.startsWith(baseOrigin)) {
        return { action: "allow" };
      } else {
        shell.openExternal(url);
        return { action: "deny" };
      }
    });

    win.webContents.on("will-navigate", (event, url) => {
      if (baseOrigin && !url.startsWith(baseOrigin)) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });

    win.on("close", (e) => {
      if (!app.isQuitting) {
        e.preventDefault();
        win.hide();
      }
    });

    setupTray(isMac);
  }

  function setupTray(isMac) {
    if (tray) return; // Don't recreate

    const trayIcon = path.join(__dirname, "assets", isMac ? "docmost.icns" : "docmost.png");

    tray = new Tray(trayIcon);
    tray.setToolTip("Docmote");

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show Docmote",
        click: () => {
          if (win) win.show();
        },
      },
      {
        label: "Quit",
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
      if (win) win.show();
    });
  }

  ipcMain.handle("save-instance-url", (event, url) => {
    fs.writeFileSync(settingsPath, JSON.stringify({ instanceUrl: url }));
    if (win) {
      win.close();
      createWindow();
    }
  });

  app.whenReady().then(createWindow);

  // Remove this to avoid quitting on Linux when all windows are closed
  app.on("window-all-closed", () => {
    // No-op to keep app running in tray
  });

  app.on("activate", () => {
    if (win) {
      win.show();
    } else {
      createWindow();
    }
  });

  app.on("before-quit", () => {
    app.isQuitting = true;
  });
}
