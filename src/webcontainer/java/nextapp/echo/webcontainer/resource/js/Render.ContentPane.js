/**
 * Component rendering peer: ContentPane
 */
EchoRender.ComponentSync.ContentPane = function() {
    this._floatingPaneManager = null;
};

EchoRender.ComponentSync.ContentPane.prototype = EchoCore.derive(EchoRender.ComponentSync);

EchoRender.ComponentSync.ContentPane.prototype._processZIndexChanged = function(e) {
    for (var i = 0; i < this.component.children.length; ++i) {
        if (!this.component.children[i].floatingPane) {
            continue;
        }
        var index = this._floatingPaneManager.getIndex(this.component.children[i].renderId);
        this._childIdToElementMap[this.component.children[i].renderId].style.zIndex = index;
    }
};

EchoRender.ComponentSync.ContentPane.prototype.raise = function(child) {
    if (!this._floatingPaneManager) {
        this._floatingPaneManager = new EchoRender.FloatingPaneManager();
        this._floatingPaneManager.addZIndexListener(new EchoCore.MethodRef(this, this._processZIndexChanged));
    }
    this._floatingPaneManager.add(child.renderId);
};

EchoRender.ComponentSync.ContentPane.prototype.renderAdd = function(update, parentElement) {
    this._divElement = document.createElement("div");
    this._divElement.style.position = "absolute";
    this._divElement.style.width = "100%";
    this._divElement.style.height = "100%";
    this._divElement.style.overflow = "hidden";
    this._divElement.style.zIndex = "0";
    EchoRender.Property.Font.renderDefault(this.component, this._divElement);
    EchoRender.Property.Color.renderFB(this.component, this._divElement);
    EchoRender.Property.FillImage.renderComponentProperty(this.component, "backgroundImage", null, this._divElement); 

    this._childIdToElementMap = new Object();
    
    var componentCount = this.component.getComponentCount();
    for (var i = 0; i < componentCount; ++i) {
        var child = this.component.getComponent(i);
        this._renderAddChild(update, child);
    }

    // Store values of horizontal/vertical scroll such that 
    // renderDisplay() will adjust scrollbars appropriately after rendering.
    this._pendingScrollX = this.component.getRenderProperty("horizontalScroll");
    this._pendingScrollY = this.component.getRenderProperty("verticalScroll");
    
    parentElement.appendChild(this._divElement);
};

EchoRender.ComponentSync.ContentPane.prototype._renderAddChild = function(update, child) {
    var divElement = document.createElement("div");
    this._childIdToElementMap[child.renderId] = divElement;
    divElement.style.position = "absolute";
    if (child.floatingPane) {
        divElement.style.zIndex = "1";
    } else {
        var insets = this.component.getRenderProperty("insets", new EchoApp.Property.Insets(0));
        var pixelInsets = EchoRender.Property.Insets.toPixels(insets);
        divElement.style.zIndex = "0";
        divElement.style.left = pixelInsets.left + "px";
        divElement.style.top = pixelInsets.top + "px";
        divElement.style.bottom = pixelInsets.bottom + "px";
        divElement.style.right = pixelInsets.right + "px";
        divElement.style.overflow = "auto";
    }
    EchoRender.renderComponentAdd(this.client, update, child, divElement);
    this._divElement.appendChild(divElement);
    
    if (child.floatingPane) {
        this.raise(child);
    }
};

EchoRender.ComponentSync.ContentPane.prototype.renderDispose = function(update) { 
    this._childIdToElementMap = null;
    this._divElement = null;
};

EchoRender.ComponentSync.ContentPane.prototype._renderRemoveChild = function(update, child) {
    if (child.floatingPane && this._floatingPaneManager) {
        this._floatingPaneManager.remove(child.renderId);
    }
    
    var divElement = this._childIdToElementMap[child.renderId];
    divElement.parentNode.removeChild(divElement);
    delete this._childIdToElementMap[child.renderId];
};

EchoRender.ComponentSync.ContentPane.prototype.renderDisplay = function() {
    var child = this._divElement.firstChild;
    while (child) {
        EchoWebCore.VirtualPosition.redraw(child);
        child = child.nextSibling;
    }

    // If a scrollbar adjustment has been requested by renderAdd, perform it.
    if (this._pendingScrollX || this._pendingScrollY) {
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            if (!child.floatingPane) {
                var contentElement = this._childIdToElementMap[child.renderId];
                if (this._pendingScrollX) {
                    contentElement.scrollLeft = this._pendingScrollX.value < 0 ? 1000000 : this._pendingScrollX.value;
                    this._pendingScrollX = null;
                }
                if (this._pendingScrollY) {
                    contentElement.scrollTop = this._pendingScrollY.value < 0 ? 1000000 : this._pendingScrollY.value;
                    this._pendingScrollY = null;
                }
                break;
            }
        }
    }
};

EchoRender.ComponentSync.ContentPane.prototype.renderUpdate = function(update) {
    var fullRender = false;
    if (update.hasUpdatedProperties() || update.hasUpdatedLayoutDataChildren()) {
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
            for (var i = 0; i < addedChildren.length; ++i) {
                //FIXME. third attribute is ignored...undecided whether order matters AT ALL here (set by z-index?)
                this._renderAddChild(update, addedChildren[i], this.component.indexOf(addedChildren[i])); 
            }
        }
    }
    if (fullRender) {
        var element = this._divElement;
        var containerElement = element.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
    }
    
    return fullRender;
};

EchoRender.registerPeer("ContentPane", EchoRender.ComponentSync.ContentPane);
