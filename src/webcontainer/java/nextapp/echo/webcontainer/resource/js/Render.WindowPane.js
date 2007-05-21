/**
 * Component rendering peer: WindowPane
 */
EchoRender.ComponentSync.WindowPane = function() {
};

EchoRender.ComponentSync.WindowPane.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.WindowPane.DEFAULT_TITLE_BACKGROUND = new EchoApp.Property.Color("#abcdef");
EchoRender.ComponentSync.WindowPane.ADJUSTMENT_OPACITY = 0.75;

EchoRender.ComponentSync.WindowPane.adjustOpacity = false;

EchoRender.ComponentSync.WindowPane.prototype.getContainerElement = function(component) {
    return document.getElementById(this.component.renderId + "_content");
};

EchoRender.ComponentSync.WindowPane.prototype.processBorderMouseDown = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    
    // Prevent selections.
    EchoWebCore.dragInProgress = true;
    EchoWebCore.DOM.preventEventDefault(e);

    var windowPaneDivElement = document.getElementById(this.component.renderId);

    this._containerSize = new EchoWebCore.Render.Measure(windowPaneDivElement.parentNode.parentNode);
    this._dragInitX = this._windowX;
    this._dragInitY = this._windowY;
    this._dragInitWidth = this._windowWidth;
    this._dragInitHeight = this._windowHeight;
    this._dragOriginX = e.clientX;
    this._dragOriginY = e.clientY;

    var resizingBorderElementId = e.target.id;
    var directionId = resizingBorderElementId.substring(resizingBorderElementId.lastIndexOf("_") + 1);
    
    switch (directionId) {
    case "0": this._resizeX = -1; this._resizeY = -1; break;
    case "1":  this._resizeX =  0; this._resizeY = -1; break;
    case "2": this._resizeX =  1; this._resizeY = -1; break;
    case "3":  this._resizeX = -1; this._resizeY =  0; break;
    case "4":  this._resizeX =  1; this._resizeY =  0; break;
    case "5": this._resizeX = -1; this._resizeY =  1; break;
    case "6":  this._resizeX =  0; this._resizeY =  1; break;
    case "7": this._resizeX =  1; this._resizeY =  1; break;
    }
    
    var bodyElement = document.getElementsByTagName("body")[0];

    EchoWebCore.EventProcessor.add(bodyElement, "mousemove", new EchoCore.MethodRef(this, this.processBorderMouseMove), true);
    EchoWebCore.EventProcessor.add(bodyElement, "mouseup", new EchoCore.MethodRef(this, this.processBorderMouseUp), true);

    // Reduce opacity.   
    if (EchoRender.ComponentSync.WindowPane.adjustOpacity) {
        windowPaneDivElement.style.opacity = EchoRender.ComponentSync.WindowPane.ADJUSTMENT_OPACITY;
    }
};

EchoRender.ComponentSync.WindowPane.prototype.processBorderMouseMove = function(e) {
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

    this.redraw();    
};

EchoRender.ComponentSync.WindowPane.prototype.processBorderMouseUp = function(e) {
    EchoWebCore.DOM.preventEventDefault(e);
    
    EchoWebCore.dragInProgress = false;

    // Set opaque.
    var windowPaneDivElement = document.getElementById(this.component.renderId);
    windowPaneDivElement.style.opacity = 1;

    this._removeBorderListeners();
	this.component.setProperty("positionX", new EchoApp.Property.Extent(this._windowX, "px"));
	this.component.setProperty("positionY", new EchoApp.Property.Extent(this._windowY, "px"));
	this.component.setProperty("width", new EchoApp.Property.Extent(this._windowWidth, "px"));
	this.component.setProperty("height", new EchoApp.Property.Extent(this._windowHeight, "px"));
    
    EchoRender.notifyResize(this.component);
    
    // Redraw all such that content is refreshed as well.
    EchoWebCore.VirtualPosition.redraw();
};

EchoRender.ComponentSync.WindowPane.prototype.processKeyDown = function(e) { 
    switch (e.keyCode) {
    case 27:
        this.component.doWindowClosing();
        break;
    }
};

EchoRender.ComponentSync.WindowPane.prototype.processTitleBarMouseDown = function(e) {
    if (!this.component.isActive()) {
        return;
    }

    // Prevent selections.
    EchoWebCore.dragInProgress = true;
    EchoWebCore.DOM.preventEventDefault(e);

    var windowPaneDivElement = document.getElementById(this.component.renderId);

    this._containerSize = new EchoWebCore.Render.Measure(windowPaneDivElement.parentNode.parentNode);
    this._dragInitX = this._windowX;
    this._dragInitY = this._windowY;
    this._dragOriginX = e.clientX;
    this._dragOriginY = e.clientY;

    // Reduce opacity.   
    if (EchoRender.ComponentSync.WindowPane.adjustOpacity) {
        windowPaneDivElement.style.opacity = EchoRender.ComponentSync.WindowPane.ADJUSTMENT_OPACITY;
    }
    
    var bodyElement = document.getElementsByTagName("body")[0];
    EchoWebCore.EventProcessor.add(bodyElement, "mousemove", new EchoCore.MethodRef(this, this.processTitleBarMouseMove), true);
    EchoWebCore.EventProcessor.add(bodyElement, "mouseup", new EchoCore.MethodRef(this, this.processTitleBarMouseUp), true);
};

EchoRender.ComponentSync.WindowPane.prototype.processTitleBarMouseMove = function(e) {
    var x = this._dragInitX + e.clientX - this._dragOriginX;
    var y = this._dragInitY + e.clientY - this._dragOriginY;
    this.setPosition(x, y);
    this.redraw();
};

EchoRender.ComponentSync.WindowPane.prototype.processTitleBarMouseUp = function(e) {
    EchoWebCore.dragInProgress = false;

    // Set opaque.
    var windowPaneDivElement = document.getElementById(this.component.renderId);
    windowPaneDivElement.style.opacity = 1;
    
    this._removeTitleBarListeners();
	this.component.setProperty("positionX", new EchoApp.Property.Extent(this._windowX, "px"));
	this.component.setProperty("positionY", new EchoApp.Property.Extent(this._windowY, "px"));
};

EchoRender.ComponentSync.WindowPane.prototype.setPosition = function(x, y, width, height) {
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
};

EchoRender.ComponentSync.WindowPane.prototype.redraw = function() {
    var windowPaneDivElement = document.getElementById(this.component.renderId);

    var titleBarDivElement = document.getElementById(this.component.renderId + "_titlebar");

    var borderTDivElement = document.getElementById(this.component.renderId + "_border_1");
    var borderBDivElement = document.getElementById(this.component.renderId + "_border_6");
    var borderLDivElement = document.getElementById(this.component.renderId + "_border_3");
    var borderRDivElement = document.getElementById(this.component.renderId + "_border_4");
    
    var contentDivElement = document.getElementById(this.component.renderId + "_content");

    var borderSideWidth = this._windowWidth - this._borderInsets.left - this._borderInsets.right;
    var borderSideHeight = this._windowHeight - this._borderInsets.top - this._borderInsets.bottom;

    windowPaneDivElement.style.left = this._windowX + "px";
    windowPaneDivElement.style.top = this._windowY + "px";
    windowPaneDivElement.style.width = this._windowWidth + "px";
    windowPaneDivElement.style.height = this._windowHeight + "px";

    titleBarDivElement.style.width = (this._windowWidth - this._contentInsets.left - this._contentInsets.right) + "px";

    borderTDivElement.style.width = borderSideWidth + "px";
    borderBDivElement.style.width = borderSideWidth + "px";
    borderLDivElement.style.height = borderSideHeight + "px";
    borderRDivElement.style.height = borderSideHeight + "px";   
    
    EchoWebCore.VirtualPosition.redraw(contentDivElement);
};

EchoRender.ComponentSync.WindowPane.prototype._removeBorderListeners = function() {
    var bodyElement = document.getElementsByTagName("body")[0];
    EchoWebCore.EventProcessor.remove(bodyElement, "mousemove", new EchoCore.MethodRef(this, this.processBorderMouseMove), true);
    EchoWebCore.EventProcessor.remove(bodyElement, "mouseup", new EchoCore.MethodRef(this, this.processBorderMouseUp), true);
};

EchoRender.ComponentSync.WindowPane.prototype._removeTitleBarListeners = function() {
    var bodyElement = document.getElementsByTagName("body")[0];
    EchoWebCore.EventProcessor.remove(bodyElement, "mousemove",
            new EchoCore.MethodRef(this, this.processTitleBarMouseMove), true);
    EchoWebCore.EventProcessor.remove(bodyElement, "mouseup", 
            new EchoCore.MethodRef(this, this.processTitleBarMouseUp), true);
};

EchoRender.ComponentSync.WindowPane.prototype.renderAdd = function(update, parentElement) {
    this._windowX = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("positionX", EchoApp.WindowPane.DEFAULT_X), true);
    this._windowY = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("positionY", EchoApp.WindowPane.DEFAULT_Y), false);
    this._windowWidth = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("width", EchoApp.WindowPane.DEFAULT_WIDTH), true);
    this._windowHeight = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("height", EchoApp.WindowPane.DEFAULT_HEIGHT), false);
            
    this._minimumWidth = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("minimumWidth", EchoApp.WindowPane.DEFAULT_MINIMUM_WIDTH), true);
    this._minimumHeight = EchoRender.Property.Extent.toPixels(
            this.component.getRenderProperty("minimumHeight", EchoApp.WindowPane.DEFAULT_MINIMUM_HEIGHT), false);
            
            
    var border = this.component.getRenderProperty("border", EchoApp.WindowPane.DEFAULT_BORDER);
    this._borderInsets = EchoRender.Property.Insets.toPixels(border.borderInsets);
    this._contentInsets = EchoRender.Property.Insets.toPixels(border.contentInsets);

    var movable = true;
    var resizable = true;
    var closable = true;

    var windowPaneDivElement = document.createElement("div");
    windowPaneDivElement.id = this.component.renderId;
    windowPaneDivElement.tabIndex = "0";

    windowPaneDivElement.style.outlineStyle = "none";

    windowPaneDivElement.style.position = "absolute";
    windowPaneDivElement.style.zIndex = 1;
    
    windowPaneDivElement.style.overflow = "hidden";
    
    windowPaneDivElement.style.left = this._windowX + "px";
    windowPaneDivElement.style.top = this._windowY + "px";
    windowPaneDivElement.style.width = this._windowWidth + "px";
    windowPaneDivElement.style.height = this._windowHeight + "px";
    
    var borderSideWidth = this._windowWidth - this._borderInsets.left - this._borderInsets.right;
    var borderSideHeight = this._windowHeight - this._borderInsets.top - this._borderInsets.bottom;
    
    var borderDivElements = new Array(8);
    
    var fillImageFlags = this.component.getRenderProperty("ieAlphaRenderBorder") 
            ? EchoRender.Property.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER : 0;
    
    // Render top row
    if (this._borderInsets.top > 0) {
        // Render top left corner
        if (this._borderInsets.left > 0) {
            borderDivElements[0] = document.createElement("div");
            borderDivElements[0].id = this.component.renderId + "_border_0";
            borderDivElements[0].style.position = "absolute";
            borderDivElements[0].style.left = "0px";
            borderDivElements[0].style.top = "0px";
            borderDivElements[0].style.width = this._borderInsets.left + "px";
            borderDivElements[0].style.height = this._borderInsets.top + "px";
            if (border.color != null) {
                borderDivElements[0].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                borderDivElements[0].style.cursor = "nw-resize";
            }
            if (border.fillImages[0]) {
                EchoRender.Property.FillImage.render(border.fillImages[0], borderDivElements[0], fillImageFlags);
            }
            windowPaneDivElement.appendChild(borderDivElements[0]);
        }
        
        // Render top side
        borderDivElements[1] = document.createElement("div");
        borderDivElements[1].id = this.component.renderId + "_border_1";
        borderDivElements[1].style.position = "absolute";
        borderDivElements[1].style.left = this._borderInsets.left + "px";
        borderDivElements[1].style.top = "0px";
        borderDivElements[1].style.width = borderSideWidth + "px";
        borderDivElements[1].style.height = this._borderInsets.top + "px";
        if (border.color != null) {
            borderDivElements[1].style.backgroundColor = border.color.value;
        }
        if (resizable) {
            borderDivElements[1].style.cursor = "n-resize";
        }
        if (border.fillImages[1]) {
            EchoRender.Property.FillImage.render(border.fillImages[1], borderDivElements[1], fillImageFlags);
        }
        windowPaneDivElement.appendChild(borderDivElements[1]);

        // Render top right corner
        if (this._borderInsets.right > 0) {
            borderDivElements[2] = document.createElement("div");
            borderDivElements[2].id = this.component.renderId + "_border_2";
            borderDivElements[2].style.position = "absolute";
            borderDivElements[2].style.right = "0px";
            borderDivElements[2].style.top = "0px";
            borderDivElements[2].style.width = this._borderInsets.right + "px";
            borderDivElements[2].style.height = this._borderInsets.top + "px";
            if (border.color != null) {
                borderDivElements[2].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                borderDivElements[2].style.cursor = "ne-resize";
            }
            if (border.fillImages[2]) {
                EchoRender.Property.FillImage.render(border.fillImages[2], borderDivElements[2], fillImageFlags);
            }
            windowPaneDivElement.appendChild(borderDivElements[2]);
        }
    }

    // Render left side
    if (this._borderInsets.left > 0) {
        borderDivElements[3] = document.createElement("div");
        borderDivElements[3].id = this.component.renderId + "_border_3";
        borderDivElements[3].style.position = "absolute";
        borderDivElements[3].style.left = "0px";
        borderDivElements[3].style.top = this._borderInsets.top + "px";
        borderDivElements[3].style.width = this._borderInsets.left + "px";
        borderDivElements[3].style.height = borderSideHeight + "px";
        if (border.color != null) {
            borderDivElements[3].style.backgroundColor = border.color.value;
        }
        if (resizable) {
            borderDivElements[3].style.cursor = "w-resize";
        }
        if (border.fillImages[3]) {
            EchoRender.Property.FillImage.render(border.fillImages[3], borderDivElements[3], fillImageFlags);
        }
        windowPaneDivElement.appendChild(borderDivElements[3]);
    }
    
    // Render right side
    if (this._borderInsets.right > 0) {
        borderDivElements[4] = document.createElement("div");
        borderDivElements[4].id = this.component.renderId + "_border_4";
        borderDivElements[4].style.position = "absolute";
        borderDivElements[4].style.right = "0px";
        borderDivElements[4].style.top = this._borderInsets.top + "px";
        borderDivElements[4].style.width = this._borderInsets.right + "px";
        borderDivElements[4].style.height = borderSideHeight + "px";
        if (border.color != null) {
            borderDivElements[4].style.backgroundColor = border.color.value;
        }
        if (resizable) {
            borderDivElements[4].style.cursor = "e-resize";
        }
        if (border.fillImages[4]) {
            EchoRender.Property.FillImage.render(border.fillImages[4], borderDivElements[4], fillImageFlags);
        }
        windowPaneDivElement.appendChild(borderDivElements[4]);
    }
    
    // Render bottom row
    if (this._borderInsets.bottom > 0) {
        // Render bottom left corner
        if (this._borderInsets.left > 0) {
            borderDivElements[5] = document.createElement("div");
            borderDivElements[5].id = this.component.renderId + "_border_5";
            borderDivElements[5].style.position = "absolute";
            borderDivElements[5].style.left = "0px";
            borderDivElements[5].style.bottom = "0px";
            borderDivElements[5].style.width = this._borderInsets.left + "px";
            borderDivElements[5].style.height = this._borderInsets.bottom + "px";
            if (border.color != null) {
                borderDivElements[5].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                borderDivElements[5].style.cursor = "sw-resize";
            }
            if (border.fillImages[5]) {
                EchoRender.Property.FillImage.render(border.fillImages[5], borderDivElements[5], fillImageFlags);
            }
            windowPaneDivElement.appendChild(borderDivElements[5]);
        }
        
        // Render bottom side
        borderDivElements[6] = document.createElement("div");
        borderDivElements[6].id = this.component.renderId + "_border_6";
        borderDivElements[6].style.position = "absolute";
        borderDivElements[6].style.left = this._borderInsets.left + "px";
        borderDivElements[6].style.bottom = "0px";
        borderDivElements[6].style.width = borderSideWidth + "px";
        borderDivElements[6].style.height = this._borderInsets.bottom + "px";
        if (border.color != null) {
            borderDivElements[6].style.backgroundColor = border.color.value;
        }
        if (resizable) {
            borderDivElements[6].style.cursor = "s-resize";
        }
        if (border.fillImages[6]) {
            EchoRender.Property.FillImage.render(border.fillImages[6], borderDivElements[6], fillImageFlags);
        }
        windowPaneDivElement.appendChild(borderDivElements[6]);

        // Render bottom right corner
        if (this._borderInsets.right > 0) {
            borderDivElements[7] = document.createElement("div");
            borderDivElements[7].id = this.component.renderId + "_border_7";
            borderDivElements[7].style.position = "absolute";
            borderDivElements[7].style.right = "0px";
            borderDivElements[7].style.bottom = "0px";
            borderDivElements[7].style.width = this._borderInsets.right + "px";
            borderDivElements[7].style.height = this._borderInsets.bottom + "px";
            if (border.color != null) {
                borderDivElements[7].style.backgroundColor = border.color.value;
            }
            if (resizable) {
                borderDivElements[7].style.cursor = "se-resize";
            }
            if (border.fillImages[7]) {
                EchoRender.Property.FillImage.render(border.fillImages[7], borderDivElements[7], fillImageFlags);
            }
            windowPaneDivElement.appendChild(borderDivElements[7]);
        }
    }
    
    // Render Title Bar
    
    var titleBarDivElement = document.createElement("div");
    titleBarDivElement.id = this.component.renderId + "_titlebar";
    titleBarDivElement.style.position = "absolute";
    titleBarDivElement.style.zIndex = 3;

    var title = this.component.getRenderProperty("title");
    if (title) {
        var titleTextDivElement = document.createElement("div");
        titleTextDivElement.style.padding = "5px 10px";
        titleTextDivElement.style.whiteSpace = "nowrap";
        titleTextDivElement.appendChild(document.createTextNode(title));
        titleBarDivElement.appendChild(titleTextDivElement);
    }
    
    var titleBarHeight = this.component.getRenderProperty("titleHeight");
    if (titleBarHeight) {
        this._titleBarHeight = EchoRender.Property.Extent.toPixels(titleBarHeight);
    } else {
        var titleMeasure = new EchoWebCore.Render.Measure(titleBarDivElement);
        if (titleMeasure.height) {
            this._titleBarHeight = titleMeasure.height;
        } else {
            this._titleBarHeight = EchoRender.Property.Extent.toPixels(EchoApp.WindowPane.DEFAULT_TITLE_HEIGHT);
        }
    }

    titleBarDivElement.style.top = this._contentInsets.top + "px";
    titleBarDivElement.style.left = this._contentInsets.left + "px";
    titleBarDivElement.style.width = (this._windowWidth - this._contentInsets.left - this._contentInsets.right) + "px";
    titleBarDivElement.style.height = this._titleBarHeight + "px";
    titleBarDivElement.style.overflow = "hidden";
    if (true || this.movable) { //FIXME. Hardcoded
        titleBarDivElement.style.cursor = "move";
    }

    EchoRender.Property.Color.renderComponentProperty(this.component, "titleForeground", null, titleBarDivElement, "color");

    var titleBackground = this.component.getRenderProperty("titleBackground");
    var titleBackgroundImage = this.component.getRenderProperty("titleBackgroundImage");

    if (titleBackground) {
        titleBarDivElement.style.backgroundColor = titleBackground.value;
    }
    if (titleBackgroundImage) {
        EchoRender.Property.FillImage.render(titleBackgroundImage, titleBarDivElement);
    }

    if (!titleBackground && !titleBackgroundImage) {
        titleBarDivElement.style.backgroundColor = EchoRender.ComponentSync.WindowPane.DEFAULT_TITLE_BACKGROUND.value;
    }
    
    windowPaneDivElement.appendChild(titleBarDivElement);
    
    // Render Content Area
    
    var contentDivElement = document.createElement("div");
    contentDivElement.id = this.component.renderId + "_content";
    EchoWebCore.VirtualPosition.register(contentDivElement.id);
    
    contentDivElement.style.position = "absolute";
    contentDivElement.style.zIndex = 2;
    contentDivElement.style.overflow = "auto";
    
    EchoRender.Property.Color.renderComponentProperty(this.component, "background", EchoApp.WindowPane.DEFAULT_BACKGROUND,
            contentDivElement, "backgroundColor");
    EchoRender.Property.Color.renderComponentProperty(this.component, "foreground", EchoApp.WindowPane.DEFAULT_FOREGROUND,
            contentDivElement, "color");

    contentDivElement.style.top = (this._contentInsets.top + this._titleBarHeight) + "px";
    contentDivElement.style.left = this._contentInsets.left + "px";
    contentDivElement.style.right = this._contentInsets.right + "px";
    contentDivElement.style.bottom = this._contentInsets.bottom + "px";
    
    windowPaneDivElement.appendChild(contentDivElement);

    var componentCount = this.component.getComponentCount();
    if (componentCount == 1) {
        this.renderAddChild(update, this.component.getComponent(0), contentDivElement);
    } else if (componentCount > 1) {
        throw new Error("Too many children: " + componentCount);
    }

    parentElement.appendChild(windowPaneDivElement);
    
    // Register event listeners.
    
    EchoWebCore.EventProcessor.add(windowPaneDivElement, "keydown", 
            new EchoCore.MethodRef(this, this.processKeyDown), false);
    EchoWebCore.EventProcessor.add(titleBarDivElement, "mousedown", 
            new EchoCore.MethodRef(this, this.processTitleBarMouseDown), true);
    for (var i = 0; i < borderDivElements.length; ++i) {
        EchoWebCore.EventProcessor.add(borderDivElements[i], "mousedown", 
                new EchoCore.MethodRef(this, this.processBorderMouseDown), true);
    }
};

EchoRender.ComponentSync.WindowPane.prototype.renderAddChild = function(update, child, parentElement) {
    EchoRender.renderComponentAdd(update, child, parentElement);
};

EchoRender.ComponentSync.WindowPane.prototype.renderDispose = function(update) { 
    var windowPaneDivElement = document.getElementById(this.component.renderId);
    var titleBarDivElement = document.getElementById(this.component.renderId + "_titlebar");
    
    EchoWebCore.EventProcessor.removeAll(windowPaneDivElement);
    EchoWebCore.EventProcessor.removeAll(titleBarDivElement);
    for (var i = 0; i < 8; ++i) {
        var borderDivElement = document.getElementById(this.component.renderId + "_border_" + i);
        EchoWebCore.EventProcessor.removeAll(borderDivElement);
    }
};

EchoRender.ComponentSync.WindowPane.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return true;
};

EchoRender.registerPeer("WindowPane", EchoRender.ComponentSync.WindowPane);
