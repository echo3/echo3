/**
 * Component rendering peer: ContentPane
 */
EchoAppRender.ContentPaneSync = Core.extend(EchoRender.ComponentSync, {

    $static: {
        DEFAULT_BACKGROUND: "#ffffff"
    },

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
            this._floatingPaneManager.addZIndexListener(Core.method(this, this._processZIndexChanged));
        }
        this._floatingPaneManager.add(child.renderId);
    },
    
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.position = "absolute";
        this._div.style.width = "100%";
        this._div.style.height = "100%";
        this._div.style.overflow = "hidden";
        this._div.style.zIndex = "0";
        EchoAppRender.Font.render(this.component.render("font"), this._div);
        EchoAppRender.Color.render(this.component.render("foreground"), this._div, "color");

        var background = this.component.render("background");
        var backgroundImage = this.component.render("backgroundImage");
        EchoAppRender.Color.render(background, this._div, "backgroundColor");
        EchoAppRender.FillImage.render(backgroundImage, this._div);
        if (!background && !backgroundImage) {
            EchoAppRender.FillImage.render(this.client.getResourceUrl("Echo", "resource/Transparent.gif"), this._div);  
        }
    
        this._childIdToElementMap = {};
        
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            this._renderAddChild(update, child);
        }
    
        // Store values of horizontal/vertical scroll such that 
        // renderDisplay() will adjust scrollbars appropriately after rendering.
        this._pendingScrollX = this.component.render("horizontalScroll");
        this._pendingScrollY = this.component.render("verticalScroll");
        
        parentElement.appendChild(this._div);
    },
    
    _renderAddChild: function(update, child) {
        var childDiv = document.createElement("div");
        this._childIdToElementMap[child.renderId] = childDiv;
        childDiv.style.position = "absolute";
        if (child.floatingPane) {
            childDiv.style.zIndex = "1";
        } else {
            var insets = this.component.render("insets", 0);
            var pixelInsets = EchoAppRender.Insets.toPixels(insets);
            childDiv.style.zIndex = "0";
            childDiv.style.left = pixelInsets.left + "px";
            childDiv.style.top = pixelInsets.top + "px";
            childDiv.style.bottom = pixelInsets.bottom + "px";
            childDiv.style.right = pixelInsets.right + "px";
            if (child.pane) {
                childDiv.style.overflow = "auto";
            } else {
                switch (this.component.render("overflow")) {
                case EchoApp.ContentPane.OVERFLOW_HIDDEN:
                    childDiv.style.overflow = "hidden";
                    break;
                case EchoApp.ContentPane.OVERFLOW_SCROLL:
                    childDiv.style.overflow = "scroll";
                    break;
                default:
                    childDiv.style.overflow = "auto";
                    break;
                }
            }
        }
        EchoRender.renderComponentAdd(update, child, childDiv);
        this._div.appendChild(childDiv);
        
        if (child.floatingPane) {
            this.raise(child);
        }
    },
    
    renderDispose: function(update) { 
        this._childIdToElementMap = null;
        this._div = null;
    },
    
    _renderRemoveChild: function(update, child) {
        if (child.floatingPane && this._floatingPaneManager) {
            this._floatingPaneManager.remove(child.renderId);
        }
        
        var childDiv = this._childIdToElementMap[child.renderId];
        childDiv.parentNode.removeChild(childDiv);
        delete this._childIdToElementMap[child.renderId];
    },
    
    renderDisplay: function() {
        var child = this._div.firstChild;
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
                        contentElement.scrollLeft = parseInt(this._pendingScrollX < 0) ? 1000000 : this._pendingScrollX;
                        this._pendingScrollX = null;
                    }
                    if (this._pendingScrollY) {
                        contentElement.scrollTop = parseInt(this._pendingScrollY) < 0 ? 1000000 : this._pendingScrollY;
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
            var element = this._div;
            var containerElement = element.parentNode;
            EchoRender.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }
        
        return fullRender;
    }
});
