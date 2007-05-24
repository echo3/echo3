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

EchoRender.ComponentSync.TextComponent.prototype._addEventHandlers = function(element) {
    EchoWebCore.EventProcessor.add(element, "blur", new EchoCore.MethodRef(this, this._processBlur), false);
    EchoWebCore.EventProcessor.add(element, "keyup", new EchoCore.MethodRef(this, this._processKeyUp), false);
};

EchoRender.ComponentSync.TextComponent.prototype.renderDispose = function(update) {
	var element = document.getElementById(this.component.renderId);
	EchoWebCore.EventProcessor.removeAll(element);
};

EchoRender.ComponentSync.TextComponent.prototype._processBlur = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    this.component.setProperty("text", e.registeredTarget.value);
};

EchoRender.ComponentSync.TextComponent.prototype._processKeyUp = function(e) {
    if (!this.component.isActive()) {
		EchoWebCore.DOM.preventEventDefault(e);
        return;
    }
    this._sanitizeInput(e.registeredTarget);
    this.component.setProperty("text", e.registeredTarget.value);
    if (e.keyCode == 13) {
	    this.component.fireEvent(new EchoCore.Event(this.component, "action"));
    }
};

EchoRender.ComponentSync.TextComponent.prototype._sanitizeInput = function(element) {
    var maximumLength = this.component.getRenderProperty("maximumLength", -1);
    if (maximumLength >= 0) {
        if (element.value && element.value.length > maximumLength) {
            element.value = element.value.substring(0, maximumLength);
        }
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
    this._addEventHandlers(textAreaElement);
    if (this.component.getProperty("text")) {
        textAreaElement.appendChild(document.createTextNode(this.component.getProperty("text")));
    } else {
        textAreaElement.appendChild(document.createTextNode(""));
    }
    parentElement.appendChild(textAreaElement);
};

EchoRender.ComponentSync.TextArea.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return false;
};

/**
 * Component rendering peer: TextField
 */
EchoRender.ComponentSync.TextField = function() {
	this._type = "text";
};

EchoRender.ComponentSync.TextField.prototype = new EchoRender.ComponentSync.TextComponent;

EchoRender.ComponentSync.TextField.prototype.renderAdd = function(update, parentElement) {
    var inputElement = document.createElement("input");
    inputElement.id = this.component.renderId;
    inputElement.setAttribute("type", this._type);
    var maximumLength = this.component.getRenderProperty("maximumLength", -1);
    if (maximumLength >= 0) {
	    inputElement.setAttribute("maxlength", maximumLength);
    }
    this._renderStyle(inputElement);
    this._addEventHandlers(inputElement);
    if (this.component.getProperty("text")) {
        inputElement.setAttribute("value", this.component.getProperty("text"));
    }
    parentElement.appendChild(inputElement);
};

EchoRender.ComponentSync.TextField.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return false;
};

EchoRender.ComponentSync.TextField.prototype._sanitizeInput = function(element) {
	// allow all input
};

/**
 * Component rendering peer: PasswordField
 */
EchoRender.ComponentSync.PasswordField = function() {
	this._type = "password";
};

EchoRender.ComponentSync.PasswordField.prototype = new EchoRender.ComponentSync.TextField;

EchoRender.registerPeer("TextArea", EchoRender.ComponentSync.TextArea);
EchoRender.registerPeer("TextField", EchoRender.ComponentSync.TextField);
EchoRender.registerPeer("PasswordField", EchoRender.ComponentSync.PasswordField);
