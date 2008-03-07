/**
 * Abstract base class for column/row peers.
 */
EchoAppRender.ArrayContainerSync = Core.extend(EchoRender.ComponentSync, {

    $abstract: {
        cellElementNodeName: true,
        
        renderChildLayoutData: function(child, cellElement) { }
    },
    
    element: null,
    containerElement: null,
    spacingPrototype: null,
    cellSpacing: null,
    _childIdToElementMap: null,

    processKeyPress: function(e) {
        switch (e.keyCode) {
        case this.prevFocusKey:
        case this.nextFocusKey:
            var focusPrevious = e.keyCode == this.prevFocusKey;
            var focusedComponent = this.component.application.getFocusedComponent();
            if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                var focusFlags = focusedComponent.peer.getFocusFlags();
                if ((focusPrevious && focusFlags & this.prevFocusFlag) || (!focusPrevious && focusFlags & this.nextFocusFlag)) {
                    var focusChild = this.component.application.focusManager.findInParent(this.component, focusPrevious);
                    if (focusChild) {
                        this.component.application.setFocusedComponent(focusChild);
                        WebCore.DOM.preventEventDefault(e);
                        return false;
                    }
                }
            }
            break;
        }
        return true;
    },

    renderAddChild: function(update, child, index) {
        var cellElement = document.createElement(this.cellElementNodeName);
        this._childIdToElementMap[child.renderId] = cellElement;
        EchoRender.renderComponentAdd(update, child, cellElement);

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
        if (index == null) {
            // Full render or append-at-end scenario
            
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
    
    renderAddChildren: function(update) {
        this._childIdToElementMap = {};
    
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            this.renderAddChild(update, child);
        }
        
        WebCore.EventProcessor.add(this.element, 
                WebCore.Environment.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress",
                Core.method(this, this.processKeyPress), false);
    },

    renderDispose: function(update) { 
        WebCore.EventProcessor.removeAll(this.element);
        this.element = null;
        this.containerElement = null;
        this._childIdToElementMap = null;
        this.spacingPrototype = null;
    },

    renderRemoveChild: function(update, child) {
        var childElement = this._childIdToElementMap[child.renderId];
        
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
                    this.renderRemoveChild(update, removedChildren[i]);
                }
            }
            var addedChildren = update.getAddedChildren();
            if (addedChildren) {
                // Add children.
                for (var i = 0; i < addedChildren.length; ++i) {
                    this.renderAddChild(update, addedChildren[i], this.component.indexOf(addedChildren[i])); 
                }
            }
        }
        if (fullRender) {
            var element = this.element;
            var containerElement = element.parentNode;
            EchoRender.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }
        
        return fullRender;
    }
});

/**
 * Component rendering peer: Column
 */
EchoAppRender.ColumnSync = Core.extend(EchoAppRender.ArrayContainerSync, {

    $load: function() {
        EchoRender.registerPeer("Column", this);
    },

    cellElementNodeName: "div",
    prevFocusKey: 38,
    prevFocusFlag: EchoRender.ComponentSync.FOCUS_PERMIT_ARROW_UP,
    nextFocusKey: 40,
    nextFocusFlag: EchoRender.ComponentSync.FOCUS_PERMIT_ARROW_DOWN,
    
    renderAdd: function(update, parentElement) {
        this.element = this.containerElement = document.createElement("div");
        this.element.id = this.component.renderId;
        this.element.style.outlineStyle = "none";
        this.element.tabIndex = "-1";
    
        EchoAppRender.Border.render(this.component.render("border"), this.element);
        EchoAppRender.Color.renderFB(this.component, this.element);
        EchoAppRender.Font.render(this.component.render("font"), this.element);
        EchoAppRender.Insets.render(this.component.render("insets"), this.element, "padding");
    
        this.cellSpacing = EchoAppRender.Extent.toPixels(this.component.render("cellSpacing"), false);
        if (this.cellSpacing) {
            this.spacingPrototype = document.createElement("div");
            this.spacingPrototype.style.height = this.cellSpacing + "px";
            this.spacingPrototype.style.fontSize = "1px";
            this.spacingPrototype.style.lineHeight = "0px";
        }
        
        this.renderAddChildren(update);

        parentElement.appendChild(this.element);
    },
    
    renderChildLayoutData: function(child, cellElement) {
        var layoutData = child.render("layoutData");
        if (layoutData) {
            EchoAppRender.Color.render(layoutData.background, cellElement, "backgroundColor");
            EchoAppRender.FillImage.render(layoutData.backgroundImage, cellElement);
            EchoAppRender.Insets.render(layoutData.insets, cellElement, "padding");
            EchoAppRender.Alignment.render(layoutData.alignment, cellElement, true, this.component);
            if (layoutData.height) {
                cellElement.style.height = EchoAppRender.Extent.toPixels(layoutData.height, false) + "px";
            }
        }
    }
});

/**
 * Component rendering peer: Row
 */
EchoAppRender.RowSync = Core.extend(EchoAppRender.ArrayContainerSync, {

    $static: {
    
        _createRowPrototype: function() {
            var divElement = document.createElement("div");
            divElement.style.outlineStyle = "none";
            divElement.style.overflow = "hidden";
            divElement.tabIndex = "-1";
        
            var tableElement = document.createElement("table");
            tableElement.style.borderCollapse = "collapse";
            divElement.appendChild(tableElement);
        
            var tbodyElement = document.createElement("tbody");
            tableElement.appendChild(tbodyElement);
            
            var trElement = document.createElement("tr");
            tbodyElement.appendChild(trElement);
        
            return divElement;
        }
    },
    
    $load: function() {
        this._rowPrototype = this._createRowPrototype();
        EchoRender.registerPeer("Row", this);
    },

    cellElementNodeName: "td",
    prevFocusKey: 37,
    prevFocusFlag: EchoRender.ComponentSync.FOCUS_PERMIT_ARROW_LEFT,
    nextFocusKey: 39,
    nextFocusFlag: EchoRender.ComponentSync.FOCUS_PERMIT_ARROW_RIGHT,
    
    renderAdd: function(update, parentElement) {
        this.element = EchoAppRender.RowSync._rowPrototype.cloneNode(true);
        this.element.id = this.component.renderId;
        
        EchoAppRender.Border.render(this.component.render("border"), this.element);
        EchoAppRender.Color.renderFB(this.component, this.element);
        EchoAppRender.Font.render(this.component.render("font"), this.element);
        EchoAppRender.Insets.render(this.component.render("insets"), this.element, "padding");
        EchoAppRender.Alignment.render(this.component.render("alignment"), this.element, true, this.component);
        
        //                      div          table      tbody      tr
        this.containerElement = this.element.firstChild.firstChild.firstChild;
    
        this.cellSpacing = EchoAppRender.Extent.toPixels(this.component.render("cellSpacing"), false);
        if (this.cellSpacing) {
            this.spacingPrototype = document.createElement("td");
            this.spacingPrototype.style.width = this.cellSpacing + "px";
        }
        
        this.renderAddChildren(update);

        parentElement.appendChild(this.element);
    },

    renderChildLayoutData: function(child, cellElement) {
        var layoutData = child.render("layoutData");
        var insets;
        if (layoutData) {
            insets = layoutData.insets;
            EchoAppRender.Color.render(layoutData.background, cellElement, "backgroundColor");
            EchoAppRender.FillImage.render(layoutData.backgroundImage, cellElement);
            EchoAppRender.Alignment.render(layoutData.alignment, cellElement, true, this.component);
            if (layoutData.width) {
                if (EchoAppRender.Extent.isPercent(layoutData.width)) {
                    cellElement.style.width = layoutData.width;
                } else {
                    cellElement.style.width = EchoAppRender.Extent.toCssValue(layoutData.width, true);
                }
            }
        }
        if (!insets) {
            insets = "0px";
        }
        EchoAppRender.Insets.render(insets, cellElement, "padding");
    }
});
