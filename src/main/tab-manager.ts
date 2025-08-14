import { BrowserWindow, shell } from "electron";
import { nanoid } from "nanoid";
import { ConfigDatabase } from "./db/config";
import { Tab, TabDatabase } from "./db/tab";
import { getBaseWindow } from "./window";

const SIDEBAR_WIDTH = 48;
const TOPBAR_HEIGHT = 48;

const tabs: Map<string, Tab> = new Map();
const windows: Map<string, BrowserWindow> = new Map();

let activeTabId: string | null = null;

export async function createTab(
  url: string = "https://www.google.com",
): Promise<Tab> {
  const id = nanoid();
  const tab: Tab = {
    id,
    url,
    title: "Loading...",
    createdAt: Date.now(),
    lastAccessed: Date.now(),
  };
  tabs.set(id, tab);
  windows.set(id, createBrowserWindow(tab));
  await TabDatabase.addTab({
    id,
    url,
    title: "Loading...",
    createdAt: Date.now(),
    lastAccessed: Date.now(),
  });

  // If this is the first tab, make it active
  if (tabs.size === 1) {
    switchTab(id);
  }

  return tab;
}

function createBrowserWindow(tab: Tab): BrowserWindow {
  const baseWindow = getBaseWindow();
  const [baseX, baseY] = baseWindow.getPosition();
  const baseBounds = baseWindow.getBounds();

  // Create new web window
  const webWindow = new BrowserWindow({
    parent: baseWindow,
    width: baseBounds.width - SIDEBAR_WIDTH,
    height: baseBounds.height - TOPBAR_HEIGHT,
    x: baseX + SIDEBAR_WIDTH,
    y: baseY + TOPBAR_HEIGHT,
    frame: false,
    show: false, // Don't show immediately
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    transparent: false,
    webPreferences: {
      sandbox: false,
      contextIsolation: false,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  // Handle window open requests
  webWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).catch((e) => {
      console.error("Failed to open URL:", details.url, e);
    });
    return { action: "deny" };
  });

  // Handle title updates
  webWindow.webContents.on("page-title-updated", (_, title) => {
    updateTabTitle(tab.id, title);
  });

  // Load URL
  webWindow
    .loadURL(tab.url)
    .then(() => {
      console.log(`Tab ${tab.id} loaded successfully: ${tab.url}`);
    })
    .catch((error) => {
      console.error(`Failed to load tab ${tab.id}:`, error);
      updateTabTitle(tab.id, "Error");
    });

  return webWindow;
}

export function switchTab(id: string): void {
  const tab = tabs.get(id);
  if (!tab) {
    console.error(`Tab ${id} not found`);
    return;
  }

  // Hide all tabs
  windows.forEach((w) => {
    w.hide();
  });

  // Show and activate the target tab
  const targetWindow = windows.get(id);
  if (targetWindow) {
    targetWindow.show();
  }
  activeTabId = id;
  void ConfigDatabase.setActiveTabId(id);

  console.log(`Switched to tab ${id}`);
}

export async function closeTab(id: string): Promise<void> {
  const tab = tabs.get(id);
  if (!tab) {
    console.error(`Tab ${id} not found`);
    return;
  }

  // Close the window
  const win = windows.get(id);
  win?.close();

  // Remove from maps
  tabs.delete(id);
  windows.delete(id);

  // Remove from database
  await TabDatabase.removeTab(id);

  // If this was the active tab, switch to another tab
  if (activeTabId === id) {
    const remainingTabs = Array.from(tabs.keys());
    if (remainingTabs.length > 0) {
      switchTab(remainingTabs[remainingTabs.length - 1]);
    } else {
      activeTabId = null;
      void ConfigDatabase.setActiveTabId(null);
    }
  }

  console.log(`Closed tab ${id}`);
}

export function getActiveTab(): Tab | null {
  if (!activeTabId) return null;
  return tabs.get(activeTabId) || null;
}

export function getActiveTabId(): string | null {
  return activeTabId;
}

export function getAllTabs(): Tab[] {
  return Array.from(tabs.values());
}

export function getTab(id: string): Tab | null {
  return tabs.get(id) || null;
}

export function getWindow(tabId: string): BrowserWindow | undefined {
  return windows.get(tabId);
}

export async function updateTabTitle(id: string, title: string): Promise<void> {
  const tab = tabs.get(id);
  if (tab) {
    tab.title = title;
    console.log(`Updated tab ${id} title: ${title}`);

    // Update in database
    await TabDatabase.updateTab(id, {
      title,
      lastAccessed: Date.now(),
    });
  }
}

export function updateWindowPositions(): void {
  const baseWindow = getBaseWindow();
  const [baseX, baseY] = baseWindow.getPosition();
  windows.forEach((win) => {
    win.setPosition(baseX + SIDEBAR_WIDTH, baseY + TOPBAR_HEIGHT);
  });
}

export function updateWindowSizes(): void {
  const baseWindow = getBaseWindow();
  const baseBounds = baseWindow.getBounds();
  windows.forEach((win) => {
    win.setSize(
      baseBounds.width - SIDEBAR_WIDTH,
      baseBounds.height - TOPBAR_HEIGHT,
    );
  });
}

// Database-related functions
export async function initializeTabs() {
  const savedTabs = await TabDatabase.getTabs();
  savedTabs.forEach((tab) => {
    const webWindow = createBrowserWindow(tab);
    tabs.set(tab.id, tab);
    windows.set(tab.id, webWindow);
  });
  return savedTabs;
}
