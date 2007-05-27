/**
 * Component rendering peer: Label
 */
EchoRender.ComponentSync.Label = function() { };

EchoRender.ComponentSync.Label.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.Label._defaultIconTextMargin = new EchoApp.Property.Extent(5);

EchoRender.ComponentSync.Label.prototype._createSingleItemSpanElement = function(contentNode) {
    var spanElement = document.createElement("span");
    spanElement.appendChild(contentNode);
    return spanElement;
};

EchoRender.ComponentSync.Label.prototype.getElement = function() {
    return this._labelElement;
};

EchoRender.ComponentSync.Label.prototype.renderAdd = function(update, parentElement) {
    var icon = this.component.getRenderProperty("icon");
    var text = this.component.getRenderProperty("text");
    
    if (text) {
        var lineWrap = this.component.getRenderProperty("lineWrap", true);
        if (icon) {
            // Text and icon.
            var iconTextMargin = this.component.getRenderProperty("iconTextMargin", 
                    EchoRender.ComponentSync.Label._defaultIconTextMargin);
            var tct = new EchoRender.TriCellTable(this.component.renderId,
                    EchoRender.TriCellTable.TRAILING_LEADING, EchoRender.Property.Extent.toPixels(iconTextMargin));
            var imgElement = document.createElement("img");
            imgElement.src = icon.url;
            tct.tdElements[0].appendChild(document.createTextNode(text));
            if (!lineWrap) {
                tct.tdElements[0].style.whiteSpace = "nowrap";
            }
            tct.tdElements[1].appendChild(imgElement);
            this._labelElement = tct.tableElement;
        } else {
            this._labelElement = this._createSingleItemSpanElement(document.createTextNode(text));
            if (!lineWrap) {
                this._labelElement.style.whiteSpace = "nowrap";
            }
        }
    } else if (icon) {
        var imgElement = document.createElement("img");
        imgElement.src = icon.url;
        this._labelElement = this._createSingleItemSpanElement(imgElement);
    } else {
        // Neither icon nor text, render blank.
        this._labelElement = this._createSingleItemSpanElement(document.createTextNode(""));
    }
    
    this._labelElement.id = this.component.renderId;
    EchoRender.Property.Color.renderFB(this.component, this._labelElement);
    EchoRender.Property.Font.renderComponentProperty(this.component, "font", null, this._labelElement);

    parentElement.appendChild(this._labelElement);
};

EchoRender.ComponentSync.Label.prototype.renderDispose = function(update) { 
    this._labelElement = null;
};

EchoRender.ComponentSync.Label.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
};

EchoRender.registerPeer("Label", EchoRender.ComponentSync.Label);
