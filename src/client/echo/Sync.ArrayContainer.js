/**
 * Abstract base class for column/row peers.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Echo.Sync.ArrayContainer = Core.extend(Echo.Render.ComponentSync, {

    $abstract: {

        /**
         * The DOM element name of child container cells.
         * @type String
         */
        cellElementNodeName: null,
        
        /** 
         * Abstract method which renders layout data on child cell element.
         * 
         * @param {Echo.Component} child the child component
         * @param {Element} the DOM element containing the child
         */
        renderChildLayoutData: function(child, cellElement) { }
    },
    
    $virtual: {
        
        /** 
         * The key code which should move focus to the previous child cell. 
         * @type Number
         */
        prevFocusKey: null,
        
        /** 
         * The Echo.Render.ComponentSync focus flag indicating which keys should trigger focus changes to the previous child. 
         * @type Boolean
         */
        prevFocusFlag: null,
        
        /** 
         * The key code which should move focus to the next child cell. 
         * @type Number
         */
        nextFocusKey: null,

        /** 
         * The Echo.Render.ComponentSync focus flag indicating which keys should trigger focus changes to the next child.
         * @type Boolean
         */
        nextFocusFlag: null,
        
        /** 
         * Flag indicating whether focus key should be inverted when the component is rendered with an RTL layout direction.
         * @type Boolean 
         */
        invertFocusRtl: false
    },
    
    /**
     * The root DOM element of the rendered array container.
     * @type Element
     */
    element: null,

    /**
     * The DOM element to which child elements should be added.  May be equivalent to <code>element</code>.
     * @type Element
     */
    containerElement: null,
    
    /**
     * Prototype Element to be cloned and added between cells of the array container.
     * 
     * @type Element
     */
    spacingPrototype: null,

    /** 
     * Number of pixels to be rendered as spacing between child cells of the container.
     * @type Number
     */
    cellSpacing: null,

    /**
     * Mapping between child render ids and child container cell elements. 
     */
    _childIdToElementMap: null,

    /**
     * Processes a key press event.  Provides support for adjusting focus via arrow keys.
     * 
     * @param e the event
     */
    clientKeyDown: function(e) {
        switch (e.keyCode) {
        case this.prevFocusKey:
        case this.nextFocusKey:
            var focusPrevious = e.keyCode == this.prevFocusKey;
            if (this.invertFocusRtl && !this.component.getRenderLayoutDirection().isLeftToRight()) {
                focusPrevious = !focusPrevious;
            }
            var focusedComponent = this.client.application.getFocusedComponent();
            if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                var focusFlags = focusedComponent.peer.getFocusFlags();
                if ((focusPrevious && focusFlags & this.prevFocusFlag) || (!focusPrevious && focusFlags & this.nextFocusFlag)) {
                    var focusChild = this.client.application.focusManager.findInParent(this.component, focusPrevious);
                    if (focusChild) {
                        this.client.application.setFocusedComponent(focusChild);
                        Core.Web.DOM.preventEventDefault(e.domEvent);
                        return false;
                    }
                }
            }
            break;
        }
        return true;
    },

    /**
     * Renders the specified child to the containerElement.
     * 
     * @param {Echo.Update.ComponentUpdate} the update
     * @param {Echo.Component} the child component
     * @param {Number} index the index of the child within the parent 
     */
    _renderAddChild: function(update, child, index) {
        var cellElement = document.createElement(this.cellElementNodeName);
        this._childIdToElementMap[child.renderId] = cellElement;
        Echo.Render.renderComponentAdd(update, child, cellElement);

        this.renderChildLayoutData(child, cellElement);

        if (index != null) {
            var currentChildCount;
            if (this.containerElement.childNodes.length >= 3 && this.cellSpacing) {
                currentChildCount = (this.containerElement.childNodes.length + 1) / 2;
            } else {
                currentChildCount = this.containerElement.childNodes.length;
            }
            if (index == currentChildCount) {
                index = null;
            }
        }
        if (index == null || !this.containerElement.firstChild) {
            // Full render, append-at-end scenario, or index 0 specified and no children rendered.
            
            // Render spacing cell first if index != 0 and cell spacing enabled.
            if (this.cellSpacing && this.containerElement.firstChild) {
                this.containerElement.appendChild(this.spacingPrototype.cloneNode(false));
            }
    
            // Render child cell second.
            this.containerElement.appendChild(cellElement);
        } else {
            // Partial render insert at arbitrary location scenario (but not at end)
            var insertionIndex = this.cellSpacing ? index * 2 : index;
            var beforeElement = this.containerElement.childNodes[insertionIndex];
            
            // Render child cell first.
            this.containerElement.insertBefore(cellElement, beforeElement);
            
            // Then render spacing cell if required.
            if (this.cellSpacing) {
                this.containerElement.insertBefore(this.spacingPrototype.cloneNode(false), beforeElement);
            }
        }
    },
    
    /**
     * Renders all children.  Must be invoked by derived <code>renderAdd()</code> implementations.
     * 
     * @param {Echo.Update.ComponentUpdate} the update
     */
    renderAddChildren: function(update) {
        this._childIdToElementMap = {};
    
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            this._renderAddChild(update, child);
        }
    },

    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) { 
        this.element = null;
        this.containerElement = null;
        this._childIdToElementMap = null;
        this.spacingPrototype = null;
    },

    /**
     * Removes a child cell.
     * 
     * @param {Echo.Update.ComponentUpdate} the update
     * @param {Echo.Component} the child to remove
     */
    _renderRemoveChild: function(update, child) {
        var childElement = this._childIdToElementMap[child.renderId];
        if (!childElement) {
            return;
        }
        
        if (this.cellSpacing) {
            // If cell spacing is enabled, remove a spacing element, either before or after the removed child.
            // In the case of a single child existing in the Row, no spacing element will be removed.
            if (childElement.previousSibling) {
                this.containerElement.removeChild(childElement.previousSibling);
            } else if (childElement.nextSibling) {
                this.containerElement.removeChild(childElement.nextSibling);
            }
        }
        
        this.containerElement.removeChild(childElement);
        
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
            if (addedChildren) {
                // Add children.
                for (i = 0; i < addedChildren.length; ++i) {
                    this._renderAddChild(update, addedChildren[i], this.component.indexOf(addedChildren[i])); 
                }
            }
        }
        if (fullRender) {
            var element = this.element;
            var containerElement = element.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }
        
        return fullRender;
    }
});

/**
 * Component rendering peer: Column
 */
Echo.Sync.Column = Core.extend(Echo.Sync.ArrayContainer, {

    $load: function() {
        Echo.Render.registerPeer("Column", this);
    },

    /** @see Echo.Render.ComponentSync#cellElementNodeName */
    cellElementNodeName: "div",
    
    /** @see Echo.Sync.ArrayContainer#prevFocusKey */
    prevFocusKey: 38,
    
    /** @see Echo.Sync.ArrayContainer#prevFocusFlag */
    prevFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP,

    /** @see Echo.Sync.ArrayContainer#nextFocusKey */
    nextFocusKey: 40,

    /** @see Echo.Sync.ArrayContainer#nextFocusFlag */
    nextFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN,
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this.element = this.containerElement = document.createElement("div");
        this.element.id = this.component.renderId;
        this.element.style.outlineStyle = "none";
        this.element.tabIndex = "-1";
    
        Echo.Sync.renderComponentDefaults(this.component, this.element);
        Echo.Sync.Border.render(this.component.render("border"), this.element);
        Echo.Sync.Insets.render(this.component.render("insets"), this.element, "padding");
    
        this.cellSpacing = Echo.Sync.Extent.toPixels(this.component.render("cellSpacing"), false);
        if (this.cellSpacing) {
            this.spacingPrototype = document.createElement("div");
            this.spacingPrototype.style.height = this.cellSpacing + "px";
            this.spacingPrototype.style.fontSize = "1px";
            this.spacingPrototype.style.lineHeight = "0";
        }
        
        this.renderAddChildren(update);

        parentElement.appendChild(this.element);
    },
    
    /** @see Echo.Sync.ArrayContainer#renderChildLayoutData */
    renderChildLayoutData: function(child, cellElement) {
        var layoutData = child.render("layoutData");
        if (layoutData) {
            Echo.Sync.Color.render(layoutData.background, cellElement, "backgroundColor");
            Echo.Sync.FillImage.render(layoutData.backgroundImage, cellElement);
            Echo.Sync.Insets.render(layoutData.insets, cellElement, "padding");
            Echo.Sync.Alignment.render(layoutData.alignment, cellElement, true, this.component);
            if (layoutData.height) {
                cellElement.style.height = Echo.Sync.Extent.toPixels(layoutData.height, false) + "px";
            }
        }
    }
});

/**
 * Component rendering peer: Row
 */
Echo.Sync.Row = Core.extend(Echo.Sync.ArrayContainer, {

    $static: {
    
        /** 
         * Creates a prototype DOM element hierarchy to be cloned when rendering.   
         * 
         * @return the prototype Element
         * @type Element
         */
        _createRowPrototype: function() {
            var div = document.createElement("div");
            div.style.outlineStyle = "none";
            div.tabIndex = "-1";
        
            var table = document.createElement("table");
            table.style.borderCollapse = "collapse";
            div.appendChild(table);
        
            var tbody = document.createElement("tbody");
            table.appendChild(tbody);
            
            tbody.appendChild(document.createElement("tr"));
        
            return div;
        },
        
        /** 
         * The prototype DOM element hierarchy to be cloned when rendering.
         * @type Element 
         */
        _rowPrototype: null
    },
    
    $load: function() {
        this._rowPrototype = this._createRowPrototype();
        Echo.Render.registerPeer("Row", this);
    },

    /** @see Echo.Render.ComponentSync#cellElementNodeName */
    cellElementNodeName: "td",

    /** @see Echo.Sync.ArrayContainer#prevFocusKey */
    prevFocusKey: 37,
    
    /** @see Echo.Sync.ArrayContainer#prevFocusFlag */
    prevFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_LEFT,
    
    /** @see Echo.Sync.ArrayContainer#nextFocusKey */
    nextFocusKey: 39,

    /** @see Echo.Sync.ArrayContainer#nextFocusFlag */
    nextFocusFlag: Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_RIGHT,
    
    /** @see Echo.Sync.ArrayContainer#invertFocusRtl */
    invertFocusRtl: true,
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this.element = Echo.Sync.Row._rowPrototype.cloneNode(true);
        this.element.id = this.component.renderId;

        Echo.Sync.renderComponentDefaults(this.component, this.element);
        Echo.Sync.Border.render(this.component.render("border"), this.element);
        Echo.Sync.Insets.render(this.component.render("insets"), this.element, "padding");
        Echo.Sync.Alignment.render(this.component.render("alignment"), this.element, true, this.component);
        
        //                      div          table      tbody      tr
        this.containerElement = this.element.firstChild.firstChild.firstChild;
    
        this.cellSpacing = Echo.Sync.Extent.toPixels(this.component.render("cellSpacing"), false);
        if (this.cellSpacing) {
            this.spacingPrototype = document.createElement("td");
            this.spacingPrototype.style.padding = 0;
            this.spacingPrototype.style.width = this.cellSpacing + "px";
        }
        
        this.renderAddChildren(update);

        parentElement.appendChild(this.element);
    },

    /** @see Echo.Sync.ArrayContainer#renderChildLayoutData */
    renderChildLayoutData: function(child, cellElement) {
        var layoutData = child.render("layoutData");
        var insets;
        if (layoutData) {
            insets = layoutData.insets;
            Echo.Sync.Color.render(layoutData.background, cellElement, "backgroundColor");
            Echo.Sync.FillImage.render(layoutData.backgroundImage, cellElement);
            Echo.Sync.Alignment.render(layoutData.alignment, cellElement, true, this.component);
            if (layoutData.width) {
                if (Echo.Sync.Extent.isPercent(layoutData.width)) {
                    cellElement.style.width = layoutData.width;
                    if (this.element.firstChild.style.width != "100%") {
                        this.element.firstChild.style.width = "100%";
                    }
                } else {
                    cellElement.style.width = Echo.Sync.Extent.toPixels(layoutData.width, true) + "px";
                }
            }
        }
        if (!insets) {
            insets = 0;
        }
        Echo.Sync.Insets.render(insets, cellElement, "padding");
    }
});
