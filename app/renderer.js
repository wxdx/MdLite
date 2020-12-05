const marked = require('marked');
const {ipcRenderer,remote} = require('electron');
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

const renderMarkdownToHtml = (markdown) => {
    htmlView.innerHTML = marked(markdown, {sanitize:true});
};

markdownView.addEventListener('keyup', (event)=>{
    const currentContent = event.target.value;
    renderMarkdownToHtml(currentContent);
})
newFileButton.addEventListener('click',(event) => {
    mainProcess.createWindow();
})
openFileButton.addEventListener('click',(event) => {

    mainProcess.getFileFromUser(currentWindow);
})
ipcRenderer.on('file-opened',(event,file,content) => {
    markdownView.value = content;
    renderMarkdownToHtml(content);
})

