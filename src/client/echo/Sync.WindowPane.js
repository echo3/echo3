/**
 * Component rendering peer: WindowPane.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Echo.Sync.WindowPane = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        /** 
         * Array mapping CSS cursor types to indices of the _borderDivs property.
         * @type Array 
         */
        CURSORS: ["n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize"],
        
        /** Map containing properties whose update can be rendered without replacing component. */
        PARTIAL_PROPERTIES: {background: true, backgroundImage: true, border: true, closable: true, closeIcon: true, 
                closeIconInsets: true, controlsInsets: true, font: true, foreground: true, height: true, icon: true, 
                iconInsets: true, insets: true, maximizeEnabled: true, maximizeIcon: true, maximumHeight: true, 
                maximumWidth: true, minimizeEnabled: true, minimizeIcon: true, minimumHeight: true, 
                minimumWidth: true, movable: true, positionX: true, positionY: true, resizable: true, title: true, 
                titleBackground: true, titleBackgroundImage: true, titleFont: true, 
                titleForeground: true, titleHeight: true, titleInsets: true, width: true },
                
        /** Map containing properties whose update should not result in any rendering. */
        NON_RENDERED_PROPERTIES: { zIndex: true },
                
        /** 
         * Map containing position/size-related properties whose update can be rendered by moving/resizing the window.
         */
        PARTIAL_PROPERTIES_POSITION_SIZE: { positionX: true, positionY: true, width: true, height: true }
    },
    
    $load: function() {
        Echo.Render.registerPeer("WindowPane", this);
    },
    
    /**
     * Flag indicating whether initial automatic sizing operation (which occurs on first invocation of 
     * <code>renderDisplay()</code> after <code>renderAdd()</code>) has been completed.
     * @type Boolean
     */
    _initialAutoSizeComplete: false,

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

    /**
     * Method reference to <code>_processBorderMouseMove()</code>.
     * @type Function
     */
    _processBorderMouseMoveRef: null,

    /**
     * Method reference to <code>_processBorderMouseUp()</code>.
     * @type Function
     */
    _processBorderMouseUpRef: null,

    /**
     * Method reference to <code>_processTitleBarMouseMove()</code>.
     * @type Function
     */
    _processTitleBarMouseMoveRef: null,

    /**
     * Method reference to <code>_processTitleBarMouseUp()</code>.
     * @type Function
     */
    _processTitleBarMouseUpRef: null,

    /**
     * Array of control icon DOM elements.
     * @type Array
     */
    _controlIcons: null,
    
    /**
     * Overlay DIV which covers other elements (such as IFRAMEs) when dragging which may otherwise suppress events.
     * @type Element
     */
    _overlay: null,

    /**
     * Creates a <code>Echo.Sync.WindowPane<code>.
     */
    $construct: function() {
        this._processBorderMouseMoveRef = Core.method(this, this._processBorderMouseMove);
        this._processBorderMouseUpRef = Core.method(this, this._processBorderMouseUp);
        this._processTitleBarMouseMoveRef = Core.method(this, this._processTitleBarMouseMove);
        this._processTitleBarMouseUpRef = Core.method(this, this._processTitleBarMouseUp);
    },
    
    /**
     * Updates the _requested object based on values from the component object.
     */
    _loadPositionAndSize: function() {
        this._requested = {
            x: this.component.render("positionX", "50%"),
            y: this.component.render("positionY", "50%"),
            contentWidth: this.component.render("contentWidth"),
            contentHeight: this.component.render("contentHeight")
        };
        
        this._requested.width = this.component.render("width", 
                this._requested.contentWidth ? null : Echo.WindowPane.DEFAULT_WIDTH);
        this._requested.height = this.component.render("height");
    },

    /**
     * Determines size of container and stores in this._containerSize property.
     */
    _loadContainerSize: function() {
        this._containerSize = this.component.parent.peer.getSize();
    },
    
    /**
     * Adds an overlay DIV at maximum z-index to cover any objects that will not provide mouseup feedback (e.g., IFRAMEs).
     */
    _overlayAdd: function() {
        if (this._overlay) {
            return;
        }
        this._overlay = document.createElement("div");
        this._overlay.style.cssText = "position:absolute;z-index:32600;width:100%;height:100%;";
        Echo.Sync.FillImage.render(this.client.getResourceUrl("Echo", "resource/Transparent.gif"), this._overlay);
        document.body.appendChild(this._overlay);
    },
    
    /**
     * Removes the overlay DIV.
     */
    _overlayRemove: function() {
        if (!this._overlay) {
            return;
        }
        document.body.removeChild(this._overlay);
        this._overlay = null;
    },
    
    /**
     * Processes a mouse-down event on the window border (resize drag).
     */
    _processBorderMouseDown: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }

        // Prevent selections.
        Core.Web.dragInProgress = true;
        Core.Web.DOM.preventEventDefault(e);
        this._overlayAdd();
    
        this._loadContainerSize();
        this._dragInit = {
            x: this._rendered.x,
            y: this._rendered.y,
            width: this._rendered.width,
            height: this._rendered.height
        };
        
        this._dragOrigin = { x: e.clientX, y: e.clientY };
        
        switch (e.target) {
        case this._borderDivs[0]: this._resizeIncrement = { x:  0, y: -1 }; break; 
        case this._borderDivs[1]: this._resizeIncrement = { x:  1, y: -1 }; break; 
        case this._borderDivs[2]: this._resizeIncrement = { x:  1, y:  0 }; break; 
        case this._borderDivs[3]: this._resizeIncrement = { x:  1, y:  1 }; break; 
        case this._borderDivs[4]: this._resizeIncrement = { x:  0, y:  1 }; break; 
        case this._borderDivs[5]: this._resizeIncrement = { x: -1, y:  1 }; break; 
        case this._borderDivs[6]: this._resizeIncrement = { x: -1, y:  0 }; break; 
        case this._borderDivs[7]: this._resizeIncrement = { x: -1, y: -1 }; break;
        }
            
        Core.Web.Event.add(document.body, "mousemove", this._processBorderMouseMoveRef, true);
        Core.Web.Event.add(document.body, "mouseup", this._processBorderMouseUpRef, true);
    },
    
    /**
     * Processes a mouse-move event on the window border (resize drag).
     */
    _processBorderMouseMove: function(e) {
        this._setBounds({
            x: this._resizeIncrement.x == -1 ? this._dragInit.x + e.clientX - this._dragOrigin.x : null,
            y: this._resizeIncrement.y == -1 ? this._dragInit.y + e.clientY - this._dragOrigin.y : null,
            width: this._dragInit.width + (this._resizeIncrement.x * (e.clientX - this._dragOrigin.x)),
            height: this._dragInit.height + (this._resizeIncrement.y * (e.clientY - this._dragOrigin.y))
        }, true);
        Echo.Sync.FillImageBorder.renderContainerDisplay(this._div);
    },

    /**
     * Processes a mouse-up event on the window border (resize drag).
     */
    _processBorderMouseUp: function(e) {
        Core.Web.DOM.preventEventDefault(e);
        
        Core.Web.dragInProgress = false;
        this._overlayRemove();
    
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
        
        Echo.Sync.FillImageBorder.renderContainerDisplay(this._div);
        Core.Web.VirtualPosition.redraw(this._contentDiv);
        Core.Web.VirtualPosition.redraw(this._maskDiv);
        Echo.Render.notifyResize(this.component);
    },
    
    /**
     * Processes a click event on the window controls (i.e. close/maximize/minimize). 
     */
    _processControlClick: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        switch (e.registeredTarget._controlData.name) {
        case "close":
            this.component.userClose();
            break;
        case "maximize":
            this.component.userMaximize();
            Echo.Render.processUpdates(this.client);
            break;
        case "minimize":
            this.component.userMinimize();
            break;
        }
    },
    
    /**
     * Processes a mouse rollover enter event on a specific window control button. 
     */
    _processControlRolloverEnter: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        Echo.Sync.ImageReference.renderImg(e.registeredTarget._controlData.rolloverIcon, e.registeredTarget.firstChild);
    },
    
    /**
     * Processes a mouse rollover exit event on a specific window control button. 
     */
    _processControlRolloverExit: function(e) {
        Echo.Sync.ImageReference.renderImg(e.registeredTarget._controlData.icon, e.registeredTarget.firstChild);
    },
    
    /**
     * Processes a key down event in the window.
     */
    clientKeyDown: function(e) {
        if (e.keyCode == 27) {
            if (this.component.render("closable", true)) {
                this.component.userClose();
                Core.Web.DOM.preventEventDefault(e.domEvent);
                return false;
            }
        }
        return true;
    },
    
    /**
     * Processes a (captured) focus click within the window region.
     */
    _processFocusClick: function(e) { 
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        this.component.parent.peer.raise(this.component);
        return true;
    },
    
    /**
     * Processes a mouse down event on the window title bar (move drag).
     */
    _processTitleBarMouseDown: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        
        // Ignore mouse down clicks on control icons.
        var target = e.target;
        while (target != e.registeredTarget) {
            if (target._controlData) {
                return;
            }
            target = target.parentNode;
        }
    
        // Raise window.
        this.component.parent.peer.raise(this.component);
        
        // Prevent selections.
        Core.Web.dragInProgress = true;
        Core.Web.DOM.preventEventDefault(e);
        this._overlayAdd();
    
        this._loadContainerSize();
        this._dragInit = { x: this._rendered.x, y: this._rendered.y };
        this._dragOrigin = { x: e.clientX, y: e.clientY };
    
        Core.Web.Event.add(document.body, "mousemove", this._processTitleBarMouseMoveRef, true);
        Core.Web.Event.add(document.body, "mouseup", this._processTitleBarMouseUpRef, true);
    },
    
    /**
     * Processes a mouse move event on the window title bar (move drag).
     */
    _processTitleBarMouseMove: function(e) {
        this._setBounds({
            x: this._dragInit.x + e.clientX - this._dragOrigin.x, 
            y: this._dragInit.y + e.clientY - this._dragOrigin.y
        }, true);
    },
    
    /**
     * Processes a mouse up event on the window title bar (move drag).
     */
    _processTitleBarMouseUp: function(e) {
        Core.Web.dragInProgress = false;
        this._overlayRemove();
    
        this._removeTitleBarListeners();
    
        this.component.set("positionX", this._rendered.x);
        this.component.set("positionY", this._rendered.y);
    
        this._requested.x = this._rendered.x;
        this._requested.y = this._rendered.y;
    },
    
    /**
     * Repositions and resizes the window based on the current bounds specified in this._rendered.
     * Performs no operation if this._rendered does not have width/height data.
     */
    _redraw: function() {
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
        
        Echo.Sync.FillImageBorder.renderContainerDisplay(this._div);
        Core.Web.VirtualPosition.redraw(this._contentDiv);
        Core.Web.VirtualPosition.redraw(this._maskDiv);
    },
    
    /**
     * Removes mouseup/mousemove listeners from border.  Invoked after resize drag has completed/on dispose.
     */
    _removeBorderListeners: function() {
        Core.Web.Event.remove(document.body, "mousemove", this._processBorderMouseMoveRef, true);
        Core.Web.Event.remove(document.body, "mouseup", this._processBorderMouseUpRef, true);
    },
    
    /**
     * Removes mouseup/mousemove listeners from title bar.  Invoked after move drag has completed/on dispose.
     */
    _removeTitleBarListeners: function() {
        Core.Web.Event.remove(document.body, "mousemove", this._processTitleBarMouseMoveRef, true);
        Core.Web.Event.remove(document.body, "mouseup", this._processTitleBarMouseUpRef, true);
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._initialAutoSizeComplete = false;
        this._rtl = !this.component.getRenderLayoutDirection().isLeftToRight();
        
        // Create content DIV.
        // Content DIV will be appended to main DIV by _renderAddFrame().
        this._contentDiv = document.createElement("div");

        // Render child component, add to content DIV.
        var componentCount = this.component.getComponentCount();
        if (componentCount == 1) {
            Echo.Render.renderComponentAdd(update, this.component.getComponent(0), this._contentDiv);
        } else if (componentCount > 1) {
            throw new Error("Too many children: " + componentCount);
        }
    
        // Render Internet Explorer 6-specific windowed control-blocking IFRAME ("mask DIV").
        // Mask DIV will be added to main DIV by _renderAddFrame().
        if (Core.Web.Env.QUIRK_IE_SELECT_Z_INDEX) {
            // Render Select Field Masking Transparent IFRAME.
            this._maskDiv = document.createElement("div");
            this._maskDiv.style.cssText = 
                    "filter:alpha(opacity=0);z-index:1;position:absolute;left:0,right:0,top:0,bottom:0,borderWidth:0;";
            var maskIFrameElement = document.createElement("iframe");
            maskIFrameElement.style.cssText = "width:100%;height:100%;";
            maskIFrameElement.src = this.client.getResourceUrl("Echo", "resource/Blank.html");
            this._maskDiv.appendChild(maskIFrameElement);
        }
    
        Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this._div);
        
        // Render window frame.
        this._renderAddFrame(parentElement);
    },
    
    /**
     * Renders the frame of the window.  Does not alter window content.  This method may be invoked after the window has 
     * initially been rendered to update the window content.
     * _renderDisposeFrame() must be invoked between invocations of _renderAddFrame() to dispose resources.
     * _contentDiv will be appended to rendered DOM structure.
     * 
     * @param {Element} parentElement the parent element to which the rendered frame should be appended 
     */
    _renderAddFrame: function(parentElement) {
        this._loadPositionAndSize();

        // Create main component DIV.
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.tabIndex = "0";

        // Load property states.
        this._minimumWidth = Echo.Sync.Extent.toPixels(
                this.component.render("minimumWidth", Echo.WindowPane.DEFAULT_MINIMUM_WIDTH), true);
        this._minimumHeight = Echo.Sync.Extent.toPixels(
                this.component.render("minimumHeight", Echo.WindowPane.DEFAULT_MINIMUM_HEIGHT), false);
        this._maximumWidth = Echo.Sync.Extent.toPixels(this.component.render("maximumWidth"), true);
        this._maximumHeight = Echo.Sync.Extent.toPixels(this.component.render("maximumHeight"), false);
        this._resizable = this.component.render("resizable", true);
        var border = this.component.render("border", Echo.WindowPane.DEFAULT_BORDER);
        this._borderInsets = Echo.Sync.Insets.toPixels(border.borderInsets);
        this._contentInsets = Echo.Sync.Insets.toPixels(border.contentInsets);
        var movable = this.component.render("movable", true);
        var closable = this.component.render("closable", true);
        var maximizeEnabled = this.component.render("maximizeEnabled", false);
        var minimizeEnabled = this.component.render("minimizeEnabled", false);
        var hasControlIcons = closable || maximizeEnabled || minimizeEnabled;
        var fillImageFlags = this.component.render("ieAlphaRenderBorder") ? Echo.Sync.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
        
        this._div = Echo.Sync.FillImageBorder.renderContainer(border, { absolute: true });
        this._div.style.outlineStyle = "none";
        this._div.style.overflow = "hidden";
        this._div.style.zIndex = 1;
        
        this._borderDivs = Echo.Sync.FillImageBorder.getBorder(this._div);
        var mouseDownHandler = this._resizable ? Core.method(this, this._processBorderMouseDown) : null; 
        for (var i = 0; i < 8; ++i) {
            if (this._borderDivs[i]) {
                if (this._resizable) {
                    this._borderDivs[i].style.zIndex = 2;
                    this._borderDivs[i].style.cursor = Echo.Sync.WindowPane.CURSORS[i];
                    Core.Web.Event.add(this._borderDivs[i], "mousedown", mouseDownHandler, true);
                }
            }
        }
        
        // Render Title Bar
        
        this._titleBarDiv = document.createElement("div");
        this._titleBarDiv.style.position = "absolute";
        this._titleBarDiv.style.zIndex = 3;
        
        var icon = this.component.render("icon");
        if (icon) {
            var titleIconDiv = document.createElement("div");
            titleIconDiv.style[Core.Web.Env.CSS_FLOAT] = this._rtl ? "right" : "left";
            Echo.Sync.Insets.render(this.component.render("iconInsets"), titleIconDiv, "padding");
            this._titleBarDiv.appendChild(titleIconDiv);
            
            var img = document.createElement("img");
            Echo.Sync.ImageReference.renderImg(icon, img);
            titleIconDiv.appendChild(img);
        }
    
        var title = this.component.render("title");
        var titleTextDiv = document.createElement("div");
        if (icon) {
            titleTextDiv.style[Core.Web.Env.CSS_FLOAT] = this._rtl ? "right" : "left";
        }
        titleTextDiv.style.whiteSpace = "nowrap";
        Echo.Sync.Font.render(this.component.render("titleFont"), titleTextDiv);
        Echo.Sync.Insets.render(this.component.render("titleInsets", 
                Echo.WindowPane.DEFAULT_TITLE_INSETS), titleTextDiv, "padding");
        titleTextDiv.appendChild(document.createTextNode(title ? title : "\u00a0"));
        this._titleBarDiv.appendChild(titleTextDiv);
        
        var titleBarHeight = this.component.render("titleHeight");
        if (titleBarHeight) {
            this._titleBarHeight = Echo.Sync.Extent.toPixels(titleBarHeight);
        }
        if (!titleBarHeight) {
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
            this._titleBarDiv.style.backgroundColor = Echo.WindowPane.DEFAULT_TITLE_BACKGROUND;
        }
        
        if (hasControlIcons) {
            this._controlDiv = document.createElement("div");
            this._controlDiv.style.cssText = "position:absolute;top:0;";
            this._controlDiv.style[this._rtl ? "left" : "right"] = 0;
            Echo.Sync.Insets.render(this.component.render("controlsInsets",  
                    Echo.WindowPane.DEFAULT_CONTROLS_INSETS), this._controlDiv, "margin");
            this._titleBarDiv.appendChild(this._controlDiv);

            // Close Button
            if (closable) {
                this._renderControlIcon("close", this.client.getResourceUrl("Echo", "resource/WindowPaneClose.gif"), "[X]");
            }
            if (maximizeEnabled) {
                this._renderControlIcon("maximize", this.client.getResourceUrl("Echo", "resource/WindowPaneMaximize.gif"), "[+]");
            }
            if (minimizeEnabled) {
                this._renderControlIcon("minimize", this.client.getResourceUrl("Echo", "resource/WindowPaneMinimize.gif"), "[-]");
            }
        }
        
        this._div.appendChild(this._titleBarDiv);
        
        // Add content to main DIV.  
        // The object this._contentDiv will have been created by renderAdd(). 
        // Note that overflow is set to 'hidden' if child is a pane component, this is necessary to workaround what
        // what is presumably a bug in Safari 3.0.x.  It should otherwise not be required.
        this._contentDiv.style.cssText = "position:absolute;z-index:2;top:" + 
                (this._contentInsets.top + this._titleBarHeight) + "px;bottom:" + this._contentInsets.bottom + "px;left:" + 
                this._contentInsets.left + "px;right:" + this._contentInsets.right + "px;" +
                "overflow:"+ ((this.component.children.length === 0 || this.component.children[0].pane) ? "hidden;" : "auto;");
        Echo.Sync.Font.renderClear(this.component.render("font"), this._contentDiv);
        if (this.component.children.length > 0 && !this.component.children[0].pane) {
            Echo.Sync.Insets.render(this.component.render("insets"), this._contentDiv, "padding");
        }
                
        Echo.Sync.Color.render(this.component.render("background", Echo.WindowPane.DEFAULT_BACKGROUND),
                this._contentDiv, "backgroundColor");
        Echo.Sync.Color.render(this.component.render("foreground", Echo.WindowPane.DEFAULT_FOREGROUND),
                this._contentDiv, "color");
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this._contentDiv);
        this._div.appendChild(this._contentDiv);

        // Add Internet Explorer 6-specific windowed control-blocking IFRAME.
        if (Core.Web.Env.QUIRK_IE_SELECT_Z_INDEX) {
            this._div.appendChild(this._maskDiv);
        }
        Core.Web.Event.add(this._div, "click", 
                Core.method(this, this._processFocusClick), true);

        // Append main DIV to parent.
        parentElement.appendChild(this._div);
    },

    /**
     * Renders a specific control button icon.
     * 
     * @param {String} name the name of the control icon, used for both event identification and to
     *        retrieve icon property names from component (e.g., a value "close" will cause
     *        "closeIcon" and "closeRolloverIcon" properties of component to be used)
     * @param {#ImageReference} defaultIcon the default icon image to use in the event none is specified
     *        by the component
     * @param {String} altText the alternate text to display if no icon is available (and defaultIcon is null)
     */
    _renderControlIcon: function(name, defaultIcon, altText) {
        var controlDiv = document.createElement("div"),
            icon = this.component.render(name + "Icon", defaultIcon),
            rolloverIcon = this.component.render(name + "RolloverIcon");
 
        var controlSpacing = Echo.Sync.Extent.toCssValue(this.component.render("controlsSpacing", 
                Echo.WindowPane.DEFAULT_CONTROLS_SPACING));
        controlDiv.style.cssText = this._rtl ? ("float:left;cursor:pointer;margin-right:" + controlSpacing) :  
                ("float:right;cursor:pointer;margin-left:" + controlSpacing);
        Echo.Sync.Insets.render(this.component.render(name + "Insets"), controlDiv, "padding");

        if (icon) {
            var img = document.createElement("img");
            Echo.Sync.ImageReference.renderImg(icon, img);
            controlDiv.appendChild(img);
            if (rolloverIcon) {
                Core.Web.Event.add(controlDiv, "mouseover", Core.method(this, this._processControlRolloverEnter), false);
                Core.Web.Event.add(controlDiv, "mouseout", Core.method(this, this._processControlRolloverExit), false);
            }
        } else {
            controlDiv.appendChild(document.createTextNode(altText));
        }
        
        Core.Web.Event.add(controlDiv, "click", Core.method(this, this._processControlClick), false);

        this._controlDiv.appendChild(controlDiv);
        if (this._controlIcons == null) {
            this._controlIcons = [];
        }
        this._controlIcons.push(controlDiv);
        
        controlDiv._controlData = {
            name: name,
            icon: icon,
            rolloverIcon: rolloverIcon
        };
    },
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        this._loadContainerSize();
        this._setBounds(this._requested, false);
        Core.Web.VirtualPosition.redraw(this._contentDiv);
        Core.Web.VirtualPosition.redraw(this._maskDiv);
        
        if (!this._initialAutoSizeComplete) {
            // If position was successfully set, perform initial operations related to automatic sizing 
            // (executed on first renderDisplay() after renderAdd()).
            this._initialAutoSizeComplete = true;
            var imageListener = Core.method(this, function() {
                if (this.component) { // Verify component still registered.
                    Echo.Render.renderComponentDisplay(this.component);
                }
            });
            Core.Web.Image.monitor(this._contentDiv, imageListener);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._overlayRemove();
        this._renderDisposeFrame();
        this._maskDiv = null;
        this._contentDiv = null;
    },
    
    /**
     * Disposes state of rendered window frame.  This method disposes all resources initialized in _renderAddFrame().
     */
    _renderDisposeFrame: function() {
        var i;

        Core.Web.Event.removeAll(this._div);

        for (i = 0; i < 8; ++i) {
            if (this._borderDivs[i]) {
                Core.Web.Event.removeAll(this._borderDivs[i]);
            }
        }
        this._borderDivs = null;
        
        if (this._controlIcons != null) {
            for (i = 0; i < this._controlIcons.length; ++i) {
                Core.Web.Event.removeAll(this._controlIcons[i]);
            }
            this._controlIcons = null;
        }
        
        Core.Web.Event.removeAll(this._titleBarDiv);
        this._titleBarDiv = null;
        
        this._div = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderFocus */
    renderFocus: function() {
        Core.Web.DOM.focusElement(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        if (update.hasAddedChildren() || update.hasRemovedChildren()) {
            // Children added/removed: perform full render.
        } else if (update.isUpdatedPropertySetIn(Echo.Sync.WindowPane.NON_RENDERED_PROPERTIES)) {
            // Do nothing.
            return false;
        } else if (update.isUpdatedPropertySetIn(Echo.Sync.WindowPane.PARTIAL_PROPERTIES_POSITION_SIZE)) {
            this._loadPositionAndSize();
            return false;
        } else if (update.isUpdatedPropertySetIn(Echo.Sync.WindowPane.PARTIAL_PROPERTIES)) {
            this._renderUpdateFrame();
            return false;
        }

        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },
    
    /**
     * Renders an update to the window frame.  Disposes existing frame, removes rendered elements, adds new frame.
     */
    _renderUpdateFrame: function() {
        var element = this._div;
        var containerElement = element.parentNode;
        this._renderDisposeFrame();
        containerElement.removeChild(element);
        this._renderAddFrame(containerElement);
    },
    
    /**
     * Sets the bounds of the window.  Constrains the specified bounds to within the available area.
     * If userAdjusting parameter is true, specBounds values must be in pixel values.
     * Invokes _redraw().
     * 
     * @param specBounds an object containing extent properties x, y, width, and height
     * @param {Boolean} userAdjusting flag indicating whether this bounds adjustment is a result of the user moving/resizing
     *        the window (true) or is programmatic (false)
     */
    _setBounds: function(specBounds, userAdjusting) {
        var pxBounds = {}, // Pixel bounds (x/y/width/height as numeric pixel values. 
            calculatedHeight = false; // Flag indicating whether height is calculated or default.
        
        if (userAdjusting) {
            // Constrain user adjustment specBounds coordinate to be an on-screen negative value.
            // if userAdjusting is true, x/y values are guaranteed to be integers.
            if (specBounds.x != null && specBounds.x < 0) {
                specBounds.x = 0;
            }
            if (specBounds.y != null && specBounds.y < 0) {
                specBounds.y = 0;
            }
        }
        
        // Determine pixel width based on specified extent width.
        if (specBounds.width != null) {
            // Determine pixel width based on specified outside width.
            pxBounds.width = Math.round(Echo.Sync.Extent.isPercent(specBounds.width) ?
                    (parseInt(specBounds.width, 10) * this._containerSize.width / 100) :
                    Echo.Sync.Extent.toPixels(specBounds.width, true));
        } else if (specBounds.contentWidth != null) {
            // Determine pixel width based on specified inside (content) width.
            pxBounds.contentWidth = Math.round(Echo.Sync.Extent.isPercent(specBounds.contentWidth) ?
                    (parseInt(specBounds.contentWidth, 10) * this._containerSize.width / 100) :
                    Echo.Sync.Extent.toPixels(specBounds.contentWidth, true));
            pxBounds.width = this._contentInsets.left + this._contentInsets.right + pxBounds.contentWidth;
        }
        
        // Determine pixel height based on specified extent height, or if not specified, calculate height.
        if (specBounds.height != null) {
            // Calculate pixel height based on specified outside height.
            pxBounds.height = Math.round(Echo.Sync.Extent.isPercent(specBounds.height) ?
                    (parseInt(specBounds.height, 10) * this._containerSize.height / 100) :
                    Echo.Sync.Extent.toPixels(specBounds.height, false));
        } else if (specBounds.contentHeight != null) {
            // Calculate pixel height based on specified inside (content) height.
            pxBounds.contentHeight = Math.round(Echo.Sync.Extent.isPercent(specBounds.contentHeight) ?
                    (parseInt(specBounds.contentHeight, 10) * this._containerSize.height / 100) :
                    Echo.Sync.Extent.toPixels(specBounds.contentHeight, false));
            pxBounds.height = this._contentInsets.top + this._contentInsets.bottom + this._titleBarHeight + pxBounds.contentHeight;
        } else if (!userAdjusting) {
            // Set calculated height flag, will be used later for constraints.
            calculatedHeight = true;
            
            // Calculate height based on content size.
            if (this.component.children[0]) {
                // Determine pixel content width.
                var contentWidth = pxBounds.contentWidth ? pxBounds.contentWidth : 
                        pxBounds.width - (this._contentInsets.left + this._contentInsets.right);
                // Cache current content DIV CSS text.
                var contentDivCss = this._contentDiv.style.cssText;
                
                // Use child peer's getPreferredSize() implementation if available.
                if (this.component.children[0].peer.getPreferredSize) {
                    // Set content DIV CSS text for measuring.
                    this._contentDiv.style.cssText = "position:absolute;width:" + contentWidth + 
                            "px;height:" + this._containerSize.height + "px";

                    // Determine size using getPreferredSize()
                    var prefSize = this.component.children[0].peer.getPreferredSize(Echo.Render.ComponentSync.SIZE_HEIGHT);
                    if (prefSize.height) {
                        pxBounds.height = this._contentInsets.top + this._contentInsets.bottom + this._titleBarHeight + 
                                prefSize.height;
                    }
                    
                    // Reset content DIV CSS text.
                    this._contentDiv.style.cssText = contentDivCss;
                }
                
                // If height not yet determined and child is not a pane, measure child height.
                if (!pxBounds.height && !this.component.children[0].pane) {
                    // Configure _contentDiv state for proper measuring of its content height.
                    var insets = Echo.Sync.Insets.toPixels(this.component.render("insets"));
                    this._contentDiv.style.position = "static";
                    this._contentDiv.style.width = (contentWidth - insets.left - insets.right) + "px";
                    this._contentDiv.style.height = "";
                    this._contentDiv.style.padding = "";

                    // Determine size using measurement.
                    var measuredHeight = new Core.Web.Measure.Bounds(this._contentDiv).height;
                    if (measuredHeight) {
                        pxBounds.height = this._contentInsets.top + this._contentInsets.bottom + this._titleBarHeight + 
                                measuredHeight + insets.top + insets.bottom;
                    }

                    // Reset content DIV CSS text.
                    this._contentDiv.style.cssText = contentDivCss;
                }
            }
            
            if (!pxBounds.height) {
                // Height calculation not possible: revert to using default height value.
                pxBounds.height = Echo.Sync.Extent.toPixels(Echo.WindowPane.DEFAULT_HEIGHT, false);            
            }
        }
        
        // Determine x-coordinate of window based on specified x-coordinate.
        if (specBounds.x != null) {
            if (Echo.Sync.Extent.isPercent(specBounds.x)) {
                pxBounds.x = Math.round((this._containerSize.width - pxBounds.width) * (parseInt(specBounds.x, 10) / 100));
                if (pxBounds.x < 0) {
                    // Constain x coordinate if window is too large to fit on-screen.
                    pxBounds.x = 0;
                }
            } else {
                pxBounds.x = Math.round(Echo.Sync.Extent.toPixels(specBounds.x, true));
                if (pxBounds.x < 0) {
                    // Negative value: position window from right side of screen.
                    pxBounds.x += this._containerSize.width - pxBounds.width;
                }
            }
        }

        // Determine y-coordinate of window based on specified y-coordinate.
        if (specBounds.y != null) {
            if (Echo.Sync.Extent.isPercent(specBounds.y)) {
                pxBounds.y = Math.round((this._containerSize.height - pxBounds.height) * (parseInt(specBounds.y, 10) / 100));
                if (pxBounds.y < 0) {
                    // Constain y coordinate if window is too large to fit on-screen.
                    pxBounds.y = 0;
                }
            } else {
                pxBounds.y = Math.round(Echo.Sync.Extent.toPixels(specBounds.y, false));
                if (pxBounds.y < 0) {
                    // Negative value: position window from bottom side of screen
                    pxBounds.y += this._containerSize.height - pxBounds.height;
                }
            }
        }
        
        // Initialize _rendered property if required.
        if (this._rendered == null) {
            this._rendered = { };
        }

        // Constrain width, store value in _rendered property.
        if (pxBounds.width != null) {
            // Constrain to width of region.
            if (this._resizable && pxBounds.width > this._containerSize.width) {
                pxBounds.width = this._containerSize.width;
            }

            // Constrain to maximum width.
            if (this._maximumWidth && pxBounds.width > this._maximumWidth) {
                if (userAdjusting && pxBounds.x != null) {
                    // If user is adjusting the window and x-coordinate is provided, adjust x-coordinate appropriately
                    // as window is being resized using a left-side handle.
                    pxBounds.x += (pxBounds.width - this._maximumWidth);
                }
                pxBounds.width = this._maximumWidth;
            }

            // Constrain to minimum width.
            if (pxBounds.width < this._minimumWidth) {
                if (userAdjusting && pxBounds.x != null) {
                    // If user is adjusting the window and x-coordinate is provided, adjust x-coordinate appropriately
                    // as window is being resized using a left-side handle.
                    pxBounds.x += (pxBounds.width - this._minimumWidth);
                }
                pxBounds.width = this._minimumWidth;
            }

            // Store.
            this._rendered.width = Math.round(pxBounds.width);
        }
        
        // Constrain height, store value in _rendered property.
        if (pxBounds.height != null) {
            // Constrain to height of region.
            if ((calculatedHeight || this._resizable) && pxBounds.height > this._containerSize.height) {
                pxBounds.height = this._containerSize.height;
            }
            
            // Constrain to maximum height.
            if (this._maximumHeight && pxBounds.height > this._maximumHeight) {
                if (userAdjusting && pxBounds.y != null) {
                    // If user is adjusting the window and y-coordinate is provided, adjust y-coordinate appropriately
                    // as window is being resized using a top-side handle.
                    pxBounds.y += (pxBounds.height - this._maximumHeight);
                }
                pxBounds.height = this._maximumHeight;
            }

            // Constrain to minimum height.
            if (pxBounds.height < this._minimumHeight) {
                if (userAdjusting && pxBounds.y != null) {
                    // If user is adjusting the window and y-coordinate is provided, adjust y-coordinate appropriately
                    // as window is being resized using a top-side handle.
                    pxBounds.y += (pxBounds.height - this._minimumHeight);
                }
                pxBounds.height = this._minimumHeight;
            }
            
            // Store.
            this._rendered.height = Math.round(pxBounds.height);
        }
    
        // Constrain x position, store value in _rendered property.
        if (pxBounds.x != null) {
            // Ensure right edge of window is on-screen.
            if (this._containerSize.width > 0 && pxBounds.x > this._containerSize.width - this._rendered.width) {
                pxBounds.x = this._containerSize.width - this._rendered.width;
            }

            // Ensure left edge of window is on-screen.
            if (pxBounds.x < 0) {
                pxBounds.x = 0;
            }

            // Store.
            this._rendered.x = Math.round(pxBounds.x);
        }
    
        // Constrain y position, store value in _rendered property.
        if (pxBounds.y != null) {
            // Ensure bottom edge of window is on-screen.
            if (this._containerSize.height > 0 && pxBounds.y > this._containerSize.height - this._rendered.height) {
                pxBounds.y = this._containerSize.height - this._rendered.height;
            }

            // Ensure top edge of window is on-screen.
            if (pxBounds.y < 0) {
                pxBounds.y = 0;
            }

            // Store.
            this._rendered.y = Math.round(pxBounds.y);
        }

        // Perform redraw based on new _rendered state.
        this._redraw();
    }
});
