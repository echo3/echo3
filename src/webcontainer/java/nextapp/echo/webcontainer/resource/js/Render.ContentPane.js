/**
 * Component rendering peer: ContentPane
 */
EchoRender.ComponentSync.ContentPane = function() { };

EchoRender.ComponentSync.ContentPane.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.ContentPane.prototype.getContainerElement = function(component) {
    var index = component.parent.indexOf(component);
    var contentPaneElement = document.getElementById(component.parent.renderId);
    return contentPaneElement.childNodes[index];
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
        var insets = this.component.getRenderProperty("insets", new EchoApp.Property.Insets(0));
        var pixelInsets = EchoRender.Property.Insets.toPixels(insets);
        divElement.style.zIndex = "0";
        divElement.style.left = pixelInsets.left + "px";
        divElement.style.top = pixelInsets.top + "px";
        divElement.style.bottom = pixelInsets.bottom + "px";
        divElement.style.right = pixelInsets.right + "px";
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
            var contentPaneDivElemenet = document.getElementById(this.component.renderId);
            for (var i = 0; i < addedChildren.length; ++i) {
                this._renderAddChild(update, addedChildren[i], contentPaneDivElemenet, this.component.indexOf(addedChildren[i])); 
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
