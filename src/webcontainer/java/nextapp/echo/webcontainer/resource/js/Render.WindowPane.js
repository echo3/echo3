/**
 * Component rendering peer: WindowPane
 */
EchoAppRender.WindowPaneSync = Core.extend(EchoRender.ComponentSync, {

    $static: {
        DEFAULT_TITLE_BACKGROUND: new EchoApp.Color("#abcdef"),
        DEFAULT_TITLE_INSETS: new EchoApp.Insets("5px", "10px"),
        ADJUSTMENT_OPACITY: 0.75,
        
        adjustOpacity: false
    },
    
    $load: function() {
        EchoRender.registerPeer("WindowPane", this);
    },

    _processBorderMouseMoveRef: null,
    
    _processBorderMouseUpRef: null,
    
    _processTitleBarMouseMoveRef: null,
    
    _processTitleBarMouseUpRef: null,

    $construct: function() {
        this._processBorderMouseMoveRef = Core.method(this, this._processBorderMouseMove);
        this._processBorderMouseUpRef = Core.method(this, this._processBorderMouseUp);
        this._processTitleBarMouseMoveRef = Core.method(this, this._processTitleBarMouseMove);
        this._processTitleBarMouseUpRef = Core.method(this, this._processTitleBarMouseUp);
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
        
    	this.component.setProperty("positionX", new EchoApp.Extent(this._windowX, "px"));
    	this.component.setProperty("positionY", new EchoApp.Extent(this._windowY, "px"));
    	this.component.setProperty("width", new EchoApp.Extent(this._windowWidth, "px"));
    	this.component.setProperty("height", new EchoApp.Extent(this._windowHeight, "px"));
    	
    	this._userWindowX = this._windowX;
    	this._userWindowY = this._windowY;
    	this._userWindowWidth = this._windowWidth;
    	this._userWindowHeight = this._windowHeight;
        
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
    
    _processCloseClick: function(e) { 
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        this.component.doWindowClosing();
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
    	this.component.setProperty("positionX", new EchoApp.Extent(this._windowX, "px"));
    	this.component.setProperty("positionY", new EchoApp.Extent(this._windowY, "px"));
    
    	this._userWindowX = this._windowX;
    	this._userWindowY = this._windowY;
    },
    
    setPosition: function(x, y, width, height) {
        if (width != null) {
            if (width < this._minimumWidth) {
                if (x != null) {
                    x += (width - this._minimumWidth);
                }
                width = this._minimumWidth;
            }
            this._windowWidth = width;
        }
        
        if (height != null) {
            if (height < this._minimumHeight) {
                if (y != null) {
                    y += (height - this._minimumHeight);
                }
                height = this._minimumHeight;
            }
            this._windowHeight = height;
        }
    
        if (x != null) {
            if (this._containerSize.width > 0 && x > this._containerSize.width - this._windowWidth) {
                x = this._containerSize.width - this._windowWidth;
            }
            if (x < 0) {
                x = 0;
            }
            this._windowX = x;
        }
    
        if (y != null) { 
            if (this._containerSize.height > 0 && y > this._containerSize.height - this._windowHeight) {
                y = this._containerSize.height - this._windowHeight;
            }
            if (y < 0) {
                y = 0;
            }
            this._windowY = y;
        }
        
        this.redraw();
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
        var positionX = this.component.getRenderProperty("positionX");
        var positionY = this.component.getRenderProperty("positionY");
        this._userWindowX = this._windowX = positionX == null ? null : EchoAppRender.Extent.toPixels(positionX, true); 
        this._userWindowY = this._windowY = positionY == null ? null :EchoAppRender.Extent.toPixels(positionY, false);
        this._userWindowWidth = this._windowWidth = EchoAppRender.Extent.toPixels(
                this.component.getRenderProperty("width", EchoApp.WindowPane.DEFAULT_WIDTH), true);
        this._userWindowHeight = this._windowHeight = EchoAppRender.Extent.toPixels(
                this.component.getRenderProperty("height", EchoApp.WindowPane.DEFAULT_HEIGHT), false);
                
        this._minimumWidth = EchoAppRender.Extent.toPixels(
                this.component.getRenderProperty("minimumWidth", EchoApp.WindowPane.DEFAULT_MINIMUM_WIDTH), true);
        this._minimumHeight = EchoAppRender.Extent.toPixels(
                this.component.getRenderProperty("minimumHeight", EchoApp.WindowPane.DEFAULT_MINIMUM_HEIGHT), false);
    
        var border = this.component.getRenderProperty("border", EchoApp.WindowPane.DEFAULT_BORDER);
        this._borderInsets = EchoAppRender.Insets.toPixels(border.borderInsets);
        this._contentInsets = EchoAppRender.Insets.toPixels(border.contentInsets);
    
        var movable = this.component.getRenderProperty("movable", true);
        var resizable = this.component.getRenderProperty("resizable", true);
        var closable = this.component.getRenderProperty("closable", true);
    
        this._windowPaneDivElement = document.createElement("div");
        this._windowPaneDivElement.id = this.component.renderId;
        this._windowPaneDivElement.tabIndex = "0";
    
        this._windowPaneDivElement.style.outlineStyle = "none";
    
        this._windowPaneDivElement.style.position = "absolute";
        this._windowPaneDivElement.style.zIndex = 1;
        
        this._windowPaneDivElement.style.overflow = "hidden";
        
        if (this._windowX != null) {
            this._windowPaneDivElement.style.left = this._windowX + "px";
        }
        if (this._windowY != null) {
            this._windowPaneDivElement.style.top = this._windowY + "px";
        }
        this._windowPaneDivElement.style.width = this._windowWidth + "px";
        this._windowPaneDivElement.style.height = this._windowHeight + "px";
        
        EchoAppRender.Font.renderDefault(this.component, this._windowPaneDivElement);
        
        var borderSideWidth = this._windowWidth - this._borderInsets.left - this._borderInsets.right;
        var borderSideHeight = this._windowHeight - this._borderInsets.top - this._borderInsets.bottom;
        
        this._borderDivElements = new Array(8);
        
        var fillImageFlags = this.component.getRenderProperty("ieAlphaRenderBorder") 
                ? EchoAppRender.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
        
        // Render top row
        if (this._borderInsets.top > 0) {
            // Render top left corner
            if (this._borderInsets.left > 0) {
                this._borderDivElements[0] = document.createElement("div");
    		    this._borderDivElements[0].style.fontSize = "1px";
                this._borderDivElements[0].style.position = "absolute";
                this._borderDivElements[0].style.left = "0px";
                this._borderDivElements[0].style.top = "0px";
                this._borderDivElements[0].style.width = this._borderInsets.left + "px";
                this._borderDivElements[0].style.height = this._borderInsets.top + "px";
                if (border.color != null) {
                    this._borderDivElements[0].style.backgroundColor = border.color.value;
                }
                if (resizable) {
                    this._borderDivElements[0].style.cursor = "nw-resize";
                }
                if (border.fillImages[0]) {
                    EchoAppRender.FillImage.render(border.fillImages[0], this._borderDivElements[0], fillImageFlags);
                }
                this._windowPaneDivElement.appendChild(this._borderDivElements[0]);
            }
            
            // Render top side
            this._borderDivElements[1] = document.createElement("div");
    	    this._borderDivElements[1].style.fontSize = "1px";
            this._borderDivElements[1].style.position = "absolute";
            this._borderDivElements[1].style.left = this._borderInsets.left + "px";
            this._borderDivElements[1].style.top = "0px";
            this._borderDivElements[1].style.width = borderSideWidth + "px";
            this._borderDivElements[1].style.height = this._borderInsets.top + "px";
            if (border.color != null) {
                this._borderDivElements[1].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                this._borderDivElements[1].style.cursor = "n-resize";
            }
            if (border.fillImages[1]) {
                EchoAppRender.FillImage.render(border.fillImages[1], this._borderDivElements[1], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[1]);
    
            // Render top right corner
            if (this._borderInsets.right > 0) {
                this._borderDivElements[2] = document.createElement("div");
    		    this._borderDivElements[2].style.fontSize = "1px";
                this._borderDivElements[2].style.position = "absolute";
                this._borderDivElements[2].style.right = "0px";
                this._borderDivElements[2].style.top = "0px";
                this._borderDivElements[2].style.width = this._borderInsets.right + "px";
                this._borderDivElements[2].style.height = this._borderInsets.top + "px";
                if (border.color != null) {
                    this._borderDivElements[2].style.backgroundColor = border.color.value;
                }
                if (resizable) {
                    this._borderDivElements[2].style.cursor = "ne-resize";
                }
                if (border.fillImages[2]) {
                    EchoAppRender.FillImage.render(border.fillImages[2], this._borderDivElements[2], fillImageFlags);
                }
                this._windowPaneDivElement.appendChild(this._borderDivElements[2]);
            }
        }
    
        // Render left side
        if (this._borderInsets.left > 0) {
            this._borderDivElements[3] = document.createElement("div");
    	    this._borderDivElements[3].style.fontSize = "1px";
            this._borderDivElements[3].style.position = "absolute";
            this._borderDivElements[3].style.left = "0px";
            this._borderDivElements[3].style.top = this._borderInsets.top + "px";
            this._borderDivElements[3].style.width = this._borderInsets.left + "px";
            this._borderDivElements[3].style.height = borderSideHeight + "px";
            if (border.color != null) {
                this._borderDivElements[3].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                this._borderDivElements[3].style.cursor = "w-resize";
            }
            if (border.fillImages[3]) {
                EchoAppRender.FillImage.render(border.fillImages[3], this._borderDivElements[3], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[3]);
        }
        
        // Render right side
        if (this._borderInsets.right > 0) {
            this._borderDivElements[4] = document.createElement("div");
    	    this._borderDivElements[4].style.fontSize = "1px";
            this._borderDivElements[4].style.position = "absolute";
            this._borderDivElements[4].style.right = "0px";
            this._borderDivElements[4].style.top = this._borderInsets.top + "px";
            this._borderDivElements[4].style.width = this._borderInsets.right + "px";
            this._borderDivElements[4].style.height = borderSideHeight + "px";
            if (border.color != null) {
                this._borderDivElements[4].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                this._borderDivElements[4].style.cursor = "e-resize";
            }
            if (border.fillImages[4]) {
                EchoAppRender.FillImage.render(border.fillImages[4], this._borderDivElements[4], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[4]);
        }
        
        // Render bottom row
        if (this._borderInsets.bottom > 0) {
            // Render bottom left corner
            if (this._borderInsets.left > 0) {
                this._borderDivElements[5] = document.createElement("div");
    		    this._borderDivElements[5].style.fontSize = "1px";
                this._borderDivElements[5].style.position = "absolute";
                this._borderDivElements[5].style.left = "0px";
                this._borderDivElements[5].style.bottom = "0px";
                this._borderDivElements[5].style.width = this._borderInsets.left + "px";
                this._borderDivElements[5].style.height = this._borderInsets.bottom + "px";
                if (border.color != null) {
                    this._borderDivElements[5].style.backgroundColor = border.color.value;
                }
                if (resizable) {
                    this._borderDivElements[5].style.cursor = "sw-resize";
                }
                if (border.fillImages[5]) {
                    EchoAppRender.FillImage.render(border.fillImages[5], this._borderDivElements[5], fillImageFlags);
                }
                this._windowPaneDivElement.appendChild(this._borderDivElements[5]);
            }
            
            // Render bottom side
            this._borderDivElements[6] = document.createElement("div");
    	    this._borderDivElements[6].style.fontSize = "1px";
            this._borderDivElements[6].style.position = "absolute";
            this._borderDivElements[6].style.left = this._borderInsets.left + "px";
            this._borderDivElements[6].style.bottom = "0px";
            this._borderDivElements[6].style.width = borderSideWidth + "px";
            this._borderDivElements[6].style.height = this._borderInsets.bottom + "px";
            if (border.color != null) {
                this._borderDivElements[6].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                this._borderDivElements[6].style.cursor = "s-resize";
            }
            if (border.fillImages[6]) {
                EchoAppRender.FillImage.render(border.fillImages[6], this._borderDivElements[6], fillImageFlags);
            }
            this._windowPaneDivElement.appendChild(this._borderDivElements[6]);
    
            // Render bottom right corner
            if (this._borderInsets.right > 0) {
                this._borderDivElements[7] = document.createElement("div");
    		    this._borderDivElements[7].style.fontSize = "1px";
                this._borderDivElements[7].style.position = "absolute";
                this._borderDivElements[7].style.right = "0px";
                this._borderDivElements[7].style.bottom = "0px";
                this._borderDivElements[7].style.width = this._borderInsets.right + "px";
                this._borderDivElements[7].style.height = this._borderInsets.bottom + "px";
                if (border.color != null) {
                    this._borderDivElements[7].style.backgroundColor = border.color.value;
                }
                if (resizable) {
                    this._borderDivElements[7].style.cursor = "se-resize";
                }
                if (border.fillImages[7]) {
                    EchoAppRender.FillImage.render(border.fillImages[7], this._borderDivElements[7], fillImageFlags);
                }
                this._windowPaneDivElement.appendChild(this._borderDivElements[7]);
            }
        }
        
        // Render Title Bar
        
        this._titleBarDivElement = document.createElement("div");
        this._titleBarDivElement.style.position = "absolute";
        this._titleBarDivElement.style.zIndex = 3;
        
        var icon = this.component.getRenderProperty("icon");
        if (icon) {
            var titleIconDivElement = document.createElement("div");
            titleIconDivElement.style[WebCore.Environment.CSS_FLOAT] = "left";
            EchoAppRender.Insets.renderComponentProperty(this.component, "iconInsets", null, titleIconDivElement, "padding");
            this._titleBarDivElement.appendChild(titleIconDivElement);
            
            var imgElement = document.createElement("img");
            imgElement.src = icon.url;
            titleIconDivElement.appendChild(imgElement);
        }
    
        var title = this.component.getRenderProperty("title");
        if (title) {
            var titleTextDivElement = document.createElement("div");
            if (icon) {
                titleTextDivElement.style[WebCore.Environment.CSS_FLOAT] = "left";
            }
            titleTextDivElement.style.whiteSpace = "nowrap";
            EchoAppRender.Font.renderComponentProperty(this.component, "titleFont", null, titleTextDivElement);
            EchoAppRender.Insets.renderComponentProperty(this.component, "titleInsets", 
                    EchoAppRender.WindowPaneSync.DEFAULT_TITLE_INSETS, titleTextDivElement, "padding");
            titleTextDivElement.appendChild(document.createTextNode(title));
            this._titleBarDivElement.appendChild(titleTextDivElement);
        }
        
        var titleBarHeight = this.component.getRenderProperty("titleHeight");
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
        this._titleBarDivElement.style.width = (this._windowWidth - this._contentInsets.left - this._contentInsets.right) + "px";
        this._titleBarDivElement.style.height = this._titleBarHeight + "px";
        this._titleBarDivElement.style.overflow = "hidden";
        if (movable) {
            this._titleBarDivElement.style.cursor = "move";
        }
    
        EchoAppRender.Color.renderComponentProperty(this.component, "titleForeground", null, this._titleBarDivElement, "color");
    
        var titleBackground = this.component.getRenderProperty("titleBackground");
        var titleBackgroundImage = this.component.getRenderProperty("titleBackgroundImage");
    
        if (titleBackground) {
            this._titleBarDivElement.style.backgroundColor = titleBackground.value;
        }
        if (titleBackgroundImage) {
            EchoAppRender.FillImage.render(titleBackgroundImage, this._titleBarDivElement);
        }
    
        if (!titleBackground && !titleBackgroundImage) {
            this._titleBarDivElement.style.backgroundColor = EchoAppRender.WindowPaneSync.DEFAULT_TITLE_BACKGROUND.value;
        }
        
        // Close Button
      
        if (closable) {
            this._closeDivElement = document.createElement("div");
            this._closeDivElement.style.position = "absolute";
            this._closeDivElement.style.right = "0px";
            this._closeDivElement.style.top = "0px";
            this._closeDivElement.style.cursor = "pointer";
            EchoAppRender.Insets.renderComponentProperty(this.component, "closeIconInsets", 
                    EchoApp.WindowPane.DEFAULT_CLOSE_ICON_INSETS, this._closeDivElement, "padding");
            var closeIcon = this.component.getRenderProperty("closeIcon", this.client.getDefaultImage("Echo.WindowPane.closeIcon")); 
            if (closeIcon) {
                var imgElement = document.createElement("img");
                imgElement.src = closeIcon.url;
                this._closeDivElement.appendChild(imgElement);
            } else {
                this._closeDivElement.appendChild(document.createTextNode("[X]"));
            }
            this._titleBarDivElement.appendChild(this._closeDivElement);
        }
        
        this._windowPaneDivElement.appendChild(this._titleBarDivElement);
        
        // Render Content Area
        
        this._contentDivElement = document.createElement("div");
        
        this._contentDivElement.style.position = "absolute";
        this._contentDivElement.style.zIndex = 2;
        this._contentDivElement.style.overflow = "auto";
        
        EchoAppRender.Color.renderComponentProperty(this.component, "background", EchoApp.WindowPane.DEFAULT_BACKGROUND,
                this._contentDivElement, "backgroundColor");
        EchoAppRender.Color.renderComponentProperty(this.component, "foreground", EchoApp.WindowPane.DEFAULT_FOREGROUND,
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
                    = "filter:alpha(opacity=0);zIndex:1;position:absolute;left:0,right:0,top:0,bottom:0,borderWidth: 0;";
            var maskIFrameElement = document.createElement("iframe");
            maskIFrameElement.style.cssText = "width:100%;height:100%;";
            // FIXME set 'src' element if possible using client to get URL of blank document.
            this._maskDivElement.appendChild(maskIFrameElement);
    	    this._windowPaneDivElement.appendChild(this._maskDivElement);
        }
    
        parentElement.appendChild(this._windowPaneDivElement);
        
        // Register event listeners.
        
        if (closable) {
    	    WebCore.EventProcessor.add(this._windowPaneDivElement, "keydown", 
    	            Core.method(this, this._processKeyDown), false);
    	    WebCore.EventProcessor.add(this._closeDivElement, "click", 
    	            Core.method(this, this._processCloseClick), false);
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
            EchoAppRender.Insets.renderComponentProperty(this.component, "insets", null, this._contentDivElement, "padding");
        }
        EchoRender.renderComponentAdd(update, child, parentElement);
    },
    
    renderDispose: function(update) { 
        for (var i = 0; i < this._borderDivElements.length; ++i) {
            WebCore.EventProcessor.removeAll(this._borderDivElements[i]);
            this._borderDivElements[i] = null;
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
        
        // Center window if user x/y coordinates are not specified.
        if (this._userWindowX == null) {
            this._userWindowX = parseInt((this._containerSize.width - this._windowWidth) / 2);
        }
        if (this._userWindowY == null) {
            this._userWindowY = parseInt((this._containerSize.height - this._windowHeight) / 2); 
        }
            
        this.setPosition(this._userWindowX, this._userWindowY, this._userWindowWidth, this._userWindowHeight);
        WebCore.VirtualPosition.redraw(this._contentDivElement);
        WebCore.VirtualPosition.redraw(this._maskDivElement);
    },
    
    renderFocus: function() {
        WebCore.DOM.focusElement(this._windowPaneDivElement);
    },

    renderUpdate: function(update) {
        var element = this._windowPaneDivElement;
        var containerElement = element.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    }
});
