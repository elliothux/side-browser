import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { resolve } from "path";
import { userDataPath } from "../utils";

export interface Tab {
  id: string;
  url: string;
  title: string;
  createdAt: number;
  lastAccessed: number;
}

type TabsSchema = Tab[];

const tabsDbPath = resolve(userDataPath, "db__tabs.json");
const tabsAdapter = new JSONFile<TabsSchema>(tabsDbPath);
const defaultTabsData: TabsSchema = [];

const db = new Low<TabsSchema>(tabsAdapter, defaultTabsData);

export class TabDatabase {
  static async initialize() {
    await db.read();
    if (!db.data) {
      db.data = defaultTabsData;
      await db.write();
    }
  }

  // Get all saved tabs
  static async getTabs(): Promise<Tab[]> {
    await db.read();
    const tabs = db.data ?? [];
    return [...tabs].sort((a, b) => b.lastAccessed - a.lastAccessed);
  }

  // Add a single tab
  static async addTab(tab: Tab): Promise<void> {
    await db.read();
    const tabs = db.data ?? [];
    const index = tabs.findIndex((t) => t.id === tab.id);
    if (index >= 0) {
      tabs[index] = { ...tab };
    } else {
      tabs.push({ ...tab });
    }
    db.data = tabs;
    await db.write();
  }

  // Remove a tab
  static async removeTab(tabId: string): Promise<void> {
    await db.read();
    db.data = (db.data ?? []).filter((t) => t.id !== tabId);
    await db.write();
  }

  // Update a tab
  static async updateTab(tabId: string, updates: Partial<Tab>): Promise<void> {
    await db.read();
    const tabs = db.data ?? [];
    const index = tabs.findIndex((t) => t.id === tabId);
    if (index !== -1) {
      const existing = tabs[index];
      tabs[index] = {
        ...existing,
        ...updates,
        lastAccessed: Date.now(),
      };
      db.data = tabs;
      await db.write();
    }
  }

  // Get tab by ID
  static async getTab(tabId: string): Promise<Tab | null> {
    await db.read();
    const tab = (db.data ?? []).find((t) => t.id === tabId) ?? null;
    return tab ?? null;
  }

  // Clear all tabs
  static async clearAllTabs(): Promise<void> {
    await db.read();
    db.data = [];
    await db.write();
  }
}
