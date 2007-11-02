EchoDebugConsole = {
        
    _installed: false,
    _initalized: false,
    _contentElement: null,
    _windowElement: null,
    
    install: function() {
        if (EchoDebugConsole._installed) {
            return;
        }
        WebCore.DOM.addEventListener(document, "keydown", EchoDebugConsole._keyListener, false);
        Core.Debug.consoleWrite = EchoDebugConsole._consoleWrite;
        EchoDebugConsole._installed = true;
    },
    
    _clearListener: function() {
        while (EchoDebugConsole._contentElement.firstChild) {
            EchoDebugConsole._contentElement.removeChild(EchoDebugConsole._contentElement.firstChild);
        }
    },
    
    _closeListener: function() {
        EchoDebugConsole._windowElement.style.display = "none";
    },
    
    _consoleWrite: function(text) {
        if (!EchoDebugConsole._initialized) {
            EchoDebugConsole._init();
        }
        
        var lineElement = document.createElement("div");
        lineElement.appendChild(document.createTextNode(text));
        EchoDebugConsole._contentElement.appendChild(lineElement);
        EchoDebugConsole._contentElement.scrollTop = 10000000;
    },
    
    _init: function() {
        EchoDebugConsole._windowElement = document.createElement("div");
        EchoDebugConsole._windowElement.id = "__DebugConsole__";
        EchoDebugConsole._windowElement.style.display = "none";
        EchoDebugConsole._windowElement.style.position = "absolute";
        EchoDebugConsole._windowElement.style.top = "20px";
        EchoDebugConsole._windowElement.style.right = "20px";
        EchoDebugConsole._windowElement.style.width = "300px";
        EchoDebugConsole._windowElement.style.height = "300px";
        EchoDebugConsole._windowElement.style.background = "#2f2f3f";
        EchoDebugConsole._windowElement.style.color = "#3fff6f";
        EchoDebugConsole._windowElement.style.border = "5px solid #3f6fff";
        EchoDebugConsole._windowElement.style.overflow = "hidden";
        EchoDebugConsole._windowElement.style.zIndex = 32767;
        
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
        EchoDebugConsole._windowElement.appendChild(titleBarElement);
    
        var clearButtonElement = document.createElement("span");
        clearButtonElement.style.padding = "0px 0px 0px 20px";
        clearButtonElement.style.cursor = "pointer";
        clearButtonElement.appendChild(document.createTextNode("[clear]"));
        titleBarElement.appendChild(clearButtonElement);
        WebCore.DOM.addEventListener(clearButtonElement, "click", EchoDebugConsole._clearListener, false);
        
        var closeButtonElement = document.createElement("span");
        closeButtonElement.style.padding = "0px 0px 0px 20px";
        closeButtonElement.style.cursor = "pointer";
        closeButtonElement.appendChild(document.createTextNode("[close]"));
        titleBarElement.appendChild(closeButtonElement);
        WebCore.DOM.addEventListener(closeButtonElement, "click", EchoDebugConsole._closeListener, false);
    
        EchoDebugConsole._contentElement = document.createElement("div");
        EchoDebugConsole._contentElement.style.fontFamily = "monospace";
        EchoDebugConsole._contentElement.style.fontSize = "9px";
        EchoDebugConsole._contentElement.style.position = "absolute";
        EchoDebugConsole._contentElement.style.top = "28px";
        EchoDebugConsole._contentElement.style.left = "1px";
        EchoDebugConsole._contentElement.style.width = "278px";
        EchoDebugConsole._contentElement.style.height = "265px";
        EchoDebugConsole._contentElement.style.padding = "3px 10px";
        EchoDebugConsole._contentElement.style.background = "#1f1f2f";
        EchoDebugConsole._contentElement.style.overflow = "auto";
        EchoDebugConsole._windowElement.appendChild(EchoDebugConsole._contentElement);
        
        document.getElementsByTagName("body")[0].appendChild(EchoDebugConsole._windowElement);
    
        EchoDebugConsole._initialized = true;
    },
    
    _keyListener: function(e) {
        //FIXME MSIE.
        e = e ? e : window.event;
        if (!(e.keyCode == 67 && e.ctrlKey && e.altKey)) {
            return;
        }
        
        if (!EchoDebugConsole._initialized) {
            EchoDebugConsole._init();
            return;
        }
        
        if (EchoDebugConsole._windowElement.style.display == "block") {
            EchoDebugConsole._windowElement.style.display = "none";
        } else {
            EchoDebugConsole._windowElement.style.display = "block";
        }
    },
    
    isVisible: function() {
        if (!EchoDebugConsole._initialized) {
            EchoDebugConsole._init();
        }
        return EchoDebugConsole._windowElement.style.display == "block";
    },
    
    setVisible: function(newValue) {
        if (!EchoDebugConsole._initialized) {
            EchoDebugConsole._init();
        }
        EchoDebugConsole._windowElement.style.display = newValue ? "block" : "none";
    }
};
