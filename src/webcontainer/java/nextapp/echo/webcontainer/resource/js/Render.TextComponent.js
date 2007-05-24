/**
 * Component rendering peer: TextComponent
 */
EchoRender.ComponentSync.TextComponent = function() { };

EchoRender.ComponentSync.TextComponent.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.TextComponent.prototype._renderStyle = function(element) {
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), element);
    EchoRender.Property.Color.renderFB(this.component, element);
    EchoRender.Property.Font.renderComponentProperty(this.component, "font", null, element);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, element, "padding");
    var width = this.component.getRenderProperty("width");
    if (width) {
    	element.style.width = width.toString();
    }
    var height = this.component.getRenderProperty("height");
    if (height) {
    	element.style.height = height.toString();
    }
};

/**
 * Component rendering peer: TextArea
 */
EchoRender.ComponentSync.TextArea = function() { };

EchoRender.ComponentSync.TextArea.prototype = new EchoRender.ComponentSync.TextComponent;

EchoRender.ComponentSync.TextArea.prototype.renderAdd = function(update, parentElement) {
    var textAreaElement = document.createElement("textarea");
    textAreaElement.id = this.component.renderId;
    this._renderStyle(textAreaElement);
    if (this.component.getProperty("text")) {
        textAreaElement.appendChild(document.createTextNode(this.component.getProperty("text")));
    } else {
        textAreaElement.appendChild(document.createTextNode(""));
    }
    parentElement.appendChild(textAreaElement);
};

EchoRender.ComponentSync.TextArea.prototype.renderDispose = function(update) { };

EchoRender.ComponentSync.TextArea.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return false;
};

/**
 * Component rendering peer: TextField
 */
EchoRender.ComponentSync.TextField = function() { };

EchoRender.ComponentSync.TextField.prototype = new EchoRender.ComponentSync.TextComponent;

EchoRender.ComponentSync.TextField.prototype.renderAdd = function(update, parentElement) {
    var inputElement = document.createElement("input");
    inputElement.id = this.component.renderId;
    inputElement.setAttribute("type", "text");
    this._renderStyle(inputElement);
    if (this.component.getProperty("text")) {
        inputElement.setAttribute("value", this.component.getProperty("text"));
    }
    parentElement.appendChild(inputElement);
};

EchoRender.ComponentSync.TextField.prototype.renderDispose = function(update) { };

EchoRender.ComponentSync.TextField.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return false;
};

EchoRender.registerPeer("TextArea", EchoRender.ComponentSync.TextArea);
EchoRender.registerPeer("TextField", EchoRender.ComponentSync.TextField);
