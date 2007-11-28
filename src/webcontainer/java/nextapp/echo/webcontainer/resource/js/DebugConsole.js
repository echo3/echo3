EchoDebugConsole = {
        
    _installed: false,
    _rendered: false,
    _contentElement: null,
    _windowElement: null,
    _logging: false,
    _maximized: false,
    
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
    
    _maximizeListener: function() {
        EchoDebugConsole._maximized = !EchoDebugConsole._maximized;
        if (EchoDebugConsole._maximized) {
            var height = document.height;
            height = height ? height : 600;
            var width = document.width;
            width = width ? width : 600;
            EchoDebugConsole._windowElement.style.width = (width - 50) + "px";
            EchoDebugConsole._titleBarElement.style.width = (width - 72) + "px";
            EchoDebugConsole._contentElement.style.width = (width - 72) + "px";
            EchoDebugConsole._windowElement.style.height = (height - 50) + "px";
            EchoDebugConsole._contentElement.style.height = (height - 85) + "px";
        } else {
            EchoDebugConsole._windowElement.style.width = "300px";
            EchoDebugConsole._titleBarElement.style.width = "278px";
            EchoDebugConsole._contentElement.style.width = "278px";
            EchoDebugConsole._windowElement.style.height = "300px";
            EchoDebugConsole._contentElement.style.height = "265px";
        }
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
        
        EchoDebugConsole._titleBarElement = document.createElement("div");
        EchoDebugConsole._titleBarElement.style.cssText
                = "position:absolute;top:1px;left:1px;width:278px;height:20px;padding:3px 10px;background-color:#5f5f8f;"
                + "color:#ffffff;overflow:hidden;";
        EchoDebugConsole._windowElement.appendChild(EchoDebugConsole._titleBarElement);

        var titleDivElement = document.createElement("div");
        titleDivElement.style.cssText = "position:absolute;font-weight:bold;";
        titleDivElement.appendChild(document.createTextNode("Debug Console"));
        EchoDebugConsole._titleBarElement.appendChild(titleDivElement);
    
        var controlsContainerDivElement = document.createElement("div");
        controlsContainerDivElement.style.cssText = "position:absolute;right:0px;";
        EchoDebugConsole._titleBarElement.appendChild(controlsContainerDivElement);
    
        var clearButtonElement = document.createElement("span");
        clearButtonElement.style.cssText = "padding:0 0 0 20px;cursor:pointer;";
        clearButtonElement.appendChild(document.createTextNode("[Clear]"));
        controlsContainerDivElement.appendChild(clearButtonElement);
        WebCore.DOM.addEventListener(clearButtonElement, "click", EchoDebugConsole._clearListener, false);
        
        var maximizeButtonElement = document.createElement("span");
        maximizeButtonElement.style.cssText = "padding:0 0 0 20px;cursor:pointer;";
        maximizeButtonElement.appendChild(document.createTextNode("[^]"));
        controlsContainerDivElement.appendChild(maximizeButtonElement);
        WebCore.DOM.addEventListener(maximizeButtonElement, "click", EchoDebugConsole._maximizeListener, false);
        
        var closeButtonElement = document.createElement("span");
        closeButtonElement.style.cssText = "padding:0 0 0 20px;cursor:pointer;";
        closeButtonElement.appendChild(document.createTextNode("[X]"));
        controlsContainerDivElement.appendChild(closeButtonElement);
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
