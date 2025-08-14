import { is } from "@electron-toolkit/utils";
import { BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { ConfigDatabase } from "./db/config";
import { TabDatabase } from "./db/tab";
import {
  closeTab,
  createTab,
  getTab,
  getWindow,
  initializeTabs,
  switchTab,
  updateWindowPositions,
  updateWindowSizes,
} from "./tab-manager";

import icon from "../../resources/icon.png?asset";

let baseWindow: BrowserWindow;

export function createBaseWindow(
  width: number,
  height: number,
  x: number,
  y: number,
) {
  baseWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    alwaysOnTop: true,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    transparent: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
    },
    ...(process.platform === "linux" ? { icon } : {}),
  });

  baseWindow.once("ready-to-show", onReadyToShow);
  baseWindow.on("moved", updateWindowPositions);
  baseWindow.on("resized", updateWindowSizes);

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    void baseWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    void baseWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

async function onReadyToShow() {
  setupIPCHandlers();

  await Promise.all([TabDatabase.initialize(), ConfigDatabase.initialize()]);

  const tabs = await initializeTabs();
  if (tabs.length === 0) {
    await createTab("https://www.google.com");
  }

  baseWindow.show();
}

function setupIPCHandlers() {
  // Create new tab
  ipcMain.handle("tabs:create", async (_, url?: string) => {
    const tab = await createTab(url);
    baseWindow.webContents.send("tabs:created", {
      id: tab.id,
      url: tab.url || "",
      title: tab.title || "Loading...",
    });
    return tab.id;
  });

  // Switch tab
  ipcMain.handle("tabs:switch", async (_, id: string) => {
    switchTab(id);

    // Notify renderer about tab switch
    baseWindow.webContents.send("tabs:switched", {
      activeTabId: id,
    });

    return true;
  });

  // Close tab
  ipcMain.handle("tabs:close", async (_, id: string) => {
    closeTab(id);

    // Notify renderer about tab closure
    baseWindow.webContents.send("tabs:closed", {
      closedTabId: id,
      activeTabId: await ConfigDatabase.getActiveTabId(),
    });

    return true;
  });

  // Get all tabs
  ipcMain.handle("tabs:get-all", async () => {
    return {
      tabs: await TabDatabase.getTabs(),
      activeTabId: await ConfigDatabase.getActiveTabId(),
    };
  });

  // Navigate tab
  ipcMain.handle("tabs:navigate", async (_, id: string, url: string) => {
    const tab = getTab(id);
    if (!tab) {
      throw new Error(`Tab ${id} not found`);
    }

    const win = getWindow(id);
    if (!win) {
      throw new Error(`Window for tab ${id} not found`);
    }
    await win.loadURL(url);
    tab.url = url;

    // Notify renderer about navigation
    baseWindow.webContents.send("tabs:navigated", {
      tabId: id,
      url: url,
    });

    return true;
  });
}

export function getBaseWindow() {
  if (!baseWindow) {
    throw new Error("Base window not created");
  }
  return baseWindow;
}
