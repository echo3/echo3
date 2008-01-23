/**
 * Component rendering peer: Row
 */
EchoAppRender.RowSync = Core.extend(EchoRender.ComponentSync, {
    
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

    _processKeyPress: function(e) { 
        switch (e.keyCode) {
        case 37:
        case 39:
            var focusPrevious = e.keyCode == 37;
            var focusedComponent = this.component.application.getFocusedComponent();
            if (focusedComponent && focusedComponent.peer && focusedComponent.peer.getFocusFlags) {
                var focusFlags = focusedComponent.peer.getFocusFlags();
                if ((focusPrevious && focusFlags & EchoRender.ComponentSync.FOCUS_PERMIT_ARROW_LEFT)
                        || (!focusPrevious && focusFlags & EchoRender.ComponentSync.FOCUS_PERMIT_ARROW_RIGHT)) {
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
        this._divElement = EchoAppRender.RowSync._rowPrototype.cloneNode(true);
        this._divElement.id = this.component.renderId;
        
        EchoAppRender.Border.render(this.component.render("border"), this._divElement);
        EchoAppRender.Color.renderFB(this.component, this._divElement);
        EchoAppRender.Font.renderDefault(this.component, this._divElement);
        
        EchoAppRender.Insets.renderPixel(this.component.render("insets"), this._divElement, "padding");
        
        
        EchoAppRender.Alignment.renderComponentProperty(this.component, "alignment", null, this._divElement, true);
        
        //                div              table      tbody      tr
        this._trElement = this._divElement.firstChild.firstChild.firstChild;
    
        this._cellSpacing = EchoAppRender.Extent.toPixels(this.component.render("cellSpacing"), false);
        if (this._cellSpacing) {
            this._spacingPrototype = document.createElement("td");
            this._spacingPrototype.style.width = this._cellSpacing + "px";
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
        var tdElement = document.createElement("td");
        this._childIdToElementMap[child.renderId] = tdElement;
        EchoRender.renderComponentAdd(update, child, tdElement);
    
        var layoutData = child.render("layoutData");
        var insets;
        if (layoutData) {
        	insets = layoutData.get("insets");
            EchoAppRender.Color.render(layoutData.get("background"), tdElement, "backgroundColor");
            EchoAppRender.FillImage.renderComponentProperty(layoutData, "backgroundImage", null, tdElement);
    		EchoAppRender.Alignment.renderComponentProperty(layoutData, "alignment", null, tdElement, true, this.component);
    	    var width = layoutData.get("width");
    	    if (width) {
    	        if (EchoAppRender.Extent.isPercent(width)) {
    		    	tdElement.style.width = width;
    	        } else {
    		    	tdElement.style.width = EchoAppRender.Extent.cssValue(width, true);
    	        }
    	    }
        }
        if (!insets) {
        	insets = 0;
        }
        EchoAppRender.Insets.renderPixel(insets, tdElement, "padding");
        
        if (index != null) {
        	var currentChildCount;
            if (this._trElement.childNodes.length >= 3 && this._cellSpacing) {
            	currentChildCount = (this._trElement.childNodes.length + 1) / 2;
            } else {
            	currentChildCount = this._trElement.childNodes.length;
            }
            if (index == currentChildCount) {
    	        index = null;
            }
        }
        if (index == null) {
            // Full render or append-at-end scenario
            
            // Render spacing td first if index != 0 and cell spacing enabled.
            if (this._cellSpacing && this._trElement.firstChild) {
                this._trElement.appendChild(this._spacingPrototype.cloneNode(false));
            }
    
            // Render child td second.
            this._trElement.appendChild(tdElement);
        } else {
            // Partial render insert at arbitrary location scenario (but not at end)
            var insertionIndex = this._cellSpacing ? index * 2 : index;
            var beforeElement = this._trElement.childNodes[insertionIndex];
            
            // Render child td first.
            this._trElement.insertBefore(tdElement, beforeElement);
            
            // Then render spacing td if required.
            if (this._cellSpacing) {
                this._trElement.insertBefore(this._spacingPrototype.cloneNode(false), beforeElement);
            }
        }
    },
    
    _renderRemoveChild: function(update, child) {
        var childElement = this._childIdToElementMap[child.renderId];
        
        if (this._cellSpacing) {
            // If cell spacing is enabled, remove a spacing element, either before or after the removed child.
            // In the case of a single child existing in the Row, no spacing element will be removed.
            if (childElement.previousSibling) {
                this._trElement.removeChild(childElement.previousSibling);
            } else if (childElement.nextSibling) {
                this._trElement.removeChild(childElement.nextSibling);
            }
        }
        this._trElement.removeChild(childElement);
    
        delete this._childIdToElementMap[child.renderId];
    },
    
    renderDispose: function(update) { 
        WebCore.EventProcessor.removeAll(this._divElement);
        this._divElement = null;
        this._trElement = null;
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
                    var child = removedChildren[i];
                    this._renderRemoveChild(update, child);
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
