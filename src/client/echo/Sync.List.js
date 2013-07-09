/**
 * Abstract base class for rendering SELECT-element based list components.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Echo.Sync.ListComponent = Core.extend(Echo.Render.ComponentSync, {

    $abstract: {
        
        /**
         * Flag indicating whether the component should be rendered as a list box (true) or select field (false).
         * @type Boolean
         */
        listBox: null
    },
    
    /**
     * Flag indicating that one or more of the items in the list component has been rendered with a selected appearance.
     * @type Boolean
     */
    _hasRenderedSelectedItems: false,
    
    /**
     * Flag indicating whether multiple selection is allowed (for listboxes).
     * @type Boolean
     */
    _multipleSelect: false,
    
    /**
     * Flag indicating that selection should be determined based on "selectedId"
     * property rather than "selection" property.  This flag is enabled when
     * "selectedId" is updated and disabled when an item is selected by the user.
     * @type Boolean
     */
    _selectedIdPriority: false,

    /**
     * The "main" element upon which contains items and upon which listeners are registered.  
     * For normal rendering, this is the SELECT, which directly contains individual OPTION elements.
     * For the alternate rendering, this is the TABLE, whose TBODY element contains individual
     * TR elements that represent options.
     * @type Element
     */
    _element: null,
    
    /**
     * Rendered focus state of component, based on received DOM focus/blur events.
     * @type Boolean
     */
    _focused: false,
    
    /**
     * Determines current selection state.
     * By default, the value of the "selection" property of the component is returned.
     * If the _selectedIdPriorirty flag is set, or if the "selection" property has no value,
     * then selection is determined based on the "selectedId" property of the component.
     * 
     * @return the selection, either an integer index or array of indices
     */
    _getSelection: function() {
        // Retrieve selection from "selection" property.
        var selection = this._selectedIdPriority ? null : this.component.get("selection");
        
        if (selection == null) {
            // If selection is now in "selection" property, query "selectedId" property.
            var selectedId = this.component.get("selectedId");

            if (selectedId) {
                // If selectedId property is set, find item with corresponding id.
                var items = this.component.get("items");

                for (var i = 0; i < items.length; ++i) {
                    if (items[i].id == selectedId) {
                        selection = i;
                        break;
                    }
                }
            }
            
            // If selection is null (selectedId not set, or corresponding item not found),
            // set selection to null/default value.
            if (selection == null) {
                selection = this.listBox ? [] : 0;
            }
        }
        
        return selection;
    },
    
    /** Processes a focus blur event */
    _processBlur: function(e) {
        this._focused = false;
    },
    
    /**
     * Processes a selection change event.
     */
    _processChange: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            this._renderSelection();
            return false;
        }
        
        var selection;
        if (this._multipleSelect) {
            selection = [];
            for (var i = 0; i < this._element.options.length; ++i) {
                if (this._element.options[i].selected) {
                    selection.push(i);
                }
            }
        } else {
            if (this._element.selectedIndex != -1) {
                selection = this._element.selectedIndex;
            }
        }
    
        this._setSelection(selection);
        this.component.doAction();
    },
    
    /** Processes a focus event */
    _processFocus: function(e) {
        this._focused = true;
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        this.client.application.setFocusedComponent(this.component);
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._multipleSelect = this.component.get("selectionMode") == Echo.ListBox.MULTIPLE_SELECTION;
        this._enabled = this.component.isRenderEnabled();
        
        this._element = document.createElement("select");
        this._element.id = this.component.renderId;
        this._element.size = this.listBox ? 6 : 1;

        if (!this._enabled) {
            this._element.disabled = true;
        }
        if (this._multipleSelect) {
            this._element.multiple = "multiple";
        }

        this._element.style.height = Echo.Sync.Extent.toCssValue(this.component.render("height"), false, false);
        
        var width = this.component.render("width");
        if (width) {
            if (Echo.Sync.Extent.isPercent(width)) {
                if (!Core.Web.Env.QUIRK_IE_SELECT_PERCENT_WIDTH) {
                    this._element.style.width = width;
                }
            } else {
                this._element.style.width = Echo.Sync.Extent.toCssValue(width, true, false);
            }
        }
        if (this._enabled) {
            Echo.Sync.renderComponentDefaults(this.component, this._element);
            Echo.Sync.Color.render(this.component.render("background"), this._element, "backgroundColor");
        } else {
            Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this._element);
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "foreground", "disabledForeground", true), 
                    this._element, "color");
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "background", "disabledBackground", true), 
                    this._element, "backgroundColor");
            Echo.Sync.Font.render(Echo.Sync.getEffectProperty(this.component, "font", "disabledFont", true),this._element);
        }

        var border = Echo.Sync.getEffectProperty(this.component, "border", "disabledBorder", !this._enabled);
        Echo.Sync.Border.render(border, this._element);
        Echo.Sync.BoxShadow.render(this.component.render("boxShadow"), this._element);
        Echo.Sync.RoundedCorner.render(this.component.render("radius"), this._element);
        Echo.Sync.Insets.render(this.component.render("insets"), this._element, "padding");

        var items = this.component.get("items");
        if (items) {
            for (var i = 0; i < items.length; ++i) {
                var optionElement = document.createElement("option");
                if (items[i].text == null) {
                    optionElement.appendChild(document.createTextNode(items[i].toString()));
                } else {
                    optionElement.appendChild(document.createTextNode(items[i].text));
                }
                if (items[i].foreground) {
                    Echo.Sync.Color.render(items[i].foreground, optionElement, "color");
                }
                if (items[i].background) {
                    Echo.Sync.Color.render(items[i].background, optionElement, "backgroundColor");
                }
                if (items[i].font) {
                    Echo.Sync.Font.render(items[i].font, optionElement);
                }
                this._element.appendChild(optionElement);
            }
        }

        if (this._enabled) {
            Core.Web.Event.add(this._element, "change", Core.method(this, this._processChange), false);
            Core.Web.Event.add(this._element, "blur", Core.method(this, this._processBlur), false);
            Core.Web.Event.add(this._element, "focus", Core.method(this, this._processFocus), false);
        }
        parentElement.appendChild(this._element);
    },

    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        this._renderSelection();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._element);
        this._element = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderFocus */
    renderFocus: function() {
        if (this._focused) {
            return;
        }
        
        this._focused = true;
        Core.Web.DOM.focusElement(this._element);
    },
    
    /**
     * Renders the current selection state.
     */
    _renderSelection: function() {
        var selection = this._getSelection();
        
        if (this._hasRenderedSelectedItems) {
             this._element.selectedIndex = -1;
        }
        if (selection instanceof Array) {
            for (var i = 0; i < selection.length; ++i) {
                if (selection[i] >= 0 && selection[i] < this._element.options.length) {
                    this._element.options[selection[i]].selected = true;
                }
            }
        } else if (selection >= 0 && selection < this._element.options.length) {
            this._element.options[selection].selected = true;
        }
        this._hasRenderedSelectedItems = true;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        if (update.getUpdatedProperty("selectedId") && !update.getUpdatedProperty("selection")) {
            this._selectedIdPriority = true;            
        }
        
        var element = this._element;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        if (this._focused) {
            Core.Web.DOM.focusElement(this._element);
        }
        return false; // Child elements not supported: safe to return false.
    },
    
    /**
     * Sets the selection state.
     * Updates values of both "selection" and "selectedId" properties of the component.
     * 
     * @param selection the new selection state, either the selected index or an array of selected indices 
     */
    _setSelection: function(selection) {
        this._selectedIdPriority = false;
    
        var selectedId = null;
        
        if (selection instanceof Array && selection.length == 1) {
            selection = selection[0];
        }
        
        var items = this.component.get("items");
        if (selection instanceof Array) {
            selectedId = [];
            for (var i = 0; i < selection.length; ++i) {
                var selectedIndex = selection[i];
                if (selectedIndex < items.length) {
                    if (items[selectedIndex].id != null) {
                        selectedId.push(items[selectedIndex].id);
                    }
                }
            }
        } else {
            if (selection < items.length) {
                if (items[selection].id != null) {
                    selectedId = items[selection].id;
                }
            }
        }

        this.component.set("selection", selection);
        this.component.set("selectedId", selectedId);
    }
});

/**
 * Component rendering peer: ListBox
 */
Echo.Sync.ListBox = Core.extend(Echo.Sync.ListComponent, {
    
    /** @see Echo.Sync.ListComponent#listBox */
    listBox: true,

    $load: function() {
        Echo.Render.registerPeer("ListBox", this);
    }
});

/**
 * Component rendering peer: SelectField
 */
Echo.Sync.SelectField = Core.extend(Echo.Sync.ListComponent, { 

    /** @see Echo.Sync.ListComponent#listBox */
    listBox: false,

    $load: function() {
        Echo.Render.registerPeer("SelectField", this);
    }
});
