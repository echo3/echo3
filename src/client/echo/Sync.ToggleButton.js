/**
 * Component rendering peer: ToggleButton.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Echo.Sync.ToggleButton = Core.extend(Echo.Sync.Button, {
    
    $load: function() {
        Echo.Render.registerPeer("ToggleButton", this);
    },
    
    $abstract: {
        
        /** The type setting for the input form element (i.e. "radio" or "checkbox"). */
        inputType: null
    },
    
    /** 
     * Selection state.
     * @type Boolean
     */
    _selected: false,
    
    /**
     * The DOM element which represents the button's state.
     * 
     * @type Element
     */
    _stateElement: null,
    
    /** @see Echo.Sync.Button#doAction */
    doAction: function() {
        this.setSelected(!this._selected);
        Echo.Sync.Button.prototype.doAction.call(this);
    },
    
    /** 
     * Returns the appropriate state icon for the given state of the control (based on disabled and selected state).
     * 
     * @param {Boolean} rollover flag indicating whether the rollover icon should be retrieved
     * @param {Boolean} pressed flag indicating whether the pressed icon should be retrieved
     * @return the state icon
     * @type #ImageReference
     */
    getStateIcon: function(rollover, pressed) {
        var icon;
        if (this._selected) {
            icon = Echo.Sync.getEffectProperty(this.component, "selectedStateIcon", "disabledSelectedStateIcon", !this.enabled);
            if (icon) {
                if (pressed) {
                    icon = this.component.render("pressedSelectedStateIcon", icon); 
                } else if (rollover) {
                    icon = this.component.render("rolloverSelectedStateIcon", icon);
                }
            }
        }
        if (!icon) {
            icon = Echo.Sync.getEffectProperty(this.component, "stateIcon", "disabledStateIcon", !this.enabled);
            if (icon) {
                if (pressed) {
                    icon = this.component.render("pressedStateIcon", icon); 
                } else if (rollover) {
                    icon = this.component.render("rolloverStateIcon", icon);
                }
            }
        }
        return icon;
    },
    
    /** Processes a change event from the state INPUT element (checkbox/radio form control itself). */
    _processStateChange: function(e) {
        this._updateStateElement();
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._selected = this.component.render("selected");
        
        Echo.Sync.Button.prototype.renderAdd.call(this, update, parentElement);
    },
    
    /** @see Echo.Sync.Button.renderContent */
    renderContent: function() {
        var text = this.component.render("text");
        var icon = this.component.render("icon");
        var orientation, margin, tct;
        
        var entityCount = (text != null ? 1 : 0) + (icon ? 1 : 0) + 1; // +1 for state element.
        if (entityCount == 1) {
            if (text != null) {
                this.renderButtonText(this.div, text);
            } else if (icon) {
                this.iconImg = this.renderButtonIcon(this.div, icon);
            } else {
                this._stateElement = this._renderButtonState(this.div);
            }
        } else if (entityCount == 2) {
            orientation = Echo.Sync.TriCellTable.getInvertedOrientation(this.component, "statePosition", "leading");
            margin = this.component.render("stateMargin", Echo.Sync.Button._defaultIconTextMargin);
            tct = new Echo.Sync.TriCellTable(orientation, Echo.Sync.Extent.toPixels(margin));
            if (text != null) {
                this.renderButtonText(tct.tdElements[0], text);
                if (icon) {
                    this.iconImg = this.renderButtonIcon(tct.tdElements[1], icon);
                } else {
                    this._stateElement = this._renderButtonState(tct.tdElements[1]);
                }
            } else {
                this.iconImg = this.renderButtonIcon(tct.tdElements[0], icon);
                this._stateElement = this._renderButtonState(tct.tdElements[1]);
            }
            this.div.appendChild(tct.tableElement);
        } else if (entityCount == 3) {
            orientation = Echo.Sync.TriCellTable.getOrientation(this.component, "textPosition");
            margin = this.component.render("iconTextMargin", Echo.Sync.Button._defaultIconTextMargin);
            var stateOrientation = Echo.Sync.TriCellTable.getInvertedOrientation(this.component, "statePosition", "leading");
            var stateMargin = this.component.render("stateMargin", Echo.Sync.Button._defaultIconTextMargin);
            tct = new Echo.Sync.TriCellTable(orientation, 
                    Echo.Sync.Extent.toPixels(margin), stateOrientation, Echo.Sync.Extent.toPixels(stateMargin));
            this.renderButtonText(tct.tdElements[0], text);
            this.iconImg = this.renderButtonIcon(tct.tdElements[1], icon);
            this._stateElement = this._renderButtonState(tct.tdElements[2]);
            this.div.appendChild(tct.tableElement);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        Echo.Sync.Button.prototype.renderDispose.call(this, update);
        if (this._stateElement) {
            Core.Web.Event.removeAll(this._stateElement);
            this._stateElement = null;
        }
    },
    
    /**
     * Renders the state element, appending it to the specified parent.
     *
     * @param {Element} parent the parent DOM element in which the state element should be rendered
     * @return the created state element
     * @type Element
     */
    _renderButtonState: function(parent) {
        var stateIcon = this.getStateIcon();
        var stateElement;
        if (stateIcon) {
            stateElement = document.createElement("img");
            Echo.Sync.ImageReference.renderImg(stateIcon, stateElement);
        } else {
            stateElement = document.createElement("input");
            stateElement.type = this.inputType;
            if (this.inputType == "radio") {
                stateElement.name = "__echo_" + Echo.Sync.RadioButton._nextNameId++;
            }
            stateElement.defaultChecked = this._selected ? true : false;
            Core.Web.Event.add(stateElement, "change", Core.method(this, this._processStateChange), false);
            Core.Web.Event.add(this.div, "click", Core.method(this, this._processStateChange), false);
        }
        parent.appendChild(stateElement);
        var stateAlignment = this.component.render("stateAlignment"); 
        if (stateAlignment) {
            Echo.Sync.Alignment.render(stateAlignment, parent, true, this.component);
        }
        
        return stateElement;
    },

    /** @see Echo.Sync.Button#setPressedState */
    setPressedState: function(pressedState) {
        Echo.Sync.Button.prototype.setPressedState.call(this, pressedState);
        var stateIcon = this.getStateIcon(false, pressedState);
        if (stateIcon) {
            var url = Echo.Sync.ImageReference.getUrl(stateIcon);
            if (this._stateElement.src != url) {
                this._stateElement.src = url;
            }
        }
    },
    
    /** @see Echo.Sync.Button#setRolloverState */
    setRolloverState: function(rolloverState) {
        Echo.Sync.Button.prototype.setRolloverState.call(this, rolloverState);
        var stateIcon = this.getStateIcon(rolloverState, false);
        if (stateIcon) {
            var url = Echo.Sync.ImageReference.getUrl(stateIcon);
            if (this._stateElement.src != url) {
                this._stateElement.src = url;
            }
        }
    },
    
    /**
     * Selects or deselects this button.
     * 
     * @param newState {Boolean} the new selection state
     */
    setSelected: function(newState) {
        if (this._selected == newState) {
            return;
        }
        this._selected = newState;
        this.component.set("selected", newState);
        
        this._updateStateElement();
    },

    /**
     * Updates the image/checked state of the state element in response to the state having changed.
     */
    _updateStateElement: function() {
        var stateIcon = this.getStateIcon();
        if (stateIcon) {
            this._stateElement.src = Echo.Sync.ImageReference.getUrl(stateIcon);
        } else {
            this._stateElement.checked = this._selected ? true : false;
        }
    }
});

/**
 * Component rendering peer: CheckBox
 */
Echo.Sync.CheckBox = Core.extend(Echo.Sync.ToggleButton, {
    
    $load: function() {
        Echo.Render.registerPeer("CheckBox", this);
    },
    
    /** @see Echo.Sync.ToggleButton#inputType */
    inputType: "checkbox"
});

/**
 * Component rendering peer: RadioButton
 */
Echo.Sync.RadioButton = Core.extend(Echo.Sync.ToggleButton, {

    $static: {
    
        /** Next sequentially assigned identifier for radio button groups. */
        _nextNameId: 0,
        
        /**
         * Contains mappings from RadioButton render ids to Echo.Sync.RadioButton.Group objects.
         * 
         * @type Core.Arrays.LargeMap
         */
        _groups: new Core.Arrays.LargeMap()
    },

    $load: function() {
        Echo.Render.registerPeer("RadioButton", this);
    },
    
    /** @see Echo.Sync.ToggleButton#inputType */
    inputType: "radio",
    
    /** 
     * The group to which this radio button belongs.
     * @type Echo.Sync.RadioButton.Group
     */
    _group: null,

    /** @see Echo.Sync.Button#doAction */
    doAction: function() {
        if (this._group) {
            this._group.deselect();
        }
        Echo.Sync.ToggleButton.prototype.doAction.call(this);
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        var groupId = this.component.render("group");
        if (groupId != null) {
            var group = Echo.Sync.RadioButton._groups.map[groupId];
            if (!group) {
                group = new Echo.Sync.RadioButton.Group(groupId);
                Echo.Sync.RadioButton._groups.map[groupId] = group;
            }
            group.add(this);
            this._group = group;
        }
        Echo.Sync.ToggleButton.prototype.renderAdd.call(this, update, parentElement);
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        Echo.Sync.ToggleButton.prototype.renderDispose.call(this, update);
        if (this._group) {
            this._group.remove(this);
            if (this._group.size() === 0) {
                Echo.Sync.RadioButton._groups.remove(this._group.id);
            }
            this._group = null;
        }
    }
});

/**
 * Representation of a collection of radio buttons, only one of which
 * may be selected at a given time.
 */
Echo.Sync.RadioButton.Group = Core.extend({

    /** Group id. */
    id: null,
    
    /** Array of buttons (peers) in this group. */
    _buttons: null,

    /**
     * Creates a RadioButton group.
     * 
     * @param id {String} the id
     */
    $construct: function(id) {
        this.id = id;
        this._buttons = [];
    },
    
    /**
     * Adds the specified button to this button group.
     *
     * @param {Echo.Render.ComponentSync.ToggleButton} button the button
     */
    add: function(button) {
        this._buttons.push(button);
    },
    
    /**
     * Deselects all buttons in this button group.
     */
    deselect: function() {
        for (var i = 0; i < this._buttons.length; ++i) {
            this._buttons[i].setSelected(false);
        }
    },
    
    /**
     * Removes the specified button from this button group.
     * 
     * @param {Echo.Render.ComponentSync.ToggleButton} button the button
     */
    remove: function(button) {
        // Find index of button in array.
        var buttonIndex = -1;
        for (var i = 0; i < this._buttons.length; ++i) {
            if (this._buttons[i] == button) {
                buttonIndex = i;
                break;
            }
        }
        
        if (buttonIndex == -1) {
            // Button does not exist in group.
            throw new Error("No such button: " + button.component.renderId);
        }
        
        if (this._buttons.length == 1) {
            // Array will now be empty.
            this._buttons = [];
        } else {
            // Buttons remain, remove button from button group.
            this._buttons[buttonIndex] = this._buttons[this._buttons.length - 1];
            this._buttons.length = this._buttons.length - 1;
        }
    },

    /**
     * Returns the number of buttons contained by this button group.
     * 
     * @return the number of buttons
     * @type Number
     */
    size: function() {
        return this._buttons.length;
    }
});
