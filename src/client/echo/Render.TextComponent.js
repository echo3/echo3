/**
 * Component rendering peer: TextComponent
 */
Echo.Sync.TextComponent = Core.extend(Echo.Render.ComponentSync, {
    
    $abstract: true,
    
    $static: {
        _supportedPartialProperties: ["text"]
    },
    
    $virtual: {
        
        sanitizeInput: function() {
            var maximumLength = this.component.render("maximumLength", -1);
            if (maximumLength >= 0) {
                if (this._input.value && this._input.value.length > maximumLength) {
                    this._input.value = this._input.value.substring(0, maximumLength);
                }
            }
        }
    },
    
    /**
     * The rendered "input" element (may be a textarea).
     */
    _input: null,
    
    _text: null,
    
    _renderStyle: function() {
        if (this.component.isRenderEnabled()) {
            Echo.Sync.Border.render(this.component.render("border"), this._input);
            Echo.Sync.Color.renderFB(this.component, this._input);
            Echo.Sync.Font.render(this.component.render("font"), this._input);
            Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this._input);
        } else {
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "foreground", "disabledForeground", true), 
                    this._input, "color");
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "background", "disabledBackground", true), 
                    this._input, "backgroundColor");
            Echo.Sync.Border.render(Echo.Sync.getEffectProperty(this.component, "border", "disabledBorder", true), 
                    this._input);
            Echo.Sync.Font.render(Echo.Sync.getEffectProperty(this.component, "font", "disabledFont", true), 
                    this._input);
            Echo.Sync.FillImage.render(Echo.Sync.getEffectProperty(this.component, 
                    "backgroundImage", "disabledBackgroundImage", true), this._input);
        }
        Echo.Sync.Insets.render(this.component.render("insets"), this._input, "padding");
        var width = this.component.render("width");
        if (width) {
            if (width == "100%") {
                this._input.style.width = "95%";
            } else {
                this._input.style.width = width.toString();
            }
        }
        var height = this.component.render("height");
        if (height) {
            this._input.style.height = height.toString();
        }
        var toolTipText = this.component.render("toolTipText");
        if (toolTipText) {
            this._input.title = toolTipText;
        }
    },
    
    _addEventHandlers: function() {
        Core.Web.Event.add(this._input, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.add(this._input, "blur", Core.method(this, this._processBlur), false);
        Core.Web.Event.add(this._input, "keypress", Core.method(this, this._processKeyPress), false);
        Core.Web.Event.add(this._input, "keyup", Core.method(this, this._processKeyUp), false);
    },
    
    renderDisplay: function() {
        var width = this.component.render("width");
        if (width == "100%") {
            var border = this.component.render("border");
            var borderSize = Echo.Sync.Border.getPixelSize(this.component.render("border", "2px solid #000000"), "left")
                    + Echo.Sync.Border.getPixelSize(this.component.render("border", "2px solid #000000"), "right");
            var overlapPercent = Math.ceil(100 * borderSize / this._input.parentNode.offsetWidth);
            this._input.style.width = (100 - overlapPercent) + "%";
        }
    },
    
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._input);
        this._input = null;
    },
    
    _processBlur: function(e) {
        if (!this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            return;
        }
        this.sanitizeInput();
        this.component.set("text", e.registeredTarget.value);
    },
    
    _processClick: function(e) {
        if (!this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            return;
        }
        this.component.application.setFocusedComponent(this.component);
    },

    _processKeyPress: function(e) {
        if (!this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            Core.Web.DOM.preventEventDefault(e);
            return true;
        }
    },
    
    _processKeyUp: function(e) {
        if (!this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            Core.Web.DOM.preventEventDefault(e);
            return true;
        }
        this.sanitizeInput();
        
        // Store last updated text in local value, to ensure that we do not attempt to
        // reset it to this value in renderUpdate() and miss any characters that were
        // typed between repaints.
        this._text = e.registeredTarget.value;
        
        this.component.set("text", this._text);
        if (e.keyCode == 13) {
            this.component.doAction();
        }
        return true;
    },
    
    renderFocus: function() {
        Core.Web.DOM.focusElement(this._input);
    },
    
    renderUpdate: function(update) {
        var fullRender =  !Core.Arrays.containsAll(Echo.Sync.TextComponent._supportedPartialProperties, 
                    update.getUpdatedPropertyNames(), true);
    
        if (fullRender) {
            var element = this._input;
            var containerElement = element.parentNode;
            this.renderDispose(update);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        } else {
            if (update.hasUpdatedProperties()) {
                var textUpdate = update.getUpdatedProperty("text");
                if (textUpdate && textUpdate.newValue != this._text) {
                    this._input.value = textUpdate.newValue;
                }
            }
        }
        
        // Store text in local value.
        this._text = this.component.get("text");
        
        return false; // Child elements not supported: safe to return false.
    }
});

/**
 * Component rendering peer: TextArea
 */
Echo.Sync.TextArea = Core.extend(Echo.Sync.TextComponent, {

    $load: function() {
        Echo.Render.registerPeer("TextArea", this);
    },

    renderAdd: function(update, parentElement) {
        this._input = document.createElement("textarea");
        this._input.id = this.component.renderId;
        this._renderStyle(this._input);
        this._input.style.overflow = "auto";
        this._addEventHandlers(this._input);
        if (this.component.get("text")) {
            this._text = this._input.value = this.component.get("text");
        }
        parentElement.appendChild(this._input);
    }
});

/**
 * Component rendering peer: TextField
 */
Echo.Sync.TextField = Core.extend(Echo.Sync.TextComponent, {
    
    $load: function() {
        Echo.Render.registerPeer("TextField", this);
    },
    
    $virtual: {
        _type: "text"
    },

    getFocusFlags: function() {
        return Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP | 
                Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN;
    },

    renderAdd: function(update, parentElement) {
        this._input = document.createElement("input");
        this._input.id = this.component.renderId;
        this._input.type = this._type;
        var maximumLength = this.component.render("maximumLength", -1);
        if (maximumLength >= 0) {
            this._input.maxLength = maximumLength;
        }
        this._renderStyle(this._input);
        this._addEventHandlers(this._input);
        if (this.component.get("text")) {
            this._text = this._input.value = this.component.get("text");
        }
        parentElement.appendChild(this._input);
    },

    sanitizeInput: function() {
        // allow all input
    }
});

/**
 * Component rendering peer: PasswordField
 */
Echo.Sync.PasswordField = Core.extend(Echo.Sync.TextField, {
    
    $load: function() {
        Echo.Render.registerPeer("PasswordField", this);
    },
    
    _type: "password"
});

