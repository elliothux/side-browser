import { app } from "electron";
import path from "path";
import PouchDB from "pouchdb";

// Tab data interface
export interface TabData {
  _id?: string;
  _rev?: string;
  id: string;
  url: string;
  title: string;
  createdAt: string;
  lastAccessed: string;
  type: "tab";
}

class TabDatabase {
  private db: PouchDB.Database | null = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath("userData");
    this.dbPath = path.join(userDataPath, "tabs.db");
  }

  async initialize(): Promise<void> {
    try {
      this.db = new PouchDB(this.dbPath);

      // Create indexes for better query performance
      await this.createIndexes();

      console.log("Tab database initialized with PouchDB");
    } catch (error) {
      console.error("Failed to initialize tab database:", error);
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    try {
      // Create index for querying tabs by type
      await this.db.createIndex({
        index: { fields: ["type"] },
      });

      // Create index for querying tabs by lastAccessed
      await this.db.createIndex({
        index: { fields: ["lastAccessed"] },
      });
    } catch (error) {
      console.error("Failed to create indexes:", error);
    }
  }

  // Save all tabs
  async saveTabs(tabs: TabData[]): Promise<void> {
    if (!this.db) return;

    try {
      // Get existing tabs
      const existingTabs = await this.getTabs();

      // Remove existing tabs
      for (const tab of existingTabs) {
        if (tab._id) {
          await this.db.remove(tab._id, tab._rev);
        }
      }

      // Add new tabs
      for (const tab of tabs) {
        await this.addTab(tab);
      }
    } catch (error) {
      console.error("Failed to save tabs:", error);
    }
  }

  // Get all saved tabs
  async getTabs(): Promise<TabData[]> {
    if (!this.db) return [];

    try {
      const result = await this.db.find({
        selector: { type: "tab" },
        sort: [{ lastAccessed: "desc" }],
      });

      return result.docs as TabData[];
    } catch (error) {
      console.error("Failed to get tabs:", error);
      return [];
    }
  }

  // Add a single tab
  async addTab(tab: TabData): Promise<void> {
    if (!this.db) return;

    try {
      const doc: TabData = {
        ...tab,
        type: "tab",
        _id: `tab_${tab.id}`,
      };

      await this.db.put(doc);
    } catch (error) {
      console.error("Failed to add tab:", error);
    }
  }

  // Remove a tab
  async removeTab(tabId: string): Promise<void> {
    if (!this.db) return;

    try {
      const docId = `tab_${tabId}`;
      const doc = await this.db.get(docId);
      await this.db.remove(doc);
    } catch (error) {
      console.error("Failed to remove tab:", error);
    }
  }

  // Update a tab
  async updateTab(tabId: string, updates: Partial<TabData>): Promise<void> {
    if (!this.db) return;

    try {
      const docId = `tab_${tabId}`;
      const doc = await this.db.get(docId);

      const updatedDoc = {
        ...doc,
        ...updates,
        lastAccessed: new Date().toISOString(),
      };

      await this.db.put(updatedDoc);
    } catch (error) {
      console.error("Failed to update tab:", error);
    }
  }

  // Get tab by ID
  async getTab(tabId: string): Promise<TabData | null> {
    if (!this.db) return null;

    try {
      const docId = `tab_${tabId}`;
      const doc = await this.db.get(docId);
      return doc as TabData;
    } catch (error) {
      console.error("Failed to get tab:", error);
      return null;
    }
  }

  // Clear all tabs
  async clearAllTabs(): Promise<void> {
    if (!this.db) return;

    try {
      const tabs = await this.getTabs();
      for (const tab of tabs) {
        if (tab._id && tab._rev) {
          await this.db.remove(tab._id, tab._rev);
        }
      }
    } catch (error) {
      console.error("Failed to clear tabs:", error);
    }
  }

  // Get database info
  async getInfo(): Promise<any> {
    if (!this.db) return null;

    try {
      return await this.db.info();
    } catch (error) {
      console.error("Failed to get database info:", error);
      return null;
    }
  }
}

export const tabDatabase = new TabDatabase();
