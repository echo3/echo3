/**
 * Component rendering peer: ContentPane
 */
Echo.Sync.ContentPane = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        DEFAULT_BACKGROUND: "#ffffff"
    },

    $load: function() {
        Echo.Render.registerPeer("ContentPane", this);
    },
    
    /** Array of child floating panes components, organized by z-index. */
    _floatingPaneStack: null,
    
    /** Flag indicating that the rendered z-indices are not synchronized with the order of <code>_floatingPaneStack</code>. */
    _zIndexRenderRequired: false,

    $construct: function() {
        this._floatingPaneStack = [];
    },
    
    raise: function(child) {
        if (this._floatingPaneStack[this._floatingPaneStack.length - 1] == child) {
            // Already on top, do nothing.
            return;
        }
        Core.Arrays.remove(this._floatingPaneStack, child);
        this._floatingPaneStack.push(child);
        this._renderFloatingPaneZIndices();
        this._storeFloatingPaneZIndices();
    },
    
    renderAdd: function(update, parentElement) {
        var i;
        
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.position = "absolute";
        this._div.style.width = "100%";
        this._div.style.height = "100%";
        this._div.style.overflow = "hidden";
        this._div.style.zIndex = "0";
        
        Echo.Sync.renderComponentDefaults(this.component, this._div);

        var background = this.component.render("background");
        var backgroundImage = this.component.render("backgroundImage");
        Echo.Sync.FillImage.render(backgroundImage, this._div);
        
        if (!background && !backgroundImage) {
            Echo.Sync.FillImage.render(this.client.getResourceUrl("Echo", "resource/Transparent.gif"), this._div);  
        }
    
        this._childIdToElementMap = {};
        
        var componentCount = this.component.getComponentCount();
        for (i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            this._renderAddChild(update, child);
        }
    
        // Store values of horizontal/vertical scroll such that 
        // renderDisplay() will adjust scrollbars appropriately after rendering.
        this._pendingScrollX = this.component.render("horizontalScroll");
        this._pendingScrollY = this.component.render("verticalScroll");
        
        parentElement.appendChild(this._div);

        if (this._zIndexRenderRequired) {
            this._renderFloatingPaneZIndices();
        }
    },

    _renderAddChild: function(update, child) {
        var childDiv = document.createElement("div");
        this._childIdToElementMap[child.renderId] = childDiv;
        childDiv.style.position = "absolute";
        if (child.floatingPane) {
            var zIndex = child.render("zIndex");
            if (zIndex != null) {
                var added = false;
                var i = 0;
                
                while (i < this._floatingPaneStack.length && !added) {
                    var testZIndex = this._floatingPaneStack[i].render("zIndex");
                    if (testZIndex != null && testZIndex > zIndex) {
                        this._floatingPaneStack.splice(i, 0, child);
                        added = true;
                    }
                    ++i;
                }
                if (!added) {
                    this._floatingPaneStack.push(child);
                }
            } else {
                this._floatingPaneStack.push(child);
            }
            childDiv.style.zIndex = "1";
            childDiv.style.left = childDiv.style.top = 0;
            this._zIndexRenderRequired = true;
        } else {
            var insets = this.component.render("insets", 0);
            var pixelInsets = Echo.Sync.Insets.toPixels(insets);
            childDiv.style.zIndex = "0";
            childDiv.style.left = pixelInsets.left + "px";
            childDiv.style.top = pixelInsets.top + "px";
            childDiv.style.bottom = pixelInsets.bottom + "px";
            childDiv.style.right = pixelInsets.right + "px";
            if (child.pane) {
                childDiv.style.overflow = "hidden";
            } else {
                switch (this.component.render("overflow")) {
                case Echo.ContentPane.OVERFLOW_HIDDEN:
                    childDiv.style.overflow = "hidden";
                    break;
                case Echo.ContentPane.OVERFLOW_SCROLL:
                    childDiv.style.overflow = "scroll";
                    break;
                default:
                    childDiv.style.overflow = "auto";
                    break;
                }
            }
        }
        Echo.Render.renderComponentAdd(update, child, childDiv);
        this._div.appendChild(childDiv);
    },
    
    renderDispose: function(update) {
        this._childIdToElementMap = null;
        this._div = null;
    },
    
    _renderRemoveChild: function(update, child) {
        if (child.floatingPane) {
            Core.Arrays.remove(this._floatingPaneStack, child);
        }
        
        var childDiv = this._childIdToElementMap[child.renderId];
        if (!childDiv) {
            // Child never rendered.
            return;
        }
        childDiv.parentNode.removeChild(childDiv);
        delete this._childIdToElementMap[child.renderId];
    },
    
    renderDisplay: function() {
        var child = this._div.firstChild;
        while (child) {
            Core.Web.VirtualPosition.redraw(child);
            child = child.nextSibling;
        }
    
        // If a scrollbar adjustment has been requested by renderAdd, perform it.
        if (this._pendingScrollX || this._pendingScrollY) {
            var componentCount = this.component.getComponentCount();
            for (var i = 0; i < componentCount; ++i) {
                child = this.component.getComponent(i);
                if (!child.floatingPane) {
                    var contentElement = this._childIdToElementMap[child.renderId];
                    var position, percent;

                    // Adjust horizontal scroll position, if required.
                    if (this._pendingScrollX) {
                        var x = Echo.Sync.Extent.toPixels(this._pendingScrollX);
                        if (Echo.Sync.Extent.isPercent(this._pendingScrollX) || x < 0) {
                            percent = x < 0 ? 100 : parseInt(this._pendingScrollX, 10);
                            position = Math.round((contentElement.scrollWidth - contentElement.offsetWidth) * percent / 100);
                            if (position > 0) {
                                contentElement.scrollLeft = position;
                                if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
                                    // IE needs to be told twice.
                                    position = Math.round((contentElement.scrollWidth - contentElement.offsetWidth) * 
                                            percent / 100);
                                    contentElement.scrollLeft = position;
                                }
                            }
                        } else {
                            contentElement.scrollLeft = x;
                        }
                        this._pendingScrollX = null;
                    }

                    // Adjust vertical scroll position, if required.
                    if (this._pendingScrollY) {
                        var y = Echo.Sync.Extent.toPixels(this._pendingScrollY);
                        if (Echo.Sync.Extent.isPercent(this._pendingScrollY) || y < 0) {
                            percent = y < 0 ? 100 : parseInt(this._pendingScrollY, 10);
                            position = Math.round((contentElement.scrollHeight - contentElement.offsetHeight) * percent / 100);
                            if (position > 0) {
                                contentElement.scrollTop = position;
                                if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
                                    // IE needs to be told twice.
                                    position = Math.round((contentElement.scrollHeight - contentElement.offsetHeight) *
                                            percent / 100);
                                    contentElement.scrollTop = position;
                                }
                            }
                        } else {
                            contentElement.scrollTop = y;
                        }
                        this._pendingScrollY = null;
                    }
                    break;
                }
            }
        }
    },
    
    _renderFloatingPaneZIndices: function() {
        for (var i = 0; i < this._floatingPaneStack.length; ++i) {
            var childElement = this._childIdToElementMap[this._floatingPaneStack[i].renderId];
            childElement.style.zIndex = 2 + i;
        }
        this._zIndexRenderRequired = false;
    },

    renderUpdate: function(update) {
        var i, fullRender = false;
        if (update.hasUpdatedProperties() || update.hasUpdatedLayoutDataChildren()) {
            // Full render
            fullRender = true;
        } else {
            var removedChildren = update.getRemovedChildren();
            if (removedChildren) {
                // Remove children.
                for (i = 0; i < removedChildren.length; ++i) {
                    this._renderRemoveChild(update, removedChildren[i]);
                }
            }
            var addedChildren = update.getAddedChildren();

            update.renderContext.displayRequired = [];
            
            if (addedChildren) {
                // Add children.
                for (i = 0; i < addedChildren.length; ++i) {
                    if (!addedChildren[i].floatingPane) {
                        // Content updated: renderDisplay() invocation required on ContentPane itself.
                        update.renderContext.displayRequired = null;
                    }
                    this._renderAddChild(update, addedChildren[i], this.component.indexOf(addedChildren[i]));
                    if (update.renderContext.displayRequired) {
                        // If only floating panes are being updated, invoke renderDisplay() only on children.
                        update.renderContext.displayRequired.push(addedChildren[i]); 
                    }
                }

                if (this._zIndexRenderRequired) {
                    this._renderFloatingPaneZIndices();
                }
            }
        }
        if (fullRender) {
            this._floatingPaneStack = [];
            var element = this._div;
            var containerElement = element.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }
        
        return fullRender;
    },
    
    _storeFloatingPaneZIndices: function() {
        for (var i = 0; i < this._floatingPaneStack.length; ++i) {
            this._floatingPaneStack[i].set("zIndex", i);
        }
    }
});
