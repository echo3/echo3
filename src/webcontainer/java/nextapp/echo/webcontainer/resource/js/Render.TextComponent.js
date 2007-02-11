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
    if (this.component.getRenderProperty("text")) {
        inputElement.setAttribute("value", this.component.getRenderProperty("text"));
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

EchoRender.registerPeer("TextField", EchoRender.ComponentSync.TextField);
