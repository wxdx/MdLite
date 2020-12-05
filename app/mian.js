const { app, dialog ,BrowserWindow, ipcMain } = require('electron');
const fs = require('fs')

const windows = new Set();

app.on('ready',() => {
    createWindow();
});

/** 针对 mac os集成  start*/

app.on('window-all-closed',() => {
    if(process.platform === 'darwin'){ //如果是mac os
        return false;  //如果是false 取消默认行为
    }
    app.quit();
})

app.on('activate',(event,hasVisibleWindows) => {
    if(!hasVisibleWindows) { createWindow();}
});

/** 针对 mac os集成  end*/

const createWindow = exports.createWindow = () => {

    let x,y

    const currentWindow = BrowserWindow.getFocusedWindow();

    if(currentWindow){
        const [currentX,currentY] = currentWindow.getPosition();
        x = currentX + 20;
        y = currentY + 20;
    }

    let newWindow = new BrowserWindow({
        x,y,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    newWindow.loadFile('app/index.html');

    newWindow.once('ready-to-show', () => {
        newWindow.show();
    });

    newWindow.on('closed', () => {
        windows.delete(newWindow);
        newWindow = null;
    });

    windows.add(newWindow);

    return newWindow;
}

const getFileFromUser = exports.getFileFromUser = (targetWindow) => {
    dialog.showOpenDialog(targetWindow,{
        properties: ['openFile'],
        filters : [
            { name : 'Markdown Files', extensions: ['md','markdown','txt']}
        ]
    }).then(result => {
        console.log(result.filePaths);
        if(!result.canceled){
            openFile(targetWindow,result.filePaths[0]);
        }
        
    }).catch(err => {
        console.log(err);
    });
};

const openFile = (targetWindow,file) => {
    const content = fs.readFileSync(file).toString();
    targetWindow.webContents.send('file-opened',file,content);
}