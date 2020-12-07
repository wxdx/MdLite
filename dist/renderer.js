"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var marked_1 = __importDefault(require("marked"));
var electron_1 = require("electron");
var highlight_js_1 = __importDefault(require("highlight.js"));
var path_1 = __importDefault(require("path"));
var mainProcess = electron_1.remote.require('./mian');
var currentWindow = electron_1.remote.getCurrentWindow();
var markdownView = document.querySelector('#markdown');
var htmlView = document.querySelector('#html');
var newFileButton = document.querySelector('#new-file');
var openFileButton = document.querySelector('#open-file');
var saveMarkdownButton = document.querySelector('#save-markdown');
var revertButton = document.querySelector('#revert');
var saveHtmlButton = document.querySelector('#save-html');
var showFileButton = document.querySelector('#show-file');
var openInDefaultButton = document.querySelector('#open-in-default');
var markdownChange = true;
var htmlChange = true;
var filePath = null;
var originalContent = '';
marked_1.default.setOptions({
    renderer: new marked_1.default.Renderer(),
    highlight: function (code) {
        return highlight_js_1.default.highlightAuto(code).value;
    },
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
});
function renderMarkdownToHtml(markdown) {
    if (htmlView != null) {
        htmlView.innerHTML = marked_1.default(markdown, { sanitize: true });
        highlightCode();
    }
}
;
function highlightCode() {
    var preEl = document.querySelectorAll('pre');
    preEl.forEach(function (el) {
        highlight_js_1.default.highlightBlock(el);
    });
}
function addLinkListener() {
    var allLink = document.querySelectorAll('a');
    var allImg = document.querySelectorAll('img');
    var links = document.querySelectorAll('a[href^="http"]');
    var imgs = document.querySelectorAll('img[src^="http"]');
    allLink.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
        });
    });
    links.forEach(function (link) {
        link.addEventListener('click', function (e) {
            if (e.target != null) {
                var url = link.getAttribute("href");
                if (url != null) {
                    electron_1.shell.openExternal(url);
                }
            }
        });
    });
    allImg.forEach(function (img) {
        img.addEventListener('click', function (e) {
            e.preventDefault();
        });
    });
    imgs.forEach(function (img) {
        img.addEventListener('click', function (e) {
            e.preventDefault();
            var url = img.getAttribute("href");
            if (url != null) {
                electron_1.shell.openExternal(url);
            }
        });
    });
}
function updateUserInterface(isEdited) {
    var title = 'MdLite';
    if (filePath) {
        title = path_1.default.basename(filePath) + " - " + title;
    }
    if (isEdited) {
        title = path_1.default.basename(title) + "(Edited)";
    }
    currentWindow.setTitle(title);
    currentWindow.setDocumentEdited(isEdited);
    var res = !isEdited;
    saveMarkdownButton === null || saveMarkdownButton === void 0 ? void 0 : saveMarkdownButton.setAttribute("disabled", res);
    revertButton === null || revertButton === void 0 ? void 0 : revertButton.setAttribute("disabled", res);
}
// 滚动条同步
markdownView === null || markdownView === void 0 ? void 0 : markdownView.addEventListener('scroll', function (event) {
    if (markdownChange) {
        if (htmlView != null) {
            htmlView.scrollTop = markdownView.scrollTop / (markdownView.scrollHeight - markdownView.clientHeight) * (htmlView.scrollHeight - htmlView.clientHeight);
        }
        htmlChange = false;
    }
    else {
        markdownChange = true;
    }
});
htmlView === null || htmlView === void 0 ? void 0 : htmlView.addEventListener('scroll', function (event) {
    if (htmlChange) {
        if (markdownView != null) {
            markdownView.scrollTop = htmlView.scrollTop / (htmlView.scrollHeight - htmlView.clientHeight) * (markdownView.scrollHeight - markdownView.clientHeight);
        }
        markdownChange = false;
    }
    else {
        htmlChange = true;
    }
});
markdownView === null || markdownView === void 0 ? void 0 : markdownView.addEventListener('keyup', function (event) {
    var currentContent = markdownView.getAttribute("value");
    if (currentContent != null) {
        renderMarkdownToHtml(currentContent);
        addLinkListener();
        updateUserInterface(originalContent !== currentContent);
    }
});
newFileButton === null || newFileButton === void 0 ? void 0 : newFileButton.addEventListener('click', function (event) {
    mainProcess.createWindow();
});
openFileButton === null || openFileButton === void 0 ? void 0 : openFileButton.addEventListener('click', function (event) {
    mainProcess.getFileFromUser(currentWindow);
});
saveHtmlButton === null || saveHtmlButton === void 0 ? void 0 : saveHtmlButton.addEventListener('click', function (event) {
    mainProcess.saveHTML(currentWindow, htmlView === null || htmlView === void 0 ? void 0 : htmlView.innerHTML);
});
saveMarkdownButton === null || saveMarkdownButton === void 0 ? void 0 : saveMarkdownButton.addEventListener('click', function (event) {
    var content = markdownView === null || markdownView === void 0 ? void 0 : markdownView.getAttribute("value");
    mainProcess.saveMarkdown(currentWindow, filePath, content);
});
revertButton === null || revertButton === void 0 ? void 0 : revertButton.addEventListener('click', function (event) {
    markdownView === null || markdownView === void 0 ? void 0 : markdownView.setAttribute("value", originalContent);
    renderMarkdownToHtml(originalContent);
    updateUserInterface(false);
});
electron_1.ipcRenderer.on('file-opened', function (event, file, content) {
    filePath = file;
    originalContent = content;
    markdownView === null || markdownView === void 0 ? void 0 : markdownView.setAttribute("value", content);
    renderMarkdownToHtml(content);
    updateUserInterface(false);
});
//# sourceMappingURL=renderer.js.map