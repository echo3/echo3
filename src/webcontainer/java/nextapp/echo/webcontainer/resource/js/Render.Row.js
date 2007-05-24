/**
 * Component rendering peer: Row
 */
EchoRender.ComponentSync.Row = function() {
};
  
EchoRender.ComponentSync.Row.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.Row._createRowPrototype = function() {
    var divElement = document.createElement("div");
    divElement.style.outlineStyle = "none";
    divElement.tabIndex = "-1";

    var tableElement = document.createElement("table");
    tableElement.style.borderCollapse = "collapse";
    divElement.appendChild(tableElement);

    var tbodyElement = document.createElement("tbody");
    tableElement.appendChild(tbodyElement);
    
    var trElement = document.createElement("tr");
    tbodyElement.appendChild(trElement);

    return divElement;
};

EchoRender.ComponentSync.Row._rowPrototype = EchoRender.ComponentSync.Row._createRowPrototype();

EchoRender.ComponentSync.Row.prototype.getContainerElement = function(component) {
    return document.getElementById(this.component.renderId + "_" + component.renderId);
};

EchoRender.ComponentSync.Row.prototype.processKeyDown = function(e) { 
    switch (e.keyCode) {
    case 37:
        var focusChanged = EchoRender.Focus.visitNextFocusComponent(this.component, true);
        if (focusChanged) {
            // Prevent default action (vertical scrolling).
            EchoWebCore.DOM.preventEventDefault(e);
        }
        return !focusChanged;
    case 39:
        var focusChanged = EchoRender.Focus.visitNextFocusComponent(this.component, false);
        if (focusChanged) {
            // Prevent default action (vertical scrolling).
            EchoWebCore.DOM.preventEventDefault(e);
        }
        return !focusChanged;
    }
};


EchoRender.ComponentSync.Row.prototype.renderAdd = function(update, parentElement) {
    this.cellSpacing = EchoRender.Property.Extent.toPixels(this.component.getRenderProperty("cellSpacing"), false);
    var insets = this.component.getRenderProperty("insets");

    var divElement = EchoRender.ComponentSync.Row._rowPrototype.cloneNode(true);
    divElement.id = this.component.renderId;

    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), divElement);
    EchoRender.Property.Color.renderFB(this.component, divElement);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, divElement, "padding");
    
    //              div        table      tbody      tr
    var trElement = divElement.firstChild.firstChild.firstChild;
    
    trElement.id = this.component.renderId + "_tr";
    
    var componentCount = this.component.getComponentCount();
    for (var i = 0; i < componentCount; ++i) {
        var child = this.component.getComponent(i);
        this._renderAddChild(update, child, trElement);
    }
    
    EchoWebCore.EventProcessor.add(divElement, "keydown", new EchoCore.MethodRef(this, this.processKeyDown), false);
    
    parentElement.appendChild(divElement);
};

EchoRender.ComponentSync.Row.prototype._renderAddChild = function(update, child, parentElement, index) {
    if (index != null && index == update.parent.getComponentCount() - 1) {
        index = null;
    }
    
    var tdElement = document.createElement("td");
    tdElement.id = this.component.renderId + "_"+ child.renderId;
    EchoRender.renderComponentAdd(update, child, tdElement);

    var layoutData = child.getRenderProperty("layoutData");
    if (layoutData) {
        EchoRender.Property.Color.renderComponentProperty(layoutData, "background", null, tdElement, "backgroundColor");
        EchoRender.Property.FillImage.renderComponentProperty(layoutData, "backgroundImage", null, tdElement);
        EchoRender.Property.Insets.renderComponentProperty(layoutData, "insets", null, tdElement, "padding");
		EchoRender.Property.Alignment.renderComponentProperty(layoutData, "alignment", null, tdElement, true, this.component);
	    var width = layoutData.getProperty("width");
	    if (width) {
	        if (width.units == "%") {
		    	tdElement.style.width = width.toString();
	        } else {
		    	tdElement.style.width = EchoRender.Property.Extent.toPixels(width, true) + "px";
	        }
	    }
    }
    
    if (index == null) {
        // Full render or append-at-end scenario
        
        // Render spacing td first if index != 0 and cell spacing enabled.
        if (this.cellSpacing && parentElement.firstChild) {
            var spacingTdElement = document.createElement("td");
            spacingTdElement.style.width = this.cellSpacing + "px";
            parentElement.appendChild(spacingTdElement);
        }

        // Render child td second.
        parentElement.appendChild(tdElement);
    } else {
        // Partial render insert at arbitrary location scenario (but not at end)
        var insertionIndex = this.cellSpacing ? index * 2 : index;
        var beforeElement = parentElement.childNodes[insertionIndex]
        
        // Render child td first.
        parentElement.insertBefore(tdElement, beforeElement);
        
        // Then render spacing td if required.
        if (this.cellSpacing) {
            var spacingTdElement = document.createElement("td");
            spacingTdElement.style.height = this.cellSpacing + "px";
            parentElement.insertBefore(spacingTdElement, beforeElement);
        }
    }
};

EchoRender.ComponentSync.Row.prototype._renderRemoveChild = function(update, child) {
    var childElement = document.getElementById(this.component.renderId + "_" + child.renderId);
    var parentElement = childElement.parentNode;
    if (this.cellSpacing) {
        // If cell spacing is enabled, remove a spacing element, either before or after the removed child.
        // In the case of a single child existing in the Row, no spacing element will be removed.
        if (childElement.previousSibling) {
            parentElement.removeChild(childElement.previousSibling);
        } else if (childElement.nextSibling) {
            parentElement.removeChild(childElement.nextSibling);
        }
    }
    parentElement.removeChild(childElement);
};

EchoRender.ComponentSync.Row.prototype.renderDispose = function(update) { 
    var divElement = document.getElementById(this.component.renderId);
    EchoWebCore.EventProcessor.remove(divElement, "keydown", new EchoCore.MethodRef(this, this.processKeyDown), false);
};

EchoRender.ComponentSync.Row.prototype.renderUpdate = function(update) {
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
            var trElemenet = document.getElementById(this.component.renderId + "_tr");
            for (var i = 0; i < addedChildren.length; ++i) {
                this._renderAddChild(update, addedChildren[i], trElemenet, this.component.indexOf(addedChildren[i])); 
            }
        }
    }
    if (fullRender) {
        EchoRender.Util.renderRemove(update, update.parent);
        var containerElement = EchoRender.Util.getContainerElement(update.parent);
        this.renderAdd(update, containerElement);
    }
    
    return fullRender;
};

EchoRender.registerPeer("Row", EchoRender.ComponentSync.Row);