/**
 * Component rendering peer: ListBox
 */
EchoRender.ComponentSync.ListBox = function() { };

EchoRender.ComponentSync.ListBox.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.ListBox.prototype.renderAdd = function(update, parentElement) {
    var selectElement = document.createElement("select");
    selectElement.id = this.component.renderId;
    selectElement.size = 5;
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), selectElement);
    EchoRender.Property.Color.renderFB(this.component, selectElement);
    EchoRender.Property.Font.renderComponentProperty(this.component, "font", null, selectElement);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, selectElement, "padding");
    parentElement.appendChild(selectElement);
};

EchoRender.ComponentSync.ListBox.prototype.renderDispose = function(update) { };

EchoRender.ComponentSync.ListBox.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return false;
};

/**
 * Component rendering peer: SelectField
 */
EchoRender.ComponentSync.SelectField = function() { };

EchoRender.ComponentSync.SelectField.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.SelectField.prototype.renderAdd = function(update, parentElement) {
    var selectElement = document.createElement("select");
    selectElement.id = this.component.renderId;
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), selectElement);
    EchoRender.Property.Color.renderFB(this.component, selectElement);
    EchoRender.Property.Font.renderComponentProperty(this.component, "font", null, selectElement);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, selectElement, "padding");
    parentElement.appendChild(selectElement);
};

EchoRender.ComponentSync.SelectField.prototype.renderDispose = function(update) { };

EchoRender.ComponentSync.SelectField.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return false;
};

EchoRender.registerPeer("ListBox", EchoRender.ComponentSync.ListBox);
EchoRender.registerPeer("SelectField", EchoRender.ComponentSync.SelectField);
