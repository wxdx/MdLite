const { app, dialog ,BrowserWindow, ipcMain,shell,globalShortcut } = require('electron');
const fs = require('fs')

const windows = new Set();

app.on('ready',() => {
    const win = createWindow();
    globalShortcut.register('CommandOrControl+S', () => {
        win.webContents.send('cmd-s');
    })
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

app.on('will-finish-launching',() => {
    app.on('open-file', (event,file) => {
        const win = createWindow();
        win.once('ready-to-show', () => {
            openFile(win,file);
        })
    })
})

app.on('will-quit', () => {
    // 注销快捷键
    globalShortcut.unregister('CommandOrControl+S')
  
    // 注销所有快捷键
    globalShortcut.unregisterAll()

    console.log('注销了所有快捷键')
})

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

const saveHTML = exports.saveHTML = (targetWindow,content) => {
    dialog.showSaveDialog(targetWindow,{
        title: 'Save HTML',
        defaultPath: app.getPath('home'),
        filters : [
            { name : 'HTML Files', extensions: ['html','htm']}
        ]
    }).then(result => {
        
        if(!result.canceled){
            fs.writeFileSync(result.filePath,content);
        }
        
    }).catch(err => {
        console.log(err);
    });
};

const saveMarkdown = exports.saveMarkdown = (targetWindow,file,content) =>{
    if(!file){
        file = dialog.showSaveDialogSync(targetWindow,{
            title: 'Save Markdown',
            defaultPath: app.getPath('home'),
            filters : [
                { name : 'Markdown Files', extensions: ['md','markdown']}
            ]
        })      
    }
    if(!file){
        return;
    }
    fs.writeFileSync(file,content);
    app.addRecentDocument(file);
    targetWindow.webContents.send('file-opened',file,content);
}

const openFile = exports.openFile = (targetWindow,file) => {
    const content = fs.readFileSync(file).toString();
    targetWindow.setRepresentedFilename(file);
    app.addRecentDocument(file);
    targetWindow.webContents.send('file-opened',file,content);
}

ipcMain.on('open-url', (event, url) => {
    shell.openExternal(url);
});