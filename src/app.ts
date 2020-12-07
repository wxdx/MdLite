import { app, dialog ,BrowserWindow } from "electron"
import * as fs from "fs"

export default class App {

    public windows: Set<BrowserWindow> =  new Set();

    public constructor() {
    }

   public createWindow():BrowserWindow {
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
           this.windows.delete(newWindow);
           newWindow.destroy();
       });
   
       this.windows.add(newWindow);
   
       return newWindow;
   }

   public getFileFromUser(targetWindow: BrowserWindow): void{
       dialog.showOpenDialog(targetWindow,{
           properties: ['openFile'],
           filters : [
               { name : 'Markdown Files', extensions: ['md','markdown','txt']}
           ]
       }).then(result => {
           console.log(result.filePaths);
           if(!result.canceled){
               this.openFile(targetWindow,result.filePaths[0]);
           }
           
       }).catch(err => {
           console.log(err);
       });
   }

   public saveHTML(targetWindow: BrowserWindow,content: string){
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
   }


   public saveMarkdown(targetWindow: BrowserWindow,file: string,content: string):void {
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

   public openFile(targetWindow: BrowserWindow,file: string):void{
       const content = fs.readFileSync(file).toString();
       targetWindow.setRepresentedFilename(file);
       app.addRecentDocument(file);
       targetWindow.webContents.send('file-opened',file,content);
   }

}