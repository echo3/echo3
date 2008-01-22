/**
 * Component rendering peer: Column
 */
EchoAppRender.ColumnSync = Core.extend(EchoRender.ComponentSync, {

    $load: function() {
        EchoRender.registerPeer("Column", this);
    },
    
    _processKeyPress: function(e) {
        switch (e.keyCode) {
        case 38:
        case 40:
            var focusPrevious = e.keyCode == 38;
            var focusedComponent = this.component.application.getFocusedComponent();
            if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                var focusFlags = focusedComponent.peer.getFocusFlags();
                if ((focusPrevious && focusFlags & EchoRender.ComponentSync.FOCUS_PERMIT_ARROW_UP)
                        || (!focusPrevious && focusFlags & EchoRender.ComponentSync.FOCUS_PERMIT_ARROW_DOWN)) {
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
    
    renderAdd: function(update, parentElement) {
        this._divElement = document.createElement("div");
        this._divElement.id = this.component.renderId;
        this._divElement.style.outlineStyle = "none";
        this._divElement.tabIndex = "-1";
    
        EchoAppRender.Border.render(this.component.render("border"), this._divElement);
        EchoAppRender.Color.renderFB(this.component, this._divElement);
        EchoAppRender.Font.renderDefault(this.component, this._divElement);
        EchoAppRender.Insets.renderComponentProperty(this.component, "insets", null, this._divElement, "padding");
    
        this._cellSpacing = EchoAppRender.Extent.toPixels(this.component.render("cellSpacing"), false);
        if (this._cellSpacing) {
            this._spacingPrototype = document.createElement("div");
            this._spacingPrototype.style.height = this._cellSpacing + "px";
            this._spacingPrototype.style.fontSize = "1px";
            this._spacingPrototype.style.lineHeight = "0px";
        }
        
        this._childIdToElementMap = {};
        
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            this._renderAddChild(update, child);
        }
        
        WebCore.EventProcessor.add(this._divElement, 
                WebCore.Environment.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress",
                Core.method(this, this._processKeyPress), false);
        
        parentElement.appendChild(this._divElement);
    },
    
    _renderAddChild: function(update, child, index) {
        var divElement = document.createElement("div");
        this._childIdToElementMap[child.renderId] = divElement;
        EchoRender.renderComponentAdd(update, child, divElement);
    
        var layoutData = child.render("layoutData");
        if (layoutData) {
            EchoAppRender.Color.renderComponentProperty(layoutData, "background", null, divElement, "backgroundColor");
            EchoAppRender.FillImage.renderComponentProperty(layoutData, "backgroundImage", null, divElement);
            EchoAppRender.Insets.renderComponentProperty(layoutData, "insets", null, divElement, "padding");
            EchoAppRender.Alignment.renderComponentProperty(layoutData, "alignment", null, divElement, true, this.component);
            var height = layoutData.get("height");
            if (height) {
                divElement.style.height = EchoAppRender.Extent.toPixels(height, false) + "px";
            }
        }
        
        if (index != null) {
            var currentChildCount;
            if (this._divElement.childNodes.length >= 3 && this._cellSpacing) {
                currentChildCount = (this._divElement.childNodes.length + 1) / 2;
            } else {
                currentChildCount = this._divElement.childNodes.length;
            }
            if (index == currentChildCount) {
                index = null;
            }
        }
        if (index == null) {
            // Full render or append-at-end scenario
            
            // Render spacing div first if index != 0 and cell spacing enabled.
            if (this._cellSpacing && this._divElement.firstChild) {
                this._divElement.appendChild(this._spacingPrototype.cloneNode(false));
            }
    
            // Render child div second.
            this._divElement.appendChild(divElement);
        } else {
            // Partial render insert at arbitrary location scenario (but not at end)
            var insertionIndex = this._cellSpacing ? index * 2 : index;
            var beforeElement = this._divElement.childNodes[insertionIndex];
            
            // Render child div first.
            this._divElement.insertBefore(divElement, beforeElement);
            
            // Then render spacing div if required.
            if (this._cellSpacing) {
                this._divElement.insertBefore(this._spacingPrototype.cloneNode(false), beforeElement);
            }
        }
    },
    
    _renderRemoveChild: function(update, child) {
        var childElement = this._childIdToElementMap[child.renderId];
    
        if (this._cellSpacing) {
            // If cell spacing is enabled, remove a spacing element, either before or after the removed child.
            // In the case of a single child existing in the column, no spacing element will be removed.
            if (childElement.previousSibling) {
                this._divElement.removeChild(childElement.previousSibling);
            } else if (childElement.nextSibling) {
                this._divElement.removeChild(childElement.nextSibling);
            }
        }
        this._divElement.removeChild(childElement);
    
        delete this._childIdToElementMap[child.renderId];
    },
    
    renderDispose: function(update) {
        WebCore.EventProcessor.removeAll(this._divElement);
        this._divElement = null;
        this._childIdToElementMap = null;
        this._spacingPrototype = null;
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
            if (addedChildren) {
                // Add children.
                for (var i = 0; i < addedChildren.length; ++i) {
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
    }
});
