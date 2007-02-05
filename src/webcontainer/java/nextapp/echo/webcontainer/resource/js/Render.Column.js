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
        return !focusChanged;
    case 40:
        var focusChanged = EchoRender.Focus.visitNextFocusComponent(this.component, false);
        return !focusChanged;
    }
};

EchoRender.ComponentSync.Column.prototype.renderAdd = function(update, parentElement) {
    this.cellSpacing = EchoRender.Property.Extent.toPixels(this.component.getRenderProperty("cellSpacing"), false);
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
        this._renderAddChild(update, child, i, divElement);
    }
    
    EchoWebCore.EventProcessor.add(divElement, "keydown", new EchoCore.MethodRef(this, this.processKeyDown), false);
    
    parentElement.appendChild(divElement);
};

EchoRender.ComponentSync.Column.prototype._renderAddChild = function(update, child, index, parentElement) {
    if (this.cellSpacing && index > 0) {
        // Render cell spacing div element.
        var spacingDivElement = document.createElement("div");
        spacingDivElement.style.height = this.cellSpacing + "px";
        parentElement.appendChild(spacingDivElement);
    }
    var divElement = document.createElement("div");
    divElement.id = this.component.renderId + "_"+ child.renderId;
    EchoRender.renderComponentAdd(update, child, divElement);
    parentElement.appendChild(divElement);
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
        if (update.hasRemovedChildren()) {
            // Remove children.
        }
        if (update.hasAddedChildren()) {
            // Add children.
        }
        
        //FIXME. temporary.
        fullRender = true;
    }
    if (fullRender) {
        EchoRender.SyncUtil.renderRemove(update, update.parent);
        var containerElement = EchoRender.SyncUtil.getContainerElement(update.parent);
        this.renderAdd(update, containerElement);
    }
    
    return fullRender;
};

EchoRender.registerPeer("Column", EchoRender.ComponentSync.Column);
