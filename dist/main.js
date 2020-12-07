"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openFile = exports.saveMarkdown = exports.saveHTML = exports.getFileFromUser = exports.createWindow = void 0;
var electron_1 = require("electron");
var fs_1 = __importDefault(require("fs"));
var windows = new Set();
electron_1.app.on('ready', function () {
    createWindow();
});
/** 针对 mac os集成  start*/
electron_1.app.on('window-all-closed', function () {
    if (process.platform === 'darwin') { //如果是mac os
        return false; //如果是false 取消默认行为
    }
    electron_1.app.quit();
});
electron_1.app.on('activate', function (event, hasVisibleWindows) {
    if (!hasVisibleWindows) {
        createWindow();
    }
});
/** 针对 mac os集成  end*/
electron_1.app.on('will-finish-launching', function () {
    electron_1.app.on('open-file', function (event, file) {
        var win = createWindow();
        win.once('ready-to-show', function () {
            openFile(win, file);
        });
    });
});
function createWindow() {
    var x = 0;
    var y = 0;
    var currentWindow = electron_1.BrowserWindow.getFocusedWindow();
    if (currentWindow) {
        var _a = currentWindow.getPosition(), currentX = _a[0], currentY = _a[1];
        x = currentX + 20;
        y = currentY + 20;
    }
    var newWindow = new electron_1.BrowserWindow({
        x: x,
        y: y,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    newWindow.loadFile('../index.html');
    newWindow.once('ready-to-show', function () {
        newWindow.show();
    });
    newWindow.on('closed', function () {
        windows.delete(newWindow);
        newWindow.destroy();
    });
    windows.add(newWindow);
    return newWindow;
}
exports.createWindow = createWindow;
function getFileFromUser(targetWindow) {
    electron_1.dialog.showOpenDialog(targetWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
        ]
    }).then(function (result) {
        console.log(result.filePaths);
        if (!result.canceled) {
            openFile(targetWindow, result.filePaths[0]);
        }
    }).catch(function (err) {
        console.log(err);
    });
}
exports.getFileFromUser = getFileFromUser;
;
function saveHTML(targetWindow, content) {
    electron_1.dialog.showSaveDialog(targetWindow, {
        title: 'Save HTML',
        defaultPath: electron_1.app.getPath('home'),
        filters: [
            { name: 'HTML Files', extensions: ['html', 'htm'] }
        ]
    }).then(function (result) {
        if (!result.canceled) {
            if (result.filePath !== undefined) {
                fs_1.default.writeFileSync(result.filePath, content);
            }
        }
    }).catch(function (err) {
        console.log(err);
    });
}
exports.saveHTML = saveHTML;
;
function saveMarkdown(targetWindow, file, content) {
    var result;
    if (!file) {
        result = electron_1.dialog.showSaveDialogSync(targetWindow, {
            title: 'Save Markdown',
            defaultPath: electron_1.app.getPath('home'),
            filters: [
                { name: 'Markdown Files', extensions: ['md', 'markdown'] }
            ]
        });
        if (result !== undefined) {
            fs_1.default.writeFileSync(result, content);
            electron_1.app.addRecentDocument(result);
            targetWindow.webContents.send('file-opened', result, content);
        }
    }
    else {
        fs_1.default.writeFileSync(file, content);
        electron_1.app.addRecentDocument(file);
        targetWindow.webContents.send('file-opened', file, content);
    }
}
exports.saveMarkdown = saveMarkdown;
function openFile(targetWindow, file) {
    var content = fs_1.default.readFileSync(file).toString();
    targetWindow.setRepresentedFilename(file);
    electron_1.app.addRecentDocument(file);
    targetWindow.webContents.send('file-opened', file, content);
}
exports.openFile = openFile;
//# sourceMappingURL=main.js.map