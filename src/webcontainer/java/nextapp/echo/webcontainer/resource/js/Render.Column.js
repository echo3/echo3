/**
 * Component rendering peer: Column
 */
EchoRender.ComponentSync.Column = function() {
};
  
EchoRender.ComponentSync.Column.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.Column.prototype.getContainerElement = function(component) {
    return EchoRender.SyncUtil.findContainerElementByIndex(component);
};

EchoRender.ComponentSync.Column.prototype.processKeyDown = function(e) { 
    switch (e.keyCode) {
    case 38:
        var focusChanged = EchoRender.Focus.visitNextFocusComponent(this.component, true);
        if (focusChanged) {
            // Prevent default action (vertical scrolling).
            EchoWebCore.DOM.preventEventDefault(e);
        }
        return !focusChanged;
    case 40:
        var focusChanged = EchoRender.Focus.visitNextFocusComponent(this.component, false);
        if (focusChanged) {
            // Prevent default action (vertical scrolling).
            EchoWebCore.DOM.preventEventDefault(e);
        }
        return !focusChanged;
    }
};

EchoRender.ComponentSync.Column.prototype.renderAdd = function(update, parentElement) {
    this.cellSpacing = EchoRender.Property.Extent.toPixels(this.component.getRenderProperty("cellSpacing"), false);
    EchoCore.Debug.consoleWrite(this.component + ":cellspacing=" + this.cellSpacing);
    var insets = this.component.getRenderProperty("insets");

    var divElement = document.createElement("div");
    divElement.id = this.component.renderId;
    divElement.style.outlineStyle = "none";
    divElement.tabIndex = "-1";
    EchoRender.Property.Color.renderFB(this.component, divElement);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, divElement, "padding");
    
    var componentCount = this.component.getComponentCount();
    for (var i = 0; i < componentCount; ++i) {
        var child = this.component.getComponent(i);
        this._renderAddChild(update, child, divElement);
    }
    
    EchoWebCore.EventProcessor.add(divElement, "keydown", new EchoCore.MethodRef(this, this.processKeyDown), false);
    
    parentElement.appendChild(divElement);
};

EchoRender.ComponentSync.Column.prototype._renderAddChild = function(update, child, parentElement, index) {
    var spacingDivElement;
    var divElement;
    
    if (this.cellSpacing && index > 0) {
        // Render cell spacing div element.
        
        spacingDivElement = document.createElement("div");
        spacingDivElement.style.height = this.cellSpacing + "px";
    }
    var divElement = document.createElement("div");
    divElement.id = this.component.renderId + "_"+ child.renderId;
    EchoRender.renderComponentAdd(update, child, divElement);

    if (index != null && index == update.parent.getComponentCount() - 1) {
        index == null;
    }
    
    if (index == null) {
        if (spacingDivElement) {
            EchoCore.Debug.consoleWrite("appending spacing div");
            parentElement.appendChild(spacingDivElement);
        }
        parentElement.appendChild(divElement);
    } else {
        var insertionIndex = this.cellSpacing ? index * 2 : index;
        var beforeElement = parentElement.childNodes[insertionIndex]
        if (spacingDivElement) {
            EchoCore.Debug.consoleWrite("appending spacing div");
            parentElement.insertBefore(spacingDivElement, beforeElement);
        }
        parentElement.insertBefore(divElement, beforeElement);
    }
};

EchoRender.ComponentSync.Column.prototype._renderRemoveChild = function(update, child) {
    var childElement = document.getElementById(this.component.renderId + "_" + child.renderId);
    var parentElement = childElement.parentNode;
    var previousElement = childElement.previousSibling;
    if (this.cellSpacing && previousElement) {
        parentElement.removeChild(previousElement);
    }
    parentElement.removeChild(childElement);
};

EchoRender.ComponentSync.Column.prototype.renderDispose = function(update) { 
    var divElement = document.getElementById(this.component.renderId);
    EchoWebCore.EventProcessor.remove(divElement, "keydown", new EchoCore.MethodRef(this, this.processKeyDown), false);
};

EchoRender.ComponentSync.Column.prototype.renderUpdate = function(update) {
    var fullRender = false;
    if (update.hasUpdatedProperties() || update.hasUpdatedLayoutDataChildren()) {
        // Full render
        fullRender = true;
    } else {
        var parentElement = document.getElementById(this.component.renderId);
        
        if (update.hasRemovedChildren()) {
            // Remove children.
            var removedChildren = update.getRemovedChildren();
            var length = removedChildren.size();
            for (var i = 0; i < length; ++i) {
                var child = removedChildren.items[i];
                this._renderRemoveChild(update, child);
            }
        }
        if (update.hasAddedChildren()) {
            // Add children.
            var addedChildren = update.getAddedChildren();
            var length = addedChildren.size();
            for (var i = 0; i < length; ++i) {
                var child = addedChildren.items[i];
                var index = this.component.indexOf(child);
                this._renderAddChild(update, child, parentElement, index); 
            }
        }
    }
    if (fullRender) {
        EchoRender.SyncUtil.renderRemove(update, update.parent);
        var containerElement = EchoRender.SyncUtil.getContainerElement(update.parent);
        this.renderAdd(update, containerElement);
    }
    
    return fullRender;
};

EchoRender.registerPeer("Column", EchoRender.ComponentSync.Column);
