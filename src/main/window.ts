import { is } from "@electron-toolkit/utils";
import { BrowserWindow, ipcMain, screen } from "electron";
import { join } from "path";
import icon from "../../resources/icon.png?asset";
import {
  closeTab,
  createTab,
  getActiveTab,
  getAllTabs,
  getTab,
  initializeTabs,
  switchTab,
  updateWindowPositions,
  updateWindowSizes,
} from "./tab-manager";

let baseWindow: BrowserWindow;

export function createWindows() {
  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  const windowWidth = 800;
  const windowHeight = screenSize.height;

  createBaseWindow(
    windowWidth,
    windowHeight,
    screenSize.width - windowWidth,
    0,
  );
}

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

  baseWindow.once("ready-to-show", async () => {
    setupIPCHandlers();
    const tabs = await initializeTabs();
    if (tabs.length === 0) {
      await createTab("https://www.google.com");
    }
    baseWindow.show();
  });

  // Handle window move events
  baseWindow.on("moved", () => {
    updateWindowPositions();
  });

  // Handle window resize events
  baseWindow.on("resized", () => {
    updateWindowSizes();
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    void baseWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    void baseWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

function setupIPCHandlers() {
  // Create new tab
  ipcMain.handle("tabs:create", async (_, url?: string) => {
    try {
      const tab = await createTab(url);
      baseWindow.webContents.send("tabs:created", {
        id: tab.id,
        url: tab.url || "",
        title: tab.title || "Loading...",
        isActive: tab.isActive || false,
      });
      return tab.id;
    } catch (error) {
      console.error("Failed to create tab:", error);
      throw error;
    }
  });

  // Switch tab
  ipcMain.handle("tabs:switch", async (_, id: string) => {
    try {
      switchTab(id);

      // Notify renderer about tab switch
      const allTabs = getAllTabs();
      baseWindow.webContents.send("tabs:switched", {
        activeTabId: id,
        tabs: allTabs.map((tab) => ({
          id: tab.id,
          url: tab.url,
          title: tab.title,
          isActive: tab.isActive,
        })),
      });

      return true;
    } catch (error) {
      console.error("Failed to switch tab:", error);
      throw error;
    }
  });

  // Close tab
  ipcMain.handle("tabs:close", async (_, id: string) => {
    try {
      closeTab(id);

      // Notify renderer about tab closure
      const allTabs = getAllTabs();
      const activeTab = getActiveTab();

      baseWindow.webContents.send("tabs:closed", {
        closedTabId: id,
        activeTabId: activeTab?.id || null,
        tabs: allTabs.map((tab) => ({
          id: tab.id,
          url: tab.url,
          title: tab.title,
          isActive: tab.isActive,
        })),
      });

      return true;
    } catch (error) {
      console.error("Failed to close tab:", error);
      throw error;
    }
  });

  // Get all tabs
  ipcMain.handle("tabs:get-all", async () => {
    try {
      const allTabs = getAllTabs();
      const activeTab = getActiveTab();

      return {
        tabs: allTabs.map((tab) => ({
          id: tab.id,
          url: tab.url,
          title: tab.title,
          isActive: tab.isActive,
        })),
        activeTabId: activeTab?.id || null,
      };
    } catch (error) {
      console.error("Failed to get tabs:", error);
      throw error;
    }
  });

  // Navigate tab
  ipcMain.handle("tabs:navigate", async (_, id: string, url: string) => {
    try {
      const tab = getTab(id);
      if (!tab) {
        throw new Error(`Tab ${id} not found`);
      }

      await tab.window.loadURL(url);
      tab.url = url;

      // Notify renderer about navigation
      baseWindow.webContents.send("tabs:navigated", {
        tabId: id,
        url: url,
      });

      return true;
    } catch (error) {
      console.error("Failed to navigate tab:", error);
      throw error;
    }
  });
}

export function getBaseWindow() {
  if (!baseWindow) {
    throw new Error("Base window not created");
  }
  return baseWindow;
}
