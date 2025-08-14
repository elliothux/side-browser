import { app } from "electron";

export const userDataPath = app.getPath("userData");
console.log("User data path:", userDataPath);
