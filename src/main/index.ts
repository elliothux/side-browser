import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import {
  app,
  BrowserView,
  BrowserWindow,
  globalShortcut,
  screen,
  shell,
} from "electron";
import { join } from "path";
import icon from "../../resources/icon.png?asset";

// import { TabManager } from './TabManager'

let mainWindow: BrowserWindow;
// let tabManager: TabManager

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const sidebarWidth = 400;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: sidebarWidth,
    height: height,
    x: width - sidebarWidth,
    y: 0,
    frame: false,
    alwaysOnTop: true,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
    },
  });

  // tabManager = new TabManager(mainWindow)

  // Adjust view bounds on resize
  // mainWindow.on('resize', () => tabManager.adjustViewBounds())

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    // Create a default tab
    // tabManager.createTab(Date.now(), 'https://www.google.com')

    // Simplified BrowserView implementation for debugging
    const view = new BrowserView();
    mainWindow.setBrowserView(view);
    const [winWidth, winHeight] = mainWindow.getSize();
    view.setBounds({ x: 0, y: 48, width: winWidth, height: winHeight - 48 });
    view.webContents.loadURL("https://www.google.com");
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  // Setup IPC listeners
  /*
  ipcMain.on('tabs:create', (_, url) => {
    tabManager.createTab(Date.now(), url)
  })
  ipcMain.on('tabs:switch', (_, id) => {
    tabManager.showTab(id)
  })
  ipcMain.on('tabs:close', (_, id) => {
    tabManager.destroyTab(id)
  })
  */

  // Register global shortcut
  const ret = globalShortcut.register("CommandOrControl+Shift+S", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  if (!ret) {
    console.log("globalShortcut registration failed");
  }

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
