/**
 * A simple debug console which attaches to Core.Debug to provide
 * the capability to view messages printed with
 * <code>Core.Debug.consoleWrite()</code>.
 */
Echo.DebugConsole = {
        
    /** 
     * Flag indicating whether the debug console has been installed. 
     * @type Boolean
     */
    _installed: false,
    
    /** 
     * Flag indicating whether the console has been rendered on screen. 
     * @type Boolean
     */
    _rendered: false,
    
    /** 
     * The DOM element to which log messages should be appended. 
     * @type Element
     */
    _contentDiv: null,
    
    /** 
     * The outer container DOM element of the rendered console. 
     * @type Element
     */
    _windowDiv: null,
    
    /** 
     * Flag indicating whether the console is logging/processing output.
     * @type Boolean 
     */
    _logging: false,
    
    /** 
     * Flag indicating whether the console is maximized.
     * @type Boolean 
     */
    _maximized: false,
    
    /**
     * Attaches the Debug console to Core.Web, by overriding the implementation of 
     * <code>Core.Debug.consoleWrite()</code>.
     */
    install: function() {
        if (Echo.DebugConsole._installed) {
            return;
        }
        Core.Web.DOM.addEventListener(document, "keydown", Echo.DebugConsole._keyListener, false);
        Core.Debug.consoleWrite = Echo.DebugConsole._consoleWrite;
        
        if (document.URL.toString().indexOf("?debug") != -1) {
            Echo.DebugConsole.setVisible(true);
            Echo.DebugConsole._logging = true;
        }
        
        Echo.DebugConsole._installed = true;
    },
    
    /** Listener for click events from the "Clear" button: removes all content. */
    _clearListener: function() {
        while (Echo.DebugConsole._contentDiv.firstChild) {
            Echo.DebugConsole._contentDiv.removeChild(Echo.DebugConsole._contentDiv.firstChild);
        }
    },
    
    /** Listener for click events from the close (X) button: sets display to none. */
    _closeListener: function() {
        Echo.DebugConsole._windowDiv.style.display = "none";
    },
    
    /** Listener for click events from the move (>) button: moves console to other side of screen. */
    _moveListener: function() {
        var style = this._windowDiv.style;
        if (style.top) {
            style.top = style.right = "";
            style.bottom = style.left = "20px";
        } else {
            style.bottom = style.left = "";
            style.top = style.right = "20px";
        }
    },
    
    /** Listener for click events from the maximize (^) button: toggles maximization state. */
    _maximizeListener: function() {
        Echo.DebugConsole._maximized = !Echo.DebugConsole._maximized;
        if (Echo.DebugConsole._maximized) {
            var height = document.height;
            height = height ? height : 600;
            var width = document.width;
            width = width ? width : 600;
            Echo.DebugConsole._windowDiv.style.width = (width - 50) + "px";
            Echo.DebugConsole._titleDiv.style.width = (width - 72) + "px";
            Echo.DebugConsole._contentDiv.style.width = (width - 72) + "px";
            Echo.DebugConsole._windowDiv.style.height = (height - 50) + "px";
            Echo.DebugConsole._contentDiv.style.height = (height - 85) + "px";
        } else {
            Echo.DebugConsole._windowDiv.style.width = "300px";
            Echo.DebugConsole._titleDiv.style.width = "278px";
            Echo.DebugConsole._contentDiv.style.width = "278px";
            Echo.DebugConsole._windowDiv.style.height = "300px";
            Echo.DebugConsole._contentDiv.style.height = "265px";
        }
    },
    
    /**
     * Method which will overwrite Core.Debug.consoleWrite().
     * 
     * @text {String} the text to output
     */
    _consoleWrite: function(text) {
        if (!Echo.DebugConsole._logging) {
            return;
        }
    
        if (!Echo.DebugConsole._rendered) {
            Echo.DebugConsole._render();
        }
        
        var lineDiv = document.createElement("div");
        lineDiv.appendChild(document.createTextNode(text));
        Echo.DebugConsole._contentDiv.appendChild(lineDiv);
        Echo.DebugConsole._contentDiv.scrollTop = 10000000;
    },
    
    /** 
     * Listener for keyboard events (shows/hides console with Ctrl+Alt+C 
     */
    _keyListener: function(e) {
        e = e ? e : window.event;
        if (!(e.keyCode == 67 && e.ctrlKey && e.altKey)) {
            return;
        }
        
        Echo.DebugConsole._logging = true;
        Echo.DebugConsole.setVisible(!Echo.DebugConsole.isVisible());
    },
    
    /**
     * Queries the visibility of the console.
     * 
     * @return the console visibility state.
     * @type Boolean
     */
    isVisible: function() {
        if (!Echo.DebugConsole._rendered) {
            return false;
        }
        return Echo.DebugConsole._windowDiv.style.display == "block";
    },
    
    /**
     * Renders the debug console to the screen.
     */
    _render: function() {
        var button;
        
        Echo.DebugConsole._windowDiv = document.createElement("div");
        Echo.DebugConsole._windowDiv.id = "__DebugConsole__";
        Echo.DebugConsole._windowDiv.style.cssText = 
                "display:none;position:absolute;top:20px;right:20px;width:300px;height:300px;background-color:#2f2f3f;" +
                "border:5px solid #3f6fff;overflow:hidden;z-index:32767;";
        
        Echo.DebugConsole._titleDiv = document.createElement("div");
        Echo.DebugConsole._titleDiv.style.cssText =
                "position:absolute;top:1px;left:1px;width:278px;height:3em;padding:3px 10px;background-color:#5f5f8f;" +
                "color:#ffffff;overflow:hidden;";
        Echo.DebugConsole._windowDiv.appendChild(Echo.DebugConsole._titleDiv);

        var titleTextDiv = document.createElement("div");
        titleTextDiv.style.cssText = "position:absolute;font-weight:bold;";
        titleTextDiv.appendChild(document.createTextNode("Debug Console"));
        Echo.DebugConsole._titleDiv.appendChild(titleTextDiv);
    
        var controlsDiv = document.createElement("div");
        controlsDiv.style.cssText = "position:absolute;right:0;background-color:#5f5f8f;";
        Echo.DebugConsole._titleDiv.appendChild(controlsDiv);
        
    
        button = document.createElement("span");
        button.style.cssText = "padding:0 8px 0 0;cursor:pointer;";
        button.appendChild(document.createTextNode("[C]"));
        controlsDiv.appendChild(button);
        Core.Web.DOM.addEventListener(button, "click", Core.method(this, this._clearListener), false);
        
        button = document.createElement("span");
        button.style.cssText = "padding:0 8px 0 0;cursor:pointer;";
        button.appendChild(document.createTextNode("[>]"));
        controlsDiv.appendChild(button);
        Core.Web.DOM.addEventListener(button, "click", Core.method(this, this._moveListener), false);
        
        button = document.createElement("span");
        button.style.cssText = "padding:0 8px 0 0;cursor:pointer;";
        button.appendChild(document.createTextNode("[^]"));
        controlsDiv.appendChild(button);
        Core.Web.DOM.addEventListener(button, "click", Core.method(this, this._maximizeListener), false);
        
        button = document.createElement("span");
        button.style.cssText = "padding:0 8px 0 0;cursor:pointer;";
        button.appendChild(document.createTextNode("[X]"));
        controlsDiv.appendChild(button);
        Core.Web.DOM.addEventListener(button, "click", Core.method(this, this._closeListener), false);
    
        Echo.DebugConsole._contentDiv = document.createElement("div");
        Echo.DebugConsole._contentDiv.style.cssText = 
                "font-family:monospace;font-size:9px;position:absolute;top:3em;left:1px;" +
                "width:278px;height:265px;padding:3px 10px;background-color:#1f1f2f;overflow:auto;color:#3fff6f;";
        Echo.DebugConsole._windowDiv.appendChild(Echo.DebugConsole._contentDiv);
        
        document.body.appendChild(Echo.DebugConsole._windowDiv);
    
        Echo.DebugConsole._rendered = true;
    },
    
    /**
     * Sets the visibility of the console.
     * 
     * @param {Boolean} newValue the new console visibility state
     */
    setVisible: function(newValue) {
        if (!Echo.DebugConsole._rendered) {
            Echo.DebugConsole._render();
        }
        Echo.DebugConsole._windowDiv.style.display = newValue ? "block" : "none";
    }
};
