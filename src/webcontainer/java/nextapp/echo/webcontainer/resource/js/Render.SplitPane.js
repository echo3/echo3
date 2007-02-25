/**
 * Component rendering peer: SplitPane
 */
EchoRender.ComponentSync.SplitPane = function() { };

EchoRender.ComponentSync.SplitPane.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.SplitPane.prototype.renderDispose = function(update) {
    var firstPaneDivElement = document.getElementById(this.component.renderId + "_pane0");
    var separatorDivElement = document.getElementById(this.component.renderId + "_separator");
    var secondPaneDivElement = document.getElementById(this.component.renderId + "_pane1");

    if (firstPaneDivElement) {
        this._firstPaneData = new Object();
        this._firstPaneData.id = null;
        this._firstPaneData.scrollTop = firstPaneDivElement.scrollTop;
        this._firstPaneData.scrollLeft = firstPaneDivElement.scrollLeft;
    }
    if (secondPaneDivElement) {
        this._secondPaneData = new Object();
        this._secondPaneData.id = null;
        this._secondPaneData.scrollTop = secondPaneDivElement.scrollTop;
        this._secondPaneData.scrollLeft = secondPaneDivElement.scrollLeft;
    }
    
    if (separatorDivElement) {
        EchoWebCore.EventProcessor.remove(separatorDivElement, "mousedown", new EchoCore.MethodRef(this,
                this._processSeparatorMouseDown), false);
    }
};

EchoRender.ComponentSync.SplitPane.prototype.getContainerElement = function(component) {
    var componentIndex = this.component.indexOf(component);
    return document.getElementById(this.component.renderId + "_pane" + componentIndex); 
};

EchoRender.ComponentSync.SplitPane.prototype.loadRenderData = function() {
    var orientation = this.component.getRenderProperty("orientation", 
            EchoApp.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING);
    // FIXME: RTL is hardcoded to false.
    var rtl = false;
 
    switch (orientation) {
    case EchoApp.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING:
        this._orientationTopLeft = !rtl;
        this._orientationVertical = false;
        break;
    case EchoApp.SplitPane.ORIENTATION_HORIZONTAL_TRAILING_LEADING:
        this._orientationTopLeft = rtl;
        this._orientationVertical = false;
        break;
    case EchoApp.SplitPane.ORIENTATION_HORIZONTAL_LEFT_RIGHT:
        this._orientationTopLeft = true;
        this._orientationVertical = false;
        break;
    case EchoApp.SplitPane.ORIENTATION_HORIZONTAL_RIGHT_LEFT:
        this._orientationTopLeft = false;
        this._orientationVertical = false;
        break;
    case EchoApp.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM:
        this._orientationTopLeft = true;
        this._orientationVertical = true;
        break;
    case EchoApp.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP:
        this._orientationTopLeft = false;
        this._orientationVertical = true;
        break;
    default:
        throw new Error("Invalid orientation: " + orientation);
    }

    this._resizable = this.component.getRenderProperty("resizable");
    this._separatorPosition = EchoRender.Property.Extent.toPixels(this.component.getRenderProperty("separatorPosition",
            EchoApp.SplitPane.DEFAULT_SEPARATOR_POSITION), this._orientationVertical);
    this._separatorSize = EchoRender.Property.Extent.toPixels(this.component.getRenderProperty(
            this._orientationVertical ? "separatorHeight" : "separatorWidth",
            this._resizable ? EchoApp.SplitPane.DEFAULT_SEPARATOR_SIZE_RESIZABLE 
            : EchoApp.SplitPane.DEFAULT_SEPARATOR_SIZE_FIXED), this._orientationVertical);
};

EchoRender.ComponentSync.SplitPane.prototype._processSeparatorMouseDown = function(e) {
    EchoWebCore.DOM.preventEventDefault(e);
    
    EchoWebCore.dragInProgress = true;

    this._dragInitPosition = this._separatorPosition;
    if (this._orientationVertical) {
        this._dragInitMouseOffset = e.clientY;
    } else {
        this._dragInitMouseOffset = e.clientX;
    }
    
    var bodyElement = document.getElementsByTagName("body")[0];
    EchoWebCore.EventProcessor.add(bodyElement, "mousemove", 
            new EchoCore.MethodRef(this, this._processSeparatorMouseMove), true);
    EchoWebCore.EventProcessor.add(bodyElement, "mouseup", 
            new EchoCore.MethodRef(this, this._processSeparatorMouseUp), true);
};

EchoRender.ComponentSync.SplitPane.prototype._processSeparatorMouseMove = function(e) {
//FIXME. Refactor for size.
    var position;
    if (this._orientationVertical) {
        if (this._orientationTopLeft) {
            position = this._dragInitPosition + e.clientY - this._dragInitMouseOffset;
        } else {
            position = this._dragInitPosition - e.clientY + this._dragInitMouseOffset;
        }
    } else {
        if (this._orientationTopLeft) {
            position = this._dragInitPosition + e.clientX - this._dragInitMouseOffset;
        } else {
            position = this._dragInitPosition - e.clientX + this._dragInitMouseOffset;
        }
    }
    this._setSeparatorPosition(position);
    this._redraw();
};

EchoRender.ComponentSync.SplitPane.prototype._processSeparatorMouseUp = function(e) {
    EchoWebCore.DOM.preventEventDefault(e);
    
    EchoWebCore.dragInProgress = false;

    this._removeSeparatorListeners();
    this.component.setProperty("separatorPosition", new EchoApp.Property.Extent(this._separatorPosition));
};

EchoRender.ComponentSync.SplitPane.prototype._getInsetsSizeAdjustment = function(layoutData) {
    if (!layoutData || !layoutData.getProperty("insets")) {
        return 0;
    }
    var layoutDataInsets = EchoRender.Property.Insets.toPixels(layoutData.getProperty("insets"));
    var adjustment;
    if (this._orientationVertical) {
        adjustment = layoutDataInsets.top + layoutDataInsets.bottom;
    } else {
        adjustment = layoutDataInsets.left + layoutDataInsets.right;
    }
    if (adjustment > this._separatorPosition) {
        adjustment = this._separatorPosition;
    }
    return adjustment;
};

EchoRender.ComponentSync.SplitPane.prototype._redraw = function() {
    var firstPaneDivElement = document.getElementById(this.component.renderId + "_pane0");
    var separatorDivElement = document.getElementById(this.component.renderId + "_separator");
    var secondPaneDivElement = document.getElementById(this.component.renderId + "_pane1");
    
    var insetsAdjustment = 0;
    if (this.component.getComponentCount() > 0) {
        var layoutData = this.component.getComponent(0).getRenderProperty("layoutData");
        insetsAdjustment = this._getInsetsSizeAdjustment(layoutData);
    }

    if (this._orientationVertical) {
        if (this._orientationTopLeft) {
            this._redrawItem(firstPaneDivElement, "height", (this._separatorPosition - insetsAdjustment) + "px");
            this._redrawItem(secondPaneDivElement, "top", (this._separatorPosition + this._separatorSize) + "px");
            this._redrawItem(separatorDivElement, "top", this._separatorPosition + "px");
        } else {
            this._redrawItem(firstPaneDivElement, "height", (this._separatorPosition - insetsAdjustment) + "px");
            this._redrawItem(secondPaneDivElement, "bottom", (this._separatorPosition + this._separatorSize) + "px"); 
            this._redrawItem(separatorDivElement, "bottom", this._separatorPosition + "px");
        }
    } else {
        if (this._orientationTopLeft) {
            this._redrawItem(firstPaneDivElement, "width", (this._separatorPosition - insetsAdjustment) + "px");
            this._redrawItem(secondPaneDivElement, "left", (this._separatorPosition + this._separatorSize) + "px");
            this._redrawItem(separatorDivElement, "left", this._separatorPosition + "px");
        } else {
            this._redrawItem(firstPaneDivElement, "width", (this._separatorPosition - insetsAdjustment) + "px");
            this._redrawItem(secondPaneDivElement, "right", (this._separatorPosition + this._separatorSize) + "px"); 
            this._redrawItem(separatorDivElement, "right", this._separatorPosition + "px");
        }
    }
};

EchoRender.ComponentSync.SplitPane.prototype._redrawItem = function(element, styleProperty, newValue) {
    if (element) {
        element.style[styleProperty] = newValue;
    }
};

EchoRender.ComponentSync.SplitPane.prototype._removeSeparatorListeners = function() {
    var bodyElement = document.getElementsByTagName("body")[0];
    EchoWebCore.EventProcessor.remove(bodyElement, "mousemove", 
            new EchoCore.MethodRef(this, this._processSeparatorMouseMove), true);
    EchoWebCore.EventProcessor.remove(bodyElement, "mouseup", 
            new EchoCore.MethodRef(this, this._processSeparatorMouseUp), true);
};

EchoRender.ComponentSync.SplitPane.prototype.renderAdd = function(update, parentElement) {
    this.loadRenderData();
    var separatorColor = new EchoApp.Property.Color("red"); 
    var separatorImage = null;
    
    var childCount = this.component.getComponentCount();
    if (childCount > 2) {
        throw new Error("Cannot render SplitPane with more than two child components.");
    }
    var child0 = childCount < 1 ? null : this.component.getComponent(0);
    var child1 = childCount < 2 ? null : this.component.getComponent(1);

    var splitPaneDivElement = document.createElement("div");
    splitPaneDivElement.id = this.component.renderId;
    splitPaneDivElement.style.position = "absolute";
    splitPaneDivElement.style.overflow = "hidden";
    splitPaneDivElement.style.top = "0px"
    splitPaneDivElement.style.bottom = "0px"
    splitPaneDivElement.style.left = "0px"
    splitPaneDivElement.style.right = "0px"
    
    EchoWebCore.VirtualPosition.register(splitPaneDivElement.id);
    EchoRender.Property.Color.renderFB(this.component, splitPaneDivElement);
    
    var separatorDivElement = null;
    if (this._separatorSize > 0) {
        separatorDivElement = document.createElement("div");
        separatorDivElement.id = this.component.renderId + "_separator";
        separatorDivElement.style.position = "absolute";
        EchoRender.Property.Color.renderComponentProperty(this.component, "separatorColor",
                EchoApp.SplitPane.DEFAULT_SEPARATOR_COLOR, separatorDivElement, "backgroundColor");
        separatorDivElement.style.fontSize = "1px";
        separatorDivElement.style.lineHeight = "0";
        separatorDivElement.style.zIndex = "2";

        var resizeCursor = null;
        if (this._orientationVertical) {
            if (this._orientationTopLeft) {
                separatorDivElement.style.top = this._separatorPosition + "px";
                resizeCursor = "s-resize";
            } else {
                separatorDivElement.style.bottom = this._separatorPosition + "px";
                resizeCursor = "n-resize";
            }
            separatorDivElement.style.width = "100%";
            separatorDivElement.style.height = this._separatorSize + "px";
        } else {
            if (this._orientationTopLeft) {
                separatorDivElement.style.left = this._separatorPosition + "px";
                resizeCursor = "e-resize";
            } else {
                separatorDivElement.style.right = this._separatorPosition + "px";
                resizeCursor = "w-resize";
            }
            separatorDivElement.style.height = "100%";
            separatorDivElement.style.width = this._separatorSize + "px";
        }
        if (this._resizable && resizeCursor) {
            separatorDivElement.style.cursor = resizeCursor;
        }
        splitPaneDivElement.appendChild(separatorDivElement);
    }
    
    for (var i = 0; i < childCount && i < 2; ++i) {
        var child = this.component.getComponent(i);
        this._renderAddChild(update, child, splitPaneDivElement, i);
    }
    
    parentElement.appendChild(splitPaneDivElement);
    
    //FIXME. The scroll-bar position storage code here appears to not be working if parent component is redrawn
    // is peer being deleted?  Probably.  That means disposed state is all broken too.
    
    if (this._firstPaneData) {
        var firstPaneDivElement = document.getElementById(this.component.renderId + "_pane0");
        if (firstPaneDivElement) {
            firstPaneDivElement.scrollTop = this._firstPaneData.scrollTop;
            firstPaneDivElement.scrollLeft = this._firstPaneData.scrollLeft;
            alert("1scrolling to: " + this._firstPaneData.scrollTop);
        }
    }
    if (this._secondPaneData) {
        var secondPaneDivElement = document.getElementById(this.component.renderId + "_pane1");
        if (secondPaneDivElement) {
            secondPaneDivElement.scrollTop = this._secondPaneData.scrollTop;
            secondPaneDivElement.scrollLeft = this._secondPaneData.scrollLeft;
            alert("2scrolling to: " + this._secondPaneData.scrollTop);
        }
    }
    
    if (this._resizable) {
        EchoWebCore.EventProcessor.add(separatorDivElement, "mousedown", new EchoCore.MethodRef(this,
                this._processSeparatorMouseDown), false);
    }
};

EchoRender.ComponentSync.SplitPane.prototype._renderAddChild = function(update, child, parentElement, index) {
    var childIndex = this.component.indexOf(child);
    var paneDivElement = document.createElement("div");
    paneDivElement.id = this.component.renderId + "_pane" + childIndex;
    paneDivElement.style.position = "absolute";
    paneDivElement.style.overflow = "auto";
    
    var layoutData = child.getRenderProperty("layoutData");
    if (layoutData) {
        EchoRender.Property.Alignment.renderComponentProperty(layoutData, "alignment", null, paneDivElement, false,
                this.component);
        EchoRender.Property.Color.renderComponentProperty(layoutData, "background", null, paneDivElement, "backgroundColor");
        EchoRender.Property.FillImage.renderComponentProperty(layoutData, "backgroundImage", null, paneDivElement);
        EchoRender.Property.Insets.renderComponentProperty(layoutData, "insets", null, paneDivElement, "padding");
    }
    var insetsAdjustment = this._getInsetsSizeAdjustment(layoutData);
    
    var renderingTopLeft = (index == 0 && this._orientationTopLeft)
            || (index != 0 && !this._orientationTopLeft);
            
    if (this._orientationVertical) {
        paneDivElement.style.left = "0px";
        paneDivElement.style.right = "0px";
        if (this._orientationTopLeft) {
            if (index == 0) {
                paneDivElement.style.top = "0px";
                paneDivElement.style.height = (this._separatorPosition - insetsAdjustment) + "px";
            } else {
                paneDivElement.style.top = (this._separatorPosition + this._separatorSize) + "px";
                paneDivElement.style.bottom = "0px";
            }
        } else {
            if (index == 0) {
                paneDivElement.style.bottom = "0px";
                paneDivElement.style.height = (this._separatorPosition - insetsAdjustment) + "px";
            } else {
                paneDivElement.style.top = "0px";
                paneDivElement.style.bottom = (this._separatorPosition + this._separatorSize) + "px";
            }
        }
    } else {
        paneDivElement.style.top = "0px";
        paneDivElement.style.bottom = "0px";
        if (this._orientationTopLeft) {
            if (index == 0) {
                paneDivElement.style.left = "0px";
                paneDivElement.style.width = (this._separatorPosition - insetsAdjustment) + "px";
            } else {
                paneDivElement.style.left = (this._separatorPosition + this._separatorSize) + "px";
                paneDivElement.style.right = "0px";
            }
        } else {
            if (index == 0) {
                paneDivElement.style.width = (this._separatorPosition - insetsAdjustment) + "px";
                paneDivElement.style.right = "0px";
            } else {
                paneDivElement.style.left = "0px";
                paneDivElement.style.right = this._separatorPosition + "px";
            }
        }
    }
    EchoWebCore.VirtualPosition.register(paneDivElement.id);
    
    EchoRender.renderComponentAdd(update, child, paneDivElement);
    parentElement.appendChild(paneDivElement);
};

EchoRender.ComponentSync.SplitPane.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return true;
};

EchoRender.ComponentSync.SplitPane.prototype._setSeparatorPosition = function(newValue) {
    this._separatorPosition = newValue;
    EchoCore.Debug.consoleWrite(this._separatorPosition);
};

EchoRender.registerPeer("SplitPane", EchoRender.ComponentSync.SplitPane);
