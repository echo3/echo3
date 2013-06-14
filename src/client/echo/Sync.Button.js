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
         * Renders the content (e.g. text and/or icon) of the additional elements
         * namely checkbox or radiobutton items
         * Appends rendered content to bounding element (<code>this.div</code>).
         * 
         * @param {Echo.Sync.Button.ContentContainer} the content container for creating the cells
         */
        renderAdditionalContent: function(contentContainer) {
            //empty, to be implemented by subclasses
        },

        /**
         * Enables/disables pressed appearance of button.
         * 
         * @param {Boolean} rollover the new pressed state
         * @param {Boolean} pressed the new pressed state
         */
        setHighlightState: function(rollover, pressed) {
            var focused = this.component && this.component.application && 
                    this.component.application.getFocusedComponent() == this.component;

            // Determine effect property name.  Priorities are 1: pressed, 2: rollover: 3: focused.
            var ep = pressed ? "pressed" : (rollover ? "rollover" : "focused");
            var state = focused || pressed || rollover;

            var foreground = Echo.Sync.getEffectProperty(this.component, "foreground", ep + "Foreground", state);
            var background = Echo.Sync.getEffectProperty(this.component, "background", ep + "Background", state);
            var backgroundImage = Echo.Sync.getEffectProperty(
                    this.component, "backgroundImage", ep + "BackgroundImage", state);
            var font = Echo.Sync.getEffectProperty(this.component, "font", ep + "Font", state);
            var border = Echo.Sync.getEffectProperty(this.component, "border", ep + "Border", state);
            var boxShadow  = Echo.Sync.getEffectProperty(this.component, "boxShadow", ep + "BoxShadow", state);

            Echo.Sync.Color.renderClear(foreground, this.div, "color");
            Echo.Sync.Color.renderClear(background, this.div, "backgroundColor");
            Echo.Sync.FillImage.renderClear(backgroundImage, this.div, "backgroundColor");

            if (state) {
                Echo.Sync.Insets.render(this.getInsetsForBorder(this.component.render(ep + "Border")), this.div, "padding");
            } else {
                Echo.Sync.Insets.render(this.component.render("insets"), this.div, "padding");
            }
            Echo.Sync.Border.renderClear(border, this.div);
            Echo.Sync.BoxShadow.renderClear(boxShadow, this.div);

            if (this._textElement) {
                Echo.Sync.Font.renderClear(font, this._textElement);
            }

            if (this.iconImg) {
                var iconUrl = Echo.Sync.ImageReference.getUrl(
                        Echo.Sync.getEffectProperty(this.component, "icon", ep + "Icon", state));
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

    /**
     * Returns an adjusted insets value to apply to the button such that the specified border+returned insets will occupy the
     * same space as the button's default state border+insets.
     * <p>
     * For example. consider a button with a border size of 5px, and a default inset of 3px.  
     * The total border/inset space would be 8px.  If this method is passed a border with
     * a size of 2px, it will return an inset with a size of 6px to compensate and ensure the border+inset size will be unchanged.
     * This calculation is performed individually for each side of the border/insets. 
     * 
     * @param #Border border the effect border for which insets should be calculated.
     * @return the adjusted insets
     * @type #Insets
     */
    getInsetsForBorder: function(border) {
        var defaultBorder = this.component.render("border");
        if (!border) {
            // Return default insets if provided border is null.
            return this.component.render("insets");
        }
        
        var insetsPx = Echo.Sync.Insets.toPixels(this.component.render("insets"));
        for (var x in insetsPx) {
            insetsPx[x] += Echo.Sync.Border.getPixelSize(defaultBorder, x) - Echo.Sync.Border.getPixelSize(border, x);
            if (insetsPx[x] < 0) {
                insetsPx[x] = 0;
            }
        }
        return insetsPx.top + " " + insetsPx.right + " " + insetsPx.bottom + " "  + insetsPx.left;
    },

    /** Processes a focus blur event. */
    _processBlur: function(e) {
        this._focused = false;
        this.setHighlightState(false, false);
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
        this.setHighlightState(false, false);
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
        this.setHighlightState(false, true);
    },

    /** Processes a mouse button release event on the button, displaying the button's normal appearance. */
    _processRelease: function(e) {
        if (!this.client) {
            return true;
        }
        this.setHighlightState(false, false);
    },

    /** Processes a mouse roll over event, displaying the button's rollover appearance. */
    _processRolloverEnter: function(e) {
        if (!this.client || !this.client.verifyInput(this.component) || Core.Web.dragInProgress) {
            return true;
        }
        this.client.application.addListener("focus", this._processRolloverExitRef);
        this.setHighlightState(true, false);
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
        this.setHighlightState(false, false);
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
            this.div.style.cursor = "auto";
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
        Echo.Sync.RoundedCorner.render(this.component, this.div);
        Echo.Sync.BoxShadow.renderClear(this.component.render("boxShadow"), this.div);

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

        var text = this.component.render("text");
        var icon = Echo.Sync.getEffectProperty(this.component, "icon", "disabledIcon", !this.enabled);
        var iconTextMargin = icon ? this.component.render("iconTextMargin", Echo.Sync.Button._defaultIconTextMargin) : 0;
        var orientation = Echo.Sync.TriCellTable.getOrientation(this.component, "textPosition");
        var alignment = this.component.render("alignment");
        var horizontal = Echo.Sync.Alignment.getRenderedHorizontal(alignment);
        var vertical = typeof(alignment) == "object" ? alignment.vertical : alignment;
        if (vertical !== "top" && vertical !== "bottom") {
            //default vertical alignment is middle!
            vertical = "middle";
        }

        var contentContainer = new Echo.Sync.Button.ContentContainer(orientation, 
                Echo.Sync.Extent.toPixels(iconTextMargin), vertical);
        if (text) {
            this.renderButtonText(contentContainer.addCell(), text);
        }
        if(icon) {
            this.iconImg = this.renderButtonIcon(contentContainer.addCell(), icon);
        }
        this.renderAdditionalContent(contentContainer);
        
        contentContainer.createLayout();
        this.div.align = horizontal;
        this.div.appendChild(contentContainer._tableDiv);

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
            //text align only applies to horizontal alignment
            //vertically it would conflict with the overall alignment property
            Echo.Sync.Alignment.render(textAlignment, element, true, this.component);
            element.style.width = "100%";
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
     * @param element the element which should contain the icon.
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

        Core.Web.DOM.focusElement(this.div);
        this._focused = true;
    },

    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var element = this.div;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false; // Child elements not supported: safe to return false.
    }
});

Echo.Sync.Button.ContentContainer = Core.extend({
  
    $static: {
        _rowPrototype: null,

        _createRowPrototype: function() {
            var trDiv = document.createElement("div");
            trDiv.style.display = "table-row";
            trDiv.style.padding = "0";
            return trDiv;
        }
    },

    $load: function() {
        this._rowPrototype = this._createRowPrototype();
    },

    _tableDiv: null,
    _cellElements: null,
    _marginCellElement: null,
    _orientation: null,
    _margin: null,
    _verticalAlignment: null,

    $construct: function(orientation, margin, verticalAlignment) {
        this._cellElements = [];
        this._orientation = orientation;
        this._margin = margin;
        this._verticalAlignment = verticalAlignment;
    },

    /**
     * Creates a cell div
     */
    addCell: function() {
        var tdDiv = document.createElement("div");
        tdDiv.style.display = "table-cell";
        tdDiv.style.padding = "0";
        tdDiv.style.verticalAlign = this._verticalAlignment;
        this._cellElements.push(tdDiv);
        return tdDiv;
    },

    /**
     * Creates the layout (table/rows/cells)
     */
    createLayout: function() {
        this._tableDiv = document.createElement("div");
        this._tableDiv.style.display = "table";
        this._tableDiv.style.borderCollapse = "collapse";
        this._tableDiv.style.padding = "0";
        this._tableDiv.style.height = "100%";

        //define margins
        if (this._margin) {
            this._marginCellElement = document.createElement("div");
            if ((this._orientation & Echo.Sync.TriCellTable.VERTICAL) === 0) {
                this._marginCellElement.style.cssText = "display:table-cell;width:" +
                    this._margin + "px;height:1px;font-size:1px;line-height:0;";
            } else {
                this._marginCellElement.style.cssText = "display:table-cell;width:1px;height:" +
                    this._margin + "px;font-size:1px;line-height:0;";
            }
        }

        //add rows and cells
        var i;
        if (this._orientation & Echo.Sync.TriCellTable.VERTICAL) {
            // Vertically oriented.
            if (this._orientation & Echo.Sync.TriCellTable.INVERTED) {
                // Inverted (bottom to top).
                for (i = this._cellElements.length - 1; i > 0; i--) {
                    this._addRow(this._cellElements[i]);
                    this._addRow(this._marginCellElement);
                }
                this._addRow(this._cellElements[0]);
            } else {
                // Normal (top to bottom).
                this._addRow(this._cellElements[0]);
                for (i = 1; i < this._cellElements.length; i++) {
                    this._addRow(this._marginCellElement);
                    this._addRow(this._cellElements[i]);
                }
            }
        } else {
            // Horizontally oriented.
            var trDiv = Echo.Sync.Button.ContentContainer._rowPrototype.cloneNode(false);
            if (this._orientation & Echo.Sync.TriCellTable.INVERTED) {
                // Trailing to leading.
                for (i = this._cellElements.length - 1; i > 0; i--) {
                    this._addColumn(trDiv, this._cellElements[i]);
                    this._addColumn(trDiv, this._marginCellElement);
                }
                this._addColumn(trDiv, this._cellElements[0]);
            } else {
                // Leading to trailing.
                this._addColumn(trDiv, this._cellElements[0]);
                for (i = 1; i < this._cellElements.length; i++) {
                    this._addColumn(trDiv, this._cellElements[i]);
                    this._addColumn(trDiv, this._marginCellElement);
                }
            }
            this._tableDiv.appendChild(trDiv);
        }
    },

    _addColumn: function(trDiv, tdDiv) {
        if (tdDiv != null) {
            trDiv.appendChild(tdDiv);
        }
    },

    _addRow: function(tdDiv) {
        if (tdDiv != null) {
            var trDiv = Echo.Sync.Button.ContentContainer._rowPrototype.cloneNode(false);
            trDiv.appendChild(tdDiv);
            this._tableDiv.appendChild(trDiv);
        }
    }
});