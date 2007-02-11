/**
 * Component rendering peer: Label
 */
EchoRender.ComponentSync.Label = function() { };

EchoRender.ComponentSync.Label.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.Label.prototype._createSingleItemSpanElement = function(contentNode) {
    var spanElement = document.createElement("span");
    spanElement.id = this.component.renderId;
    EchoRender.Property.Color.renderFB(this.component, spanElement);
    spanElement.appendChild(contentNode);
    return spanElement;
};

EchoRender.ComponentSync.Label.prototype.renderAdd = function(update, parentElement) {
    var labelElement;
    var icon = this.component.getRenderProperty("icon");
    var text = this.component.getRenderProperty("text");
    
    if (text) {
        if (icon) {
            labelElement = this._createSingleItemSpanElement(document.createTextNode(icon + "/" + text));
        } else {
            labelElement = this._createSingleItemSpanElement(document.createTextNode(text));
        }
    } else if (icon) {
        var imgElement = document.createElement("img");
        imgElement.src = icon.url;
        labelElement = this._createSingleItemSpanElement(imgElement);
    } else {
        // Neither icon nor text, render blank.
        labelElement = this._createSingleItemSpanElement(document.createTextNode(""));
    }

    parentElement.appendChild(labelElement);
};

EchoRender.ComponentSync.Label.prototype.renderDispose = function(update) { };

EchoRender.ComponentSync.Label.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
};

EchoRender.registerPeer("Label", EchoRender.ComponentSync.Label);
