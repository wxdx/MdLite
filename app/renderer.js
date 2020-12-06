const marked = require('marked');
const {ipcRenderer,remote} = require('electron');
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
    const links = document.querySelectorAll('a[href]')
    links.forEach((link) => {
        link.addEventListener('click',(event) => {
            event.preventDefault();
            const url = event.target.href;
            ipcRenderer.send('open-url', url);
        });
    })
}

const updateUserInterface = (isEdited) => {
    let title = 'MdLite';
    console.log(filePath);
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
ipcRenderer.on('cmd-s', () => {
    mainProcess.saveMarkdown(currentWindow,filePath,markdownView.value);
});

