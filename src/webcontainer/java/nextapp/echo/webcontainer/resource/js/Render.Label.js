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
    return this._labelNode;
};

EchoRender.ComponentSync.Label.prototype.renderAdd = function(update, parentElement) {
    var icon = this.component.getRenderProperty("icon");
    var text = this.component.getRenderProperty("text");
    var foreground = this.component.getRenderProperty("foreground");
    var background = this.component.getRenderProperty("background");

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
            this._labelNode = tct.tableElement;
            EchoRender.Property.Font.renderComponentProperty(this.component, "font", null, this._labelNode);
            EchoRender.Property.Color.renderFB(this.component, this._labelNode);
        } else {
	        var font = this.component.getRenderProperty("font");
            if (!font && lineWrap && !foreground && !background) {
                this._labelNode = document.createTextNode(text);
            } else {
                this._labelNode = this._createSingleItemSpanElement(document.createTextNode(text));
                if (!lineWrap) {
                    this._labelNode.style.whiteSpace = "nowrap";
                }
                EchoRender.Property.Font.renderComponentProperty(this.component, "font", null, this._labelNode);
                EchoRender.Property.Color.renderFB(this.component, this._labelNode);
            }
        }
    } else if (icon) {
        var imgElement = document.createElement("img");
        imgElement.src = icon.url;
        this._labelNode = this._createSingleItemSpanElement(imgElement);
        EchoRender.Property.Color.renderFB(this.component, this._labelNode); // should be BG only.
    } else {
        // Neither icon nor text, render blank.
        this._labelNode = null;
    }

    if (this._labelNode) {
        parentElement.appendChild(this._labelNode);
    }
};

EchoRender.ComponentSync.Label.prototype.renderDispose = function(update) { 
    this._labelNode = null;
};

EchoRender.ComponentSync.Label.prototype.renderUpdate = function(update) {
    if (this._labelNode) {
        this._labelNode.parentNode.removeChild(this._labelNode);
    }
    // Note: dispose() is not invoked here because it effecitvely does nothing.
    var containerElement = this.component.parent.peer.getContainerElement(this.component);
    this.renderAdd(update, containerElement);
    return false; // Child elements not supported: safe to return false.
};

EchoRender.registerPeer("Label", EchoRender.ComponentSync.Label);
