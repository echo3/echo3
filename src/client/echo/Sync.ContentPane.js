/**
 * Component rendering peer: ContentPane
 */
Echo.Sync.ContentPane = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        DEFAULT_BACKGROUND: "#ffffff",
        
        /**
         * Sort method to order floating panes, first by z-index and then by position within container component.
         * Lower indices of sorted array should appear below higher indices.
         */
        _zIndexSort: function(a, b) {
            var aIndex = a.render("zIndex", 0);
            var bIndex = b.render("zIndex", 0);
            if (aIndex === bIndex) {
                return a.parent.indexOf(a) - b.parent.indexOf(b);
            } else {
                return aIndex - bIndex;
            }
        }
    },

    $load: function() {
        Echo.Render.registerPeer("ContentPane", this);
    },
    
    /**
     * Flag indicating floating pane state has changed (floating panes have been added).
     */
    _floatingPanesChanged: false,
    
    /**
     * Floating pane manager instance.
     * 
     * @type Echo.Sync.FloatingPaneManager
     */
    _floatingPaneManager: null,

    $construct: function() {
        this._floatingPaneManager = null;
    },
    
    /**
     * Returns array of floating panes, sorted first by z-index and then by position within container component.
     * Lower indices in returned array should appear below higher indices.
     */
    _getOrderedFloatingPanes: function() {
        var floatingPanes = [];
        for (var i = 0; i < this.component.children.length; ++i) {
            if (this.component.children[i].floatingPane) {
                floatingPanes.push(this.component.children[i]);
            }
        }
        floatingPanes.sort(Echo.Sync.ContentPane._zIndexSort);
        return floatingPanes;
    },
    
    /**
     * Processes a z-index change as reported by the floating pane manager.
     * Updates CSS style of floating pane DIV appropriately.
     */
    _processZIndexChanged: function(e) {
        for (var i = 0; i < this.component.children.length; ++i) {
            if (!this.component.children[i].floatingPane) {
                continue;
            }
            var index = this._floatingPaneManager.getIndex(this.component.children[i].renderId);
            var childElement = this._childIdToElementMap[this.component.children[i].renderId];
            if (childElement) {
                childElement.style.zIndex = index + 1;
                this.component.children[i].set("zIndex", index + 1);
            }
        }
    },
    
    raise: function(child) {
        this._floatingPaneManager.add(child.renderId);
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

        if (this._floatingPanesChanged) {
            this._updateFloatingPanes();
        }
    },

    _renderAddChild: function(update, child) {
        var childDiv = document.createElement("div");
        this._childIdToElementMap[child.renderId] = childDiv;
        childDiv.style.position = "absolute";
        if (child.floatingPane) {
            childDiv.style.zIndex = "1";
            childDiv.style.left = childDiv.style.top = 0;
            this._floatingPanesChanged = true;
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
        this._floatingPaneManager = null;
        this._childIdToElementMap = null;
        this._div = null;
    },
    
    _renderRemoveChild: function(update, child) {
        if (child.floatingPane && this._floatingPaneManager) {
            this._floatingPaneManager.remove(child.renderId);
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

            // FIXME experimental, nonfinal API
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

                if (this._floatingPanesChanged) {
                    this._updateFloatingPanes();
                }
            }
        }
        if (fullRender) {
            var element = this._div;
            var containerElement = element.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }
        
        return fullRender;
    },
    
    /**
     * Processes an update where floating panes have been added.
     */
    _updateFloatingPanes: function() {
        // Lazily-create floating pane manager.
        if (!this._floatingPaneManager) {
            this._floatingPaneManager = new Echo.Sync.FloatingPaneManager();
            this._floatingPaneManager.addZIndexListener(Core.method(this, this._processZIndexChanged));
        }

        // Retrieve z-index/child-index sorted floating panes.
        var floatingPanes = this._getOrderedFloatingPanes();
        for (i = 0; i < floatingPanes.length; ++i) {
            this._floatingPaneManager.add(floatingPanes[i].renderId);
        }
        
        // Update status flag as floating pane changes have been processed.
        this._floatingPanesChanged = false;
    }
});
