/**
 * Component rendering peer: TextComponent
 * 
 * Note that this component has workarounds for issues with percentage-width text fields/areas in various browsers.
 * Percentage widths are reduced based on container size and border width to ensure overall width of component meets
 * user-set percent width specification.  Workaround is also provided for Internet Explorer 6's growing textarea bug. 
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
    
    _container: null,
    
    _text: null,
    
    _renderStyle: function() {
        var container = this._container ? this._container : this._input;
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
        Echo.Sync.Alignment.render(this.component.render("alignment"), this._input, false, null);
        Echo.Sync.Insets.render(this.component.render("insets"), this._input, "padding");
        var width = this.component.render("width");
        if (width && !Echo.Sync.Extent.isPercent(width)) {
            container.style.width = Echo.Sync.Extent.toCssValue(width, true);
        }
        var height = this.component.render("height");
        if (height) {
            this._input.style.height = Echo.Sync.Extent.toCssValue(height, false);
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
    
    _adjustPercentWidth: function(percentValue, reducePixels, containerPixels) {
        var value = (100 - Math.ceil(100 * reducePixels / containerPixels)) * percentValue / 100;
        return value > 0 ? value : 0;
    },
    
    renderDisplay: function() {
        var width = this.component.render("width");
        if (width && Echo.Sync.Extent.isPercent(width) && this._input.parentNode.offsetWidth) {
            // If width is a percentage, reduce rendered percent width based on measured container size and border width,
            // such that border pixels will not make the component wider than specified percentage.
            var border = this.component.render("border");
            var borderSize = Echo.Sync.Border.getPixelSize(this.component.render("border", "2px solid #000000"), "left")
                    + Echo.Sync.Border.getPixelSize(this.component.render("border", "2px solid #000000"), "right") + 1;
            if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
                // Add default windows scroll bar width to border size for Internet Explorer browsers.
                if (this._container) {
                    this._container.style.width = this._adjustPercentWidth(100, 16, this._input.parentNode.offsetWidth) + "%";
                } else {
                    borderSize += 16;
                }
            }
            this._input.style.width = this._adjustPercentWidth(parseInt(width), borderSize, this._input.parentNode.offsetWidth)
                    + "%";
        }
    },
    
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._input);
        this._input = null;
        this._container = null;
    },
    
    _processBlur: function(e) {
        if (!this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            return true;
        }
        this.sanitizeInput();
        this.component.set("text", e.registeredTarget.value);
    },
    
    _processClick: function(e) {
        if (!this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            return true;
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
                    this._input.value = textUpdate.newValue == null ? "" : textUpdate.newValue;
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
        // Render text areas inside of a div to accomodate bugs with IE6 where text areas grow when
        // text is entered if they are set to percent widths.
        this._container = document.createElement("div");
        this._input = document.createElement("textarea");
        this._input.id = this.component.renderId;
        this._renderStyle(this._input);
        this._input.style.overflow = "auto";
        this._addEventHandlers(this._input);
        if (this.component.get("text")) {
            this._text = this._input.value = this.component.get("text");
        }
        this._container.appendChild(this._input);
        parentElement.appendChild(this._container);
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
        return Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP | Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN;
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
