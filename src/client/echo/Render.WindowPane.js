/**
 * Component rendering peer: WindowPane
 */
EchoAppRender.WindowPaneSync = Core.extend(EchoRender.ComponentSync, {

    $static: {
        DEFAULT_TITLE_BACKGROUND: "#abcdef",
        DEFAULT_TITLE_INSETS: "5px 10px",
        ADJUSTMENT_OPACITY: 0.75,
        CURSORS: ["nw-resize", "n-resize", "ne-resize", "w-resize", "e-resize", "sw-resize", "s-resize", "se-resize"],
        FIB_POSITIONS: ["topLeft", "top", "topRight", "left", "right", "bottomLeft", "bottom", "bottomRight"],
        adjustOpacity: false,
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
     * Rendered x position of window.
     * @type Integer
     */
    _renderX: null,
    
    /**
     * Rendered y position of window.
     * @type Integer
     */
    _renderY: null,
    
    /**
     * Rendered width of window.
     * @type Integer
     */
    _renderWidth: null,
    
    /**
     * Rendered height of window.
     * @type Integer
     */
    _renderHeight: null,
    
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
        this._containerSize = new WebCore.Measure.Bounds(this._div.parentNode.parentNode);
    },
    
    _processBorderMouseDown: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return;
        }
    
        // Prevent selections.
        WebCore.dragInProgress = true;
        WebCore.DOM.preventEventDefault(e);
    
        this._loadContainerSize();
        this._dragInitX = this._renderX;
        this._dragInitY = this._renderY;
        this._dragInitWidth = this._renderWidth;
        this._dragInitHeight = this._renderHeight;
        this._dragOriginX = e.clientX;
        this._dragOriginY = e.clientY;
        
        switch (e.target) {
        case this._borderDivs[0]: this._resizeX = -1; this._resizeY = -1; break;
        case this._borderDivs[1]: this._resizeX =  0; this._resizeY = -1; break;
        case this._borderDivs[2]: this._resizeX =  1; this._resizeY = -1; break;
        case this._borderDivs[3]: this._resizeX = -1; this._resizeY =  0; break;
        case this._borderDivs[4]: this._resizeX =  1; this._resizeY =  0; break;
        case this._borderDivs[5]: this._resizeX = -1; this._resizeY =  1; break;
        case this._borderDivs[6]: this._resizeX =  0; this._resizeY =  1; break;
        case this._borderDivs[7]: this._resizeX =  1; this._resizeY =  1; break;
        }
        
        var bodyElement = document.getElementsByTagName("body")[0];
    
        WebCore.EventProcessor.add(bodyElement, "mousemove", this._processBorderMouseMoveRef, true);
        WebCore.EventProcessor.add(bodyElement, "mouseup", this._processBorderMouseUpRef, true);
    
        // Reduce opacity.   
        if (EchoAppRender.WindowPaneSync.adjustOpacity) {
            this._div.style.opacity = EchoAppRender.WindowPaneSync.ADJUSTMENT_OPACITY;
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
        this._div.style.opacity = 1;
    
        this._removeBorderListeners();
        
        this.component.set("positionX", this._renderX);
        this.component.set("positionY", this._renderY);
        this.component.set("width", this._renderWidth);
        this.component.set("height", this._renderHeight);
        
        this._userX = this._renderX;
        this._userY = this._renderY;
        this._userWidth = this._renderWidth;
        this._userHeight = this._renderHeight;
        
        WebCore.VirtualPosition.redraw(this._contentDiv);
        WebCore.VirtualPosition.redraw(this._maskDiv);
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
        this._dragInitX = this._renderX;
        this._dragInitY = this._renderY;
        this._dragOriginX = e.clientX;
        this._dragOriginY = e.clientY;
    
        // Reduce opacity.   
        if (EchoAppRender.WindowPaneSync.adjustOpacity) {
            this._div.style.opacity = EchoAppRender.WindowPaneSync.ADJUSTMENT_OPACITY;
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
        this._div.style.opacity = 1;
        
        this._removeTitleBarListeners();
        this.component.set("positionX", this._renderX);
        this.component.set("positionY", this._renderY);
    
        this._userX = this._renderX;
        this._userY = this._renderY;
    },
    
    redraw: function() {    
        if (this._renderWidth <= 0 || this._renderHeight <= 0) {
            // Do not render if window does not have set dimensions.
            return;
        }

        var borderSideWidth = this._renderWidth - this._borderInsets.left - this._borderInsets.right;
        var borderSideHeight = this._renderHeight - this._borderInsets.top - this._borderInsets.bottom;
    
        this._div.style.left = this._renderX + "px";
        this._div.style.top = this._renderY + "px";
        this._div.style.width = this._renderWidth + "px";
        this._div.style.height = this._renderHeight + "px";
    
        this._titleBarDiv.style.width = (this._renderWidth - this._contentInsets.left - this._contentInsets.right) + "px";
        
        this._borderDivs[1].style.width = borderSideWidth + "px";
        this._borderDivs[6].style.width = borderSideWidth + "px";
        this._borderDivs[3].style.height = borderSideHeight + "px";
        this._borderDivs[4].style.height = borderSideHeight + "px";   
        
        WebCore.VirtualPosition.redraw(this._contentDiv);
        WebCore.VirtualPosition.redraw(this._maskDiv);
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
        var fillImageFlags = this.component.render("ieAlphaRenderBorder") 
                ? EchoAppRender.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
    
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.tabIndex = "0";
        this._div.style.cssText = "outline-style:none;position:absolute;z-index:1;overflow:hidden;";
        EchoAppRender.Font.render(this.component.render("font"), this._div);
        
        this._borderDivs = new Array(8);
        
        var borderBaseCss = "z-index:2;font-size:1px;position:absolute;";
        // Render top row
        if (this._borderInsets.top > 0) {
            // Render top left corner
            if (this._borderInsets.left > 0) {
                this._borderDivs[0] = document.createElement("div");
                this._borderDivs[0].style.cssText = borderBaseCss + "left:0;top:0;"
                        + "width:" + this._borderInsets.left + "px;height:" + this._borderInsets.top + "px;";
            }
            
            // Render top side
            this._borderDivs[1] = document.createElement("div");
            this._borderDivs[1].style.cssText = borderBaseCss + "top:0;"
                    + "left:" + this._borderInsets.left + "px;height:" + this._borderInsets.top + "px;";
    
            // Render top right corner
            if (this._borderInsets.right > 0) {
                this._borderDivs[2] = document.createElement("div");
                this._borderDivs[2].style.cssText = borderBaseCss + "right:0;top:0;"
                        + "width:" + this._borderInsets.right + "px;height:" + this._borderInsets.top + "px;";
            }
        }
    
        // Render left side
        if (this._borderInsets.left > 0) {
            this._borderDivs[3] = document.createElement("div");
            this._borderDivs[3].style.cssText = borderBaseCss + "left:0;"
                    + "top:" + this._borderInsets.top + "px;width:" + this._borderInsets.left + "px;";
        }
        
        // Render right side
        if (this._borderInsets.right > 0) {
            this._borderDivs[4] = document.createElement("div");
            this._borderDivs[4].style.cssText = borderBaseCss + "right:0;"
                    + "top:" + this._borderInsets.top + "px;width:" + this._borderInsets.right + "px;";
        }
        
        // Render bottom row
        if (this._borderInsets.bottom > 0) {
            // Render bottom left corner
            if (this._borderInsets.left > 0) {
                this._borderDivs[5] = document.createElement("div");
                this._borderDivs[5].style.cssText = borderBaseCss + "left:0;bottom:0;"
                        + "width:" + this._borderInsets.left + "px;height:" + this._borderInsets.bottom + "px;";
            }
            
            // Render bottom side
            this._borderDivs[6] = document.createElement("div");
            this._borderDivs[6].style.cssText = borderBaseCss + "bottom:0;"
                    + "left:" + this._borderInsets.left + "px;height:" + this._borderInsets.bottom + "px;";
    
            // Render bottom right corner
            if (this._borderInsets.right > 0) {
                this._borderDivs[7] = document.createElement("div");
                this._borderDivs[7].style.cssText = borderBaseCss + "right:0;bottom:0;"
                        + "width:" + this._borderInsets.right + "px;height:" + this._borderInsets.bottom + "px;";
            }
        }
        
        for (var i = 0; i < 8; ++i) {
            if (this._borderDivs[i]) {
                if (border.color != null) {
                    this._borderDivs[i].style.backgroundColor = border.color;
                }
                if (resizable) {
                    this._borderDivs[i].style.cursor = EchoAppRender.WindowPaneSync.CURSORS[i];
                }
                var borderImage = border[EchoAppRender.WindowPaneSync.FIB_POSITIONS[i]];
                if (borderImage) {
                    EchoAppRender.FillImage.render(borderImage, this._borderDivs[i], fillImageFlags);
                }
                this._div.appendChild(this._borderDivs[i]);
            }
        }
        
        // Render Title Bar
        
        this._titleBarDiv = document.createElement("div");
        this._titleBarDiv.style.position = "absolute";
        this._titleBarDiv.style.zIndex = 3;
        
        var icon = this.component.render("icon");
        if (icon) {
            var titleIconDiv = document.createElement("div");
            titleIconDiv.style[WebCore.Environment.CSS_FLOAT] = "left";
            EchoAppRender.Insets.render(this.component.render("iconInsets"), titleIconDiv, "padding");
            this._titleBarDiv.appendChild(titleIconDiv);
            
            var imgElement = document.createElement("img");
            EchoAppRender.ImageReference.renderImg(icon, imgElement);
            titleIconDiv.appendChild(imgElement);
        }
    
        var title = this.component.render("title");
        if (title) {
            var titleTextDiv = document.createElement("div");
            if (icon) {
                titleTextDiv.style[WebCore.Environment.CSS_FLOAT] = "left";
            }
            titleTextDiv.style.whiteSpace = "nowrap";
            EchoAppRender.Font.render(this.component.render("titleFont"), titleTextDiv);
            EchoAppRender.Insets.render(this.component.render("titleInsets", 
                    EchoAppRender.WindowPaneSync.DEFAULT_TITLE_INSETS), titleTextDiv, "padding");
            titleTextDiv.appendChild(document.createTextNode(title));
            this._titleBarDiv.appendChild(titleTextDiv);
        }
        
        var titleBarHeight = this.component.render("titleHeight");
        if (titleBarHeight) {
            this._titleBarHeight = EchoAppRender.Extent.toPixels(titleBarHeight);
        } else {
            var titleMeasure = new WebCore.Measure.Bounds(this._titleBarDiv);
            if (titleMeasure.height) {
                this._titleBarHeight = titleMeasure.height;
            } else {
                this._titleBarHeight = EchoAppRender.Extent.toPixels(EchoApp.WindowPane.DEFAULT_TITLE_HEIGHT);
            }
        }
    
        this._titleBarDiv.style.top = this._contentInsets.top + "px";
        this._titleBarDiv.style.left = this._contentInsets.left + "px";
        this._titleBarDiv.style.height = this._titleBarHeight + "px";
        this._titleBarDiv.style.overflow = "hidden";
        if (movable) {
            this._titleBarDiv.style.cursor = "move";
        }
    
        EchoAppRender.Color.render(this.component.render("titleForeground"), this._titleBarDiv, "color");
    
        var titleBackground = this.component.render("titleBackground");
        var titleBackgroundImage = this.component.render("titleBackgroundImage");
    
        if (titleBackground) {
            this._titleBarDiv.style.backgroundColor = titleBackground;
        }
        if (titleBackgroundImage) {
            EchoAppRender.FillImage.render(titleBackgroundImage, this._titleBarDiv);
        }
    
        if (!titleBackground && !titleBackgroundImage) {
            this._titleBarDiv.style.backgroundColor = EchoAppRender.WindowPaneSync.DEFAULT_TITLE_BACKGROUND;
        }
        
        if (hasControlIcons) {
            this._controlDiv = document.createElement("div");
            this._controlDiv.style.cssText = "position:absolute;top:0;right:0;";
            EchoAppRender.Insets.render(this.component.render("closeIconInsets", 
                    EchoApp.WindowPane.DEFAULT_CONTROLS_INSETS), this._controlDiv, "padding");
            this._titleBarDiv.appendChild(this._controlDiv);

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
        
        this._div.appendChild(this._titleBarDiv);
        
        // Render Content Area
        
        this._contentDiv = document.createElement("div");
        
        this._contentDiv.style.position = "absolute";
        this._contentDiv.style.zIndex = 2;
        this._contentDiv.style.overflow = "auto";
        
        EchoAppRender.Color.render(this.component.render("background", EchoApp.WindowPane.DEFAULT_BACKGROUND),
                this._contentDiv, "backgroundColor");
        EchoAppRender.Color.render(this.component.render("foreground", EchoApp.WindowPane.DEFAULT_FOREGROUND),
                this._contentDiv, "color");
    
        this._contentDiv.style.top = (this._contentInsets.top + this._titleBarHeight) + "px";
        this._contentDiv.style.left = this._contentInsets.left + "px";
        this._contentDiv.style.right = this._contentInsets.right + "px";
        this._contentDiv.style.bottom = this._contentInsets.bottom + "px";
        
        this._div.appendChild(this._contentDiv);
    
        var componentCount = this.component.getComponentCount();
        if (componentCount == 1) {
            this.renderAddChild(update, this.component.getComponent(0), this._contentDiv);
        } else if (componentCount > 1) {
            throw new Error("Too many children: " + componentCount);
        }
    
        // Render Internet Explorer 6-specific windowed control-blocking IFRAME.
        if (WebCore.Environment.QUIRK_IE_SELECT_Z_INDEX) {
            // Render Select Field Masking Transparent IFRAME.
            this._maskDiv = document.createElement("div");
            this._maskDiv.style.cssText 
                    = "filter:alpha(opacity=0);z-index:1;position:absolute;left:0,right:0,top:0,bottom:0,borderWidth: 0;";
            var maskIFrameElement = document.createElement("iframe");
            maskIFrameElement.style.cssText = "width:100%;height:100%;";
            
            var blankUrl = this.client.getResourceUrl("Echo", "resource/Blank.html");
            if (blankUrl) {
                maskIFrameElement.src = blankUrl;
            }
            
            this._maskDiv.appendChild(maskIFrameElement);
            this._div.appendChild(this._maskDiv);
        }
    
        parentElement.appendChild(this._div);
        
        // Register event listeners.
        
        WebCore.EventProcessor.add(this._div, "click", 
                Core.method(this, this._processFocusClick), true);
        
        if (closable) {
            WebCore.EventProcessor.add(this._div, "keydown", Core.method(this, this._processKeyDown), false);
            WebCore.EventProcessor.add(this._div, "keypress", Core.method(this, this._processKeyPress), false);
        }
        if (movable) {
            WebCore.EventProcessor.add(this._titleBarDiv, "mousedown", Core.method(this, this._processTitleBarMouseDown), true);
        }
        if (resizable) {
            for (var i = 0; i < this._borderDivs.length; ++i) {
                WebCore.EventProcessor.add(this._borderDivs[i], "mousedown", Core.method(this, this._processBorderMouseDown), true);
            }
        }
    },
    
    renderAddChild: function(update, child, parentElement) {
        if (child.pane) {
            this._contentDiv.style.padding = "0";
        } else {
            EchoAppRender.Insets.render(this.component.render("insets"), this._contentDiv, "padding");
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
        
        this._controlDiv.appendChild(controlIcon);
        if (this._controlIcons == null) {
            this._controlIcons = [];
        }
        this._controlIcons.push(controlIcon);
    },
    
    renderDispose: function(update) { 
        for (var i = 0; i < this._borderDivs.length; ++i) {
            WebCore.EventProcessor.removeAll(this._borderDivs[i]);
        }
        this._borderDivs = null;
        
        if (this._controlIcons != null) {
            for (var i = 0; i < this._controlIcons.length; ++i) {
                WebCore.EventProcessor.removeAll(this._controlIcons[i]);
            }
            this._controlIcons = null;
        }
        
        WebCore.EventProcessor.removeAll(this._titleBarDiv);
        this._titleBarDiv = null;
        
        if (this._closeDiv) {
            WebCore.EventProcessor.removeAll(this._closeDiv);
            this._closeDiv = null;
        }
        
        this._contentDiv = null;
    
        WebCore.EventProcessor.removeAll(this._div);
        this._div = null;
        this._maskDiv = null;
    },
    
    renderDisplay: function() {
        this._loadContainerSize();
        this.setPosition(this._userX, this._userY, this._userWidth, this._userHeight);
        WebCore.VirtualPosition.redraw(this._contentDiv);
        WebCore.VirtualPosition.redraw(this._maskDiv);
    },
    
    renderFocus: function() {
        WebCore.DOM.focusElement(this._div);
    },

    renderUpdate: function(update) {
        if (update.hasAddedChildren() || update.hasRemovedChildren()) {
            // Children added/removed: full render.
        } else if (update.isUpdatedPropertySetIn({ positionX: true, positionY: true, width: true, height: true })) {
            // Only x/y/width/height properties changed: reset window position/size.
            this._loadPositionAndSize();
            return;
        }

        var element = this._div;
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
            this._renderWidth = c.width;
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
            this._renderHeight = c.height;
        }
    
        if (c.x != null) {
            if (this._containerSize.width > 0 && c.x > this._containerSize.width - this._renderWidth) {
                c.x = this._containerSize.width - this._renderWidth;
            }
            if (c.x < 0) {
                c.x = 0;
            }
            this._renderX = c.x;
        }
    
        if (c.y != null) {
            if (this._containerSize.height > 0 && c.y > this._containerSize.height - this._renderHeight) {
                c.y = this._containerSize.height - this._renderHeight;
            }
            if (c.y < 0) {
                c.y = 0;
            }
            this._renderY = c.y;
        }
        
        this.redraw();
    }
});
