import { resolve } from "path";

export interface Config {
  tabId?: string;
}

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { userDataPath } from "../utils";

interface ConfigSchema {
  config: Config;
}

const configDbPath = resolve(userDataPath, "db__config.json");
const configAdapter = new JSONFile<ConfigSchema>(configDbPath);
const defaultConfigData: ConfigSchema = { config: {} };
const db = new Low<ConfigSchema>(configAdapter, defaultConfigData);

export class ConfigDatabase {
  static async initialize() {
    await db.read();
    if (!db.data) {
      db.data = defaultConfigData;
      await db.read();
    }
  }

  static async getActiveTabId(): Promise<string | null> {
    await db.read();
    return db.data?.config.tabId ?? null;
  }

  static async setActiveTabId(tabId: string | null): Promise<void> {
    await db.read();
    if (!db.data) return;
    db.data.config = {
      ...db.data.config,
      tabId: tabId ?? undefined,
    };
    await db.write();
  }
}
