import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

// Custom APIs for renderer
const api = {
  createTab: (url: string) => ipcRenderer.send("tabs:create", url),
  switchTab: (id: number) => ipcRenderer.send("tabs:switch", id),
  closeTab: (id: number) => ipcRenderer.send("tabs:close", id),
  onTabsUpdated: (callback: (tabs: any[]) => void) => {
    const listener = (_event, tabs) => callback(tabs);
    ipcRenderer.on("tabs:updated", listener);
    return () => {
      ipcRenderer.removeListener("tabs:updated", listener);
    };
  },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
