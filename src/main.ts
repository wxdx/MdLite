import { app, dialog ,BrowserWindow } from "electron"
import App from "./app";



let mainProcess = new App();

app.on('ready',() => {
    mainProcess.createWindow();
});

/** 针对 mac os集成  start*/

app.on('window-all-closed',() => {
    if(process.platform === 'darwin'){ //如果是mac os
        return false;  //如果是false 取消默认行为
    }
    app.quit();
})

app.on('activate',(event,hasVisibleWindows) => {
    if(!hasVisibleWindows) { mainProcess.createWindow();}
});

/** 针对 mac os集成  end*/

app.on('will-finish-launching',() => {
    app.on('open-file', (event,file) => {
        const win = mainProcess.createWindow();
        win.once('ready-to-show', () => {
            mainProcess.openFile(win,file);
        })
    })
})










