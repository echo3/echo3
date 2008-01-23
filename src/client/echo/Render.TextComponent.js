/**
 * Component rendering peer: TextComponent
 */
EchoAppRender.TextComponentSync = Core.extend(EchoRender.ComponentSync, {
    
    $abstract: true,
    
    $static: {
        _supportedPartialProperties: ["text"]
    },
    
    $virtual: {
        
        sanitizeInput: function() {
            var maximumLength = this.component.render("maximumLength", -1);
            if (maximumLength >= 0) {
                if (this._textComponentElement.value && this._textComponentElement.value.length > maximumLength) {
                    this._textComponentElement.value = this._textComponentElement.value.substring(0, maximumLength);
                }
            }
        }
    },
    
    _renderStyle: function() {
        EchoAppRender.Border.render(this.component.render("border"), this._textComponentElement);
        EchoAppRender.Color.renderFB(this.component, this._textComponentElement);
        EchoAppRender.Font.render(this.component.render("font"), this._textComponentElement);
        EchoAppRender.Insets.render(this.component.render("insets"), this._textComponentElement, "padding");
        EchoAppRender.FillImage.render(this.component.render("backgroundImage"), this._textComponentElement);
        var width = this.component.render("width");
        if (width) {
        	this._textComponentElement.style.width = width.toString();
        }
        var height = this.component.render("height");
        if (height) {
        	this._textComponentElement.style.height = height.toString();
        }
        var toolTipText = this.component.render("toolTipText");
        if (toolTipText) {
            this._textComponentElement.title = toolTipText;
        }
    },
    
    _addEventHandlers: function() {
        WebCore.EventProcessor.add(this._textComponentElement, "click", Core.method(this, this._processClick), false);
        WebCore.EventProcessor.add(this._textComponentElement, "blur", Core.method(this, this._processBlur), false);
        WebCore.EventProcessor.add(this._textComponentElement, "keypress", Core.method(this, this._processKeyPress), false);
        WebCore.EventProcessor.add(this._textComponentElement, "keyup", Core.method(this, this._processKeyUp), false);
    },
    
    renderDispose: function(update) {
        WebCore.EventProcessor.removeAll(this._textComponentElement);
        this._textComponentElement = null;
    },
    
    _processBlur: function(e) {
        if (!this.client.verifyInput(this.component, EchoClient.FLAG_INPUT_PROPERTY)) {
            return;
        }
        this.sanitizeInput();
        this.component.set("text", e.registeredTarget.value);
    },
    
    _processClick: function(e) {
        if (!this.client.verifyInput(this.component, EchoClient.FLAG_INPUT_PROPERTY)) {
            return;
        }
        this.component.application.setFocusedComponent(this.component);
    },

    _processKeyPress: function(e) {
        if (!this.client.verifyInput(this.component, EchoClient.FLAG_INPUT_PROPERTY)) {
    		WebCore.DOM.preventEventDefault(e);
            return true;
        }
    },
    
    _processKeyUp: function(e) {
        if (!this.client.verifyInput(this.component, EchoClient.FLAG_INPUT_PROPERTY)) {
    		WebCore.DOM.preventEventDefault(e);
            return true;
        }
        this.sanitizeInput();
        
        // Store last updated text in local value, to ensure that we do not attempt to
        // reset it to this value in renderUpdate() and miss any characters that were
        // typed between repaints.
        this._text = e.registeredTarget.value;
        
        this.component.set("text", this._text);
        if (e.keyCode == 13) {
            //FIXME fire from component.
    	    this.component.fireEvent({type: "action", source: this.component});
        }
        return true;
    },
    
    renderFocus: function() {
        WebCore.DOM.focusElement(this._textComponentElement);
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
    }
});

/**
 * Component rendering peer: TextArea
 */
EchoAppRender.TextAreaSync = Core.extend(EchoAppRender.TextComponentSync, {

    $load: function() {
        EchoRender.registerPeer("TextArea", this);
    },

    renderAdd: function(update, parentElement) {
        this._textComponentElement = document.createElement("textarea");
        this._textComponentElement.id = this.component.renderId;
        this._renderStyle(this._textComponentElement);
        this._textComponentElement.style.overflow = "auto";
        this._addEventHandlers(this._textComponentElement);
        if (this.component.get("text")) {
            this._textComponentElement.appendChild(document.createTextNode(this.component.get("text")));
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
    
    $load: function() {
        EchoRender.registerPeer("TextField", this);
    },
    
    $virtual: {
        _type: "text"
    },

    getFocusFlags: function() {
        return EchoRender.ComponentSync.FOCUS_PERMIT_ARROW_UP | 
                EchoRender.ComponentSync.FOCUS_PERMIT_ARROW_DOWN;
    },

    renderAdd: function(update, parentElement) {
        this._textComponentElement = document.createElement("input");
        this._textComponentElement.id = this.component.renderId;
        this._textComponentElement.type = this._type;
        var maximumLength = this.component.render("maximumLength", -1);
        if (maximumLength >= 0) {
            this._textComponentElement.maxLength = maximumLength;
        }
        this._renderStyle(this._textComponentElement);
        this._addEventHandlers(this._textComponentElement);
        if (this.component.get("text")) {
            this._textComponentElement.value = this.component.get("text");
        }
        parentElement.appendChild(this._textComponentElement);
    },

    sanitizeInput: function() {
        // allow all input
    }
});

/**
 * Component rendering peer: PasswordField
 */
EchoAppRender.PasswordFieldSync = Core.extend(EchoAppRender.TextFieldSync, {
    
    $load: function() {
        EchoRender.registerPeer("PasswordField", this);
    },
    
    _type: "password"
});

