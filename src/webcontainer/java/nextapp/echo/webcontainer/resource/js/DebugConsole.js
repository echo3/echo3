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
    windowElement.setAttribute("id", EchoDebugConsole._BASE_ID);
    windowElement.setAttribute("style", "position: absolute; top: 20px; right: 20px; height: 300px; width: 300px; "
            + "background: #2f2f3f; color: #3fff6f; border: 5px solid #3f6fff; overflow: hidden; z-index: 32767;");
    
    var titleBarElement = document.createElement("div");
    titleBarElement.setAttribute("style", "position: absolute; top: 1px; left: 1px; width: 278px; height: 20px;"
            + "padding: 3px 10px; background: #5f5f8f; color: #ffffff; overflow: hidden;");
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
    contentElement.setAttribute("style", "position: absolute; top: 28px; left: 1px; width: 278px; height: 265px; " +
            "padding: 3px 10px; background: #1f1f2f; overflow:auto;")
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
