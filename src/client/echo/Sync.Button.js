/**
 * Component rendering peer: Button.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Echo.Sync.Button = Core.extend(Echo.Render.ComponentSync, {

    $static: {

        /**
         * Default margin between icon and text elements.
         * @type Number
         */
        _defaultIconTextMargin: 5,
        
        /**
         * Prototype DOM hierarchy for a rendered button.
         * @type Element
         */
        _prototypeButton: null,
        
        /**
         * Creates the prototype DOM hierarchy for a rendered button.
         * @type Element
         */
        _createPrototypeButton: function() {
            var div = document.createElement("div");
            div.tabIndex = "0";
            div.style.outlineStyle = "none";
            div.style.cursor = "pointer";
            return div;
        }
    },
    
    $load: function() {
        this._prototypeButton = this._createPrototypeButton();
        Echo.Render.registerPeer("Button", this);
    },
    
    /**
     * The rendered enabled state of the component.
     * @type Boolean
     */
    enabled: null,
    
    /**
     * Outer DIV containing button.
     * @type Element
     */
    div: null,
    
    /**
     * Text-containing element, upon which font styles should be set.
     * @type Element
     */
    _textElement: null,
    
    /**
     * IMG element representing buttons icon.
     * @type Element
     */
    iconImg: null,
    
    /**
     * Method reference to _processRolloverExit.
     * @type Function
     */
    _processRolloverExitRef: null,
    
    /**
     * Method reference to _processInitEvent.
     * @type Function
     */
    _processInitEventRef: null,
    
    /**
     * The rendered focus state of the button.
     * @type Boolean
     */
    _focused: false,
    
    /** Creates a new Echo.Sync.Button */
    $construct: function() { 
        this._processInitEventRef = Core.method(this, this._processInitEvent);
    },
    
    $virtual: {
        
        /**
         * Processes a user action (i.e., clicking or pressing enter when button is focused).
         * Default implementation invokes <code>doAction()</code> on supported <code>Echo.Component</code>.
         */
        doAction: function() {
            this.component.doAction();
        },
        
        /**
         * Renders the content (e.g. text and/or icon) of the button.
         * Appends rendered content to bounding element (<code>this.div</code>).
         */
        renderContent: function() {
            var text = this.component.render("text");
            var icon = Echo.Sync.getEffectProperty(this.component, "icon", "disabledIcon", !this.enabled);
            if (text != null) {
                if (icon) {
                    // Text and icon.
                    var iconTextMargin = this.component.render("iconTextMargin", 
                            Echo.Sync.Button._defaultIconTextMargin);
                    var orientation = Echo.Sync.TriCellTable.getOrientation(this.component, "textPosition");
                    var tct = new Echo.Sync.TriCellTable(orientation, 
                            Echo.Sync.Extent.toPixels(iconTextMargin));
                    this.renderButtonText(tct.tdElements[0], text);
                    this.iconImg = this.renderButtonIcon(tct.tdElements[1], icon);
                    this.div.appendChild(tct.tableElement);
                } else {
                    // Text only.
                    this.renderButtonText(this.div, text);
                }
            } else if (icon) {
                // Icon only.
                this.iconImg = this.renderButtonIcon(this.div, icon);
            }
        },
    
        /**
         * Enables/disables pressed appearance of button.
         * 
         * @param {Boolean} pressedState the new pressed state.
         */
        setPressedState: function(pressedState) {
            var foreground = Echo.Sync.getEffectProperty(this.component, "foreground", "pressedForeground", pressedState);
            var background = Echo.Sync.getEffectProperty(this.component, "background", "pressedBackground", pressedState);
            var backgroundImage = Echo.Sync.getEffectProperty(
                    this.component, "backgroundImage", "pressedBackgroundImage", pressedState);
            var font = Echo.Sync.getEffectProperty(this.component, "font", "pressedFont", pressedState);
            var border = Echo.Sync.getEffectProperty(this.component, "border", "pressedBorder", pressedState);
            
            Echo.Sync.Color.renderClear(foreground, this.div, "color");
            Echo.Sync.Color.renderClear(background, this.div, "backgroundColor");
            Echo.Sync.FillImage.renderClear(backgroundImage, this.div, "backgroundColor");
            Echo.Sync.Border.renderClear(border, this.div);
            if (this._textElement) {
                Echo.Sync.Font.renderClear(font, this._textElement);
            }
            
            if (this.iconImg) {
                var iconUrl = Echo.Sync.ImageReference.getUrl(
                        Echo.Sync.getEffectProperty(this.component, "icon", "pressedIcon", pressedState));
                if (iconUrl != this.iconImg.src) {
                    this.iconImg.src = iconUrl;
                }
            }
        },
        
        /**
         * Enables/disables rollover appearance of button.
         * 
         * @param {Boolean} rolloverState the new rollover state.
         */
        setRolloverState: function(rolloverState) {
            var foreground = Echo.Sync.getEffectProperty(this.component, "foreground", "rolloverForeground", rolloverState);
            var background = Echo.Sync.getEffectProperty(this.component, "background", "rolloverBackground", rolloverState);
            var backgroundImage = Echo.Sync.getEffectProperty(
                    this.component, "backgroundImage", "rolloverBackgroundImage", rolloverState);
            var font = Echo.Sync.getEffectProperty(this.component, "font", "rolloverFont", rolloverState);
            var border = Echo.Sync.getEffectProperty(this.component, "border", "rolloverBorder", rolloverState);
            
            Echo.Sync.Color.renderClear(foreground, this.div, "color");
            Echo.Sync.Color.renderClear(background, this.div, "backgroundColor");
            Echo.Sync.FillImage.renderClear(backgroundImage, this.div, "backgroundColor");
            Echo.Sync.Border.renderClear(border, this.div);
            if (this._textElement) {
                Echo.Sync.Font.renderClear(font, this._textElement);
            }
        
            if (this.iconImg) {
                var iconUrl = Echo.Sync.ImageReference.getUrl(
                        Echo.Sync.getEffectProperty(this.component, "icon", "rolloverIcon", rolloverState));
                if (iconUrl != this.iconImg.src) {
                    this.iconImg.src = iconUrl;
                }
            }
        }
    },
    
    /**
     * Registers event listeners on the button.  This method is invoked lazily, i.e., the first time the button
     * is focused or rolled over with the mouse.  The initial focus/mouse rollover listeners are removed by this method.
     * This strategy is used for performance reasons due to the fact that many buttons may be present 
     * on the screen, and each button has many event listeners, which would otherwise need to be registered on the initial render.
     */
    _addEventListeners: function() {
        this._processRolloverExitRef = Core.method(this, this._processRolloverExit);
    
        // Remove initialization listeners.
        Core.Web.Event.remove(this.div, "focus", this._processInitEventRef);
        Core.Web.Event.remove(this.div, "mouseover", this._processInitEventRef);
        
        Core.Web.Event.add(this.div, "click", Core.method(this, this._processClick), false);
        if (this.component.render("rolloverEnabled")) {
            Core.Web.Event.add(this.div, Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED ? "mouseenter" : "mouseover", 
                    Core.method(this, this._processRolloverEnter), false);
            Core.Web.Event.add(this.div, Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED ? "mouseleave" : "mouseout", 
                    Core.method(this, this._processRolloverExit), false);
        }
        if (this.component.render("pressedEnabled")) {
            Core.Web.Event.add(this.div, "mousedown", Core.method(this, this._processPress), false);
            Core.Web.Event.add(this.div, "mouseup", Core.method(this, this._processRelease), false);
        }
        Core.Web.Event.add(this.div, "focus", Core.method(this, this._processFocus), false);
        Core.Web.Event.add(this.div, "blur", Core.method(this, this._processBlur), false);
        
        Core.Web.Event.Selection.disable(this.div);
    },
    
    /** 
     * Processes a key press event.  Invokes <code>doAction()</code> in the case of enter being pressed.
     * @see Echo.Render.ComponentSync#clientKeyDown 
     */
    clientKeyDown: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        if (e.keyCode == 13) {
            this.doAction();
            return false;
        } else {
            return true;
        }
    },
    
    /** @see Echo.Render.ComponentSync#getFocusFlags */ 
    getFocusFlags: function() {
        return Echo.Render.ComponentSync.FOCUS_PERMIT_ARROW_ALL;
    },
    
    /** Processes a focus blur event. */
    _processBlur: function(e) {
        this._renderFocusStyle(false);
    },
    
    /** Processes a mouse click event. */
    _processClick: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        this.client.application.setFocusedComponent(this.component);
        this.doAction();
    },
    
    /** Processes a focus event. */
    _processFocus: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        this.client.application.setFocusedComponent(this.component);
    },
    
    /**
     * The Initial focus/mouse rollover listener.
     * This listener is invoked the FIRST TIME the button is focused or mouse rolled over.
     * It invokes the addListeners() method to lazily add the full listener set to the button.
     */
    _processInitEvent: function(e) {
        this._addEventListeners();
        switch (e.type) {
        case "focus":
            this._processFocus(e);
            break;
        case "mouseover":
            if (this.component.render("rolloverEnabled")) {
                this._processRolloverEnter(e);
            }
            break;
        }
    },
    
    /** Processes a mouse button press event, displaying the button's pressed appearance. */
    _processPress: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        Core.Web.DOM.preventEventDefault(e);
        this.setPressedState(true);
    },
    
    /** Processes a mouse button release event on the button, displaying the button's normal appearance. */
    _processRelease: function(e) {
        if (!this.client) {
            return true;
        }
        this.setPressedState(false);
    },
    
    /** Processes a mouse roll over event, displaying the button's rollover appearance. */
    _processRolloverEnter: function(e) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return true;
        }
        this.client.application.addListener("focus", this._processRolloverExitRef);
        this.setRolloverState(true);
        return true;
    },
    
    /** Processes a mouse roll over exit event, displaying the button's normal appearance. */
    _processRolloverExit: function(e) {
        if (!this.client || !this.client.application) {
            return true;
        }
        if (this._processRolloverExitRef) {
            this.client.application.removeListener("focus", this._processRolloverExitRef);
        }
        this.setRolloverState(false);
        return true;
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this.enabled = this.component.isRenderEnabled();
        
        this.div = Echo.Sync.Button._prototypeButton.cloneNode(false); 
        this.div.id = this.component.renderId;

        Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this.div);
        if (this.enabled) {
            Echo.Sync.Color.renderFB(this.component, this.div);
            Echo.Sync.Border.render(this.component.render("border"), this.div);
            Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this.div);
        } else {
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "foreground", "disabledForeground", true), 
                    this.div, "color");
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "background", "disabledBackground", true), 
                    this.div, "backgroundColor");
            Echo.Sync.Border.render(Echo.Sync.getEffectProperty(this.component, "border", "disabledBorder", true), 
                    this.div);
            Echo.Sync.FillImage.render(Echo.Sync.getEffectProperty(this.component, 
                    "backgroundImage", "disabledBackgroundImage", true), this.div);
        }
        
        Echo.Sync.Insets.render(this.component.render("insets"), this.div, "padding");
        Echo.Sync.Alignment.render(this.component.render("alignment"), this.div, true, this.component);
        
        var toolTipText = this.component.render("toolTipText");
        if (toolTipText) {
            this.div.title = toolTipText;
        }
        var width = this.component.render("width");
        if (width) {
            this.div.style.width = Echo.Sync.Extent.toCssValue(width, true, true);
        }
        var height = this.component.render("height");
        if (height) {
            this.div.style.height = Echo.Sync.Extent.toCssValue(height, false);
            this.div.style.overflow = "hidden";
        }
        
        this.renderContent();
        
        if (this.enabled) {
            // Add event listeners for focus and mouse rollover.  When invoked, these listeners will register the full gamut
            // of button event listeners.  There may be a large number of such listeners depending on how many effects
            // are enabled, and as such we do this lazily for performance reasons.
            Core.Web.Event.add(this.div, "focus", this._processInitEventRef, false);
            Core.Web.Event.add(this.div, "mouseover", this._processInitEventRef, false);
        }
        
        parentElement.appendChild(this.div);
    },
    
    /**
     * Renders the button text.  Configures text alignment, and font.
     * 
     * @param element the element which should contain the text.
     * @param text the text to render
     */
    renderButtonText: function(element, text) {
        this._textElement = element;
        var textAlignment = this.component.render("textAlignment"); 
        if (textAlignment) {
            Echo.Sync.Alignment.render(textAlignment, element, true, this.component);
        }
        if (this.enabled) {
            Echo.Sync.Font.render(this.component.render("font"), this._textElement);
        } else {
            Echo.Sync.Font.render(Echo.Sync.getEffectProperty(this.component, "font", "disabledFont", true), this._textElement);
        }
        
        element.appendChild(document.createTextNode(text));
        if (!this.component.render("lineWrap", true)) {
            element.style.whiteSpace = "nowrap";
        }
    },
    
    /** 
     * Renders the button icon.
     * 
     * @param elemnt the element which should contain the icon.
     * @param icon the icon property to render
     */
    renderButtonIcon: function(element, icon) {
        var alignment = this.component.render("alignment"); 
        if (alignment) {
            Echo.Sync.Alignment.render(alignment, element, true, this.component);
        }
        var imgElement = document.createElement("img");
        Echo.Sync.ImageReference.renderImg(icon, imgElement);
        element.appendChild(imgElement);
        return imgElement;
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        if (this._processRolloverExitRef) {
            this.client.application.removeListener("focus", this._processRolloverExitRef);
        }

        Core.Web.Event.removeAll(this.div);
        
        this._focused = false;
        this.div = null;
        this._textElement = null;
        this.iconImg = null;
    },

    /** @see Echo.Render.ComponentSync#renderFocus */
    renderFocus: function() {
        if (this._focused) {
            return;
        }

        this._renderFocusStyle(true);
        Core.Web.DOM.focusElement(this.div);
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this.div;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false; // Child elements not supported: safe to return false.
    },
    
    /**
     * Enables/disables focused appearance of button.
     * 
     * @param {Boolean} focusState the new focus state.
     */
    _renderFocusStyle: function(focusState) {
        if (this._focused == focusState) {
            return;
        }
        this._focused = focusState;
        var background;
        
        if (!this.component.render("focusedEnabled")) {
            // Render default focus aesthetic.
            background = this.component.render("background");
            if (background != null) {
                var newBackground = focusState ? Echo.Sync.Color.adjust(background, 0x20, 0x20, 0x20) : background;
                Echo.Sync.Color.render(newBackground, this.div, "backgroundColor");
            }
            return;
        } else {
            var foreground = Echo.Sync.getEffectProperty(this.component, "foreground", "focusedForeground", focusState);
            background = Echo.Sync.getEffectProperty(this.component, "background", "focusedBackground", focusState);
            var backgroundImage = Echo.Sync.getEffectProperty(
                    this.component, "backgroundImage", "focusedBackgroundImage", focusState);
            var font = Echo.Sync.getEffectProperty(this.component, "font", "focusedFont", focusState);
            var border = Echo.Sync.getEffectProperty(this.component, "border", "focusedBorder", focusState);
            
            Echo.Sync.Color.renderClear(foreground, this.div, "color");
            Echo.Sync.Color.renderClear(background, this.div, "backgroundColor");
            Echo.Sync.FillImage.renderClear(backgroundImage, this.div, "backgroundColor");
            Echo.Sync.Border.renderClear(border, this.div);
            if (this._textElement) {
                Echo.Sync.Font.renderClear(font, this._textElement);
            }
        
            if (this.iconImg) {
                var iconUrl = Echo.Sync.ImageReference.getUrl(
                        Echo.Sync.getEffectProperty(this.component, "icon", "focusedIcon", focusState));
                if (iconUrl != this.iconImg.src) {
                    this.iconImg.src = iconUrl;
                }
            }
        }
    }
});
