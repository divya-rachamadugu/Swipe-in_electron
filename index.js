
const { app, BrowserWindow, ipcMain, Tray } = require('electron')
const path = require('path')

let tray = undefined
let window = undefined
const assetsDirectory = path.join(__dirname, 'assets')

function createWindow() {
    // Create the browser window.
    window = new BrowserWindow({
        width: 230,
        height: 80,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            // Prevents renderer process code from not running when window is
            // hidden
            backgroundThrottling: false,
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    window.loadFile('index.html')

    // Open the DevTools.
    //window.webContents.openDevTools()
    window.on('blur', () => {
        if (!window.webContents.isDevToolsOpened()) {
            window.hide()
        }
    })
}

function createTray() {
    tray = new Tray(path.join(assetsDirectory, 'sunTemplate.png'))
    tray.on('right-click', toggleWindow)
    tray.on('double-click', toggleWindow)
    tray.on('click', function (event) {
        toggleWindow()

        // Show devtools when command clicked
        if (window.isVisible() && process.defaultApp && event.metaKey) {
            window.openDevTools({ mode: 'detach' })
        }
    })
    console.log(tray)
}

function createObjects() {
    createTray()
    createWindow()
}

function getWindowPosition() {
    const windowBounds = window.getBounds()
    const trayBounds = tray.getBounds()

    // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 4)

    return { x: x, y: y }
}

//app.dock.hide()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createObjects)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createObjects()
    }
})

const toggleWindow = () => {
    if (window.isVisible()) {
        window.hide()
    } else {
        showWindow()
    }
}

const showWindow = () => {
    const position = getWindowPosition()
    window.setPosition(position.x, position.y, false)
    window.show()
    window.focus()
}

ipcMain.on('show-window', () => {
    showWindow()
})

ipcMain.on('time-updated', (event, time) => {
    tray.setTitle(time)
})
