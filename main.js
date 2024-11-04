const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const { execFile } = require("child_process");
let splashWindow;
let win;

function createSplashScreen() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    title: "Launch It!",
    frame: false, // No window controls for splash
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    icon: path.join(__dirname, "logo.png"), // Replace with your icon path
  });

  splashWindow.loadFile(path.join(__dirname, "splash.html")); // Create a simple splash.html
}
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 720,
    autoHideMenuBar: true,
    title: "Launch It!",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      webSecurity: false,
    },
    icon: path.join(__dirname, "logo.png"),
  });

  win.loadURL("https://launch-it-web.netlify.app/");
  win.once("ready-to-show", () => {
    if (splashWindow) {
      splashWindow.close();
    }
    win.show();
  });
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
  if (filePath) {
    const child = spawn(filePath, {
      detached: true,
      stdio: "ignore",
    });

    child.unref();
  } else {
    console.error("Invalid file path provided");
  }
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
