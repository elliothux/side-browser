import { electronApp, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, screen } from "electron";
import { registerShortcut } from "./shortcut";
import { createBaseWindow } from "./window";

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  createWindow();
  registerShortcut();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function createWindow() {
  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  const windowWidth = 800;
  const windowHeight = screenSize.height;

  createBaseWindow(
    windowWidth,
    windowHeight,
    screenSize.width - windowWidth,
    0,
  );
}
