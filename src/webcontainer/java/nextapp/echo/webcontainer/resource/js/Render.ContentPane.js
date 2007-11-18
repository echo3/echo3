/**
 * Component rendering peer: ContentPane
 */
EchoAppRender.ContentPaneSync = Core.extend(EchoRender.ComponentSync, {
    $load: function() {
        EchoRender.registerPeer("ContentPane", this);
    },

    $construct: function() {
        this._floatingPaneManager = null;
    },
    
    _processZIndexChanged: function(e) {
        for (var i = 0; i < this.component.children.length; ++i) {
            if (!this.component.children[i].floatingPane) {
                continue;
            }
            var index = this._floatingPaneManager.getIndex(this.component.children[i].renderId);
            var childElement = this._childIdToElementMap[this.component.children[i].renderId];
            if (childElement) {
                childElement.style.zIndex = index;
            }
        }
    },
    
    raise: function(child) {
        if (!this._floatingPaneManager) {
            this._floatingPaneManager = new EchoAppRender.FloatingPaneManager();
            this._floatingPaneManager.addZIndexListener(new Core.MethodRef(this, this._processZIndexChanged));
        }
        this._floatingPaneManager.add(child.renderId);
    },
    
    renderAdd: function(update, parentElement) {
        this._divElement = document.createElement("div");
        this._divElement.style.position = "absolute";
        this._divElement.style.width = "100%";
        this._divElement.style.height = "100%";
        this._divElement.style.overflow = "hidden";
        this._divElement.style.zIndex = "0";
        EchoAppRender.Font.renderDefault(this.component, this._divElement);
        EchoAppRender.Color.renderFB(this.component, this._divElement);
        EchoAppRender.FillImage.renderComponentProperty(this.component, "backgroundImage", null, this._divElement); 
    
        this._childIdToElementMap = {};
        
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
    },
    
    _renderAddChild: function(update, child) {
        var divElement = document.createElement("div");
        this._childIdToElementMap[child.renderId] = divElement;
        divElement.style.position = "absolute";
        if (child.floatingPane) {
            divElement.style.zIndex = "1";
        } else {
            var insets = this.component.getRenderProperty("insets", new EchoApp.Insets(0));
            var pixelInsets = EchoAppRender.Insets.toPixels(insets);
            divElement.style.zIndex = "0";
            divElement.style.left = pixelInsets.left + "px";
            divElement.style.top = pixelInsets.top + "px";
            divElement.style.bottom = pixelInsets.bottom + "px";
            divElement.style.right = pixelInsets.right + "px";
            divElement.style.overflow = "auto";
        }
        EchoRender.renderComponentAdd(update, child, divElement);
        this._divElement.appendChild(divElement);
        
        if (child.floatingPane) {
            this.raise(child);
        }
    },
    
    renderDispose: function(update) { 
        this._childIdToElementMap = null;
        this._divElement = null;
    },
    
    _renderRemoveChild: function(update, child) {
        if (child.floatingPane && this._floatingPaneManager) {
            this._floatingPaneManager.remove(child.renderId);
        }
        
        var divElement = this._childIdToElementMap[child.renderId];
        divElement.parentNode.removeChild(divElement);
        delete this._childIdToElementMap[child.renderId];
    },
    
    renderDisplay: function() {
        var child = this._divElement.firstChild;
        while (child) {
            WebCore.VirtualPosition.redraw(child);
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
    },
    
    renderUpdate: function(update) {
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

            // FIXME experimental, nonfinal API
            update.renderContext.displayRequired = [];
            
            if (addedChildren) {
                // Add children.
                for (var i = 0; i < addedChildren.length; ++i) {
                    this._renderAddChild(update, addedChildren[i], this.component.indexOf(addedChildren[i]));
                    update.renderContext.displayRequired.push(addedChildren[i]); 
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
    }
});
