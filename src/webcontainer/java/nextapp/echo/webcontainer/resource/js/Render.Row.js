/**
 * Component rendering peer: Row
 */
EchoRender.ComponentSync.Row = function() { };

EchoRender.ComponentSync.Row.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.Row.prototype.processKeyDown = function(e) { 
    switch (e.keyCode) {
    case 37:
        var focusChanged = EchoRender.Focus.visitNextFocusComponent(this.component, true);
        return !focusChanged;
    case 39:
        var focusChanged = EchoRender.Focus.visitNextFocusComponent(this.component, false);
        return !focusChanged;
    }
    return true;
};

EchoRender.ComponentSync.Row.prototype.getContainerElement = function(component) {
    return EchoRender.SyncUtil.findContainerElementByIndex(component);
};

EchoRender.ComponentSync.Row.prototype.renderAdd = function(update, parentElement) {
    var cellSpacing = this.component.getRenderProperty("cellSpacing");
    var insets = this.component.getRenderProperty("insets");

    var tableElement = document.createElement("table");
    tableElement.id = this.component.renderId;
    tableElement.style.borderCollapse = "collapse";
    EchoRender.Property.Color.renderFB(this.component, tableElement);

    var tbodyElement = document.createElement("tbody");
    tableElement.appendChild(tbodyElement);
    var trElement = document.createElement("tr");
    tbodyElement.appendChild(trElement);
    
    var componentCount = this.component.getComponentCount();
    for (var i = 0; i < componentCount; ++i) {
        var child = this.component.getComponent(i);
        this._renderAddChild(update, child, trElement);
    }
    
    EchoWebCore.EventProcessor.add(tableElement, "keydown", new EchoCore.MethodRef(this, this.processKeyDown), false);

    parentElement.appendChild(tableElement);
};

EchoRender.ComponentSync.Row.prototype._renderAddChild = function(update, child, parentElement) {
    var tdElement = document.createElement("td");
    tdElement.style.padding = "0px";
    EchoRender.renderComponentAdd(update, child, tdElement);
    parentElement.appendChild(tdElement);
};

EchoRender.ComponentSync.Row.prototype.renderDispose = function(update) { 
    var tableElement = document.getElementById(this.component.renderId);
    EchoWebCore.EventProcessor.remove(tableElement, "keydown", new EchoCore.MethodRef(this, this.processKeyDown), false);
};

EchoRender.ComponentSync.Row.prototype.renderUpdate = function(update) {
    EchoRender.SyncUtil.renderRemove(update, update.parent);
    var containerElement = EchoRender.SyncUtil.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return true;
};

EchoRender.registerPeer("Row", EchoRender.ComponentSync.Row);
