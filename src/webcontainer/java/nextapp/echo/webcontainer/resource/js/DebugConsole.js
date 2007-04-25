EchoDebugConsole = function() { };

EchoDebugConsole._BASE_ID = "__DebugConsole__";
EchoDebugConsole._CONTENT_ID = "__DebugConsole__Content__";

EchoDebugConsole._installed = false;
EchoDebugConsole._initalized = false;

EchoDebugConsole.install = function() {
    if (EchoDebugConsole._installed) {
        return;
    }
    EchoWebCore.DOM.addEventListener(document, "keydown", EchoDebugConsole._keyListener, false);
    EchoCore.Debug.consoleWrite = EchoDebugConsole._consoleWrite;
    EchoDebugConsole._installed = true;
};

EchoDebugConsole._clearListener = function() {
    var contentElement = document.getElementById(EchoDebugConsole._CONTENT_ID);
    while (contentElement.firstChild) {
        contentElement.removeChild(contentElement.firstChild);
    }
};

EchoDebugConsole._closeListener = function() {
    var windowElement = document.getElementById(EchoDebugConsole._BASE_ID);
    windowElement.style.display = "none";
};

EchoDebugConsole._consoleWrite = function(text) {
    if (!EchoDebugConsole._initialized) {
        EchoDebugConsole._init();
    }
    
    var contentElement = document.getElementById(EchoDebugConsole._CONTENT_ID);
    var lineElement = document.createElement("div");
    lineElement.appendChild(document.createTextNode(text));
    contentElement.appendChild(lineElement);
};

EchoDebugConsole._init = function() {
    var windowElement = document.createElement("div");
    windowElement.id = EchoDebugConsole._BASE_ID;
    windowElement.style.position = "absolute";
    windowElement.style.top = "20px";
    windowElement.style.right = "20px";
    windowElement.style.width = "300px";
    windowElement.style.height = "300px";
    windowElement.style.background = "#2f2f3f";
    windowElement.style.color = "#3fff6f";
    windowElement.style.border = "5px solid #3f6fff";
    windowElement.style.overflow = "hidden";
    windowElement.style.zIndex = 32767;
    
    var titleBarElement = document.createElement("div");
    titleBarElement.style.position = "absolute";
    titleBarElement.style.top = "1px";
    titleBarElement.style.left = "1px";
    titleBarElement.style.width = "278px";
    titleBarElement.style.height = "20px";
    titleBarElement.style.padding = "3px 10px";
    titleBarElement.style.background = "#5f5f8f";
    titleBarElement.style.color = "#ffffff";
    titleBarElement.style.overflow = "hidden";
    titleBarElement.appendChild(document.createTextNode("/ Debug Console /"));
    windowElement.appendChild(titleBarElement);

    var clearButtonElement = document.createElement("span");
    clearButtonElement.style.padding = "0px 0px 0px 20px";
    clearButtonElement.appendChild(document.createTextNode("[clear]"));
    titleBarElement.appendChild(clearButtonElement);
    EchoWebCore.DOM.addEventListener(clearButtonElement, "click", EchoDebugConsole._clearListener, false);
    
    var closeButtonElement = document.createElement("span");
    closeButtonElement.style.padding = "0px 0px 0px 20px";
    closeButtonElement.appendChild(document.createTextNode("[close]"));
    titleBarElement.appendChild(closeButtonElement);
    EchoWebCore.DOM.addEventListener(closeButtonElement, "click", EchoDebugConsole._closeListener, false);

    var contentElement = document.createElement("div");
    contentElement.setAttribute("id", EchoDebugConsole._CONTENT_ID);
    contentElement.style.position = "absolute";
    contentElement.style.top = "28px";
    contentElement.style.left = "1px";
    contentElement.style.width = "278px";
    contentElement.style.height = "265px";
    contentElement.style.padding = "3px 10px";
    contentElement.style.background = "#1f1f2f";
    contentElement.style.overflow = "auto";
    windowElement.appendChild(contentElement);
    
    document.getElementsByTagName("body")[0].appendChild(windowElement);

    EchoDebugConsole._initialized = true;
}

EchoDebugConsole._keyListener = function(e) {
    //FIXME MSIE.
    e = e ? e : window.event;
    if (!(e.keyCode == 67 && e.ctrlKey && e.altKey)) {
        return;
    }
    
    var windowElement = document.getElementById(EchoDebugConsole._BASE_ID);
    if (!EchoDebugConsole._initialized) {
        EchoDebugConsole._init();
        return;
    }
    
    if (windowElement.style.display == "block") {
        windowElement.style.display = "none";
    } else {
        windowElement.style.display = "block";
    }
};
