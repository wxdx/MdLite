const marked = require('marked');
const {ipcRenderer,remote} = require('electron');
const shell = require('electron').shell;
const hljs  = require('highlight.js');
const mainProcess  = require('electron').remote.require('./mian');
const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');
const currentWindow = remote.getCurrentWindow();
const path = require('path');
let markdownChange = true
let htmlChange = true
let filePath = null;
let originalContent = '';



marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code) {
      return hljs.highlightAuto(code).value;
    },
    pedantic: false,
    gfm: true,
    tables: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
    }
  );

const renderMarkdownToHtml = (markdown) => {
    htmlView.innerHTML = marked(markdown, {sanitize:true});
    highlightCode();
};

const highlightCode = () => {
    const preEl = document.querySelectorAll('pre')
   
    preEl.forEach((el) => {
      hljs.highlightBlock(el)
    })
}

const addLinkListener = () => {
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
            const url = e.target.href;
            shell.openExternal(url)
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
            const url = e.target.src;
            shell.openExternal(url)
        });
    })
}

const updateUserInterface = (isEdited) => {
    let title = 'MdLite';
    if(filePath) {
        title = `${path.basename(filePath)} - ${title}`;
    }
    if(isEdited){
        title = `${path.basename(title)}(Edited)`;
    }
    currentWindow.setTitle(title);
    currentWindow.setDocumentEdited(isEdited);

    saveMarkdownButton.disabled = !isEdited;
    revertButton.disabled = !isEdited;
}

// 滚动条同步
markdownView.addEventListener('scroll', event => {
    if (markdownChange) {
        htmlView.scrollTop = markdownView.scrollTop / (markdownView.scrollHeight - markdownView.clientHeight) * (htmlView.scrollHeight - htmlView.clientHeight)
        htmlChange = false
      } else {
        markdownChange = true
      }
})

htmlView.addEventListener('scroll', event => {
    if (htmlChange) {
        markdownView.scrollTop = htmlView.scrollTop / (htmlView.scrollHeight - htmlView.clientHeight) * (markdownView.scrollHeight - markdownView.clientHeight)
        markdownChange = false
      } else {
        htmlChange = true
      }
})
markdownView.addEventListener('keyup', (event)=>{
    const currentContent = event.target.value;
    renderMarkdownToHtml(currentContent);
    addLinkListener();
    updateUserInterface(originalContent !== currentContent);
})

newFileButton.addEventListener('click',(event) => {
    mainProcess.createWindow();
})

openFileButton.addEventListener('click',(event) => {

    mainProcess.getFileFromUser(currentWindow);
})

saveHtmlButton.addEventListener('click', event => {
    mainProcess.saveHTML(currentWindow,htmlView.innerHTML);
})

saveMarkdownButton.addEventListener('click', event => {
    mainProcess.saveMarkdown(currentWindow,filePath,markdownView.value);
})

revertButton.addEventListener('click', event => {
    markdownView.value = originalContent;
    renderMarkdownToHtml(originalContent);
    updateUserInterface(false);
})

ipcRenderer.on('file-opened',(event,file,content) => {
    filePath = file;
    originalContent = content;
    markdownView.value = content;
    renderMarkdownToHtml(content);
    updateUserInterface(false);
})

