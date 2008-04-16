/**
 * Component rendering peer: SplitPane
 */
Echo.Sync.SplitPane = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        /**    
         * @class Describes the configuration of a child pane of the SplitPane,
         *        including the child component and scroll bar positions.
         */
        ChildPane: Core.extend({
        
            minimumSize: null,
            maximumSize: null,
            component: null,
            layoutData: null,
            scrollLeft: 0,
            scrolltop: 0,
        
            /**
             * Creates a new PaneConfiguration instance
             * 
             * @param {Echo.Sync.SplitPane} splitPanePeer the relevant componentPeer
             * @param {Echo.Component} component the child component
             */
            $construct: function(splitPanePeer, component) {
                this.component = component;
                this.layoutData = component.render("layoutData");
                if (this.layoutData) {
                    if (this.layoutData.minimumSize) {
                        this.minimumSize = Echo.Sync.Extent.toPixels(this.layoutData.minimumSize, 
                                !splitPanePeer._orientationVertical);
                    }
                    if (this.layoutData.maximumSize) {
                        this.maximumSize = Echo.Sync.Extent.toPixels(this.layoutData.maximumSize, 
                                !splitPanePeer._orientationVertical);
                    }
                }
            },
            
            loadScrollPositions: function(paneDiv) {
                paneDiv.scrollLeft = this.scrollLeft;
                paneDiv.scrollTop = this.scrollTop;
            },
            
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
    _paneDivs: null,
    _separatorDiv: null,
    
    /**
     * The user's desired position of the separator.  This is the last
     * position to which the user dragged the separator or the last position
     * that the separator was explicitly set to.  This value may not be the
     * actual separator position, in cases where other constraints have
     * temporarily adjusted it.
     * @type Integer
     */
    _requested: null,
    
    /**
     * Current rendered separator position.
     */
    _rendered: null,

    _processSeparatorMouseMoveRef: null,
    
    _processSeparatorMouseUpRef: null,

    $construct: function() {
        this._childPanes = new Array(2);
        this._paneDivs = new Array(2);
        this._processSeparatorMouseMoveRef = Core.method(this, this._processSeparatorMouseMove);
        this._processSeparatorMouseUpRef = Core.method(this, this._processSeparatorMouseUp);
    },

    loadRenderData: function() {
        var orientation = this.component.render("orientation", 
                Echo.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING);
        // FIXME: RTL is hardcoded to false.
        var rtl = false;
     
        switch (orientation) {
        case Echo.SplitPane.ORIENTATION_HORIZONTAL_LEADING_TRAILING:
            this._orientationTopLeft = !rtl;
            this._orientationVertical = false;
            break;
        case Echo.SplitPane.ORIENTATION_HORIZONTAL_TRAILING_LEADING:
            this._orientationTopLeft = rtl;
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
        this._requested = this.component.render("separatorPosition", Echo.SplitPane.DEFAULT_SEPARATOR_POSITION);
        this._separatorUpdateRequired = true;
        this._separatorSize = Echo.Sync.Extent.toPixels(this.component.render(
                this._orientationVertical ? "separatorHeight" : "separatorWidth",
                this._resizable ? Echo.SplitPane.DEFAULT_SEPARATOR_SIZE_RESIZABLE 
                : Echo.SplitPane.DEFAULT_SEPARATOR_SIZE_FIXED), this._orientationVertical);
    },
    
    _processKeyPress: function(e) {
        switch (e.keyCode) {
        case 37:
        case 39:
            if (!this._orientationVertical) {
                var focusPrevious = (e.keyCode == 37) ^ (!this._orientationTopLeft);
                var focusedComponent = this.component.application.getFocusedComponent();
                if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                    var focusFlags = focusedComponent.peer.getFocusFlags();
                    if ((focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_LEFT)
                            || (!focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_RIGHT)) {
                        var focusChild = this.component.application.focusManager.findInParent(this.component, focusPrevious);
                        if (focusChild) {
                            this.component.application.setFocusedComponent(focusChild);
                            Core.Web.DOM.preventEventDefault(e);
                            return false;
                        }
                    }
                }
            }
            break;
        case 38:
        case 40:
            if (this._orientationVertical) {
                var focusPrevious = (e.keyCode == 38) ^ (!this._orientationTopLeft);
                var focusedComponent = this.component.application.getFocusedComponent();
                if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                    var focusFlags = focusedComponent.peer.getFocusFlags();
                    if ((focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP)
                            || (!focusPrevious && focusFlags & Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN)) {
                        var focusChild = this.component.application.focusManager.findInParent(this.component, focusPrevious);
                        if (focusChild) {
                            this.component.application.setFocusedComponent(focusChild);
                            Core.Web.DOM.preventEventDefault(e);
                            return false;
                        }
                    }
                }
            }
            break;
        }
        return true;
    }, 
    
    _processSeparatorMouseDown: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return;
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
    },
    
    _processSeparatorMouseMove: function(e) {
        var mousePosition = this._orientationVertical ? e.clientY : e.clientX;
        this._setSeparatorPosition(this._orientationTopLeft
                ? this._dragInitPosition + mousePosition - this._dragInitMouseOffset
                : this._dragInitPosition - mousePosition + this._dragInitMouseOffset);
    },
    
    _processSeparatorMouseUp: function(e) {
        Core.Web.DOM.preventEventDefault(e);
        
        Core.Web.dragInProgress = false;
    
        this._removeSeparatorListeners();
        this.component.set("separatorPosition", this._rendered);
        
        // inform renderer that separatorposition is currently drawn as this._rendered
        
        this._requested = this._rendered;
    
        if (this._paneDivs[0]) {
            Core.Web.VirtualPosition.redraw(this._paneDivs[0]);
        }
        if (this._paneDivs[1]) {
            Core.Web.VirtualPosition.redraw(this._paneDivs[1]);
        }
    
        Echo.Render.notifyResize(this.component);
    },
    
    _getInsetsSizeAdjustment: function(layoutData) {
        if (!layoutData || layoutData.insets == null || layoutDataInsets == 0) {
            return 0;
        }
        var layoutDataInsets = Echo.Sync.Insets.toPixels(layoutData.insets);
        var adjustment;
        if (this._orientationVertical) {
            adjustment = layoutDataInsets.top + layoutDataInsets.bottom;
        } else {
            adjustment = layoutDataInsets.left + layoutDataInsets.right;
        }
        if (adjustment > this._rendered) {
            adjustment = this._rendered;
        }
        return adjustment;
    },
    
    _hasRelocatedChildren: function(update) {
        var oldChild0 = this._childPanes[0] ? this._childPanes[0].component : null; 
        var oldChild1 = this._childPanes[1] ? this._childPanes[1].component : null; 
        var childCount = this.component.getComponentCount();
        var newChild0 = childCount > 0 ? this.component.getComponent(0) : null;
        var newChild1 = childCount > 1 ? this.component.getComponent(1) : null;
        return (oldChild0 != null && oldChild0 == newChild1) 
                || (oldChild1 != null && oldChild1 == newChild0);
    },
    
    _redraw: function() {
        var insetsAdjustment = 0;
        if (this.component.getComponentCount() > 0) {
            var layoutData = this.component.getComponent(0).render("layoutData");
            insetsAdjustment = this._getInsetsSizeAdjustment(layoutData);
        }

        var sizeAttr = this._orientationVertical ? "height" : "width";
        var positionAttr = this._orientationVertical
                ? (this._orientationTopLeft ? "top" : "bottom")
                : (this._orientationTopLeft ? "left" : "right");
        this._redrawItem(this._paneDivs[0], sizeAttr, (this._rendered - insetsAdjustment) + "px");
        this._redrawItem(this._paneDivs[1], positionAttr, (this._rendered + this._separatorSize) + "px");
        this._redrawItem(this._separatorDiv, positionAttr, this._rendered + "px");
    },
    
    _redrawItem: function(element, styleProperty, newValue) {
        if (element) {
            element.style[styleProperty] = newValue;
        }
    },
    
    _removeSeparatorListeners: function() {
        Core.Web.Event.remove(document.body, "mousemove", this._processSeparatorMouseMoveRef, true);
        Core.Web.Event.remove(document.body, "mouseup", this._processSeparatorMouseUpRef, true);
    },
    
    renderAdd: function(update, parentElement) {
        this.loadRenderData();

        var childCount = this.component.getComponentCount();
        if (childCount > 2) {
            throw new Error("Cannot render SplitPane with more than two child components.");
        }
        var child0 = childCount < 1 ? null : this.component.getComponent(0);
        var child1 = childCount < 2 ? null : this.component.getComponent(1);
    
        this._splitPaneDiv = document.createElement("div");
        this._splitPaneDiv.id = this.component.renderId;
        this._splitPaneDiv.style.cssText = "position:absolute;overflow:hidden;top:0;left:0;right:0;bottom:0;";
        
        Echo.Sync.Color.renderFB(this.component, this._splitPaneDiv);
        Echo.Sync.Font.render(this.component.render("font"), this._splitPaneDiv);
        
        if (this._separatorSize > 0) {
            this._separatorDiv = document.createElement("div");
            this._separatorDiv.style.cssText = "position:absolute;font-size:1px;line-height:0;z-index:2;";
            Echo.Sync.Color.render(this.component.render("separatorColor", Echo.SplitPane.DEFAULT_SEPARATOR_COLOR), 
                    this._separatorDiv, "backgroundColor");
    
            var resizeCursor = null;
            if (this._orientationVertical) {
                resizeCursor = this._orientationTopLeft ? "s-resize" : "n-resize";
                this._separatorDiv.style.width = "100%";
                this._separatorDiv.style.height = this._separatorSize + "px";
                Echo.Sync.FillImage.render(this.component.render("separatorVerticalImage"), this._separatorDiv, 0);
            } else {
                resizeCursor = this._orientationTopLeft ? "e-resize" : "w-resize";
                this._separatorDiv.style.height = "100%";
                this._separatorDiv.style.width = this._separatorSize + "px";
                Echo.Sync.FillImage.render(this.component.render("separatorHorizontalImage"), this._separatorDiv, 0);
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
        
        Core.Web.Event.add(this._splitPaneDiv, 
                Core.Web.Env.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress", 
                Core.method(this, this._processKeyPress), false);
                
        if (this._resizable) {
            Core.Web.Event.add(this._separatorDiv, "mousedown", 
                    Core.method(this, this._processSeparatorMouseDown), false);
        }
    },
    
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
            }
            switch (layoutData.overflow) {
            case Echo.SplitPane.OVERFLOW_HIDDEN:
                paneDiv.style.overflow = "hidden";
                break;
            case Echo.SplitPane.OVERFLOW_SCROLL:
                paneDiv.style.overflow = "scroll";
                break;
            }
        }
        
        var insetsAdjustment = this._getInsetsSizeAdjustment(layoutData);
        var renderingTopLeft = (index == 0 && this._orientationTopLeft) || (index != 0 && !this._orientationTopLeft);
                
        if (this._orientationVertical) {
            paneDiv.style.left = "0";
            paneDiv.style.right = "0";
            if (this._orientationTopLeft) {
                if (index == 0) {
                    paneDiv.style.top = "0";
                    paneDiv.style.height = (this._rendered - insetsAdjustment) + "px";
                } else {
                    paneDiv.style.top = (this._rendered + this._separatorSize) + "px";
                    paneDiv.style.bottom = "0";
                }
            } else {
                if (index == 0) {
                    paneDiv.style.bottom = "0";
                    paneDiv.style.height = (this._rendered - insetsAdjustment) + "px";
                } else {
                    paneDiv.style.top = "0";
                    paneDiv.style.bottom = (this._rendered + this._separatorSize) + "px";
                }
            }
        } else {
            paneDiv.style.top = "0";
            paneDiv.style.bottom = "0";
            if (this._orientationTopLeft) {
                if (index == 0) {
                    paneDiv.style.left = "0";
                    paneDiv.style.width = (this._rendered - insetsAdjustment) + "px";
                } else {
                    paneDiv.style.left = (this._rendered + this._separatorSize) + "px";
                    paneDiv.style.right = "0";
                }
            } else {
                if (index == 0) {
                    paneDiv.style.width = (this._rendered - insetsAdjustment) + "px";
                    paneDiv.style.right = "0";
                } else {
                    paneDiv.style.left = "0";
                    paneDiv.style.right = (this._rendered + this._separatorSize) + "px";
                }
            }
        }
        
        Echo.Render.renderComponentAdd(update, child, paneDiv);
        this._splitPaneDiv.appendChild(paneDiv);
    
        if (this._childPanes[index] && this._childPanes[index].component == child) {
            this._childPanes[index].loadScrollPositions(paneDiv);
        } else {
            this._childPanes[index] = new Echo.Sync.SplitPane.ChildPane(this, child);
        }
    },
    
    renderDisplay: function() {
        Core.Web.VirtualPosition.redraw(this._splitPaneDiv);
        if (this._separatorUpdateRequired) {
            this._separatorUpdateRequired = false;
            this._setSeparatorPosition(this._requested);
        }
        if (this._paneDivs[0]) {
            Core.Web.VirtualPosition.redraw(this._paneDivs[0]);
        }
        if (this._paneDivs[1]) {
            Core.Web.VirtualPosition.redraw(this._paneDivs[1]);
        }
    },
    
    renderDispose: function(update) {
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
    
    _renderRemoveChild: function(update, child) {
        var index;
        if (this._childPanes[0] && this._childPanes[0].component == child) {
            index = 0;
        } else if (this._childPanes[1] && this._childPanes[1].component == child) {
            index = 1;
        } else {
            throw new Error("Specified component is not a child of the SplitPane.");
        }

        this._childPanes[index] = null;
        
        Core.Web.DOM.removeNode(this._paneDivs[index]);
        this._paneDivs[index] = null;
    },
        
    renderUpdate: function(update) {
        var fullRender = false;
        
        if (this._hasRelocatedChildren()) {
            fullRender = true;
        } else if (update.hasUpdatedProperties() || update.hasUpdatedLayoutDataChildren()) {
            if (update.isUpdatedPropertySetIn({ separatorPosition: true })) {
                this._requested =  Echo.Sync.Extent.toPixels(this.component.render("separatorPosition",
                        Echo.SplitPane.DEFAULT_SEPARATOR_POSITION), this._orientationVertical);
                this._setSeparatorPosition(this._requested);
            } else {
                fullRender = true;
            }
        }
        
        if (!fullRender && (update.hasAddedChildren() || update.hasRemovedChildren())) {
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
    },
    
    _setSeparatorPosition: function(newValue) {
        var oldValue = this._rendered;
        
        if (Echo.Sync.Extent.isPercent(newValue)) {
            var totalSize = this._orientationVertical ? 
                    this._splitPaneDiv.offsetHeight : this._splitPaneDiv.offsetWidth;
            newValue = parseInt((parseInt(newValue) / 100) * totalSize);
        } else {
            newValue = Echo.Sync.Extent.toPixels(newValue, !this._orientationVertical);
        }
    
        if (this._childPanes[1]) {
            var totalSize = this._orientationVertical ? 
                    this._splitPaneDiv.offsetHeight : this._splitPaneDiv.offsetWidth;
            if (this._childPanes[1].minimumSize != null
                    && newValue > totalSize - this._childPanes[1].minimumSize - this._separatorSize) {
                newValue = totalSize - this._childPanes[1].minimumSize - this._separatorSize;
            } else if (this._childPanes[1].maximumSize != null
                    && newValue < totalSize - this._childPanes[1].maximumSize - this._separatorSize) {
                newValue = totalSize - this._childPanes[1].maximumSize - this._separatorSize;
            }
        }
        if (this._childPanes[0]) {
            if (this._childPanes[0].minimumSize != null && newValue < this._childPanes[0].minimumSize) {
                newValue = this._childPanes[0].minimumSize;
            } else if (this._childPanes[0].maximumSize != null && newValue > this._childPanes[0].maximumSize) {
                newValue = this._childPanes[0].maximumSize;
            }
        }
        
        this._rendered = newValue;
        
        this._redraw();
    }
});
