/**
 * Component rendering peer: SplitPane.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Echo.Sync.SplitPane = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        /**    
         * Describes the configuration of a child pane of the SplitPane,
         * including the child component and scroll bar positions.
         */
        ChildPane: Core.extend({
        
            /** 
             * Minimum pixel size of the child pane.
             * @type Number
             */
            minimumSize: 0,
            
            /** 
             * Maximum pixel size of the child pane.
             * @type Number
             */
            maximumSize: null,
            
            /**
             * The child pane <code>Echo.Component</code> instance.
             * @type Echo.Component
             */
            component: null,
            
            /**
             * The value of the child pane <code>Echo.Component</code>'s <code>layoutData</code> property.
             */
            layoutData: null,
            
            /** 
             * Horizontal scroll position, in pixels.
             * @type Number.
             */
            scrollLeft: 0,

            /** 
             * Vertical scroll position, in pixels.
             * @type Number.
             */
            scrollTop: 0,
            
            /** 
             * Flag indicating that scroll position should be reset on next renderDisplay() invocation.
             * @type Boolean
             */
            scrollRequired: false,
            
            /**
             * Flag indicating whether sizing information is permanent (fixed pixel-based) or variable (percent-based).
             * @type Boolean
             */
            _permanentSizes: false,
            
            /**
             * The SplitPane component rendering peer using this <code>ChildPane</code> object.
             * @type Echo.Sync.SplitPane
             */
            _peer: null,
        
            /**
             * Creates a new PaneConfiguration instance
             * 
             * @param {Echo.Sync.SplitPane} splitPanePeer the relevant componentPeer
             * @param {Echo.Component} component the child component
             */
            $construct: function(splitPanePeer, component) {
                this._peer = splitPanePeer;
                this.component = component;
                this.layoutData = component.render("layoutData");
            },
            
            /**
             * Load minimum and maximum separator positions for panes.
             */
            loadDisplayData: function() {
                if (this._permanentSizes) {
                    // Pane size constraints have been loaded for this ChildPane, and will not ever change
                    // (because they are pixel rather percent-based.
                    return;
                }
                
                var size;
                this._permanentSizes = true;
                if (this.layoutData) {
                    if (this.layoutData.minimumSize) {
                        if (Echo.Sync.Extent.isPercent(this.layoutData.minimumSize)) {
                            size = this._peer._getSize();
                            this.minimumSize = Math.round((this._peer._orientationVertical ? size.height : size.width) *
                                    parseInt(this.layoutData.minimumSize, 10) / 100);
                            this._permanentSizes = false;
                        } else {
                            this.minimumSize = Math.round(Echo.Sync.Extent.toPixels(this.layoutData.minimumSize, 
                                    !this._peer._orientationVertical));
                        }
                    }
                    if (this.layoutData.maximumSize) {
                        if (Echo.Sync.Extent.isPercent(this.layoutData.maximumSize)) {
                            size = this._peer._getSize();
                            this.maximumSize = Math.round((this._peer._orientationVertical ? size.height : size.width) *
                                    parseInt(this.layoutData.maximumSize, 10) / 100);
                            this._permanentSizes = false;
                        } else {
                            this.maximumSize = Math.round(Echo.Sync.Extent.toPixels(this.layoutData.maximumSize, 
                                    !this._peer._orientationVertical));
                        }
                    }
                }
            },
            
            /**
             * Update pane DIV element's scroll positions to reflect those stored in this object.
             *  
             * @param paneDiv the pane's DIV element
             */
            loadScrollPositions: function(paneDiv) {
                paneDiv.scrollLeft = this.scrollLeft;
                paneDiv.scrollTop = this.scrollTop;
            },
            
            /**
             * Retrieve scroll bar positions from pane DIV element and store in this object.
             * 
             * @param paneDiv the pane's DIV element
             */
            storeScrollPositions: function(paneDiv) {
                this.scrollLeft = paneDiv.scrollLeft;
                this.scrollTop = paneDiv.scrollTop;
            }
        })
    },

    $load: function() {
        Echo.Render.registerPeer("SplitPane", this);
    },

    /**
     * Array containing two PaneConfiguration instances, representing the state of each child pane.
     * @type Array
     */
    _childPanes: null,
    
    /**
     * Array containing the elements of the first and second child pane DIVs.  This array always has two elements.
     * @type Array
     */
    _paneDivs: null,
    
    /**
     * The rendered separator DIV element.
     * @type Element
     */
    _separatorDiv: null,
    
    /**
     * Flag indicating whether separator is to be automatically positioned.
     * @type Boolean
     */
    _autoPositioned: false,

    /**
     * Overlay DIV which covers other elements (such as IFRAMEs) when dragging which may otherwise suppress events.
     * @type Element
     */
    _overlay: null,
    
    /**
     * Flag indicating whether the renderDisplay() method must be invoked on this peer 
     * (and descendant component peers).
     * @type Number
     */
    _redisplayRequired: false,
    
    /**
     * The user's desired position of the separator.  This is the last
     * position to which the user dragged the separator or the last position
     * that the separator was explicitly set to.  This value may not be the
     * actual separator position, in cases where other constraints have
     * temporarily adjusted it.
     * This is value is retained such that if constraints are lifted, the 
     * separator position will return to where the user last preferred it.
     * 
     * @type Extent
     */
    _requested: null,
    
    /**
     * Current rendered separator position.
     * @type Number
     */
    _rendered: null,

    /**
     * Method reference to this._processSeparatorMouseMove().
     * @type Function
     */
    _processSeparatorMouseMoveRef: null,

    /**
     * Method reference to this._processSeparatorMouseUp().
     * @type Function
     */
    _processSeparatorMouseUpRef: null,

    /**
     * Flag indicating whether initial automatic sizing operation (which occurs on first invocation of 
     * <code>renderDisplay()</code> after <code>renderAdd()</code>) has been completed.
     * @type Boolean
     */
    _initialAutoSizeComplete: false,
    
    /**
     * The rendered size of the SplitPane outer DIV.  This value is lazily loaded by
     * _getSize(), thus it should always be retrieved by invoking _getSize().
     * This property will be cleared any time the size changes.
     */
    _size: null,

    /** Constructor. */
    $construct: function() {
        this._childPanes = [];
        this._paneDivs = [];
        this._processSeparatorMouseMoveRef = Core.method(this, this._processSeparatorMouseMove);
        this._processSeparatorMouseUpRef = Core.method(this, this._processSeparatorMouseUp);
    },
    
    /** Processes a key press event. */
    clientKeyDown: function(e) {
        var focusPrevious,
            focusedComponent,
            focusFlags,
            focusChild;
        switch (e.keyCode) {
        case 37:
        case 39:
            if (!this._orientationVertical) {
                focusPrevious = (e.keyCode == 37) ^ (!this._orientationTopLeft);
                focusedComponent = this.client.application.getFocusedComponent();
                if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                    focusFlags = focusedComponent.peer.getFocusFlags();
                    if ((focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_LEFT) || 
                            (!focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_RIGHT)) {
                        focusChild = this.client.application.focusManager.findInParent(this.component, focusPrevious);
                        if (focusChild) {
                            this.client.application.setFocusedComponent(focusChild);
                            Core.Web.DOM.preventEventDefault(e.domEvent);
                            return false;
                        }
                    }
                }
            }
            break;
        case 38:
        case 40:
            if (this._orientationVertical) {
                focusPrevious = (e.keyCode == 38) ^ (!this._orientationTopLeft);
                focusedComponent = this.client.application.getFocusedComponent();
                if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                    focusFlags = focusedComponent.peer.getFocusFlags();
                    if ((focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP) ||
                            (!focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN)) {
                        focusChild = this.client.application.focusManager.findInParent(this.component, focusPrevious);
                        if (focusChild) {
                            this.client.application.setFocusedComponent(focusChild);
                            Core.Web.DOM.preventEventDefault(e.domEvent);
                            return false;
                        }
                    }
                }
            }
            break;
        }
        return true;
    }, 
    
    /**
     * Converts a desired separator position into a render-able separator position that
     * complies with the SplitPane's separator bounds (miniumSize and maximumSize of child
     * component layout data).
     * 
     * @param {Number} position requested separator position
     * @return the bounded separator position
     * @type Number
     */
    _getBoundedSeparatorPosition: function(position) {
        if (this._childPanes[1]) {
            var totalSize = this._orientationVertical ? this._getSize().height : this._getSize().width;
            if (position > totalSize - this._childPanes[1].minimumSize - this._separatorSize) {
                position = totalSize - this._childPanes[1].minimumSize - this._separatorSize;
            } else if (this._childPanes[1].maximumSize != null
                    && position < totalSize - this._childPanes[1].maximumSize - this._separatorSize) {
                position = totalSize - this._childPanes[1].maximumSize - this._separatorSize;
            }
        }
        if (this._childPanes[0]) {
            if (position < this._childPanes[0].minimumSize) {
                position = this._childPanes[0].minimumSize;
            } else if (this._childPanes[0].maximumSize != null && position > this._childPanes[0].maximumSize) {
                position = this._childPanes[0].maximumSize;
            }
        }
        return position;
    },
    
    /**
     * Determines the number of pixels of inset margin specified in a layout data object.
     * Horizontal or vertical pixels will be analyzed based on the SplitPane's orientation.
     * The result of this method can be subtracted from the desired height or width of a pane
     * to determine the appropriate value to set for a CSS width/height attribute.
     * 
     * @param {Object} layoutData a component layout data object
     * @return the number of inset pixels
     * @type Number 
     */
    _getInsetsSizeAdjustment: function(position, layoutData) {
        if (!layoutData || layoutData.insets == null) {
            return 0;
        }
        var layoutDataInsets = Echo.Sync.Insets.toPixels(layoutData.insets);
        var adjustment;
        if (this._orientationVertical) {
            adjustment = layoutDataInsets.top + layoutDataInsets.bottom;
        } else {
            adjustment = layoutDataInsets.left + layoutDataInsets.right;
        }
        if (position != null && adjustment > position) {
            adjustment = position;
        }
        return adjustment;
    },
    
    /**
     * Calculates the preferred rendered size of the SplitPane by measuring the sizes of its content and/or
     * invoking getPreferredSize() on its content (if supported).
     * 
     * @see Echo.Render.ComponnetSync#getPreferredSize
     */
    getPreferredSize: function(dimension) {
        if (this.component.children.length === 0) {
            return null;
        }
        
        var bounds, insets, layoutData;
        
        dimension = dimension || (Echo.Render.ComponentSync.SIZE_WIDTH | Echo.Render.ComponentSync.SIZE_HEIGHT);        

        // Determine size of pane 0.
        var size0;
        if (this.component.children[0].peer.getPreferredSize) {
            // Use getPreferredSize() if available.
            size0 = this.component.children[0].peer.getPreferredSize(dimension);
        } else if (!this.component.children[0].pane && (dimension & Echo.Render.ComponentSync.SIZE_HEIGHT) &&
                this._paneDivs[0].firstChild) {
            // Measure height of non-pane child (assuming height is being requested).
            bounds = new Core.Web.Measure.Bounds(this._paneDivs[0].firstChild);
            size0 = { height: bounds.height === 0 ? null : bounds.height };
            if (size0.height) {
                layoutData = this.component.children[0].render("layoutData");
                if (layoutData && layoutData.insets) {
                    insets = Echo.Sync.Insets.toPixels(layoutData.insets);
                    size0.height += insets.top + insets.bottom;
                }
            }
        } else {
            // Pane 0 cannot be measured.
            size0 = { };
        }

        // Determine size of pane 1.
        var size1;
        if (this.component.children.length == 1) {
            // Pane 1 does not exist.
            size1 = { width: 0, height: 0 };
        } else if (this.component.children[1].peer.getPreferredSize) {
            // Use getPreferredSize() if available.
            size1 = this.component.children[1].peer.getPreferredSize(dimension);
        } else if (!this.component.children[1].pane && (dimension & Echo.Render.ComponentSync.SIZE_HEIGHT) &&
                this._paneDivs[1].firstChild) {
            // Measure height of non-pane child (assuming height is being requested).
            bounds = new Core.Web.Measure.Bounds(this._paneDivs[1].firstChild);
            size1 = { height: bounds.height === 0 ? null : bounds.height };
            if (size1.height) {
                layoutData = this.component.children[1].render("layoutData");
                if (layoutData && layoutData.insets) {
                    insets = Echo.Sync.Insets.toPixels(layoutData.insets);
                    size1.height += insets.top + insets.bottom;
                }
            }
        } else {
            // Pane 1 cannot be measured.
            size1 = { };
        }
        
        var height = null;
        if ((dimension & Echo.Render.ComponentSync.SIZE_HEIGHT) && size0.height != null && size1.height != null) {
            if (this._orientationVertical) {
                // Measure height of vertical SplitPane: sum pane heights and separator.
                height = size0.height + size1.height + this._separatorSize;
            } else {
                // Measure height of horizontal SplitPane: use maximum pane height.
                height = size0.height > size1.height ? size0.height : size1.height;
            }
        }
        
        var width = null;
        if ((dimension & Echo.Render.ComponentSync.SIZE_WIDTH) && size0.width != null && size1.width != null) {
            if (this._orientationVertical) {
                // Measure width of vertical SplitPane: use maximum pane width.
                width = size0.width > size1.width ? size0.width : size1.width;
            } else {
                // Measure width of horizontal SplitPane: sum pane widths and separator.
                width = size0.width + size1.width + this._separatorSize;
            }
        }
        
        return { height: height, width: width };
    },
    
    /**
     * Retrieves the (potentially cached) dimensions of the SplitPane outer DIV.
     * 
     * @return the dimensions
     * @type Core.Web.Measure.Bounds
     */
    _getSize: function() {
        if (!this._size) {
            this._size = new Core.Web.Measure.Bounds(this._splitPaneDiv);
        }
        return this._size;
    },
    
    /**
     * Determines if the specified update has caused either child of the SplitPane to
     * be relocated (i.e., a child which existed before continues to exist, but at a
     * different index).
     * 
     * @param {Echo.Update.ComponentUpdate} update the component update
     * @return true if a child has been relocated
     * @type Boolean
     */
    _hasRelocatedChildren: function(update) {
        var oldChild0 = this._childPanes[0] ? this._childPanes[0].component : null; 
        var oldChild1 = this._childPanes[1] ? this._childPanes[1].component : null; 
        var childCount = this.component.getComponentCount();
        var newChild0 = childCount > 0 ? this.component.getComponent(0) : null;
        var newChild1 = childCount > 1 ? this.component.getComponent(1) : null;
        return (oldChild0 != null && oldChild0 == newChild1) || 
                (oldChild1 != null && oldChild1 == newChild0);
    },

    /**
     * Retrieves properties from Echo.SplitPane component instances and
     * stores them in local variables in a format more convenient for processing
     * by this synchronization peer.
     */
    _loadRenderData: function() {
        var orientation = this.component.render("orientation", 
                Echo.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING);
        
        switch (orientation) {
        case Echo.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING:
            this._orientationTopLeft = this.component.getRenderLayoutDirection().isLeftToRight();
            this._orientationVertical = false;
            break;
        case Echo.SplitPane.ORIENTATION_HORIZONTAL_TRAILING_LEADING:
            this._orientationTopLeft = !this.component.getRenderLayoutDirection().isLeftToRight();
            this._orientationVertical = false;
            break;
        case Echo.SplitPane.ORIENTATION_HORIZONTAL_LEFT_RIGHT:
            this._orientationTopLeft = true;
            this._orientationVertical = false;
            break;
        case Echo.SplitPane.ORIENTATION_HORIZONTAL_RIGHT_LEFT:
            this._orientationTopLeft = false;
            this._orientationVertical = false;
            break;
        case Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM:
            this._orientationTopLeft = true;
            this._orientationVertical = true;
            break;
        case Echo.SplitPane.ORIENTATION_VERTICAL_BOTTOM_TOP:
            this._orientationTopLeft = false;
            this._orientationVertical = true;
            break;
        default:
            throw new Error("Invalid orientation: " + orientation);
        }

        this._resizable = this.component.render("resizable");
        this._autoPositioned = this.component.render("autoPositioned");
        this._requested = this.component.render("separatorPosition");
        
        var defaultSeparatorSize = this._resizable ? Echo.SplitPane.DEFAULT_SEPARATOR_SIZE_RESIZABLE : 
                Echo.SplitPane.DEFAULT_SEPARATOR_SIZE_FIXED;
        var separatorSizeExtent = this.component.render(
                this._orientationVertical ? "separatorHeight" : "separatorWidth", defaultSeparatorSize);
        this._separatorSize = Echo.Sync.Extent.toPixels(separatorSizeExtent, this._orientationVertical);
        if (this._separatorSize == null) {
            this._separatorSize = defaultSeparatorSize;
        }
        this._separatorVisible = this._resizable || (this.component.render("separatorVisible", true) && this._separatorSize > 0);
        if (!this._separatorVisible) {
            this._separatorSize = 0;
        }
        
        if (this._separatorSize > 0) {
            this._separatorColor = this.component.render("separatorColor", Echo.SplitPane.DEFAULT_SEPARATOR_COLOR); 
            this._separatorRolloverColor = this.component.render("separatorRolloverColor") || 
                    Echo.Sync.Color.adjust(this._separatorColor, 0x20, 0x20, 0x20);
            
            this._separatorImage = this.component.render(this._orientationVertical ? 
                    "separatorVerticalImage" : "separatorHorizontalImage");
            this._separatorRolloverImage = this.component.render(this._orientationVertical ? 
                    "separatorVerticalRolloverImage" : "separatorHorizontalRolloverImage");
        }
    },
    
    /**
     * Adds an overlay DIV at maximum z-index to cover any objects that will not provide move mouseup freedback.
     * @see #_overlayRemove
     */ 
    _overlayAdd: function() {
        if (this._overlay) {
            return;
        }
        this._overlay = document.createElement("div");
        this._overlay.style.cssText = "position:absolute;z-index:32600;width:100%;height:100%;";
        Echo.Sync.FillImage.render(this.client.getResourceUrl("Echo", "resource/Transparent.gif"), this._overlay);
        document.body.appendChild(this._overlay);
    },
    
    /**
     * Removes the overlay DIV.
     * @see #_overlayAdd
     */
    _overlayRemove: function() {
        if (!this._overlay) {
            return;
        }
        document.body.removeChild(this._overlay);
        this._overlay = null;
    },
    
    /** Processes a mouse down event on a SplitPane separator that is about to be dragged. */
    _processSeparatorMouseDown: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
    
        Core.Web.DOM.preventEventDefault(e);
        
        Core.Web.dragInProgress = true;
    
        this._dragInitPosition = this._rendered;
        if (this._orientationVertical) {
            this._dragInitMouseOffset = e.clientY;
        } else {
            this._dragInitMouseOffset = e.clientX;
        }
        
        Core.Web.Event.add(document.body, "mousemove", this._processSeparatorMouseMoveRef, true);
        Core.Web.Event.add(document.body, "mouseup", this._processSeparatorMouseUpRef, true);
        this._overlayAdd();
    },
    
    /** Processes a mouse move event on a SplitPane separator that is being dragged. */
    _processSeparatorMouseMove: function(e) {
        var mousePosition = this._orientationVertical ? e.clientY : e.clientX;
        this._rendered = this._getBoundedSeparatorPosition(this._orientationTopLeft ?
                this._dragInitPosition + mousePosition - this._dragInitMouseOffset :
                this._dragInitPosition - mousePosition + this._dragInitMouseOffset);
        this._redraw(this._rendered);
    },
    
    /** Processes a mouse up event on a SplitPane separator that was being dragged. */
    _processSeparatorMouseUp: function(e) {
        Core.Web.DOM.preventEventDefault(e);
        
        this._overlayRemove();
        Core.Web.dragInProgress = false;
    
        this._removeSeparatorListeners();
        this.component.set("separatorPosition", this._rendered);
        
        // Inform renderer that separator position is currently drawn as this._rendered.
        this._requested = this._rendered;
    
        if (this._paneDivs[0]) {
            Core.Web.VirtualPosition.redraw(this._paneDivs[0]);
        }
        if (this._paneDivs[1]) {
            Core.Web.VirtualPosition.redraw(this._paneDivs[1]);
        }
    
        Echo.Render.notifyResize(this.component);
    },
    
    /** Processes a mouse rollover enter event on the SplitPane separator. */
    _processSeparatorRolloverEnter: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        
        if (this._separatorRolloverImage) {
            Echo.Sync.FillImage.render(this._separatorRolloverImage, this._separatorDiv, 0);
        } else {
            Echo.Sync.Color.render(this._separatorRolloverColor, this._separatorDiv, "backgroundColor");
        }
    },
    
    /** Processes a mouse rollover exit event on the SplitPane separator. */
    _processSeparatorRolloverExit: function(e) {
        if (this._separatorRolloverImage) {
            Echo.Sync.FillImage.renderClear(this._separatorImage, this._separatorDiv, 0);
        } else {
            Echo.Sync.Color.render(this._separatorColor, this._separatorDiv, "backgroundColor");
        }
    },
    
    /**
     * Updates the variable CSS attributes of the SplitPane.
     * 
     * @param {Number} position the pixel position of the separator
     */
    _redraw: function(position) {
        var insetsAdjustment = 0;
        if (this.component.getComponentCount() > 0) {
            var layoutData = this.component.getComponent(0).render("layoutData");
            insetsAdjustment = this._getInsetsSizeAdjustment(position, layoutData);
        }

        var sizeAttr = this._orientationVertical ? "height" : "width";
        var positionAttr = this._orientationVertical ?
                (this._orientationTopLeft ? "top" : "bottom") :
                (this._orientationTopLeft ? "left" : "right");
        if (this._paneDivs[0]) {
            this._paneDivs[0].style[sizeAttr] = (position - insetsAdjustment) + "px";
        }
        if (this._paneDivs[1]) {
            this._paneDivs[1].style[positionAttr] =  (position + this._separatorSize) + "px";
        }
        if (this._separatorDiv) {
            this._separatorDiv.style[positionAttr] = position + "px";
        }
    },
    
    /**
     * Removes listeners from the separator used to monitor its state while it is being dragging.
     */
    _removeSeparatorListeners: function() {
        Core.Web.Event.remove(document.body, "mousemove", this._processSeparatorMouseMoveRef, true);
        Core.Web.Event.remove(document.body, "mouseup", this._processSeparatorMouseUpRef, true);
    },
    
    /**
     * Adds basic structure of SplitPane to DOM, but much work is delayed for initial invocation
     * of renderDisplay().
     * @see Echo.Render.ComponentSync#renderAdd
     */
    renderAdd: function(update, parentElement) {
        this._initialAutoSizeComplete = false;
        this._loadRenderData();

        var childCount = this.component.getComponentCount();
        if (childCount > 2) {
            throw new Error("Cannot render SplitPane with more than two child components.");
        }
        var child0 = childCount < 1 ? null : this.component.getComponent(0);
        var child1 = childCount < 2 ? null : this.component.getComponent(1);
    
        this._splitPaneDiv = document.createElement("div");
        this._splitPaneDiv.id = this.component.renderId;
        this._splitPaneDiv.style.cssText = "position:absolute;overflow:hidden;top:0;left:0;right:0;bottom:0;";
        
        Echo.Sync.renderComponentDefaults(this.component, this._splitPaneDiv);
        
        if (this._separatorVisible) {
            this._separatorDiv = document.createElement("div");
            this._separatorDiv.style.cssText = "position:absolute;font-size:1px;line-height:0;z-index:2;";
            Echo.Sync.Color.render(this._separatorColor, this._separatorDiv, "backgroundColor");
    
            var resizeCursor = null;
            if (this._orientationVertical) {
                resizeCursor = this._orientationTopLeft ? "s-resize" : "n-resize";
                this._separatorDiv.style.width = "100%";
                this._separatorDiv.style.height = this._separatorSize + "px";
                Echo.Sync.FillImage.render(this._separatorImage, this._separatorDiv, 0);
            } else {
                resizeCursor = this._orientationTopLeft ? "e-resize" : "w-resize";
                this._separatorDiv.style.height = "100%";
                this._separatorDiv.style.width = this._separatorSize + "px";
                Echo.Sync.FillImage.render(this._separatorImage, this._separatorDiv, 0);
            }
            if (this._resizable && resizeCursor) {
                this._separatorDiv.style.cursor = resizeCursor;
            }
            this._splitPaneDiv.appendChild(this._separatorDiv);
        } else {
            this._separatorDiv = null;
        }
        
        for (var i = 0; i < childCount && i < 2; ++i) {
            var child = this.component.getComponent(i);
            this._renderAddChild(update, child, i);
        }
        
        parentElement.appendChild(this._splitPaneDiv);
        
        if (this._resizable) {
            Core.Web.Event.add(this._separatorDiv, "mousedown", 
                    Core.method(this, this._processSeparatorMouseDown), false);
            Core.Web.Event.add(this._separatorDiv, "mouseover", 
                    Core.method(this, this._processSeparatorRolloverEnter), false);
            Core.Web.Event.add(this._separatorDiv, "mouseout", 
                    Core.method(this, this._processSeparatorRolloverExit), false);
        }
    },
    
    /**
     * Renders the addition of a child.
     * 
     * @param {Echo.Update.ComponentUpdate} update the update
     * @param {Echo.Component} child the added child
     * @param {Number} index the index of the child within the SplitPane 
     */
    _renderAddChild: function(update, child, index) {
        var childIndex = this.component.indexOf(child);
        var paneDiv = document.createElement("div");
        this._paneDivs[index] = paneDiv;
        
        paneDiv.style.cssText = "position: absolute; overflow: auto; z-index: 1;";
        
        var layoutData = child.render("layoutData");
        if (layoutData) {
            Echo.Sync.Alignment.render(layoutData.alignment, paneDiv, false, this.component);
            Echo.Sync.Color.render(layoutData.background, paneDiv, "backgroundColor");
            Echo.Sync.FillImage.render(layoutData.backgroundImage, paneDiv);
            if (!child.pane) {
                Echo.Sync.Insets.render(layoutData.insets, paneDiv, "padding");
                switch (layoutData.overflow) {
                case Echo.SplitPane.OVERFLOW_HIDDEN:
                    paneDiv.style.overflow = "hidden";
                    break;
                case Echo.SplitPane.OVERFLOW_SCROLL:
                    paneDiv.style.overflow = "scroll";
                    break;
                }
            }
        }
        if (child.pane) {
            paneDiv.style.overflow = "hidden";
        }
                
        // Set static CSS positioning attributes on pane DIV.
        if (this._orientationVertical) {
            paneDiv.style.left = 0;
            paneDiv.style.right = 0;
            if ((this._orientationTopLeft && index === 0) || (!this._orientationTopLeft && index == 1)) {
                paneDiv.style.top = 0;
            } else {
                paneDiv.style.bottom = 0;
            }
        } else {
            paneDiv.style.top = "0";
            paneDiv.style.bottom = "0";
            if ((this._orientationTopLeft && index === 0) || (!this._orientationTopLeft && index == 1)) {
                paneDiv.style.left = 0;
            } else {
                paneDiv.style.right = 0;
            }
        }
        
        Echo.Render.renderComponentAdd(update, child, paneDiv);
        this._splitPaneDiv.appendChild(paneDiv);
    
        if (this._childPanes[index] && this._childPanes[index].component == child) {
            this._childPanes[index].scrollRequired = true;
        } else {
            this._childPanes[index] = new Echo.Sync.SplitPane.ChildPane(this, child);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._splitPaneDiv);
        Core.Web.VirtualPosition.redraw(this._paneDivs[0]);
        Core.Web.VirtualPosition.redraw(this._paneDivs[1]);

        this._size = null;
        
        if (this._childPanes[0]) {
            this._childPanes[0].loadDisplayData();
        }
        if (this._childPanes[1]) {
            this._childPanes[1].loadDisplayData();
        }

        var position = this._requested;
        
        if (position == null && this._autoPositioned && this._paneDivs[0]) {
            // Automatic sizing requested: set separator and pane 1 positions to be adjacent to browser's 
            // rendered size of pane 0.

            if (this.component.children[0].peer.getPreferredSize) {
                // Query child 0 component for preferred size if available.
                var prefSize = this.component.children[0].peer.getPreferredSize(
                        this._orientationVertical ? Echo.Render.ComponentSync.SIZE_HEIGHT : Echo.Render.ComponentSync.SIZE_WIDTH);
                position = prefSize ? (this._orientationVertical ? prefSize.height : prefSize.width) : null;
            }
            
            if (position == null && this._orientationVertical && !this.component.children[0].pane) {
                // Automatically position vertical SplitPane based on height of non-pane child 0.
                this._paneDivs[0].style.height = "";
                var bounds0 = new Core.Web.Measure.Bounds(this._paneDivs[0]);
                position = bounds0.height;
            }

            if (position != null && !this._initialAutoSizeComplete) {
                // If position was successfully set, perform initial operations related to automatic sizing 
                // (executed on first renderDisplay() after renderAdd()).
                this._initialAutoSizeComplete = true;
                var imageListener = Core.method(this, function() {
                    if (this.component) { // Verify component still registered.
                        Echo.Render.renderComponentDisplay(this.component);
                    }
                });
                Core.Web.Image.monitor(this._paneDivs[0], imageListener);
            }
        }

        if (position == null) {
            // Use default separator position if none has been provided at this point.
            position = Echo.SplitPane.DEFAULT_SEPARATOR_POSITION;
        }

        if (Echo.Sync.Extent.isPercent(position)) {
            // Convert percent position to integer value.
            var totalSize = this._orientationVertical ? this._getSize().height : this._getSize().width;
            position = Math.round((parseInt(position, 10) / 100) * totalSize);
        } else {
            // Convert non-percent extent position to integer position.
            position = Math.round(Echo.Sync.Extent.toPixels(position, !this._orientationVertical));
        }
        
        // Constrain position and assign as rendered position.
        this._rendered = this._getBoundedSeparatorPosition(position);
        
        // Redraw dynamic elements of SplitPane.
        this._redraw(this._rendered);
        
        // IE Virtual positioning updates.
        Core.Web.VirtualPosition.redraw(this._paneDivs[0]);
        Core.Web.VirtualPosition.redraw(this._paneDivs[1]);

        // Update scroll bar positions for scenario where pane has been disposed and redrawn.
        for (var i = 0; i < this._childPanes.length; ++i) {
            if (this._childPanes[i] && this._childPanes[i].scrollRequired && this._paneDivs[i]) {
                this._childPanes[i].loadScrollPositions(this._paneDivs[i]);
                this._childPanes[i].scrollRequired = false;
            }
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        this._overlayRemove();

        for (var i = 0; i < 2; ++i) {
            if (this._paneDivs[i]) {
                if (this._childPanes[i]) {
                    this._childPanes[i].storeScrollPositions(this._paneDivs[i]);
                }
                this._paneDivs[i] = null;
            }
        }
        
        if (this._separatorDiv) {
            Core.Web.Event.removeAll(this._separatorDiv);
            this._separatorDiv = null;
        }

        Core.Web.Event.removeAll(this._splitPaneDiv);
    
        this._splitPaneDiv = null;
    },
    
    /**
     * Renders the removal a single child component.
     * 
     * @param {Echo.Update.ComponentUpdate} update the update
     * @param {Echo.Component} child the removed child
     */
    _renderRemoveChild: function(update, child) {
        var index;
        if (this._childPanes[0] && this._childPanes[0].component == child) {
            index = 0;
        } else if (this._childPanes[1] && this._childPanes[1].component == child) {
            index = 1;
        } else {
            // Do nothing (component was never rendered within the SplitPane).
            return;
        }

        this._childPanes[index] = null;
        
        Core.Web.DOM.removeNode(this._paneDivs[index]);
        this._paneDivs[index] = null;
    },
        
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var fullRender = false,
            i;
        
        if (this._hasRelocatedChildren()) {
            fullRender = true;
        } else if (update.hasUpdatedProperties() || update.hasUpdatedLayoutDataChildren()) {
            if (update.isUpdatedPropertySetIn({ separatorPosition: true })) {
                this._requested = this.component.render("separatorPosition");
            } else {
                fullRender = true;
            }
        }
        
        if (!fullRender && (update.hasAddedChildren() || update.hasRemovedChildren())) {
            var removedChildren = update.getRemovedChildren();
            if (removedChildren) {
                // Remove children.
                for (i = 0; i < removedChildren.length; ++i) {
                    this._renderRemoveChild(update, removedChildren[i]);
                }
            }
            var addedChildren = update.getAddedChildren();
            if (addedChildren) {
                // Add children.
                for (i = 0; i < addedChildren.length; ++i) {
                    this._renderAddChild(update, addedChildren[i], this.component.indexOf(addedChildren[i])); 
                }
            }
        }
        
        if (fullRender) {
            var element = this._splitPaneDiv;
            var containerElement = element.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }
        
        return fullRender;
    }
});
