import { electronApp, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow } from "electron";
import { registerShortcut } from "./shortcut";
import { createWindows } from "./window";

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindows();
    }
  });

  createWindows();
  registerShortcut();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
