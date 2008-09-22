/**
 * Component rendering peer: WindowPane
 */
Echo.Sync.WindowPane = Core.extend(Echo.Render.ComponentSync, {

    $static: {
        DEFAULT_TITLE_BACKGROUND: "#abcdef",
        DEFAULT_TITLE_INSETS: "5px 10px",
        ADJUSTMENT_OPACITY: 0.75,
        CURSORS: ["nw-resize", "n-resize", "ne-resize", "w-resize", "e-resize", "sw-resize", "s-resize", "se-resize"],
        FIB_POSITIONS: ["topLeft", "top", "topRight", "left", "right", "bottomLeft", "bottom", "bottomRight"],
        PARTIAL_PROPERTIES: {background: true, backgroundImage: true, border: true, closable: true, closeIcon: true, 
                closeIconInsets: true, font: true, foreground: true, height: true, icon: true, iconInsets: true, insets: true, 
                maximizeEnabled: true, maximizeIcon: true, maximumHeight: true, maximumWidth: true, minimizeEnabled: true, 
                minimizeIcon: true, minimumHeight: true, minimumWidth: true, movable: true, positionX: true, positionY: true, 
                resizable: true, title: true, titleBackground: true, titleBackgroundImage: true, titleFont: true, 
                titleForeground: true, titleHeight: true, titleInsets: true, width: true },  
        PARTIAL_PROPERTIES_POSITION_SIZE: { positionX: true, positionY: true, width: true, height: true },
        adjustOpacity: false
    },
    
    $load: function() {
        Echo.Render.registerPeer("WindowPane", this);
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
     * @type Core.Web.Measure.Bounds
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
            pxBounds.width = Echo.Sync.Extent.isPercent(bounds.width)
                    ? parseInt((parseInt(bounds.width) / 100) * this._containerSize.width)
                    : Math.round(Echo.Sync.Extent.toPixels(bounds.width, true));
        }
        if (bounds.height != null) {
            pxBounds.height = Echo.Sync.Extent.isPercent(bounds.height)
                    ? parseInt((parseInt(bounds.height) / 100) * this._containerSize.height)
                    : Math.round(Echo.Sync.Extent.toPixels(bounds.height, false));
        }
        if (bounds.x != null) {
            pxBounds.x = Echo.Sync.Extent.isPercent(bounds.x)
                    ? parseInt((this._containerSize.width - pxBounds.width) * (parseInt(bounds.x) / 100))
                    : Math.round(Echo.Sync.Extent.toPixels(bounds.x, true));
        }
        if (bounds.y != null) {
            pxBounds.y = Echo.Sync.Extent.isPercent(bounds.y)
                    ? parseInt((this._containerSize.height - pxBounds.height) * (parseInt(bounds.y) / 100))
                    : Math.round(Echo.Sync.Extent.toPixels(bounds.y, false));
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
            width: this.component.render("width", Echo.WindowPane.DEFAULT_WIDTH),
            height: this.component.render("height", Echo.WindowPane.DEFAULT_HEIGHT)
        };
    },

    _loadContainerSize: function() {
        //FIXME. the "parentnode.parentnode" business needs to go.
        this._containerSize = new Core.Web.Measure.Bounds(this._div.parentNode.parentNode);
    },
    
    _processBorderMouseDown: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return true;
        }

        // Prevent selections.
        Core.Web.dragInProgress = true;
        Core.Web.DOM.preventEventDefault(e);
    
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
            
        Core.Web.Event.add(document.body, "mousemove", this._processBorderMouseMoveRef, true);
        Core.Web.Event.add(document.body, "mouseup", this._processBorderMouseUpRef, true);
    
        // Reduce opacity.   
        if (Echo.Sync.WindowPane.adjustOpacity) {
            this._div.style.opacity = Echo.Sync.WindowPane.ADJUSTMENT_OPACITY;
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
        Core.Web.DOM.preventEventDefault(e);
        
        Core.Web.dragInProgress = false;
    
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
        
        Core.Web.VirtualPosition.redraw(this._contentDiv);
        Core.Web.VirtualPosition.redraw(this._maskDiv);
        Echo.Render.notifyResize(this.component);
    },
    
    _processKeyDown: function(e) {
        switch (e.keyCode) {
        case 27:
            this.component.userClose();
            Core.Web.DOM.preventEventDefault(e);
            return false;
        }
        return true;
    },

    _processKeyPress: function(e) {
        switch (e.keyCode) {
        case 27:
            Core.Web.DOM.preventEventDefault(e);
            return false;
        }
        return true;
    },
    
    _processCloseClick: function(e) { 
        if (!this.client.verifyInput(this.component)) {
            return true;
        }
        this.component.userClose();
    },
    
    _processFocusClick: function(e) { 
        if (!this.client.verifyInput(this.component)) {
            return true;
        }
        this.component.parent.peer.raise(this.component);
        return true;
    },
    
    _processMaximizeClick: function(e) { 
        if (!this.client.verifyInput(this.component)) {
            return true;
        }
        this.component.userMaximize();
        Echo.Render.processUpdates(this.client);
    },
    
    _processMinimizeClick: function(e) { 
        if (!this.client.verifyInput(this.component)) {
            return true;
        }
        this.component.userMinimize();
    },
    
    _processTitleBarMouseDown: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return true;
        }
    
        // Raise window.
        this.component.parent.peer.raise(this.component);
        
        // Prevent selections.
        Core.Web.dragInProgress = true;
        Core.Web.DOM.preventEventDefault(e);
    
        this._loadContainerSize();
        this._dragInit = { x: this._rendered.x, y: this._rendered.y };
        this._dragOrigin = { x: e.clientX, y: e.clientY };
    
        // Reduce opacity.   
        if (Echo.Sync.WindowPane.adjustOpacity) {
            this._div.style.opacity = Echo.Sync.WindowPane.ADJUSTMENT_OPACITY;
        }
        
        Core.Web.Event.add(document.body, "mousemove", this._processTitleBarMouseMoveRef, true);
        Core.Web.Event.add(document.body, "mouseup", this._processTitleBarMouseUpRef, true);
    },
    
    _processTitleBarMouseMove: function(e) {
        this.setBounds({
            x: this._dragInit.x + e.clientX - this._dragOrigin.x, 
            y: this._dragInit.y + e.clientY - this._dragOrigin.y
        });
    },
    
    _processTitleBarMouseUp: function(e) {
        Core.Web.dragInProgress = false;
    
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
        
        Core.Web.VirtualPosition.redraw(this._contentDiv);
        Core.Web.VirtualPosition.redraw(this._maskDiv);
    },
    
    _removeBorderListeners: function() {
        Core.Web.Event.remove(document.body, "mousemove", this._processBorderMouseMoveRef, true);
        Core.Web.Event.remove(document.body, "mouseup", this._processBorderMouseUpRef, true);
    },
    
    _removeTitleBarListeners: function() {
        Core.Web.Event.remove(document.body, "mousemove", this._processTitleBarMouseMoveRef, true);
        Core.Web.Event.remove(document.body, "mouseup", this._processTitleBarMouseUpRef, true);
    },
    
    renderAdd: function(update, parentElement) {
        // Create main component DIV.
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.tabIndex = "0";

        // Create content DIV.
        // Content DIV will be appended to main DIV by _renderAddFrame().
        this._contentDiv = document.createElement("div");

        // Render child component, add to content DIV.
        var componentCount = this.component.getComponentCount();
        if (componentCount == 1) {
            this.renderAddChild(update, this.component.getComponent(0), this._contentDiv);
        } else if (componentCount > 1) {
            throw new Error("Too many children: " + componentCount);
        }
    
        // Render Internet Explorer 6-specific windowed control-blocking IFRAME ("mask DIV").
        // Mask DIV will be added to main DIV by _renderAddFrame().
        if (Core.Web.Env.QUIRK_IE_SELECT_Z_INDEX) {
            // Render Select Field Masking Transparent IFRAME.
            this._maskDiv = document.createElement("div");
            this._maskDiv.style.cssText 
                    = "filter:alpha(opacity=0);z-index:1;position:absolute;left:0,right:0,top:0,bottom:0,borderWidth:0;";
            var maskIFrameElement = document.createElement("iframe");
            maskIFrameElement.style.cssText = "width:100%;height:100%;";
            maskIFrameElement.src = this.client.getResourceUrl("Echo", "resource/Blank.html");
            this._maskDiv.appendChild(maskIFrameElement);
        }
    
        // Render window frame.
        this._renderAddFrame();
    
        // Append main DIV to parent.
        parentElement.appendChild(this._div);
    },
    
    renderAddChild: function(update, child, parentElement) {
        if (child.pane) {
            this._contentDiv.style.padding = "0";
        } else {
            Echo.Sync.Insets.render(this.component.render("insets"), this._contentDiv, "padding");
        }
        Echo.Render.renderComponentAdd(update, child, parentElement);
    },
    
    _renderAddFrame: function() {
        this._loadPositionAndSize();

        // Load property states.
        this._minimumWidth = Echo.Sync.Extent.toPixels(
                this.component.render("minimumWidth", Echo.WindowPane.DEFAULT_MINIMUM_WIDTH), true);
        this._minimumHeight = Echo.Sync.Extent.toPixels(
                this.component.render("minimumHeight", Echo.WindowPane.DEFAULT_MINIMUM_HEIGHT), false);
        this._maximumWidth = Echo.Sync.Extent.toPixels(this.component.render("maximumWidth"), true);
        this._maximumHeight = Echo.Sync.Extent.toPixels(this.component.render("maximumHeight"), false);
        var border = this.component.render("border", Echo.WindowPane.DEFAULT_BORDER);
        this._borderInsets = Echo.Sync.Insets.toPixels(border.borderInsets);
        this._contentInsets = Echo.Sync.Insets.toPixels(border.contentInsets);
        var movable = this.component.render("movable", true);
        var resizable = this.component.render("resizable", true);
        var closable = this.component.render("closable", true);
        var maximizeEnabled = this.component.render("maximizeEnabled", false);
        var minimizeEnabled = this.component.render("minimizeEnabled", false);
        var hasControlIcons = closable || maximizeEnabled || minimizeEnabled;
        var fillImageFlags = this.component.render("ieAlphaRenderBorder") 
                ? Echo.Sync.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
        
        this._div.style.cssText = "outline-style:none;position:absolute;z-index:1;overflow:hidden;";
        Echo.Sync.Font.render(this.component.render("font"), this._div);
        
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
                    this._borderDivs[i].style.cursor = Echo.Sync.WindowPane.CURSORS[i];
                    Core.Web.Event.add(this._borderDivs[i], "mousedown", 
                            Core.method(this, this._processBorderMouseDown), true);
                }
                var borderImage = border[Echo.Sync.WindowPane.FIB_POSITIONS[i]];
                if (borderImage) {
                    Echo.Sync.FillImage.render(borderImage, this._borderDivs[i], fillImageFlags);
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
            titleIconDiv.style[Core.Web.Env.CSS_FLOAT] = "left";
            Echo.Sync.Insets.render(this.component.render("iconInsets"), titleIconDiv, "padding");
            this._titleBarDiv.appendChild(titleIconDiv);
            
            var img = document.createElement("img");
            Echo.Sync.ImageReference.renderImg(icon, img);
            titleIconDiv.appendChild(img);
        }
    
        var title = this.component.render("title");
        if (title) {
            var titleTextDiv = document.createElement("div");
            if (icon) {
                titleTextDiv.style[Core.Web.Env.CSS_FLOAT] = "left";
            }
            titleTextDiv.style.whiteSpace = "nowrap";
            Echo.Sync.Font.render(this.component.render("titleFont"), titleTextDiv);
            Echo.Sync.Insets.render(this.component.render("titleInsets", 
                    Echo.Sync.WindowPane.DEFAULT_TITLE_INSETS), titleTextDiv, "padding");
            titleTextDiv.appendChild(document.createTextNode(title));
            this._titleBarDiv.appendChild(titleTextDiv);
        }
        
        var titleBarHeight = this.component.render("titleHeight");
        if (titleBarHeight) {
            this._titleBarHeight = Echo.Sync.Extent.toPixels(titleBarHeight);
        } else {
            var titleMeasure = new Core.Web.Measure.Bounds(this._titleBarDiv);
            if (titleMeasure.height) {
                this._titleBarHeight = titleMeasure.height;
            } else {
                this._titleBarHeight = Echo.Sync.Extent.toPixels(Echo.WindowPane.DEFAULT_TITLE_HEIGHT);
            }
        }
    
        this._titleBarDiv.style.top = this._contentInsets.top + "px";
        this._titleBarDiv.style.left = this._contentInsets.left + "px";
        this._titleBarDiv.style.height = this._titleBarHeight + "px";
        this._titleBarDiv.style.overflow = "hidden";
        if (movable) {
            this._titleBarDiv.style.cursor = "move";
            Core.Web.Event.add(this._titleBarDiv, "mousedown", Core.method(this, this._processTitleBarMouseDown), true);
        }
    
        Echo.Sync.Color.render(this.component.render("titleForeground"), this._titleBarDiv, "color");
    
        var titleBackground = this.component.render("titleBackground");
        var titleBackgroundImage = this.component.render("titleBackgroundImage");
    
        if (titleBackground) {
            this._titleBarDiv.style.backgroundColor = titleBackground;
        }
        if (titleBackgroundImage) {
            Echo.Sync.FillImage.render(titleBackgroundImage, this._titleBarDiv);
        }
    
        if (!titleBackground && !titleBackgroundImage) {
            this._titleBarDiv.style.backgroundColor = Echo.Sync.WindowPane.DEFAULT_TITLE_BACKGROUND;
        }
        
        if (hasControlIcons) {
            this._controlDiv = document.createElement("div");
            this._controlDiv.style.cssText = "position:absolute;top:0;right:0;";
            Echo.Sync.Insets.render(this.component.render("controlsInsets",  
                    Echo.WindowPane.DEFAULT_CONTROLS_INSETS), this._controlDiv, "padding");
            this._titleBarDiv.appendChild(this._controlDiv);

            // Close Button
            if (closable) {
                this._renderControlIcon(this.component.render("closeIcon", 
                        this.client.getResourceUrl("Echo", "resource/WindowPaneClose.gif")),
                        null, null, "[X]", this.component.render("closeIconInsets"),
                        Core.method(this, this._processCloseClick));
                Core.Web.Event.add(this._div, "keydown", Core.method(this, this._processKeyDown), false);
                Core.Web.Event.add(this._div, "keypress", Core.method(this, this._processKeyPress), false);
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
        
        // Add content to main DIV.  
        // The object this._contentDiv will have been created by renderAdd(). 
        // Note that overflow is set to 'hidden' if child is a pane component, this is necessary to workaround what
        // what is presumably a bug in Safari 3.0.x.  It should otherwise not be required.
        this._contentDiv.style.cssText = "position:absolute;z-index:2;top:" 
                + (this._contentInsets.top + this._titleBarHeight) + "px;bottom:" + this._contentInsets.bottom + "px;left:" 
                + this._contentInsets.left + "px;right:" + this._contentInsets.right + "px;"
                + "overflow:"+ ((this.component.children.length == 0 || this.component.children[0].pane) ? "hidden;" : "auto;");
        Echo.Sync.Color.render(this.component.render("background", Echo.WindowPane.DEFAULT_BACKGROUND),
                this._contentDiv, "backgroundColor");
        Echo.Sync.Color.render(this.component.render("foreground", Echo.WindowPane.DEFAULT_FOREGROUND),
                this._contentDiv, "color");
        this._div.appendChild(this._contentDiv);

        // Add Internet Explorer 6-specific windowed control-blocking IFRAME.
        if (Core.Web.Env.QUIRK_IE_SELECT_Z_INDEX) {
            this._div.appendChild(this._maskDiv);
        }
        Core.Web.Event.add(this._div, "click", 
                Core.method(this, this._processFocusClick), true);
    },

    _renderControlIcon: function(icon, rolloverIcon, pressedIcon, altText, insets, eventMethod) {
        var controlIcon = document.createElement("div");
        controlIcon.style.cssText = "float:right;cursor:pointer;margin-left:5px;";
        Echo.Sync.Insets.render(insets, controlIcon, "padding");
        if (icon) {
            var img = document.createElement("img");
            Echo.Sync.ImageReference.renderImg(icon, img);
            controlIcon.appendChild(img);
        } else {
            controlIcon.appendChild(document.createTextNode(altText));
        }
        
        if (eventMethod) {
            Core.Web.Event.add(controlIcon, "click", eventMethod, false);
        }
        
        this._controlDiv.appendChild(controlIcon);
        if (this._controlIcons == null) {
            this._controlIcons = [];
        }
        this._controlIcons.push(controlIcon);
    },
    
    renderDispose: function(update) {
        this._renderDisposeFrame();
        this._div = null;
        this._maskDiv = null;
        this._contentDiv = null;
    },
    
    _renderDisposeFrame: function() {
        Core.Web.Event.removeAll(this._div);

        for (var i = 0; i < this._borderDivs.length; ++i) {
            Core.Web.Event.removeAll(this._borderDivs[i]);
        }
        this._borderDivs = null;
        
        if (this._controlIcons != null) {
            for (var i = 0; i < this._controlIcons.length; ++i) {
                Core.Web.Event.removeAll(this._controlIcons[i]);
            }
            this._controlIcons = null;
        }
        
        Core.Web.Event.removeAll(this._titleBarDiv);
        this._titleBarDiv = null;
        
    },
    
    renderDisplay: function() {
        this._loadContainerSize();
        this.setBounds(this._requested);
        Core.Web.VirtualPosition.redraw(this._contentDiv);
        Core.Web.VirtualPosition.redraw(this._maskDiv);
    },
    
    renderFocus: function() {
        Core.Web.DOM.focusElement(this._div);
    },
    
    renderUpdate: function(update) {
        if (update.hasAddedChildren() || update.hasRemovedChildren()) {
            // Children added/removed: perform full render.
        } else if (update.isUpdatedPropertySetIn(Echo.Sync.WindowPane.PARTIAL_PROPERTIES_POSITION_SIZE)) {
            this._loadPositionAndSize();
            return;
        } else if (update.isUpdatedPropertySetIn(Echo.Sync.WindowPane.PARTIAL_PROPERTIES)) {
            this._renderUpdateFrame();
            return;
        }

        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    _renderUpdateFrame: function() {
        this._renderDisposeFrame();
    
        // Remove all child components from main DIV (necessary in cases where frame is being redrawn
        // on previously rendered WindowPane in response to property update). 
        while (this._div.childNodes.length > 0) {
            this._div.removeChild(this._div.lastChild);
        }

        this._renderAddFrame();
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
