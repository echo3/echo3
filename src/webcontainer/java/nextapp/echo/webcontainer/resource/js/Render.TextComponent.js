/**
 * Component rendering peer: TextComponent
 */
EchoAppRender.TextComponentSync = Core.extend(EchoRender.ComponentSync, {
    
    $abstract: true,
    
    $static: {
        _supportedPartialProperties: ["text"]
    },
    
    _renderStyle: function() {
        EchoAppRender.Border.render(this.component.getRenderProperty("border"), this._textComponentElement);
        EchoAppRender.Color.renderFB(this.component, this._textComponentElement);
        EchoAppRender.Font.renderComponentProperty(this.component, "font", null, this._textComponentElement);
        EchoAppRender.Insets.renderComponentProperty(this.component, "insets", null, this._textComponentElement, "padding");
        EchoAppRender.FillImage.renderComponentProperty(this.component, "backgroundImage", null, this._textComponentElement);
        var width = this.component.getRenderProperty("width");
        if (width) {
        	this._textComponentElement.style.width = width.toString();
        }
        var height = this.component.getRenderProperty("height");
        if (height) {
        	this._textComponentElement.style.height = height.toString();
        }
        var toolTipText = this.component.getRenderProperty("toolTipText");
        if (toolTipText) {
            this._textComponentElement.title = toolTipText;
        }
    },
    
    _addEventHandlers: function() {
        EchoWebCore.EventProcessor.add(this._textComponentElement, "click", new Core.MethodRef(this, this._processClick), false);
        EchoWebCore.EventProcessor.add(this._textComponentElement, "blur", new Core.MethodRef(this, this._processBlur), false);
        EchoWebCore.EventProcessor.add(this._textComponentElement, "keyup", new Core.MethodRef(this, this._processKeyUp), false);
    },
    
    renderDispose: function(update) {
        EchoWebCore.EventProcessor.removeAll(this._textComponentElement);
        this._textComponentElement = null;
    },
    
    _processBlur: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        this._sanitizeInput();
        this.component.setProperty("text", e.registeredTarget.value);
    },
    
    _processClick: function(e) {
        if (!this.client.verifyInput(this.component)) {
            return;
        }
        this.component.application.setFocusedComponent(this.component);
    },
    
    _processKeyUp: function(e) {
        if (!this.client.verifyInput(this.component)) {
    		EchoWebCore.DOM.preventEventDefault(e);
            return true;
        }
        this._sanitizeInput();
        
        // Store last updated text in local value, to ensure that we do not attempt to
        // reset it to this value in renderUpdate() and miss any characters that were
        // typed between repaints.
        this._text = e.registeredTarget.value;
        
        this.component.setProperty("text", this._text);
        if (e.keyCode == 13) {
            //FIXME fire from component.
    	    this.component.fireEvent(new Core.Event("action", this.component));
        }
        return true;
    },
    
    renderFocus: function() {
        EchoWebCore.DOM.focusElement(this._textComponentElement);
    },
    
    renderUpdate: function(update) {
        var fullRender =  !Core.Arrays.containsAll(EchoAppRender.TextComponentSync._supportedPartialProperties, 
                    update.getUpdatedPropertyNames(), true);
    
        if (fullRender) {
            var element = this._textComponentElement;
            var containerElement = element.parentNode;
            this.renderDispose(update);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        } else {
            if (update.hasUpdatedProperties()) {
                var textUpdate = update.getUpdatedProperty("text");
                if (textUpdate && textUpdate.newValue != this._text) {
                    this._textComponentElement.value = textUpdate.newValue;
                }
            }
        }
        
        return false; // Child elements not supported: safe to return false.
    },
    
    _sanitizeInput: function() {
        var maximumLength = this.component.getRenderProperty("maximumLength", -1);
        if (maximumLength >= 0) {
            if (this._textComponentElement.value && this._textComponentElement.value.length > maximumLength) {
                this._textComponentElement.value = this._textComponentElement.value.substring(0, maximumLength);
            }
        }
    }
});

/**
 * Component rendering peer: TextArea
 */
EchoAppRender.TextAreaSync = Core.extend(EchoAppRender.TextComponentSync, {

    $staticConstruct: function() {
        EchoRender.registerPeer("TextArea", this);
    },

    renderAdd: function(update, parentElement) {
        this._textComponentElement = document.createElement("textarea");
        this._renderStyle(this._textComponentElement);
        this._textComponentElement.style.overflow = "auto";
        this._addEventHandlers(this._textComponentElement);
        if (this.component.getProperty("text")) {
            this._textComponentElement.appendChild(document.createTextNode(this.component.getProperty("text")));
        } else {
            this._textComponentElement.appendChild(document.createTextNode(""));
        }
        parentElement.appendChild(this._textComponentElement);
    }
});

/**
 * Component rendering peer: TextField
 */
EchoAppRender.TextFieldSync = Core.extend(EchoAppRender.TextComponentSync, {
    
    $staticConstruct: function() {
        EchoRender.registerPeer("TextField", this);
    },

    $construct: function() {
        this._type = "text";
    },

    renderAdd: function(update, parentElement) {
        this._textComponentElement = document.createElement("input");
        this._textComponentElement.setAttribute("type", this._type);
        var maximumLength = this.component.getRenderProperty("maximumLength", -1);
        if (maximumLength >= 0) {
            this._textComponentElement.setAttribute("maxlength", maximumLength);
        }
        this._renderStyle(this._textComponentElement);
        this._addEventHandlers(this._textComponentElement);
        if (this.component.getProperty("text")) {
            this._textComponentElement.setAttribute("value", this.component.getProperty("text"));
        }
        parentElement.appendChild(this._textComponentElement);
    },

    _sanitizeInput: function() {
        // allow all input
    }
});

/**
 * Component rendering peer: PasswordField
 */
EchoAppRender.PasswordFieldSync = Core.extend(EchoAppRender.TextFieldSync, {
    
    $staticConstruct: function() {
        EchoRender.registerPeer("PasswordField", this);
    },

    $construct: function() {
        this._type = "password";
    }
});

