// FIXME render enabled/disabled/pressed/rollover/focus properties

/**
 * Component rendering peer: Button
 */
EchoRender.ComponentSync.Button = function() {
	this._divElement = null;
};

EchoRender.ComponentSync.Button.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.Button._defaultIconTextMargin = new EchoApp.Property.Extent(5);

EchoRender.ComponentSync.Button.prototype.focus = function(e) {
    this._divElement.focus();
    this._setFocusState(true);
    this.component.application.setFocusedComponent(this.component);
};

EchoRender.ComponentSync.Button.prototype._doAction = function() {
    this.component.doAction();
};

EchoRender.ComponentSync.Button.prototype._processBlur = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this._setFocusState(false);
};

EchoRender.ComponentSync.Button.prototype._processClick = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this._doAction();
};

EchoRender.ComponentSync.Button.prototype._processFocus = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this.component.application.setFocusedComponent(this.component);
    this._setFocusState(true);
};

EchoRender.ComponentSync.Button.prototype._processKeyPress = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    if (e.keyCode == 13) {
        this._doAction();
        return false;
    } else {
        return true;
    }
};

EchoRender.ComponentSync.Button.prototype._processPress = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    EchoRender.Property.Color.renderComponentProperty(this.component, "pressedBackground", null, this._divElement, "background");
    EchoRender.Property.Color.renderComponentProperty(this.component, "pressedForeground", null, this._divElement, "color");
    EchoWebCore.DOM.preventEventDefault(e);
};

EchoRender.ComponentSync.Button.prototype._processRelease = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    EchoRender.Property.Color.renderComponentProperty(this.component, "background", null, this._divElement, "background");
    EchoRender.Property.Color.renderComponentProperty(this.component, "foreground", null, this._divElement, "color");
};

EchoRender.ComponentSync.Button.prototype._processRolloverEnter = function(e) {
    if (!this.component.isActive() || EchoWebCore.dragInProgress) {
        return;
    }
    this._setRolloverState(true);
};

EchoRender.ComponentSync.Button.prototype._processRolloverExit = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this._setRolloverState(false);
};

EchoRender.ComponentSync.Button.prototype.renderAdd = function(update, parentElement) {
    var divElement = document.createElement("div");
    divElement.id = this.component.renderId;
    divElement.tabIndex = "0";
    if (this.component.getRenderProperty("focusedEnabled")) {
        divElement.style.outlineStyle = "none";
    }
    divElement.style.overflow = "hidden";
    divElement.style.cursor = "pointer";
    EchoRender.Property.Color.renderFB(this.component, divElement);
    EchoRender.Property.Font.renderDefault(this.component, divElement);
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), divElement);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", "", divElement, "padding");
    // FIXME use textAlignment and _getCombinedAlignment()
    EchoRender.Property.Alignment.renderComponentProperty(this.component, "alignment", null, divElement, false, null);
    var toolTipText = this.component.getRenderProperty("toolTipText");
    if (toolTipText) {
    	divElement.title = toolTipText;
    }
    var width = this.component.getRenderProperty("width");
    if (width) {
    	divElement.style.width = width.toString();
    }
    var height = this.component.getRenderProperty("height");
    if (height) {
    	divElement.style.height = height.toString();
    	divElement.style.overflow = "hidden";
    }
    var text = this.component.getRenderProperty("text");
    var icon = this.component.getRenderProperty("icon");

    if (text) {
		var lineWrap = this.component.getRenderProperty("lineWrap", true);
        if (icon) {
            // Text and icon.
            var iconTextMargin = this.component.getRenderProperty("iconTextMargin", EchoRender.ComponentSync.Button._defaultIconTextMargin);
            var tct = new EchoRender.TriCellTable(this.component.renderId,
                    EchoRender.TriCellTable.TRAILING_LEADING, EchoRender.Property.Extent.toPixels(iconTextMargin));
            var imgElement = document.createElement("img");
            imgElement.src = icon.url;
            tct.tdElements[0].appendChild(document.createTextNode(text));
			if (!lineWrap) {
		    	tct.tdElements[0].style.whiteSpace = "nowrap";
			}
            tct.tdElements[1].appendChild(imgElement);
            divElement.appendChild(tct.tableElement);
        } else {
            // Text only.
            divElement.appendChild(document.createTextNode(text));
			if (!lineWrap) {
		    	divElement.style.whiteSpace = "nowrap";
			}
        }
    } else if (icon) {
        // Icon only.
        var imgElement = document.createElement("img");
        imgElement.src = icon.url;
        imgElement.alt = "";
        divElement.appendChild(imgElement);
    } else {
        // No text or icon.
    }
    
    EchoWebCore.EventProcessor.add(divElement, "click", new EchoCore.MethodRef(this, this._processClick), false);
    EchoWebCore.EventProcessor.add(divElement, "keypress", new EchoCore.MethodRef(this, this._processKeyPress), false);
	if (this.component.getRenderProperty("rolloverEnabled")) {
        var mouseEnterLeaveSupport = EchoWebCore.Environment.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
        var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
        var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
	    EchoWebCore.EventProcessor.add(divElement, enterEvent, new EchoCore.MethodRef(this, this._processRolloverEnter), false);
    	EchoWebCore.EventProcessor.add(divElement, exitEvent, new EchoCore.MethodRef(this, this._processRolloverExit), false);
	}
    if (this.component.getRenderProperty("pressedEnabled")) {
	    EchoWebCore.EventProcessor.add(divElement, "mousedown", new EchoCore.MethodRef(this, this._processPress), false);
    	EchoWebCore.EventProcessor.add(divElement, "mouseup", new EchoCore.MethodRef(this, this._processRelease), false);
    }
    EchoWebCore.EventProcessor.add(divElement, "focus", new EchoCore.MethodRef(this, this._processFocus), false);
    EchoWebCore.EventProcessor.add(divElement, "blur", new EchoCore.MethodRef(this, this._processBlur), false);
    
    EchoWebCore.EventProcessor.addSelectionDenialListener(divElement);
    
    parentElement.appendChild(divElement);
    
    this._divElement = divElement;
};

EchoRender.ComponentSync.Button.prototype._getCombinedAlignment = function() {
	var primary = this.component.getRenderProperty("alignment");
	var secondary = this.component.getRenderProperty("textAlignment");
    
    if (primary == null) {
        return secondary;
    } else if (secondary == null) {
        return primary;
    }
    
    var horizontal = primary.horizontal;
    if (horizontal == EchoApp.Property.Alignment.DEFAULT) {
    	horizontal = secondary.horizontal;
    }
    var vertical = primary.vertical;
    if (vertical == EchoApp.Property.Alignment.DEFAULT) {
    	vertical = secondary.vertical;
    }
    return new EchoApp.Property.Alignment(horizontal, vertical);
};

EchoRender.ComponentSync.Button.prototype.renderDispose = function(update) {
    EchoWebCore.EventProcessor.removeAll(this._divElement);
    this._divElement = null;
};

EchoRender.ComponentSync.Button.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return false;
};

EchoRender.ComponentSync.Button.prototype._setFocusState = function(focusState) {
    if (!this.component.getRenderProperty("focusedEnabled")) {
    	return;
    }
    var fontProperty = rolloverState ? "focusedFont" : "font";
    var bgProperty = focusState ? "focusedBackground" : "background";
    var fgProperty = focusState ? "focusedForeground" : "foreground";
    
    var font = this.component.getRenderProperty(fontProperty);
    if (font) {
	    EchoRender.Property.Font.render(font, this._divElement);
    } else {
	    EchoRender.Property.Font.clear(this._divElement);
    }
    EchoRender.Property.Color.renderComponentProperty(this.component, bgProperty, null, this._divElement, "background");
    EchoRender.Property.Color.renderComponentProperty(this.component, fgProperty, null, this._divElement, "color");
};

EchoRender.ComponentSync.Button.prototype._setRolloverState = function(rolloverState) {
    var fontProperty = rolloverState ? "rolloverFont" : "font";
    var bgProperty = rolloverState ? "rolloverBackground" : "background";
    var fgProperty = rolloverState ? "rolloverForeground" : "foreground";
    
    var font = this.component.getRenderProperty(fontProperty);
    if (font) {
	    EchoRender.Property.Font.render(font, this._divElement);
    } else {
	    EchoRender.Property.Font.clear(this._divElement);
    }
    EchoRender.Property.Color.renderComponentProperty(this.component, bgProperty, null, this._divElement, "background");
    EchoRender.Property.Color.renderComponentProperty(this.component, fgProperty, null, this._divElement, "color");
};

EchoRender.registerPeer("Button", EchoRender.ComponentSync.Button);
