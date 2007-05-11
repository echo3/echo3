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

EchoRender.ComponentSync.Label.prototype.renderAdd = function(update, parentElement) {
    var labelElement;
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
            labelElement = tct.tableElement;
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
    
    labelElement.id = this.component.renderId;
    EchoRender.Property.Color.renderFB(this.component, labelElement);
    EchoRender.Property.Font.renderComponentProperty(this.component, "font", null, labelElement);

    parentElement.appendChild(labelElement);
};

EchoRender.ComponentSync.Label.prototype.renderDispose = function(update) { };

EchoRender.ComponentSync.Label.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
};

EchoRender.registerPeer("Label", EchoRender.ComponentSync.Label);
