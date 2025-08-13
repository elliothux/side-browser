import { BrowserView, BrowserWindow } from "electron";

interface Tab {
  id: number;
  title: string;
  url: string;
  view: BrowserView;
}

export class TabManager {
  private tabs: Map<number, Tab> = new Map();
  private window: BrowserWindow;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  private sendTabsToRenderer() {
    const serializableTabs = Array.from(this.tabs.values()).map(
      ({ id, title, url }) => ({ id, title, url }),
    );
    this.window.webContents.send("tabs:updated", serializableTabs);
  }

  createTab(id: number, url: string) {
    const view = new BrowserView();
    const newTab: Tab = { id, url, title: "Loading...", view };
    this.tabs.set(id, newTab);

    this.window.addBrowserView(view);
    view.webContents.loadURL(url);
    this.adjustViewBounds();
    this.showTab(id);

    view.webContents.on("page-title-updated", (_event, title) => {
      const tab = this.tabs.get(id);
      if (tab) {
        tab.title = title;
        this.sendTabsToRenderer();
      }
    });

    this.sendTabsToRenderer();
  }

  showTab(id: number) {
    this.tabs.forEach((tab) => {
      if (tab.id === id) {
        this.window.setTopBrowserView(tab.view);
      }
    });
  }

  destroyTab(id: number) {
    const tab = this.tabs.get(id);
    if (tab) {
      this.window.removeBrowserView(tab.view);
      // @ts-ignore
      tab.view.webContents.destroy();
      this.tabs.delete(id);
      this.sendTabsToRenderer();
    }
  }

  adjustViewBounds() {
    const [width, height] = this.window.getSize();
    this.tabs.forEach((tab) => {
      tab.view.setBounds({ x: 0, y: 48, width, height: height - 48 }); // 48px for tab bar
    });
  }
}
