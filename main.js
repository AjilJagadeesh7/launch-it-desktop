const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const { execFile } = require("child_process");

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      webSecurity: false,
    },
  });

  win.loadURL("https://launch-it-web.netlify.app/");
}

app.whenReady().then(createWindow);

ipcMain.handle("dialog:openFile", async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile"],
    filters: [{ name: "Executable Files", extensions: ["exe"] }],
  });

  return result.canceled ? null : result.filePaths[0];
});

ipcMain.on("launch:exe", (event, filePath) => {
  execFile(filePath, (error) => {
    if (error) {
      console.error(`Error launching executable: ${error}`);
    }
  });
});

ipcMain.on("open:fileLocation", (event, filePath) => {
  if (filePath) {
    shell.showItemInFolder(filePath);
  } else {
    console.error("Invalid file path provided");
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
