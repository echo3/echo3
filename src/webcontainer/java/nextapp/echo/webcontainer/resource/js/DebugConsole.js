EchoDebugConsole = {
        
    _installed: false,
    _rendered: false,
    _contentElement: null,
    _windowElement: null,
    _logging: false,
    
    install: function() {
        if (EchoDebugConsole._installed) {
            return;
        }
        WebCore.DOM.addEventListener(document, "keydown", EchoDebugConsole._keyListener, false);
        Core.Debug.consoleWrite = EchoDebugConsole._consoleWrite;
        
        if (document.URL.toString().indexOf("?debug") != -1) {
            EchoDebugConsole.setVisible(true);
            EchoDebugConsole._logging = true;
        }
        
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
    
    /**
     * Method which will overwrite Core.Debug.consoleWrite().
     */
    _consoleWrite: function(text) {
        if (!EchoDebugConsole._logging) {
            return;
        }
    
        if (!EchoDebugConsole._rendered) {
            EchoDebugConsole._render();
        }
        
        var lineElement = document.createElement("div");
        lineElement.appendChild(document.createTextNode(text));
        EchoDebugConsole._contentElement.appendChild(lineElement);
        EchoDebugConsole._contentElement.scrollTop = 10000000;
    },
    
    _keyListener: function(e) {
        e = e ? e : window.event;
        if (!(e.keyCode == 67 && e.ctrlKey && e.altKey)) {
            return;
        }
        
        EchoDebugConsole._logging = true;
        EchoDebugConsole.setVisible(!EchoDebugConsole.isVisible());
    },
    
    isVisible: function() {
        if (!EchoDebugConsole._rendered) {
            return false;
        }
        return EchoDebugConsole._windowElement.style.display == "block";
    },
    
    _render: function() {
        EchoDebugConsole._windowElement = document.createElement("div");
        EchoDebugConsole._windowElement.id = "__DebugConsole__";
        EchoDebugConsole._windowElement.style.cssText 
                = "display:none;position:absolute;top:20px;right:20px;width:300px;height:300px;background-color:#2f2f3f;"
                + "border:5px solid #3f6fff;overflow:hidden;z-index:32767;";
        
        var titleBarElement = document.createElement("div");
        titleBarElement.style.cssText
                = "position:absolute;top:1px;left:1px;width:278px;height:20px;padding:3px 10px;background-color:#5f5f8f;"
                + "color:#ffffff;overflow:hidden;";
        titleBarElement.appendChild(document.createTextNode("/ Debug Console /"));
        EchoDebugConsole._windowElement.appendChild(titleBarElement);
    
        var clearButtonElement = document.createElement("span");
        clearButtonElement.style.cssText = "padding:0 0 0 20px;cursor:pointer;";
        clearButtonElement.appendChild(document.createTextNode("[clear]"));
        titleBarElement.appendChild(clearButtonElement);
        WebCore.DOM.addEventListener(clearButtonElement, "click", EchoDebugConsole._clearListener, false);
        
        var closeButtonElement = document.createElement("span");
        closeButtonElement.style.cssText = "padding:0 0 0 20px;cursor:pointer;";
        closeButtonElement.appendChild(document.createTextNode("[close]"));
        titleBarElement.appendChild(closeButtonElement);
        WebCore.DOM.addEventListener(closeButtonElement, "click", EchoDebugConsole._closeListener, false);
    
        EchoDebugConsole._contentElement = document.createElement("div");
        EchoDebugConsole._contentElement.style.cssText = "font-family:monospace;font-size:9px;position:absolute;top:28px;left:1px;"
                + "width:278px;height:265px;padding:3px 10px;background-color:#1f1f2f;overflow:auto;color:#3fff6f;";
        EchoDebugConsole._windowElement.appendChild(EchoDebugConsole._contentElement);
        
        document.body.appendChild(EchoDebugConsole._windowElement);
    
        EchoDebugConsole._rendered = true;
    },
    
    setVisible: function(newValue) {
        if (!EchoDebugConsole._rendered) {
            EchoDebugConsole._render();
        }
        EchoDebugConsole._windowElement.style.display = newValue ? "block" : "none";
    }
};
