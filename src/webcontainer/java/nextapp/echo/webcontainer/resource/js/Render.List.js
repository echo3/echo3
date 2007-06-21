//FIXME.  This code is fairly temporary, once I'm comfortable with the way selection/model/rendering data properties are being set
// during serialization, it needs to be gutted to support IE6 (with a DIV/DHTML based listbox impl because of this browser's
// totally broken impl of rendering listbox-style select elements.

/**
 * Component rendering peer: ListBox
 */
EchoRender.ComponentSync.ListBox = function() { };

EchoRender.ComponentSync.ListBox.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.ListBox.prototype.renderAdd = function(update, parentElement) {
    this._selectElement = document.createElement("select");
    this._selectElement.id = this.component.renderId;
    this._selectElement.size = 5;
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), this._selectElement);
    EchoRender.Property.Color.renderFB(this.component, this._selectElement);
    EchoRender.Property.Font.renderComponentProperty(this.component, "font", null, this._selectElement);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, this._selectElement, "padding");
    parentElement.appendChild(this._selectElement);
};

EchoRender.ComponentSync.ListBox.prototype.renderDispose = function(update) { 
    this._selectElement.id = "";
    this._selectElement = null;    
};

EchoRender.ComponentSync.ListBox.prototype.renderUpdate = function(update) {
    var element = this._selectElement;
    var containerElement = element.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(element);
    this.renderAdd(update, containerElement);
    return false; // Child elements not supported: safe to return false.
};

/**
 * Component rendering peer: SelectField
 */
EchoRender.ComponentSync.SelectField = function() { };

EchoRender.ComponentSync.SelectField.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.SelectField.prototype.renderAdd = function(update, parentElement) {
    this._selectElement = document.createElement("select");
    this._selectElement.id = this.component.renderId;
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), this._selectElement);
    EchoRender.Property.Color.renderFB(this.component, this._selectElement);
    EchoRender.Property.Font.renderComponentProperty(this.component, "font", null, this._selectElement);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, this._selectElement, "padding");
    
    if (this.component.items) {
        for (var i = 0; i < this.component.items.length; ++i) {
            var optionElement = document.createElement("option");
            optionElement.appendChild(document.createTextNode(this.component.items[i].toString()));
            this._selectElement.appendChild(optionElement);
        }
    }
    
    parentElement.appendChild(this._selectElement);
};

EchoRender.ComponentSync.SelectField.prototype.renderDispose = function(update) {
    this._selectElement.id = "";
    this._selectElement = null;    
};

EchoRender.ComponentSync.SelectField.prototype.renderUpdate = function(update) {
    var element = this._selectElement;
    var containerElement = element.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(element);
    this.renderAdd(update, containerElement);
    return false; // Child elements not supported: safe to return false.
};

EchoRender.registerPeer("ListBox", EchoRender.ComponentSync.ListBox);
EchoRender.registerPeer("SelectField", EchoRender.ComponentSync.SelectField);
