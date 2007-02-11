/**
 * Component rendering peer: Button
 */
EchoRender.ComponentSync.Button = function() {
};

EchoRender.ComponentSync.Button.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.Button.prototype.doAction = function() {
    this.component.doAction();
};

EchoRender.ComponentSync.Button.prototype.focus = function(e) {
    var divElement = document.getElementById(this.component.renderId);
    divElement.focus();
    this.setFocusState(true);
    this.component.application.setFocusedComponent(this.component);
};

EchoRender.ComponentSync.Button.prototype.processBlur = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this.setFocusState(false);
};

EchoRender.ComponentSync.Button.prototype.processClick = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this.doAction();
};

EchoRender.ComponentSync.Button.prototype.processFocus = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this.component.application.setFocusedComponent(this.component);
    this.setFocusState(true);
};

EchoRender.ComponentSync.Button.prototype.processKeyPress = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    if (e.keyCode == 13) {
        this.doAction();
        return false;
    } else {
        return true;
    }
};

EchoRender.ComponentSync.Button.prototype.processPress = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    var divElement = document.getElementById(this.component.renderId);
    if (this.component.getRenderProperty("pressedEnabled")) {
        EchoRender.Property.Color.renderComponentProperty(this.component, "pressedBackground", null, divElement, "background");
        EchoRender.Property.Color.renderComponentProperty(this.component, "pressedForeground", null, divElement, "color");
    }
    EchoWebCore.DOM.preventEventDefault(e);
};

EchoRender.ComponentSync.Button.prototype.processRelease = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    var divElement = document.getElementById(this.component.renderId);
    if (this.component.getRenderProperty("pressedEnabled")) {
        EchoRender.Property.Color.renderComponentProperty(this.component, "background", null, divElement, "background");
        EchoRender.Property.Color.renderComponentProperty(this.component, "foreground", null, divElement, "color");
    }
};

EchoRender.ComponentSync.Button.prototype.processRolloverEnter = function(e) {
    if (!this.component.isActive() || EchoWebCore.dragInProgress) {
        return;
    }
    this.setFocusState(true);
};

EchoRender.ComponentSync.Button.prototype.processRolloverExit = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this.setFocusState(false);
};

EchoRender.ComponentSync.Button.prototype.renderAdd = function(update, parentElement) {
    var divElement = document.createElement("div");
    divElement.id = this.component.renderId;
    divElement.tabIndex = "0";
    divElement.style.outlineStyle = "none";
    divElement.style.overflow = "hidden";
    EchoRender.Property.Color.renderFB(this.component, divElement);
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), divElement);
    EchoRender.Property.Insets.renderPixel(this.component.getRenderProperty("insets"), divElement, "padding");
    if (this.component.getRenderProperty("text")) {
        divElement.appendChild(document.createTextNode(this.component.getRenderProperty("text")));
    }
    divElement.style.cursor = "pointer";

    EchoWebCore.EventProcessor.add(divElement, "click", new EchoCore.MethodRef(this, this.processClick), false);
    EchoWebCore.EventProcessor.add(divElement, "keypress", new EchoCore.MethodRef(this, this.processKeyPress), false);
    EchoWebCore.EventProcessor.add(divElement, "mouseover", new EchoCore.MethodRef(this, this.processRolloverEnter), false);
    EchoWebCore.EventProcessor.add(divElement, "mouseout", new EchoCore.MethodRef(this, this.processRolloverExit), false);
    EchoWebCore.EventProcessor.add(divElement, "mousedown", new EchoCore.MethodRef(this, this.processPress), false);
    EchoWebCore.EventProcessor.add(divElement, "mouseup", new EchoCore.MethodRef(this, this.processRelease), false);
    EchoWebCore.EventProcessor.add(divElement, "focus", new EchoCore.MethodRef(this, this.processFocus), false);
    EchoWebCore.EventProcessor.add(divElement, "blur", new EchoCore.MethodRef(this, this.processBlur), false);
    
    EchoWebCore.EventProcessor.addSelectionDenialListener(divElement);
    
    parentElement.appendChild(divElement);
};

EchoRender.ComponentSync.Button.prototype.renderDispose = function(update) {
    var divElement = document.getElementById(this.component.renderId);
    EchoWebCore.EventProcessor.removeAll(divElement);
};

EchoRender.ComponentSync.Button.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return false;
};

EchoRender.ComponentSync.Button.prototype.setFocusState = function(focusState) {
    var divElement = document.getElementById(this.component.renderId);
    if (focusState) {
        if (this.component.getRenderProperty("rolloverEnabled")) {
            EchoRender.Property.Color.renderComponentProperty(this.component, "rolloverBackground", null, divElement, "background");
            EchoRender.Property.Color.renderComponentProperty(this.component, "rolloverForeground", null, divElement, "color");
        }
    } else {
        if (this.component.getRenderProperty("rolloverEnabled")) {
            EchoRender.Property.Color.renderComponentProperty(this.component, "background", null, divElement, "background");
            EchoRender.Property.Color.renderComponentProperty(this.component, "foreground", null, divElement, "color");
        }
    }
};

EchoRender.registerPeer("Button", EchoRender.ComponentSync.Button);
