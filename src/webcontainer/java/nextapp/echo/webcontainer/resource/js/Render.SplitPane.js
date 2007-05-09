/**
 * Component rendering peer: SplitPane
 * 
 * @class
 * @base EchoRender.ComponentSync
 */
EchoRender.ComponentSync.SplitPane = function() {

    /**
     * Array containing two PaneConfiguration instances, representing the state of each child pane.
     * @type Array
     */
    this._paneConfigurations = new Array(2);
};

EchoRender.ComponentSync.SplitPane.prototype = new EchoRender.ComponentSync;

/**
 * Creates a new PaneConfiguration instance
 * 
 * @class Describes the configuration of a child pane of the SplitPane,
 *        including the child component and scroll bar positions.
 * @param component the child component
 */
EchoRender.ComponentSync.SplitPane.PaneConfiguration = function(component) {
    this.component = component;
};

EchoRender.ComponentSync.SplitPane.PaneConfiguration.prototype.loadScrollPositions = function(paneDivElement) {
    paneDivElement.scrollLeft = this.scrollLeft;
    paneDivElement.scrollTop = this.scrollTop;
};

EchoRender.ComponentSync.SplitPane.PaneConfiguration.prototype.storeScrollPositions = function(paneDivElement) {
    this.scrollLeft = paneDivElement.scrollLeft;
    this.scrollTop = paneDivElement.scrollTop;
};

EchoRender.ComponentSync.SplitPane.prototype.renderDispose = function(update) {
    if (this._paneConfigurations[0]) {
        var firstPaneDivElement = document.getElementById(this.component.renderId + "_pane0");
        if (this.firstPaneDivElement) {
            this._paneConfigurations[0].storeScrollPositions(firstPaneDivElement);
        }
    }
    if (this._paneConfigurations[1]) {
        var secondPaneDivElement = document.getElementById(this.component.renderId + "_pane1");
        if (this.secondPaneDivElement) {
            this._paneConfigurations[0].storeScrollPositions(firstPaneDivElement);
        }
    }
    
    var separatorDivElement = document.getElementById(this.component.renderId + "_separator");
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

EchoRender.ComponentSync.SplitPane.prototype._getRenderedChildIndex = function(child) {
    if (this._paneConfigurations[0] && this._paneConfigurations[0].component == child) {
        return 0;
    } else if (this._paneConfigurations[1] && this._paneConfigurations[1].component == child) {
        return 1;
    } else {
        throw new Error("Specified component is not a child of the SplitPane.");
    }
};

EchoRender.ComponentSync.SplitPane.prototype._hasRelocatedChildren = function(update) {
    var oldChild0 = this._paneConfigurations[0] ? this._paneConfigurations[0].component : null; 
    var oldChild1 = this._paneConfigurations[1] ? this._paneConfigurations[1].component : null; 
    var childCount = this.component.getComponentCount();
    var newChild0 = childCount > 0 ? this.component.getComponent(0) : null;
    var newChild1 = childCount > 1 ? this.component.getComponent(1) : null;
    return (oldChild0 != null && oldChild0 == newChild1) 
            || (oldChild1 != null && oldChild1 == newChild0);
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
    EchoWebCore.VirtualPosition.redraw();
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
        switch (layoutData.getProperty("overflow")) {
        case EchoApp.SplitPane.OVERFLOW_HIDDEN:
            paneDivElement.style.overflow = "hidden";
            break;
        case EchoApp.SplitPane.OVERFLOW_SCROLL:
            paneDivElement.style.overflow = "scroll";
            break;
        }
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

    if (this._paneConfigurations[index] && this._paneConfigurations[index].component == child) {
        this._paneConfigurations[index].loadScrollPositions(paneDivElement);
    } else {
        this._paneConfigurations[index] = new EchoRender.ComponentSync.SplitPane.PaneConfiguration(child);
    }
};

EchoRender.ComponentSync.SplitPane.prototype._renderRemoveChild = function(update, child) {
    var index = this._getRenderedChildIndex(child);
    this._paneConfigurations[index] = null;
    var paneDivElement = document.getElementById(this.component.renderId + "_pane" + index);
    EchoWebCore.DOM.removeNode(paneDivElement);
};

EchoRender.ComponentSync.SplitPane.prototype.renderUpdate = function(update) {
    var fullRender = false;
    if (update.hasUpdatedProperties() || update.hasUpdatedLayoutDataChildren()
            || this._hasRelocatedChildren()) {
        // Full render
        fullRender = true;
    } else {
        var removedChildren = update.getRemovedChildren();
        if (removedChildren) {
            // Remove children.
            for (var i = 0; i < removedChildren.length; ++i) {
                this._renderRemoveChild(update, removedChildren[i]);
            }
        }
        var addedChildren = update.getAddedChildren();
        if (addedChildren) {
            // Add children.
            var splitPaneDivElement = document.getElementById(this.component.renderId);
            for (var i = 0; i < addedChildren.length; ++i) {
                this._renderAddChild(update, addedChildren[i], splitPaneDivElement, this.component.indexOf(addedChildren[i])); 
            }
        }
    }
    if (fullRender) {
        EchoRender.Util.renderRemove(update, update.parent);
        var containerElement = EchoRender.Util.getContainerElement(update.parent);
        this.renderAdd(update, containerElement);
    }
    
    return fullRender;
};

EchoRender.ComponentSync.SplitPane.prototype._setSeparatorPosition = function(newValue) {
    this._separatorPosition = newValue;
};

EchoRender.registerPeer("SplitPane", EchoRender.ComponentSync.SplitPane);
