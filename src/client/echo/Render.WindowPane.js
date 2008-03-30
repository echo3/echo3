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
     * The user-requested bounds of the window.  Contains properties x, y, width, and height.  
     * Property values are extents.  Percentage values are valid.
     */
    _requested: null,
    
    /**
     * Rendered bounds of the window.  Contains properties x, y, width, and height.
     * Property values are integers.  Will differ from user-requested bounds in scenarios where space is not available
     * or user-requested values are otherwise out of range.
     */
    _rendered: null,
    
    /**
     * The rendered bounds of the window immediately prior to the active drag operation.
     */
    _dragInit: null,
    
    /**
     * The X/Y coordinates of the mouse when the active drag operation originated.
     */
    _dragOrigin: null,
    
    /**
     * X/Y directions in which to increment (decrement) size of window when moving mouse.
     * Used in resize operations.
     */ 
    _resizeIncrement: null,
    
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
    _coordinatesToPixels: function(bounds) {
        var pxBounds = {};
        if (bounds.width != null) {
            pxBounds.width = EchoAppRender.Extent.isPercent(bounds.width)
                    ? parseInt((parseInt(bounds.width) / 100) * this._containerSize.width)
                    : EchoAppRender.Extent.toPixels(bounds.width, true);
        }
        if (bounds.height != null) {
            pxBounds.height = EchoAppRender.Extent.isPercent(bounds.height)
                    ? parseInt((parseInt(bounds.height) / 100) * this._containerSize.height)
                    : EchoAppRender.Extent.toPixels(bounds.height, false);
        }
        if (bounds.x != null) {
            pxBounds.x = EchoAppRender.Extent.isPercent(bounds.x)
                    ? parseInt((this._containerSize.width - pxBounds.width) * (parseInt(bounds.x) / 100))
                    : EchoAppRender.Extent.toPixels(bounds.x, true);
        }
        if (bounds.y != null) {
            pxBounds.y = EchoAppRender.Extent.isPercent(bounds.y)
                    ? parseInt((this._containerSize.height - pxBounds.height) * (parseInt(bounds.y) / 100))
                    : EchoAppRender.Extent.toPixels(bounds.y, false);
        }
        return pxBounds;
    },
    
    /**
     * Updates the _requested object based on values from the component object.
     */
    _loadPositionAndSize: function() {
        this._requested = {
            x: this.component.render("positionX", "50%"),
            y: this.component.render("positionY", "50%"),
            width: this.component.render("width", EchoApp.WindowPane.DEFAULT_WIDTH),
            height: this.component.render("height", EchoApp.WindowPane.DEFAULT_HEIGHT)
        };
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
        this._dragInit = {
            x: this._rendered.x,
            y: this._rendered.y,
            width: this._rendered.width,
            height: this._rendered.height
        };
        
        this._dragOrigin = { x: e.clientX, y: e.clientY };
        
        switch (e.target) {
        case this._borderDivs[0]: this._resizeIncrement = { x: -1, y: -1 }; break;
        case this._borderDivs[1]: this._resizeIncrement = { x:  0, y: -1 }; break; 
        case this._borderDivs[2]: this._resizeIncrement = { x:  1, y: -1 }; break; 
        case this._borderDivs[3]: this._resizeIncrement = { x: -1, y:  0 }; break; 
        case this._borderDivs[4]: this._resizeIncrement = { x:  1, y:  0 }; break; 
        case this._borderDivs[5]: this._resizeIncrement = { x: -1, y:  1 }; break; 
        case this._borderDivs[6]: this._resizeIncrement = { x:  0, y:  1 }; break; 
        case this._borderDivs[7]: this._resizeIncrement = { x:  1, y:  1 }; break; 
        }
            
        WebCore.EventProcessor.add(document.body, "mousemove", this._processBorderMouseMoveRef, true);
        WebCore.EventProcessor.add(document.body, "mouseup", this._processBorderMouseUpRef, true);
    
        // Reduce opacity.   
        if (EchoAppRender.WindowPaneSync.adjustOpacity) {
            this._div.style.opacity = EchoAppRender.WindowPaneSync.ADJUSTMENT_OPACITY;
        }
    },
    
    _processBorderMouseMove: function(e) {
        this.setBounds({
            x: this._resizeIncrement.x == -1 ? this._dragInit.x + e.clientX - this._dragOrigin.x : null,
            y: this._resizeIncrement.y == -1 ? this._dragInit.y + e.clientY - this._dragOrigin.y : null,
            width: this._dragInit.width + ((this._resizeIncrement.x) * (e.clientX - this._dragOrigin.x)),
            height: this._dragInit.height + ((this._resizeIncrement.y) * (e.clientY - this._dragOrigin.y))
        });
    },

    _processBorderMouseUp: function(e) {
        WebCore.DOM.preventEventDefault(e);
        
        WebCore.dragInProgress = false;
    
        // Set opaque.
        this._div.style.opacity = 1;
    
        this._removeBorderListeners();
        
        this.component.set("positionX", this._rendered.x);
        this.component.set("positionY", this._rendered.y);
        this.component.set("width", this._rendered.width);
        this.component.set("height", this._rendered.height);
        
        this._requested = {
            x: this._rendered.x,
            y: this._rendered.y,
            width: this._rendered.width,
            height: this._rendered.height
        };
        
        WebCore.VirtualPosition.redraw(this._contentDiv);
        WebCore.VirtualPosition.redraw(this._maskDiv);
        EchoRender.notifyResize(this.component);
    },
    
    _processKeyDown: function(e) {
        switch (e.keyCode) {
        case 27:
            this.component.userClose();
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
        this.component.userClose();
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
        this.component.userMaximize();
        EchoRender.processUpdates(this.client);
    },
    
    _processMinimizeClick: function(e) { 
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        this.component.userMinimize();
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
        this._dragInit = { x: this._rendered.x, y: this._rendered.y };
        this._dragOrigin = { x: e.clientX, y: e.clientY };
    
        // Reduce opacity.   
        if (EchoAppRender.WindowPaneSync.adjustOpacity) {
            this._div.style.opacity = EchoAppRender.WindowPaneSync.ADJUSTMENT_OPACITY;
        }
        
        WebCore.EventProcessor.add(document.body, "mousemove", this._processTitleBarMouseMoveRef, true);
        WebCore.EventProcessor.add(document.body, "mouseup", this._processTitleBarMouseUpRef, true);
    },
    
    _processTitleBarMouseMove: function(e) {
        this.setBounds({
            x: this._dragInit.x + e.clientX - this._dragOrigin.x, 
            y: this._dragInit.y + e.clientY - this._dragOrigin.y
        });
    },
    
    _processTitleBarMouseUp: function(e) {
        WebCore.dragInProgress = false;
    
        // Set opaque.
        this._div.style.opacity = 1;
    
        this._removeTitleBarListeners();
    
        this.component.set("positionX", this._rendered.x);
        this.component.set("positionY", this._rendered.y);
    
        this._requested.x = this._rendered.x;
        this._requested.y = this._rendered.y;
    },
    
    redraw: function() {
        if (this._rendered.width <= 0 || this._rendered.height <= 0) {
            // Do not render if window does not have set dimensions.
            return;
        }

        var borderSideWidth = this._rendered.width - this._borderInsets.left - this._borderInsets.right;
        var borderSideHeight = this._rendered.height - this._borderInsets.top - this._borderInsets.bottom;
    
        this._div.style.left = this._rendered.x + "px";
        this._div.style.top = this._rendered.y + "px";
        this._div.style.width = this._rendered.width + "px";
        this._div.style.height = this._rendered.height + "px";
    
        this._titleBarDiv.style.width = (this._rendered.width - this._contentInsets.left - this._contentInsets.right) + "px";
        
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
                    WebCore.EventProcessor.add(this._borderDivs[i], "mousedown", 
                            Core.method(this, this._processBorderMouseDown), true);
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
            
            var img = document.createElement("img");
            EchoAppRender.ImageReference.renderImg(icon, img);
            titleIconDiv.appendChild(img);
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
            WebCore.EventProcessor.add(this._titleBarDiv, "mousedown", Core.method(this, this._processTitleBarMouseDown), true);
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
                WebCore.EventProcessor.add(this._div, "keydown", Core.method(this, this._processKeyDown), false);
                WebCore.EventProcessor.add(this._div, "keypress", Core.method(this, this._processKeyPress), false);
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
        this._contentDiv.style.cssText = "position:absolute;z-index:2;overflow:auto;top:" 
                + (this._contentInsets.top + this._titleBarHeight) + "px;bottom:" + this._contentInsets.bottom + "px;left:" 
                + this._contentInsets.left + "px;right:" + this._contentInsets.right + "px;";
        EchoAppRender.Color.render(this.component.render("background", EchoApp.WindowPane.DEFAULT_BACKGROUND),
                this._contentDiv, "backgroundColor");
        EchoAppRender.Color.render(this.component.render("foreground", EchoApp.WindowPane.DEFAULT_FOREGROUND),
                this._contentDiv, "color");
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
                    = "filter:alpha(opacity=0);z-index:1;position:absolute;left:0,right:0,top:0,bottom:0,borderWidth:0;";
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
            var img = document.createElement("img");
            EchoAppRender.ImageReference.renderImg(icon, img);
            controlIcon.appendChild(img);
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
        
        this._contentDiv = null;
    
        WebCore.EventProcessor.removeAll(this._div);
        this._div = null;
        this._maskDiv = null;
    },
    
    renderDisplay: function() {
        this._loadContainerSize();
        this.setBounds(this._requested);
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
    
    setBounds: function(bounds) {
        var c = this._coordinatesToPixels(bounds);
        if (this._rendered == null) {
            this._rendered = { };
        }

        if (c.width != null) {
            if (this._maximumWidth && c.width > this._maximumWidth) {
                if (c.x != null) {
                    c.x += (c.width - this._maximumWidth);
                }
                c.width = this._maximumWidth;
            }
            if (bounds.width < this._minimumWidth) {
                if (c.x != null) {
                    c.x += (c.width - this._minimumWidth);
                }
                c.width = this._minimumWidth;
            }
            this._rendered.width = c.width;
        }
        
        if (c.height != null) {
            if (this._maximumHeight && c.height > this._maximumHeight) {
                if (c.y != null) {
                    c.y += (c.height - this._maximumHeight);
                }
                c.height = this._maximumHeight;
            }
            if (bounds.height < this._minimumHeight) {
                if (c.y != null) {
                    c.y += (c.height - this._minimumHeight);
                }
                c.height = this._minimumHeight;
            }
            this._rendered.height = c.height;
        }
    
        if (c.x != null) {
            if (this._containerSize.width > 0 && c.x > this._containerSize.width - this._rendered.width) {
                c.x = this._containerSize.width - this._rendered.width;
            }
            if (c.x < 0) {
                c.x = 0;
            }
            this._rendered.x = c.x;
        }
    
        if (c.y != null) {
            if (this._containerSize.height > 0 && c.y > this._containerSize.height - this._rendered.height) {
                c.y = this._containerSize.height - this._rendered.height;
            }
            if (c.y < 0) {
                c.y = 0;
            }
            this._rendered.y = c.y;
        }
        
        this.redraw();
    }
});
