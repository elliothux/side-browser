import { globalShortcut } from "electron";
import { getBaseWindow } from "./window";

export function registerShortcut() {
  const mainWindow = getBaseWindow();
  const ret = globalShortcut.register("CommandOrControl+Shift+S", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  if (!ret) {
    console.log("globalShortcut registration failed");
  }
}
