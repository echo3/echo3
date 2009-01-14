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
    
        /**
         * Array containing properties that may be updated without full re-render.
         */
        _supportedPartialProperties: ["text", "editable"]
    },
    
    $virtual: {
        
        /**
         * Invoked to ensure that input meets requirements of text field.  Default implementation ensures input
         * does not exceed maximum length.
         */
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
    
    /**
     * Last processed text value.  The text value is stored in this property each time the peer successfully updates the
     * supported Echo.TextComponent object.  This value is used to ensure that the user is allowed to keep typing even when
     * the client is not ready for input.
     * @type String
     */
    _text: null,
    
    /**
     * Actual focus state of component, based on received DOM focus/blur events.
     * @type Boolean
     */
    _focused: false,
    
    /**
     * Renders style information: colors, borders, font, insets, etc.
     */
    _renderStyle: function() {
        if (this.component.isRenderEnabled()) {
            Echo.Sync.renderComponentDefaults(this.component, this._input);
            Echo.Sync.Border.render(this.component.render("border"), this._input);
            Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this._input);
        } else {
            Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this._input);
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
            this._input.style.width = Echo.Sync.Extent.toCssValue(width, true);
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
    
    /**
     * Registers event handlers on the text component.
     */
    _addEventHandlers: function() {
        Core.Web.Event.add(this._input, "click", Core.method(this, this._processClick), false);
        Core.Web.Event.add(this._input, "focus", Core.method(this, this._processFocus), false);
        Core.Web.Event.add(this._input, "blur", Core.method(this, this._processBlur), false);
        Core.Web.Event.add(this._input, "keypress", Core.method(this, this._processKeyPress), false);
        Core.Web.Event.add(this._input, "keyup", Core.method(this, this._processKeyUp), false);
    },
    
    /**
     * Reduces a percentage width by a number of pixels based on the container size.
     */
    _adjustPercentWidth: function(percentValue, reducePixels, containerPixels) {
        var value = (100 - Math.ceil(100 * reducePixels / containerPixels)) * percentValue / 100;
        return value > 0 ? value : 0;
    },
    
    /**
     * Processes a focus blur event.
     */
    _processBlur: function(e) {
        this._focused = false;
        if (!this.client || !this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            return true;
        }
        this.sanitizeInput();
        this.component.set("text", e.registeredTarget.value);
    },
    
    /**
     * Processes a mouse click event.
     * Notifies application of focus.
     */
    _processClick: function(e) {
        if (!this.client || !this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            return true;
        }
        this.component.application.setFocusedComponent(this.component);
    },

    /**
     * Processes a focus event.
     * Notifies application of focus.
     */
    _processFocus: function(e) {
        this._focused = true;
        if (!this.client || !this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            return true;
        }
        this.component.application.setFocusedComponent(this.component);
    },
    
    /**
     * Processes a key press event.  
     * Prevents input when client is not ready. 
     */
    _processKeyPress: function(e) {
        if (!this.client || !this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            Core.Web.DOM.preventEventDefault(e);
            return true;
        }
    },
    
    /**
     * Processes a key up event.  
     * Prevents input when client is not ready, sanitizes input.  Stores updated form value in <code>Component</code> instance.
     */
    _processKeyUp: function(e) {
        if (!this.client || !this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
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

    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        var width = this.component.render("width");
        if (width && Echo.Sync.Extent.isPercent(width) && this._input.parentNode.offsetWidth) {
            // If width is a percentage, reduce rendered percent width based on measured container size and border width,
            // such that border pixels will not make the component wider than specified percentage.
            var border = this.component.render("border");
            var borderSize = Echo.Sync.Border.getPixelSize(this.component.render("border", "2px solid #000000"), "left") +
                    Echo.Sync.Border.getPixelSize(this.component.render("border", "2px solid #000000"), "right") + 1;
            if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
                // Add default windows scroll bar width to border size for Internet Explorer browsers.
                if (this._container) {
                    this._container.style.width = this._adjustPercentWidth(100, Core.Web.Measure.SCROLL_WIDTH, 
                            this._input.parentNode.offsetWidth) + "%";
                } else {
                    borderSize += Core.Web.Measure.SCROLL_WIDTH;
                }
            }
            this._input.style.width = this._adjustPercentWidth(parseInt(width, 10), borderSize, 
                    this._input.parentNode.offsetWidth) + "%";
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._input);
        this._focused = false;
        this._input = null;
        this._container = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderFocus */
    renderFocus: function() {
        if (this._focused) {
            return;
        }
            
        this._focused = true;
        Core.Web.DOM.focusElement(this._input);
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var fullRender = !Core.Arrays.containsAll(Echo.Sync.TextComponent._supportedPartialProperties, 
                    update.getUpdatedPropertyNames(), true);
    
        if (fullRender) {
            var element = this._container ? this._container : this._input;
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
                var editableUpdate = update.getUpdatedProperty("editable");
                if (editableUpdate != null) {
                    this._input.readOnly = !editableUpdate.newValue;
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

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        // Render text areas inside of a div to accommodate bugs with IE6 where text areas grow when
        // text is entered if they are set to percent widths.
        this._container = document.createElement("div");
        this._input = document.createElement("textarea");
        this._input.id = this.component.renderId;
        if (!this.component.render("editable", true)) {
            this._input.readOnly = true;
        }
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
        
        /** Input element type, either "text" or "password" */
        _type: "text"
    },

    /** @see Echo.Render.ComponentSync#getFocusFlags */
    getFocusFlags: function() {
        return Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_UP | Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_DOWN;
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._input = document.createElement("input");
        this._input.id = this.component.renderId;
        if (!this.component.render("editable", true)) {
            this._input.readOnly = true;
        }
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

    /** 
     * Allows all input.
     * @see Echo.Sync.TextComponent#sanitizeInput
     */
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
    
    /** @see Echo.Sync.TextField#_type */
    _type: "password"
});
