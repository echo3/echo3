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
        if (this._installed) {
            return;
        }
        Core.Web.DOM.addEventListener(document, "keydown", Core.method(this, this._keyListener), false);
        Core.Debug.consoleWrite = function(text) {
            Echo.DebugConsole._consoleWrite(text);
        };
        
        if (document.URL.toString().indexOf("?debug") != -1) {
            this.setVisible(true);
            this._logging = true;
        }
        
        this._installed = true;
    },
    
    /** Listener for click events from the "Clear" button: removes all content. */
    _clearListener: function(e) {
        while (this._contentDiv.firstChild) {
            this._contentDiv.removeChild(this._contentDiv.firstChild);
        }
    },
    
    /** Listener for click events from the close (X) button: sets display to none. */
    _closeListener: function(e) {
        this._windowDiv.style.display = "none";
    },
    
    /** Listener for click events from the move (>) button: moves console to other side of screen. */
    _moveListener: function(e) {
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
    _maximizeListener: function(e) {
        this._maximized = !this._maximized;
        if (this._maximized) {
            var height = document.height;
            height = height ? height : 600;
            var width = document.width;
            width = width ? width : 600;
            this._windowDiv.style.width = (width - 50) + "px";
            this._titleDiv.style.width = (width - 72) + "px";
            this._contentDiv.style.width = (width - 72) + "px";
            this._windowDiv.style.height = (height - 50) + "px";
            this._contentDiv.style.height = (height - 85) + "px";
        } else {
            this._windowDiv.style.width = "300px";
            this._titleDiv.style.width = "278px";
            this._contentDiv.style.width = "278px";
            this._windowDiv.style.height = "300px";
            this._contentDiv.style.height = "265px";
        }
    },
    
    _addControl: function(text, method) {
        var button = document.createElement("span");
        button.style.cssText = "padding:0 8px 0 0;cursor:pointer;";
        button.appendChild(document.createTextNode("[" + text + "]"));
        this._controlsDiv.appendChild(button);
        Core.Web.DOM.addEventListener(button, "click", Core.method(this, method), false);
    },

    /**
     * Method which will overwrite Core.Debug.consoleWrite().
     * 
     * @text {String} the text to output
     */
    _consoleWrite: function(text) {
        if (!this._logging) {
            return;
        }
    
        if (!this._rendered) {
            this._render();
        }
        
        var lineDiv = document.createElement("div");
        lineDiv.appendChild(document.createTextNode(text));
        this._contentDiv.appendChild(lineDiv);
        this._contentDiv.scrollTop = 10000000;
    },
    
    /** 
     * Listener for keyboard events (shows/hides console with Ctrl+Alt+C 
     */
    _keyListener: function(e) {
        e = e ? e : window.event;
        if (!(e.keyCode == 67 && e.ctrlKey && e.altKey)) {
            return;
        }
        
        this._logging = true;
        this.setVisible(!this.isVisible());
    },
    
    /**
     * Queries the visibility of the console.
     * 
     * @return the console visibility state.
     * @type Boolean
     */
    isVisible: function() {
        if (!this._rendered) {
            return false;
        }
        return this._windowDiv.style.display == "block";
    },
    
    /**
     * Renders the debug console to the screen.
     */
    _render: function() {
        var button;
        
        this._windowDiv = document.createElement("div");
        this._windowDiv.id = "__DebugConsole__";
        this._windowDiv.style.cssText = 
                "display:none;position:absolute;top:20px;right:20px;width:300px;height:300px;background-color:#2f2f3f;" +
                "border:5px solid #3f6fff;overflow:hidden;z-index:32767;";
        
        this._titleDiv = document.createElement("div");
        this._titleDiv.style.cssText =
                "position:absolute;top:1px;left:1px;width:278px;height:3em;padding:3px 10px;background-color:#5f5f8f;" +
                "color:#ffffff;overflow:hidden;";
        this._windowDiv.appendChild(this._titleDiv);

        var titleTextDiv = document.createElement("div");
        titleTextDiv.style.cssText = "position:absolute;font-weight:bold;";
        titleTextDiv.appendChild(document.createTextNode("Debug Console"));
        this._titleDiv.appendChild(titleTextDiv);
    
        this._controlsDiv = document.createElement("div");
        this._controlsDiv.style.cssText = "position:absolute;right:0;background-color:#5f5f8f;";
        this._titleDiv.appendChild(this._controlsDiv);
        
        this._addControl("C", this._clearListener);
        this._addControl("<", this._moveListener);
        this._addControl("^", this._maximizeListener);
        this._addControl("X", this._closeListener);
        
        this._contentDiv = document.createElement("div");
        this._contentDiv.style.cssText = 
                "font-family:monospace;font-size:9px;position:absolute;top:3em;left:1px;" +
                "width:278px;height:265px;padding:3px 10px;background-color:#1f1f2f;overflow:auto;color:#3fff6f;";
        this._windowDiv.appendChild(this._contentDiv);
        
        document.body.appendChild(this._windowDiv);
    
        this._rendered = true;
    },
    
    /**
     * Sets the visibility of the console.
     * 
     * @param {Boolean} newValue the new console visibility state
     */
    setVisible: function(newValue) {
        if (!this._rendered) {
            this._render();
        }
        this._windowDiv.style.display = newValue ? "block" : "none";
    }
};
