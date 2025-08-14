import { BrowserWindow, shell } from "electron";
import { nanoid } from "nanoid";
import { TabData, tabDatabase } from "./database";
import { getBaseWindow } from "./window";

// Extended Tab interface that includes BrowserWindow
export interface Tab extends TabData {
  window: BrowserWindow;
  isActive: boolean;
}

const SIDEBAR_WIDTH = 48;
const TOPBAR_HEIGHT = 48;

const tabs: Map<string, Tab> = new Map();
let activeTabId: string | null = null;

export async function createTab(
  url: string = "https://www.google.com",
): Promise<Tab> {
  const id = nanoid();
  const webWindow = createBrowserWindow(id);

  // Create tab object
  const tab: Tab = {
    id,
    url,
    title: "Loading...",
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    type: "tab",
    window: webWindow,
    isActive: false,
  };

  tabs.set(id, tab);

  // Save to database
  await tabDatabase.addTab({
    id,
    url,
    title: "Loading...",
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    type: "tab",
  });

  // Load URL
  webWindow
    .loadURL(url)
    .then(() => {
      console.log(`Tab ${id} loaded successfully: ${url}`);
    })
    .catch((error) => {
      console.error(`Failed to load tab ${id}:`, error);
      updateTabTitle(id, "Error");
    });

  // If this is the first tab, make it active
  if (tabs.size === 1) {
    switchTab(id);
  }

  return tab;
}

function createBrowserWindow(tabId: string): BrowserWindow {
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
    updateTabTitle(tabId, title);
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
  tabs.forEach((t) => {
    t.window.hide();
    t.isActive = false;
  });

  // Show and activate the target tab
  tab.window.show();
  tab.isActive = true;
  activeTabId = id;

  console.log(`Switched to tab ${id}`);
}

export async function closeTab(id: string): Promise<void> {
  const tab = tabs.get(id);
  if (!tab) {
    console.error(`Tab ${id} not found`);
    return;
  }

  // Close the window
  tab.window.close();

  // Remove from tabs map
  tabs.delete(id);

  // Remove from database
  await tabDatabase.removeTab(id);

  // If this was the active tab, switch to another tab
  if (activeTabId === id) {
    const remainingTabs = Array.from(tabs.keys());
    if (remainingTabs.length > 0) {
      switchTab(remainingTabs[remainingTabs.length - 1]);
    } else {
      activeTabId = null;
    }
  }

  console.log(`Closed tab ${id}`);
}

export function getActiveTab(): Tab | null {
  if (!activeTabId) return null;
  return tabs.get(activeTabId) || null;
}

export function getAllTabs(): Tab[] {
  return Array.from(tabs.values());
}

export function getTab(id: string): Tab | null {
  return tabs.get(id) || null;
}

export async function updateTabTitle(id: string, title: string): Promise<void> {
  const tab = tabs.get(id);
  if (tab) {
    tab.title = title;
    console.log(`Updated tab ${id} title: ${title}`);

    // Update in database
    await tabDatabase.updateTab(id, {
      title,
      lastAccessed: new Date().toISOString(),
    });
  }
}

export function updateWindowPositions(): void {
  const baseWindow = getBaseWindow();
  const [baseX, baseY] = baseWindow.getPosition();
  tabs.forEach((tab) => {
    tab.window.setPosition(baseX + SIDEBAR_WIDTH, baseY + TOPBAR_HEIGHT);
  });
}

export function updateWindowSizes(): void {
  const baseWindow = getBaseWindow();
  const baseBounds = baseWindow.getBounds();
  tabs.forEach((tab) => {
    tab.window.setSize(
      baseBounds.width - SIDEBAR_WIDTH,
      baseBounds.height - TOPBAR_HEIGHT,
    );
  });
}

// Database-related functions
export async function initializeTabs() {
  await tabDatabase.initialize();
  const savedTabs = await tabDatabase.getTabs();
  savedTabs.forEach((tab) => {
    const webWindow = createBrowserWindow(tab.id);
    tabs.set(tab.id, { ...tab, window: webWindow, isActive: false });
  });
  return savedTabs;
}

export async function saveAllTabsToDatabase() {
  const tabDataArray: TabData[] = Array.from(tabs.values()).map((tab) => ({
    id: tab.id,
    url: tab.url,
    title: tab.title,
    createdAt: tab.createdAt,
    lastAccessed: new Date().toISOString(),
    type: "tab",
  }));

  await tabDatabase.saveTabs(tabDataArray);
  console.log(`Saved ${tabDataArray.length} tabs to database`);
}
