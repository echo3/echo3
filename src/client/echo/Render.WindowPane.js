/**
 * Component rendering peer: WindowPane
 */
EchoAppRender.WindowPaneSync = Core.extend(EchoRender.ComponentSync, {

    $static: {
        DEFAULT_TITLE_BACKGROUND: "#abcdef",
        DEFAULT_TITLE_INSETS: "5px 10px",
        ADJUSTMENT_OPACITY: 0.75,
        
        adjustOpacity: false
    },
    
    $load: function() {
        EchoRender.registerPeer("WindowPane", this);
    },

    /**
     * The user-requested x position of the window.  The value may or may not be rendered exactly depending on other constraints,
     * e.g., available space.
     */
    _userX: null,

    /**
     * The user-requested y position of the window.  The value may or may not be rendered exactly depending on other constraints,
     * e.g., available space.
     */
    _userY: null,

    /**
     * The user-requested width of the window.  The value may or may not be rendered exactly depending on other constraints,
     * e.g., available space.
     */
    _userWidth: null,

    /**
     * The user-requested height of the window.  The value may or may not be rendered exactly depending on other constraints,
     * e.g., available space.
     */
    _userHeight: null,
    
    /**
     * Actual x position of window.
     * @type Integer
     */
    _windowX: null,
    
    /**
     * Actual y position of window.
     * @type Integer
     */
    _windowY: null,
    
    /**
     * Actual width of window.
     * @type Integer
     */
    _windowWidth: null,
    
    /**
     * Actual height of window.
     * @type Integer
     */
    _windowHeight: null,
    
    /**
     * The size of the region containing the window.
     * @type WebCore.Measure.Bounds
     */
    _containerSize: null,

    _processBorderMouseMoveRef: null,
    _processBorderMouseUpRef: null,
    _processTitleBarMouseMoveRef: null,
    _processTitleBarMouseUpRef: null,
    _controlIcons: null,

    $construct: function() {
        this._processBorderMouseMoveRef = Core.method(this, this._processBorderMouseMove);
        this._processBorderMouseUpRef = Core.method(this, this._processBorderMouseUp);
        this._processTitleBarMouseMoveRef = Core.method(this, this._processTitleBarMouseMove);
        this._processTitleBarMouseUpRef = Core.method(this, this._processTitleBarMouseUp);
    },

    /**
     * Converts the x/y/width/height coordinates of a window pane to pixel values.
     * The _containerSize instance property is used to calculate percent-based values.
     */
    _coordinatesToPixels: function(x, y, width, height) {
        var c = {};
        if (width != null) {
            c.width = EchoAppRender.Extent.isPercent(width)
                    ? (parseInt(width) / 100) * this._containerSize.width
                    : EchoAppRender.Extent.toPixels(width, true);
        }
        if (height != null) {
            c.height = EchoAppRender.Extent.isPercent(height)
                    ? (parseInt(height) / 100) * this._containerSize.height
                    : EchoAppRender.Extent.toPixels(height, false);
        }
        if (x != null) {
            c.x = EchoAppRender.Extent.isPercent(x)
                    ? (this._containerSize.width - c.width) * (parseInt(x) / 100)
                    : EchoAppRender.Extent.toPixels(x, true);
        }
        if (y != null) {
            c.y = EchoAppRender.Extent.isPercent(y)
                    ? (this._containerSize.height - c.height) * (parseInt(y) / 100)
                    : EchoAppRender.Extent.toPixels(y, false);
        }
        return c;
    },
    
    /**
     * Updates the _userX/Y/Width/Height variables based on values from the component object.
     */
    _loadPositionAndSize: function() {
        this._userX = this.component.render("positionX", "50%");
        this._userY = this.component.render("positionY", "50%");
        this._userWidth = this.component.render("width", EchoApp.WindowPane.DEFAULT_WIDTH);
        this._userHeight = this.component.render("height", EchoApp.WindowPane.DEFAULT_HEIGHT);
    },

    _loadContainerSize: function() {
        //FIXME. the "parentnode.parentnode" business needs to go.
        this._containerSize = new WebCore.Measure.Bounds(this._windowPaneDivElement.parentNode.parentNode);
    },
    
    _processBorderMouseDown: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return;
        }
    
        // Prevent selections.
        WebCore.dragInProgress = true;
        WebCore.DOM.preventEventDefault(e);
    
        this._loadContainerSize();
        this._dragInitX = this._windowX;
        this._dragInitY = this._windowY;
        this._dragInitWidth = this._windowWidth;
        this._dragInitHeight = this._windowHeight;
        this._dragOriginX = e.clientX;
        this._dragOriginY = e.clientY;
    
        switch (e.target) {
        case this._borderDivElements[0]: this._resizeX = -1; this._resizeY = -1; break;
        case this._borderDivElements[1]: this._resizeX =  0; this._resizeY = -1; break;
        case this._borderDivElements[2]: this._resizeX =  1; this._resizeY = -1; break;
        case this._borderDivElements[3]: this._resizeX = -1; this._resizeY =  0; break;
        case this._borderDivElements[4]: this._resizeX =  1; this._resizeY =  0; break;
        case this._borderDivElements[5]: this._resizeX = -1; this._resizeY =  1; break;
        case this._borderDivElements[6]: this._resizeX =  0; this._resizeY =  1; break;
        case this._borderDivElements[7]: this._resizeX =  1; this._resizeY =  1; break;
        }
        
        var bodyElement = document.getElementsByTagName("body")[0];
    
        WebCore.EventProcessor.add(bodyElement, "mousemove", this._processBorderMouseMoveRef, true);
        WebCore.EventProcessor.add(bodyElement, "mouseup", this._processBorderMouseUpRef, true);
    
        // Reduce opacity.   
        if (EchoAppRender.WindowPaneSync.adjustOpacity) {
            this._windowPaneDivElement.style.opacity = EchoAppRender.WindowPaneSync.ADJUSTMENT_OPACITY;
        }
    },
    
    _processBorderMouseMove: function(e) {
        var x, y, width, height;
        
        if (this._resizeX == -1) {
            width = this._dragInitWidth - (e.clientX - this._dragOriginX);
            x = this._dragInitX + this._dragInitWidth - width;
        } else if (this._resizeX ==1 ) {
            width = this._dragInitWidth + e.clientX - this._dragOriginX;
        }
        if (this._resizeY == -1) {
            height = this._dragInitHeight - (e.clientY - this._dragOriginY);
            y = this._dragInitY + this._dragInitHeight - height;
        } else if (this._resizeY ==1) {
            height = this._dragInitHeight + e.clientY - this._dragOriginY;
        }
        
        this.setPosition(x, y, width, height);
    },

    _processBorderMouseUp: function(e) {
        WebCore.DOM.preventEventDefault(e);
        
        WebCore.dragInProgress = false;
    
        // Set opaque.
        this._windowPaneDivElement.style.opacity = 1;
    
        this._removeBorderListeners();
        
        this.component.set("positionX", this._windowX);
        this.component.set("positionY", this._windowY);
        this.component.set("width", this._windowWidth);
        this.component.set("height", this._windowHeight);
        
        this._userX = this._windowX;
        this._userY = this._windowY;
        this._userWidth = this._windowWidth;
        this._userHeight = this._windowHeight;
        
        WebCore.VirtualPosition.redraw(this._contentDivElement);
        WebCore.VirtualPosition.redraw(this._maskDivElement);
        EchoRender.notifyResize(this.component);
    },
    
    _processKeyDown: function(e) {
        switch (e.keyCode) {
        case 27:
            this.component.doWindowClosing();
            WebCore.DOM.preventEventDefault(e);
            return false;
        }
        return true;
    },

    _processKeyPress: function(e) {
        switch (e.keyCode) {
        case 27:
            WebCore.DOM.preventEventDefault(e);
            return false;
        }
        return true;
    },
    
    _processCloseClick: function(e) { 
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        this.component.doWindowClosing();
    },
    
    _processFocusClick: function(e) { 
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        this.component.parent.peer.raise(this.component);
        return true;
    },
    
    _processMaximizeClick: function(e) { 
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        this.component.doWindowMaximizing();
    },
    
    _processMinimizeClick: function(e) { 
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        this.component.doWindowMinimizing();
    },
    
    _processTitleBarMouseDown: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return;
        }
    
        // Raise window.
        this.component.parent.peer.raise(this.component);
        
        // Prevent selections.
        WebCore.dragInProgress = true;
        WebCore.DOM.preventEventDefault(e);
    
        this._loadContainerSize();
        this._dragInitX = this._windowX;
        this._dragInitY = this._windowY;
        this._dragOriginX = e.clientX;
        this._dragOriginY = e.clientY;
    
        // Reduce opacity.   
        if (EchoAppRender.WindowPaneSync.adjustOpacity) {
            this._windowPaneDivElement.style.opacity = EchoAppRender.WindowPaneSync.ADJUSTMENT_OPACITY;
        }
        
        var bodyElement = document.getElementsByTagName("body")[0];
        WebCore.EventProcessor.add(bodyElement, "mousemove", this._processTitleBarMouseMoveRef, true);
        WebCore.EventProcessor.add(bodyElement, "mouseup", this._processTitleBarMouseUpRef, true);
    },
    
    _processTitleBarMouseMove: function(e) {
        var x = this._dragInitX + e.clientX - this._dragOriginX;
        var y = this._dragInitY + e.clientY - this._dragOriginY;
        this.setPosition(x, y);
    },
    
    _processTitleBarMouseUp: function(e) {
        WebCore.dragInProgress = false;
    
        // Set opaque.
        this._windowPaneDivElement.style.opacity = 1;
        
        this._removeTitleBarListeners();
        this.component.set("positionX", this._windowX);
        this.component.set("positionY", this._windowY);
    
        this._userX = this._windowX;
        this._userY = this._windowY;
    },
    
    redraw: function() {
        var borderSideWidth = this._windowWidth - this._borderInsets.left - this._borderInsets.right;
        var borderSideHeight = this._windowHeight - this._borderInsets.top - this._borderInsets.bottom;
    
        this._windowPaneDivElement.style.left = this._windowX + "px";
        this._windowPaneDivElement.style.top = this._windowY + "px";
        this._windowPaneDivElement.style.width = this._windowWidth + "px";
        this._windowPaneDivElement.style.height = this._windowHeight + "px";
    
        this._titleBarDivElement.style.width = (this._windowWidth - this._contentInsets.left - this._contentInsets.right) + "px";
        
        this._borderDivElements[1].style.width = borderSideWidth + "px";
        this._borderDivElements[6].style.width = borderSideWidth + "px";
        this._borderDivElements[3].style.height = borderSideHeight + "px";
        this._borderDivElements[4].style.height = borderSideHeight + "px";   
        
        WebCore.VirtualPosition.redraw(this._contentDivElement);
        WebCore.VirtualPosition.redraw(this._maskDivElement);
    },
    
    _removeBorderListeners: function() {
        WebCore.EventProcessor.remove(document.body, "mousemove", this._processBorderMouseMoveRef, true);
        WebCore.EventProcessor.remove(document.body, "mouseup", this._processBorderMouseUpRef, true);
    },
    
    _removeTitleBarListeners: function() {
        WebCore.EventProcessor.remove(document.body, "mousemove", this._processTitleBarMouseMoveRef, true);
        WebCore.EventProcessor.remove(document.body, "mouseup", this._processTitleBarMouseUpRef, true);
    },
    
    renderAdd: function(update, parentElement) {
        this._loadPositionAndSize();
                
        this._minimumWidth = EchoAppRender.Extent.toPixels(
                this.component.render("minimumWidth", EchoApp.WindowPane.DEFAULT_MINIMUM_WIDTH), true);
        this._minimumHeight = EchoAppRender.Extent.toPixels(
                this.component.render("minimumHeight", EchoApp.WindowPane.DEFAULT_MINIMUM_HEIGHT), false);
        this._maximumWidth = EchoAppRender.Extent.toPixels(this.component.render("maximumWidth"), true);
        this._maximumHeight = EchoAppRender.Extent.toPixels(this.component.render("maximumHeight"), false);
    
        var border = this.component.render("border", EchoApp.WindowPane.DEFAULT_BORDER);
        this._borderInsets = EchoAppRender.Insets.toPixels(border.borderInsets);
        this._contentInsets = EchoAppRender.Insets.toPixels(border.contentInsets);
    
        var movable = this.component.render("movable", true);
        var resizable = this.component.render("resizable", true);
        var closable = this.component.render("closable", true);
        var maximizeEnabled = this.component.render("maximizeEnabled", false);
        var minimizeEnabled = this.component.render("minimizeEnabled", false);
        
        var hasControlIcons = closable || maximizeEnabled || minimizeEnabled;
    
        this._windowPaneDivElement = document.createElement("div");
        this._windowPaneDivElement.id = this.component.renderId;
        this._windowPaneDivElement.tabIndex = "0";
    
        this._windowPaneDivElement.style.outlineStyle = "none";
    
        this._windowPaneDivElement.style.position = "absolute";
        this._windowPaneDivElement.style.zIndex = 1;
        
        this._windowPaneDivElement.style.overflow = "hidden";

        EchoAppRender.Font.render(this.component.render("font"), this._windowPaneDivElement);
        
        this._borderDivElements = new Array(8);
        
        var fillImageFlags = this.component.render("ieAlphaRenderBorder") 
                ? EchoAppRender.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
        
        // Render top row
        if (this._borderInsets.top > 0) {
            // Render top left corner
            if (this._borderInsets.left > 0) {
                this._borderDivElements[0] = document.createElement("div");
                this._borderDivElements[0].style.zIndex = 2;
                this._borderDivElements[0].style.fontSize = "1px";
                this._borderDivElements[0].style.position = "absolute";
                this._borderDivElements[0].style.left = "0px";
                this._borderDivElements[0].style.top = "0px";
                this._borderDivElements[0].style.width = this._borderInsets.left + "px";
                this._borderDivElements[0].style.height = this._borderInsets.top + "px";
                if (border.color != null) {
                    this._borderDivElements[0].style.backgroundColor = border.color;
                }
                if (resizable) {
                    this._borderDivElements[0].style.cursor = "nw-resize";
                }
                if (border.topLeft) {
                    EchoAppRender.FillImage.render(border.topLeft, this._borderDivElements[0], fillImageFlags);
                }
                this._windowPaneDivElement.appendChild(this._borderDivElements[0]);
            }
            
            // Render top side
            this._borderDivElements[1] = document.createElement("div");
            this._borderDivElements[1].style.zIndex = 2;                
            this._borderDivElements[1].style.fontSize = "1px";
            this._borderDivElements[1].style.position = "absolute";
            this._borderDivElements[1].style.left = this._borderInsets.left + "px";
            this._borderDivElements[1].style.top = "0px";
            this._borderDivElements[1].style.height = this._borderInsets.top + "px";
            if (border.color != null) {
                this._borderDivElements[1].style.backgroundColor = border.color;
            }
            if (resizable) {
                this._borderDivElements[1].style.cursor = "n-resize";
            }
            if (border.top) {
                EchoAppRender.FillImage.render(border.top, this._borderDivElements[1], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[1]);
    
            // Render top right corner
            if (this._borderInsets.right > 0) {
                this._borderDivElements[2] = document.createElement("div");
                this._borderDivElements[2].style.zIndex = 2;                
                this._borderDivElements[2].style.fontSize = "1px";
                this._borderDivElements[2].style.position = "absolute";
                this._borderDivElements[2].style.right = "0px";
                this._borderDivElements[2].style.top = "0px";
                this._borderDivElements[2].style.width = this._borderInsets.right + "px";
                this._borderDivElements[2].style.height = this._borderInsets.top + "px";
                if (border.color != null) {
                    this._borderDivElements[2].style.backgroundColor = border.color;
                }
                if (resizable) {
                    this._borderDivElements[2].style.cursor = "ne-resize";
                }
                if (border.topRight) {
                    EchoAppRender.FillImage.render(border.topRight, this._borderDivElements[2], fillImageFlags);
                }
                this._windowPaneDivElement.appendChild(this._borderDivElements[2]);
            }
        }
    
        // Render left side
        if (this._borderInsets.left > 0) {
            this._borderDivElements[3] = document.createElement("div");
            this._borderDivElements[3].style.zIndex = 2;                
            this._borderDivElements[3].style.fontSize = "1px";
            this._borderDivElements[3].style.position = "absolute";
            this._borderDivElements[3].style.left = "0px";
            this._borderDivElements[3].style.top = this._borderInsets.top + "px";
            this._borderDivElements[3].style.width = this._borderInsets.left + "px";
            if (border.color != null) {
                this._borderDivElements[3].style.backgroundColor = border.color;
            }
            if (resizable) {
                this._borderDivElements[3].style.cursor = "w-resize";
            }
            if (border.left) {
                EchoAppRender.FillImage.render(border.left, this._borderDivElements[3], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[3]);
        }
        
        // Render right side
        if (this._borderInsets.right > 0) {
            this._borderDivElements[4] = document.createElement("div");
            this._borderDivElements[4].style.zIndex = 2;                
            this._borderDivElements[4].style.fontSize = "1px";
            this._borderDivElements[4].style.position = "absolute";
            this._borderDivElements[4].style.right = "0px";
            this._borderDivElements[4].style.top = this._borderInsets.top + "px";
            this._borderDivElements[4].style.width = this._borderInsets.right + "px";
            if (border.color != null) {
                this._borderDivElements[4].style.backgroundColor = border.color;
            }
            if (resizable) {
                this._borderDivElements[4].style.cursor = "e-resize";
            }
            if (border.right) {
                EchoAppRender.FillImage.render(border.right, this._borderDivElements[4], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[4]);
        }
        
        // Render bottom row
        if (this._borderInsets.bottom > 0) {
            // Render bottom left corner
            if (this._borderInsets.left > 0) {
                this._borderDivElements[5] = document.createElement("div");
                this._borderDivElements[5].style.zIndex = 2;                
                this._borderDivElements[5].style.fontSize = "1px";
                this._borderDivElements[5].style.position = "absolute";
                this._borderDivElements[5].style.left = "0px";
                this._borderDivElements[5].style.bottom = "0px";
                this._borderDivElements[5].style.width = this._borderInsets.left + "px";
                this._borderDivElements[5].style.height = this._borderInsets.bottom + "px";
                if (border.color != null) {
                    this._borderDivElements[5].style.backgroundColor = border.color;
                }
                if (resizable) {
                    this._borderDivElements[5].style.cursor = "sw-resize";
                }
                if (border.bottomLeft) {
                    EchoAppRender.FillImage.render(border.bottomLeft, this._borderDivElements[5], fillImageFlags);
                }
                this._windowPaneDivElement.appendChild(this._borderDivElements[5]);
            }
            
            // Render bottom side
            this._borderDivElements[6] = document.createElement("div");
            this._borderDivElements[6].style.zIndex = 2;                
            this._borderDivElements[6].style.fontSize = "1px";
            this._borderDivElements[6].style.position = "absolute";
            this._borderDivElements[6].style.left = this._borderInsets.left + "px";
            this._borderDivElements[6].style.bottom = "0px";
            this._borderDivElements[6].style.height = this._borderInsets.bottom + "px";
            if (border.color != null) {
                this._borderDivElements[6].style.backgroundColor = border.color;
            }
            if (resizable) {
                this._borderDivElements[6].style.cursor = "s-resize";
            }
            if (border.bottom) {
                EchoAppRender.FillImage.render(border.bottom, this._borderDivElements[6], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[6]);
    
            // Render bottom right corner
            if (this._borderInsets.right > 0) {
                this._borderDivElements[7] = document.createElement("div");
                this._borderDivElements[7].style.zIndex = 2;                
                this._borderDivElements[7].style.fontSize = "1px";
                this._borderDivElements[7].style.position = "absolute";
                this._borderDivElements[7].style.right = "0px";
                this._borderDivElements[7].style.bottom = "0px";
                this._borderDivElements[7].style.width = this._borderInsets.right + "px";
                this._borderDivElements[7].style.height = this._borderInsets.bottom + "px";
                if (border.color != null) {
                    this._borderDivElements[7].style.backgroundColor = border.color;
                }
                if (resizable) {
                    this._borderDivElements[7].style.cursor = "se-resize";
                }
                if (border.bottomRight) {
                    EchoAppRender.FillImage.render(border.bottomRight, this._borderDivElements[7], fillImageFlags);
                }
                this._windowPaneDivElement.appendChild(this._borderDivElements[7]);
            }
        }
        
        // Render Title Bar
        
        this._titleBarDivElement = document.createElement("div");
        this._titleBarDivElement.style.position = "absolute";
        this._titleBarDivElement.style.zIndex = 3;
        
        var icon = this.component.render("icon");
        if (icon) {
            var titleIconDivElement = document.createElement("div");
            titleIconDivElement.style[WebCore.Environment.CSS_FLOAT] = "left";
            EchoAppRender.Insets.render(this.component.render("iconInsets"), titleIconDivElement, "padding");
            this._titleBarDivElement.appendChild(titleIconDivElement);
            
            var imgElement = document.createElement("img");
            EchoAppRender.ImageReference.renderImg(icon, imgElement);
            titleIconDivElement.appendChild(imgElement);
        }
    
        var title = this.component.render("title");
        if (title) {
            var titleTextDivElement = document.createElement("div");
            if (icon) {
                titleTextDivElement.style[WebCore.Environment.CSS_FLOAT] = "left";
            }
            titleTextDivElement.style.whiteSpace = "nowrap";
            EchoAppRender.Font.render(this.component.render("titleFont"), titleTextDivElement);
            EchoAppRender.Insets.render(this.component.render("titleInsets", 
                    EchoAppRender.WindowPaneSync.DEFAULT_TITLE_INSETS), titleTextDivElement, "padding");
            titleTextDivElement.appendChild(document.createTextNode(title));
            this._titleBarDivElement.appendChild(titleTextDivElement);
        }
        
        var titleBarHeight = this.component.render("titleHeight");
        if (titleBarHeight) {
            this._titleBarHeight = EchoAppRender.Extent.toPixels(titleBarHeight);
        } else {
            var titleMeasure = new WebCore.Measure.Bounds(this._titleBarDivElement);
            if (titleMeasure.height) {
                this._titleBarHeight = titleMeasure.height;
            } else {
                this._titleBarHeight = EchoAppRender.Extent.toPixels(EchoApp.WindowPane.DEFAULT_TITLE_HEIGHT);
            }
        }
    
        this._titleBarDivElement.style.top = this._contentInsets.top + "px";
        this._titleBarDivElement.style.left = this._contentInsets.left + "px";
        this._titleBarDivElement.style.height = this._titleBarHeight + "px";
        this._titleBarDivElement.style.overflow = "hidden";
        if (movable) {
            this._titleBarDivElement.style.cursor = "move";
        }
    
        EchoAppRender.Color.render(this.component.render("titleForeground"), this._titleBarDivElement, "color");
    
        var titleBackground = this.component.render("titleBackground");
        var titleBackgroundImage = this.component.render("titleBackgroundImage");
    
        if (titleBackground) {
            this._titleBarDivElement.style.backgroundColor = titleBackground;
        }
        if (titleBackgroundImage) {
            EchoAppRender.FillImage.render(titleBackgroundImage, this._titleBarDivElement);
        }
    
        if (!titleBackground && !titleBackgroundImage) {
            this._titleBarDivElement.style.backgroundColor = EchoAppRender.WindowPaneSync.DEFAULT_TITLE_BACKGROUND;
        }
        
        if (hasControlIcons) {
            this._controlContainerDivElement = document.createElement("div");
            this._controlContainerDivElement.style.cssText = "position:absolute;top:0;right:0;";
            EchoAppRender.Insets.render(this.component.render("closeIconInsets", 
                    EchoApp.WindowPane.DEFAULT_CONTROLS_INSETS), this._controlContainerDivElement, "padding");
            this._titleBarDivElement.appendChild(this._controlContainerDivElement);

            // Close Button
            if (closable) {
                this._renderControlIcon(this.component.render("closeIcon", 
                        this.client.getResourceUrl("Echo", "resource/WindowPaneClose.gif")),
                        null, null, "[X]", this.component.render("closeIconInsets"),
                        Core.method(this, this._processCloseClick));
            }
            
            if (maximizeEnabled) {
                this._renderControlIcon(this.component.render("maximizeIcon", 
                        this.client.getResourceUrl("Echo", "resource/WindowPaneMaximize.gif")),
                        null, null, "[+]", this.component.render("maximizeIconInsets"),
                        Core.method(this, this._processMaximizeClick));
            }

            if (minimizeEnabled) {
                this._renderControlIcon(this.component.render("minimizeIcon", 
                        this.client.getResourceUrl("Echo", "resource/WindowPaneMinimize.gif")),
                        null, null, "[-]", this.component.render("minimizeIconInsets"),
                        Core.method(this, this._processMinimizeClick));
            }
        }
        
        this._windowPaneDivElement.appendChild(this._titleBarDivElement);
        
        // Render Content Area
        
        this._contentDivElement = document.createElement("div");
        
        this._contentDivElement.style.position = "absolute";
        this._contentDivElement.style.zIndex = 2;
        this._contentDivElement.style.overflow = "auto";
        
        EchoAppRender.Color.render(this.component.render("background", EchoApp.WindowPane.DEFAULT_BACKGROUND),
                this._contentDivElement, "backgroundColor");
        EchoAppRender.Color.render(this.component.render("foreground", EchoApp.WindowPane.DEFAULT_FOREGROUND),
                this._contentDivElement, "color");
    
        this._contentDivElement.style.top = (this._contentInsets.top + this._titleBarHeight) + "px";
        this._contentDivElement.style.left = this._contentInsets.left + "px";
        this._contentDivElement.style.right = this._contentInsets.right + "px";
        this._contentDivElement.style.bottom = this._contentInsets.bottom + "px";
        
        this._windowPaneDivElement.appendChild(this._contentDivElement);
    
        var componentCount = this.component.getComponentCount();
        if (componentCount == 1) {
            this.renderAddChild(update, this.component.getComponent(0), this._contentDivElement);
        } else if (componentCount > 1) {
            throw new Error("Too many children: " + componentCount);
        }
    
        // Render Internet Explorer 6-specific windowed control-blocking IFRAME.
        if (WebCore.Environment.QUIRK_IE_SELECT_Z_INDEX) {
            // Render Select Field Masking Transparent IFRAME.
            this._maskDivElement = document.createElement("div");
            this._maskDivElement.style.cssText 
                    = "filter:alpha(opacity=0);z-index:1;position:absolute;left:0,right:0,top:0,bottom:0,borderWidth: 0;";
            var maskIFrameElement = document.createElement("iframe");
            maskIFrameElement.style.cssText = "width:100%;height:100%;";
            
            var blankUrl = this.client.getResourceUrl("Echo", "resource/Blank.html");
            if (blankUrl) {
                maskIFrameElement.src = blankUrl;
            }
            
            this._maskDivElement.appendChild(maskIFrameElement);
            this._windowPaneDivElement.appendChild(this._maskDivElement);
        }
    
        parentElement.appendChild(this._windowPaneDivElement);
        
        // Register event listeners.
        
        WebCore.EventProcessor.add(this._windowPaneDivElement, "click", 
                Core.method(this, this._processFocusClick), true);
        
        if (closable) {
            WebCore.EventProcessor.add(this._windowPaneDivElement, "keydown", 
                    Core.method(this, this._processKeyDown), false);
            WebCore.EventProcessor.add(this._windowPaneDivElement, "keypress", 
                    Core.method(this, this._processKeyPress), false);
        }
        if (movable) {
            WebCore.EventProcessor.add(this._titleBarDivElement, "mousedown", 
                    Core.method(this, this._processTitleBarMouseDown), true);
        }
        if (resizable) {
            for (var i = 0; i < this._borderDivElements.length; ++i) {
                WebCore.EventProcessor.add(this._borderDivElements[i], "mousedown", 
                        Core.method(this, this._processBorderMouseDown), true);
            }
        }
    },
    
    renderAddChild: function(update, child, parentElement) {
        if (child.pane) {
            this._contentDivElement.style.padding = "0";
        } else {
            EchoAppRender.Insets.render(this.component.render("insets"), this._contentDivElement, "padding");
        }
        EchoRender.renderComponentAdd(update, child, parentElement);
    },
    
    _renderControlIcon: function(icon, rolloverIcon, pressedIcon, altText, insets, eventMethod) {
        var controlIcon = document.createElement("div");
        controlIcon.style.cssText = "float:right;cursor:pointer;margin-left:5px;";
        EchoAppRender.Insets.render(insets, controlIcon, "padding");
        if (icon) {
            var imgElement = document.createElement("img");
            EchoAppRender.ImageReference.renderImg(icon, imgElement);
            controlIcon.appendChild(imgElement);
        } else {
            controlIcon.appendChild(document.createTextNode(altText));
        }
        
        if (eventMethod) {
            WebCore.EventProcessor.add(controlIcon, "click", eventMethod, false);
        }
        
        this._controlContainerDivElement.appendChild(controlIcon);
        if (this._controlIcons == null) {
            this._controlIcons = [];
        }
        this._controlIcons.push(controlIcon);
    },
    
    renderDispose: function(update) { 
        for (var i = 0; i < this._borderDivElements.length; ++i) {
            WebCore.EventProcessor.removeAll(this._borderDivElements[i]);
        }
        this._borderDivElements = null;
        
        if (this._controlIcons != null) {
            for (var i = 0; i < this._controlIcons.length; ++i) {
                WebCore.EventProcessor.removeAll(this._controlIcons[i]);
            }
            this._controlIcons = null;
        }
        
        WebCore.EventProcessor.removeAll(this._titleBarDivElement);
        this._titleBarDivElement = null;
        
        if (this._closeDivElement) {
            WebCore.EventProcessor.removeAll(this._closeDivElement);
            this._closeDivElement = null;
        }
        
        this._contentDivElement = null;
    
        WebCore.EventProcessor.removeAll(this._windowPaneDivElement);
        this._windowPaneDivElement = null;
        this._maskDivElement = null;
    },
    
    renderDisplay: function() {
        this._loadContainerSize();
        this.setPosition(this._userX, this._userY, this._userWidth, this._userHeight);
        WebCore.VirtualPosition.redraw(this._contentDivElement);
        WebCore.VirtualPosition.redraw(this._maskDivElement);
    },
    
    renderFocus: function() {
        WebCore.DOM.focusElement(this._windowPaneDivElement);
    },

    renderUpdate: function(update) {
        if (update.hasAddedChildren() || update.hasRemovedChildren()) {
            // Children added/removed: full render.
        } else if (update.isUpdatedPropertySetIn({ positionX: true, positionY: true, width: true, height: true })) {
            // Only x/y/width/height properties changed: reset window position/size.
            this._loadPositionAndSize();
            this.setPosition(this._userX, this._userY, this._userWidth, this._userHeight);
            return;
        }

        var element = this._windowPaneDivElement;
        var containerElement = element.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    setPosition: function(x, y, width, height) {
        var c = this._coordinatesToPixels(x, y, width, height);

        if (c.width != null) {
            if (this._maximumWidth && c.width > this._maximumWidth) {
                if (c.x != null) {
                    c.x += (c.width - this._maximumWidth);
                }
                c.width = this._maximumWidth;
            }
            if (width < this._minimumWidth) {
                if (c.x != null) {
                    c.x += (c.width - this._minimumWidth);
                }
                c.width = this._minimumWidth;
            }
            this._windowWidth = c.width;
        }
        
        if (c.height != null) {
            if (this._maximumHeight && c.height > this._maximumHeight) {
                if (c.y != null) {
                    c.y += (c.height - this._maximumHeight);
                }
                c.height = this._maximumHeight;
            }
            if (height < this._minimumHeight) {
                if (c.y != null) {
                    c.y += (c.height - this._minimumHeight);
                }
                c.height = this._minimumHeight;
            }
            this._windowHeight = c.height;
        }
    
        if (c.x != null) {
            if (this._containerSize.width > 0 && c.x > this._containerSize.width - this._windowWidth) {
                c.x = this._containerSize.width - this._windowWidth;
            }
            if (c.x < 0) {
                c.x = 0;
            }
            this._windowX = c.x;
        }
    
        if (c.y != null) {
            if (this._containerSize.height > 0 && c.y > this._containerSize.height - this._windowHeight) {
                c.y = this._containerSize.height - this._windowHeight;
            }
            if (c.y < 0) {
                c.y = 0;
            }
            this._windowY = c.y;
        }
        
        this.redraw();
    }
});
