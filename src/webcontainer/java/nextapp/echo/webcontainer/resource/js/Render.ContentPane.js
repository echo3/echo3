/**
 * Component rendering peer: ContentPane
 */
EchoRender.ComponentSync.ContentPane = function() { };

EchoRender.ComponentSync.ContentPane.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.ContentPane.prototype.getContainerElement = function(component) {
    return EchoRender.Util.findContainerElementByIndex(component);
};

EchoRender.ComponentSync.ContentPane.prototype.renderAdd = function(update, parentElement) {
    var divElement = document.createElement("div");
    divElement.id = this.component.renderId;
    divElement.style.position = "absolute";
    divElement.style.width = "100%";
    divElement.style.height = "100%";
    divElement.style.overflow = "hidden";
    divElement.style.zIndex = "0";
    EchoRender.Property.Color.renderFB(this.component, divElement);
    EchoRender.Property.FillImage.renderComponentProperty(this.component, "backgroundImage", null, divElement); 

    var componentCount = this.component.getComponentCount();
    for (var i = 0; i < componentCount; ++i) {
        var child = this.component.getComponent(i);
        this._renderAddChild(update, child, divElement);
    }

    parentElement.appendChild(divElement);
};

EchoRender.ComponentSync.ContentPane.prototype._renderAddChild = function(update, child, parentElement) {
    var divElement = document.createElement("div");
    divElement.id = this.component.renderId + "__" + child.renderId;
    divElement.style.position = "absolute";
    if (child.floatingPane) {
        divElement.style.zIndex = "1";
    } else {
        divElement.style.zIndex = "0";
        divElement.style.left = "0px";
        divElement.style.top = "0px";
        divElement.style.bottom = "0px";
        divElement.style.right = "0px";
        EchoWebCore.VirtualPosition.register(divElement.id);
    }
    EchoRender.renderComponentAdd(update, child, divElement);
    parentElement.appendChild(divElement);
};

EchoRender.ComponentSync.ContentPane.prototype.renderDispose = function(update) { };

EchoRender.ComponentSync.ContentPane.prototype._renderRemoveChild = function(update, child) {
    var divElement = document.getElementById(this.component.renderId + "__" + child.renderId);
    divElement.parentNode.removeChild(divElement);
};

EchoRender.ComponentSync.ContentPane.prototype.renderUpdate = function(update) {
    var fullRender = false;
    if (update.hasUpdatedProperties() || update.hasUpdatedLayoutDataChildren()) {
        // Full render
        fullRender = true;
    } else {
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
            var contentPaneDivElemenet = document.getElementById(this.component.renderId);
            for (var i = 0; i < length; ++i) {
                var child = addedChildren.items[i];
                var index = this.component.indexOf(child);
                this._renderAddChild(update, child, contentPaneDivElemenet, index); 
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

EchoRender.registerPeer("ContentPane", EchoRender.ComponentSync.ContentPane);
