export interface IElectronAPI {
  tabs: {
    create: (url?: string) => Promise<string>;
    switch: (id: string) => Promise<boolean>;
    close: (id: string) => Promise<boolean>;
    getAll: () => Promise<{
      tabs: Array<{
        id: string;
        url: string;
        title: string;
      }>;
      activeTabId: string | null;
    }>;
    navigate: (id: string, url: string) => Promise<boolean>;
  };
  onTabCreated: (
    callback: (data: { id: string; url: string; title: string }) => void,
  ) => void;
  onTabSwitched: (
    callback: (data: { activeTabId: string | null }) => void,
  ) => void;
  onTabClosed: (
    callback: (data: {
      closedTabId: string;
      activeTabId: string | null;
    }) => void,
  ) => void;
  onTabNavigated: (
    callback: (data: { tabId: string; url: string }) => void,
  ) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
