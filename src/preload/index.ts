import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
  // Tab management
  tabs: {
    create: (url?: string) => ipcRenderer.invoke("tabs:create", url),
    switch: (id: string) => ipcRenderer.invoke("tabs:switch", id),
    close: (id: string) => ipcRenderer.invoke("tabs:close", id),
    getAll: () => ipcRenderer.invoke("tabs:get-all"),
    navigate: (id: string, url: string) =>
      ipcRenderer.invoke("tabs:navigate", id, url),
  },

  // Tab events
  onTabCreated: (callback: (data: any) => void) => {
    ipcRenderer.on("tabs:created", (_, data) => callback(data));
  },
  onTabSwitched: (callback: (data: any) => void) => {
    ipcRenderer.on("tabs:switched", (_, data) => callback(data));
  },
  onTabClosed: (callback: (data: any) => void) => {
    ipcRenderer.on("tabs:closed", (_, data) => callback(data));
  },
  onTabNavigated: (callback: (data: any) => void) => {
    ipcRenderer.on("tabs:navigated", (_, data) => callback(data));
  },

  // Remove event listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
