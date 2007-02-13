/**
 * Component rendering peer: TextArea
 */
EchoRender.ComponentSync.TextArea = function() { };

EchoRender.ComponentSync.TextArea.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.TextArea.prototype.renderAdd = function(update, parentElement) {
    var textAreaElement = document.createElement("textarea");
    textAreaElement.id = this.component.renderId;
    EchoRender.Property.Color.renderFB(this.component, textAreaElement);
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

EchoRender.ComponentSync.TextField.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.TextField.prototype.renderAdd = function(update, parentElement) {
    var inputElement = document.createElement("input");
    inputElement.id = this.component.renderId;
    inputElement.setAttribute("type", "text");
    EchoRender.Property.Color.renderFB(this.component, inputElement);
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
