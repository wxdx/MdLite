import { app, dialog ,BrowserWindow } from "electron"
import fs from "fs"

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

app.on('will-finish-launching',() => {
    app.on('open-file', (event,file) => {
        const win = createWindow();
        win.once('ready-to-show', () => {
            openFile(win,file);
        })
    })
})


export function createWindow():BrowserWindow {
    let x: number = 0;
    let y: number = 0;

    const currentWindow = BrowserWindow.getFocusedWindow();

    if(currentWindow){
        const [currentX,currentY] = currentWindow.getPosition();
        x = currentX + 20;
        y = currentY + 20;
    }

    let newWindow = new BrowserWindow({
        x: x,
        y: y,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    newWindow.loadFile('../index.html');

    newWindow.once('ready-to-show', () => {
        newWindow.show();
    });

    newWindow.on('closed', () => {
        windows.delete(newWindow);
        newWindow.destroy();
    });

    windows.add(newWindow);

    return newWindow;
}


export function getFileFromUser(targetWindow: BrowserWindow): void{
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

export function saveHTML(targetWindow: BrowserWindow,content: string){
    dialog.showSaveDialog(targetWindow,{
        title: 'Save HTML',
        defaultPath: app.getPath('home'),
        filters : [
            { name : 'HTML Files', extensions: ['html','htm']}
        ]
    }).then(result => {
        
        if(!result.canceled){
            if(result.filePath !== undefined){
                fs.writeFileSync(result.filePath,content);
            }
        }
        
    }).catch(err => {
        console.log(err);
    });
};

export function saveMarkdown(targetWindow: BrowserWindow,file: string,content: string):void {
    let result;
    if(!file){
        result = dialog.showSaveDialogSync(targetWindow,{
            title: 'Save Markdown',
            defaultPath: app.getPath('home'),
            filters : [
                { name : 'Markdown Files', extensions: ['md','markdown']}
            ]
        }) 
        if(result !== undefined){
            fs.writeFileSync(result,content);
            app.addRecentDocument(result);
            targetWindow.webContents.send('file-opened',result,content);
        }
             
    } else {
        fs.writeFileSync(file,content);
        app.addRecentDocument(file);
        targetWindow.webContents.send('file-opened',file,content);
    } 
}


export function openFile(targetWindow: BrowserWindow,file: string):void{
    const content = fs.readFileSync(file).toString();
    targetWindow.setRepresentedFilename(file);
    app.addRecentDocument(file);
    targetWindow.webContents.send('file-opened',file,content);
}