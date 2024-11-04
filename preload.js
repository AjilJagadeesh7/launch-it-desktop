const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
  launchExecutable: (filePath) => ipcRenderer.send("launch:exe", filePath),
  openFileLocation: (filePath) =>
    ipcRenderer.send("open:fileLocation", filePath),
});
