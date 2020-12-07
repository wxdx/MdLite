import marked from "marked";
import {ipcRenderer,remote,shell} from "electron";
import hljs from "highlight.js";
import path from "path";


const mainProcess  = remote.require('./mian');
const currentWindow = remote.getCurrentWindow();
const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

let markdownChange: boolean = true
let htmlChange: boolean = true
let filePath: any = null;
let originalContent: string = '';



marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code) {
      return hljs.highlightAuto(code).value;
    },
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
    }
  );

function renderMarkdownToHtml(markdown: string):void{
    if(htmlView != null){
        htmlView.innerHTML = marked(markdown, {sanitize:true});
        highlightCode();
    }   
};

function highlightCode():void{
    const preEl = document.querySelectorAll('pre');
    preEl.forEach((el) => {
      hljs.highlightBlock(el)
    })
}

function addLinkListener():void{
    const allLink = document.querySelectorAll('a');
    const allImg = document.querySelectorAll('img');
    const links = document.querySelectorAll('a[href^="http"]');
    const imgs = document.querySelectorAll('img[src^="http"]');
    allLink.forEach((link) => {
        link.addEventListener('click',(e) => {
            e.preventDefault();
        });
    })
    links.forEach((link) => {
        link.addEventListener('click',(e) => {
            if (e.target != null){
                const url = link.getAttribute("href");
                if(url != null){
                    shell.openExternal(url)
                }
            }
        });
    })

    allImg.forEach((img) => {
        img.addEventListener('click',(e) => {
            e.preventDefault();
        });
    })
    imgs.forEach((img) => {
        img.addEventListener('click',(e) => {
            e.preventDefault();
            const url = img.getAttribute("href");
            if(url != null){
                shell.openExternal(url)
            }
        });
    })
}

function updateUserInterface(isEdited: boolean){
    let title = 'MdLite';
    if(filePath) {
        title = `${path.basename(filePath)} - ${title}`;
    }
    if(isEdited){
        title = `${path.basename(title)}(Edited)`;
    }
    currentWindow.setTitle(title);
    currentWindow.setDocumentEdited(isEdited);

    let res: any = !isEdited;
    saveMarkdownButton?.setAttribute("disabled",res);
    revertButton?.setAttribute("disabled",res);
}

// 滚动条同步
markdownView?.addEventListener('scroll', event => {
    if (markdownChange) {
        if(htmlView != null){
            htmlView.scrollTop = markdownView.scrollTop / (markdownView.scrollHeight - markdownView.clientHeight) * (htmlView.scrollHeight - htmlView.clientHeight)
        }
        htmlChange = false
      } else {
        markdownChange = true
      }
})

htmlView?.addEventListener('scroll', event => {
    if (htmlChange) {
        if(markdownView != null){
            markdownView.scrollTop = htmlView.scrollTop / (htmlView.scrollHeight - htmlView.clientHeight) * (markdownView.scrollHeight - markdownView.clientHeight)
        }
        markdownChange = false
      } else {
        htmlChange = true
      }
})
markdownView?.addEventListener('keyup', (event)=>{
    const currentContent = markdownView.getAttribute("value");
    if(currentContent != null){
        renderMarkdownToHtml(currentContent);
        addLinkListener();
        updateUserInterface(originalContent !== currentContent);
    }
})

newFileButton?.addEventListener('click',(event) => {
    mainProcess.createWindow();
})

openFileButton?.addEventListener('click',(event) => {

    mainProcess.getFileFromUser(currentWindow);
})

saveHtmlButton?.addEventListener('click', event => {
    mainProcess.saveHTML(currentWindow,htmlView?.innerHTML);
})

saveMarkdownButton?.addEventListener('click', event => {
    let content: any = markdownView?.getAttribute("value");
    mainProcess.saveMarkdown(currentWindow,filePath,content);
})

revertButton?.addEventListener('click', event => {
    markdownView?.setAttribute("value",originalContent);
    renderMarkdownToHtml(originalContent);
    updateUserInterface(false);
})

ipcRenderer.on('file-opened',(event,file,content) => {
    filePath = file;
    originalContent = content;
    markdownView?.setAttribute("value",content);
    renderMarkdownToHtml(content);
    updateUserInterface(false);
})

