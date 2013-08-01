/**
 * Component rendering peer: ContentPane.
 * This class should not be extended by developers, the implementation is subject to change.
 * 
 * <h3>Exit Animations</h3>
 * 
 * <p>Child component peers may implement a <code>renderContentPaneRemove()</code> method if they desire to run
 * an "exit" animation.  If this method is provided, it will be used to determine if the child desires to play an exit
 * animation and if so, allow the child to begin executing the animation when the child is to be removed.  
 * The method must take the following form:</p>
 * <p><code>renderContentPaneRemove(element, completionMethod)</code></p>
 * <p>The first parameter, <code>element</code>, provides the DOM <code>Element</code> containing the child component</p>
 * <p>The second parameter,<code>completionMethod</code> is a function which the animator should call once the animation 
 * completes</p>
 * <p>If the <code>renderContentPaneRemove()</code> implementation determines that it will play an animation, it should return 
 * <code>true</code> and invoke the <code>completionMethod</code> when the animation completes.</p>
 * <p>If the <code>renderContentPaneRemove()</code> implementation determines that it will NOT play an animation, it should return
 * <code>false</code> and it should <strong>not invoke</strong> the <code>completionMethod</code>.</p>
 */
Echo.Sync.ContentPane = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("ContentPane", this);
    },
    
    /** 
     * Array of child floating panes components, organized by z-index. 
     * @type Array
     */
    _floatingPaneStack: null,
    
    /** 
     * Flag indicating that the rendered z-indices are not synchronized with the order of <code>_floatingPaneStack</code>.
     * @type Boolean
     */
    _zIndexRenderRequired: false,

    /** Constructor. */
    $construct: function() {
        this._floatingPaneStack = [];
    },
    
    /**
     * Returns the measured size of the content pane element.  Child floating pane (e.g. WindowPane) peers may invoke this 
     * method to determine dimensions in which such panes can be placed/moved.
     * 
     * @return a bounds object describing the measured size
     * @type Core.Web.Measure.Bounds
     */
    getSize: function() {
        return new Core.Web.Measure.Bounds(this._div);
    },
    
    /**
     * Raises a floating pane child to the top.
     * 
     * @param {Echo.Component} the child component to raise
     */
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
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        var i;
        
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.position = "absolute";
        this._div.style.width = "100%";
        this._div.style.height = "100%";
        this._div.style.overflow = "visible";
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

    /**
     * Renders the addition of a child component.
     * 
     * @param {Echo.Update.ComponentUpdate} the update
     * @param {Echo.Component} child the child component to add
     */
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
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
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
                                if (Core.Web.Env.ENGINE_MSHTML) {
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
                                if (Core.Web.Env.ENGINE_MSHTML) {
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

    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._childIdToElementMap = null;
        this._div = null;
    },
    
    /** 
     * Updates the rendered CSS z-index attribute of all floating panes based on their positions in 
     * <code>_floatingPaneStack.</code>. 
     */ 
    _renderFloatingPaneZIndices: function() {
        for (var i = 0; i < this._floatingPaneStack.length; ++i) {
            var childElement = this._childIdToElementMap[this._floatingPaneStack[i].renderId];
            childElement.style.zIndex = 3 + i;
        }
        this._zIndexRenderRequired = false;
    },

    /**
     * Renders the removal of a child component.
     * 
     * @param {Echo.Update.ComponentUpdate} the update
     * @param {Echo.Component} child the child component to remove
     */
    _renderRemoveChild: function(update, child) {
        if (child.floatingPane) {
            Core.Arrays.remove(this._floatingPaneStack, child);
        }
        
        var childDiv = this._childIdToElementMap[child.renderId];
        if (!childDiv) {
            // Child never rendered.
            return;
        }

        // Determine if child component would like to render removal effect (e.g., WindowPane fade).
        // If so, inform child to start effect, provide copmletion callback to perform removal operations.
        var selfRemove = false;
        if (child.peer.renderContentPaneRemove) {
            selfRemove = child.peer.renderContentPaneRemove(this._childIdToElementMap[child.renderId], 
                    Core.method(this, function() {
                        childDiv.parentNode.removeChild(childDiv);
                    })
            );
        }
        
        if (!selfRemove) {
            // Child will not render removal effect, remove immediately.
            childDiv.parentNode.removeChild(childDiv);
        }
        
        delete this._childIdToElementMap[child.renderId];
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
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
    
    /** Sets "zIndex" property on all child components based on their positions within the <code>_floatingPaneStack</code>. */
    _storeFloatingPaneZIndices: function() {
        for (var i = 0; i < this._floatingPaneStack.length; ++i) {
            this._floatingPaneStack[i].set("zIndex", i);
        }
    }
});
