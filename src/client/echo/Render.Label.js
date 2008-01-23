/**
 * Component rendering peer: Label
 */
EchoAppRender.LabelSync = Core.extend(EchoRender.ComponentSync, { 

    $static: {
    
       _defaultIconTextMargin: 5
    },
    
    $load: function() {
        EchoRender.registerPeer("Label", this);
    },
    
    /**
     * Formats the whitespace in the given text for use in HTML.
     * 
     * @param text {String} the text to format
     * @param parentElement the element to append the text to
     */
    _formatWhitespace: function(text, parentElement) {
        // switch between spaces and non-breaking spaces to preserve line wrapping
        text = text.replace(/\t/g, " \u00a0 \u00a0");
        text = text.replace(/ {2}/g, " \u00a0");
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (i > 0) {
                parentElement.appendChild(document.createElement("br"));
            }
            if (line.length > 0) {
                parentElement.appendChild(document.createTextNode(line));
            }
        }
    },
    
    renderAdd: function(update, parentElement) {
        this._containerElement = parentElement;
        var icon = this.component.render("icon");
        var text = this.component.render("text");
        var foreground = this.component.render("foreground");
        var background = this.component.render("background");
    
        if (text) {
            var lineWrap = this.component.render("lineWrap", true);
            var formatWhitespace = this.component.render("formatWhitespace", false)
                    && (text.indexOf(' ') != -1 || text.indexOf('\n') != -1 || text.indexOf('\t') != -1);
            
            if (icon) {
                // Text and icon.
                var iconTextMargin = this.component.render("iconTextMargin", 
                        EchoAppRender.LabelSync._defaultIconTextMargin);
                var orientation = EchoAppRender.TriCellTable.getOrientation(this.component, "textPosition");
                var tct = new EchoAppRender.TriCellTable(orientation, EchoAppRender.Extent.toPixels(iconTextMargin));
                var imgElement = document.createElement("img");
                imgElement.src = icon.url;
                if (formatWhitespace) {
                    this._formatWhitespace(text, tct.tdElements[0]);
                } else {
                    tct.tdElements[0].appendChild(document.createTextNode(text));
                }
                if (!lineWrap) {
                    tct.tdElements[0].style.whiteSpace = "nowrap";
                }
                tct.tdElements[1].appendChild(imgElement);
                this._labelNode = tct.tableElement;
                this._labelNode.id = this.component.renderId;
                EchoAppRender.Font.renderComponentProperty(this.component, "font", null, this._labelNode);
                EchoAppRender.Color.renderFB(this.component, this._labelNode);
            } else {
                // Text without icon.
                var font = this.component.render("font");
                if (!font && lineWrap && !foreground && !background && !formatWhitespace) {
                    this._labelNode = document.createTextNode(text);
                } else {
                    this._labelNode = document.createElement("span");
                    this._labelNode.id = this.component.renderId;
                    if (formatWhitespace) {
                        this._formatWhitespace(text, this._labelNode);
                    } else {
                        this._labelNode.appendChild(document.createTextNode(text));
                    }
                    if (!lineWrap) {
                        this._labelNode.style.whiteSpace = "nowrap";
                    }
                    EchoAppRender.Font.renderComponentProperty(this.component, "font", null, this._labelNode);
                    EchoAppRender.Color.renderFB(this.component, this._labelNode);
                }
            }
        } else if (icon) {
            var imgElement = document.createElement("img");
            imgElement.src = icon.url;
            this._labelNode = document.createElement("span");
            this._labelNode.id = this.component.renderId;
            this._labelNode.appendChild(imgElement);
            EchoAppRender.Color.renderFB(this.component, this._labelNode); // should be BG only.
        } else {
            // Neither icon nor text, render blank.
            this._labelNode = null;
        }
    
        if (this._labelNode) {
            parentElement.appendChild(this._labelNode);
        }
    },
    
    renderDispose: function(update) {
        this._containerElement = null;
        this._labelNode = null;
    },
    
    renderUpdate: function(update) {
        if (this._labelNode) {
            this._labelNode.parentNode.removeChild(this._labelNode);
        }
        // Note: this.renderDispose() is not invoked (it does nothing).
        this.renderAdd(update, this._containerElement);
        return false; // Child elements not supported: safe to return false.
    }
});
