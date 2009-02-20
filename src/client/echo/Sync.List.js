/**
 * Abstract base class for rendering SELECT-element based list components.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Echo.Sync.ListComponent = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        /** 
         * Alternate rendering: default border style.
         * @type #Border
         */
        DEFAULT_DIV_BORDER: "1px solid #7f7f7f",
        
        /** 
         * Alternate rendering: default selected item background.
         * @type #Color
         */
        DEFAULT_SELECTED_BACKGROUND: "#0a246a",
        
        /** 
         * Alternate rendering: default selected item foreground.
         * @type #Color
         */
        DEFAULT_SELECTED_FOREGROUND: "#ffffff"
    },

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
     * Flag indicating that component will be rendered as a DHTML-based ListBox.
     * This form of rendering is necessary on Internet Explorer 6 browsers due to unstable
     * code in this web browser when using listbox-style SELECT elements.
     * @type Boolean
     */
    _alternateRender: false,
    
    /**
     * The "main" element upon which contains items and upon which listeners are registered.  
     * For normal rendering, this is the SELECT, which directly contains individual OPTION elements.
     * For the alternate rendering, this is the TABLE, whose TBODY element contains individual
     * TR elements that represent options.
     * @type Element
     */
    _element: null,
    
    /**
     * Rendered DIV element when alternate listbox rendering is enabled.
     * Null if list is rendered as a SELECT element.
     * @type Element.
     */
    _div: null,
    
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
     * Processes a click event.
     * This event handler is registered only in the case of the "alternate" DHTML-based rendered
     * listbox for IE6, i.e., the _alternateRender flag will be true. 
     */
    _processClick: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            Core.Web.DOM.preventEventDefault(e);
            this._renderSelection();
            return true;
        }
        
        var child = this._div.firstChild;
        var i = 0;
        while (child) {
            if (child == e.target) {
                break;
            }
            child = child.nextSibling;
            ++i;
        }
        if (child == null) {
            return;
        }
        
        if (this._multipleSelect && e.ctrlKey) {
            // Multiple selection and user has pressed ctrl key to select multiple items.
            var selection = this._getSelection();
            if (selection == null) {
                selection = [];
            } else if (typeof (selection) == "number") {
                selection = [selection];
            }
            var arrayIndex = Core.Arrays.indexOf(selection, i); 
            if (arrayIndex == -1) {
                // Add item to selection if not present.
                selection.push(i);
            } else {
                // Remove item from selection if already present.
                selection.splice(arrayIndex, 1);
            }
        } else {
            selection = i;
        }
        
        this._setSelection(selection);
        this.component.doAction();
        this._renderSelection();
    },
    
    /**
     * Processes a selection change event.
     * This event handler is registered only for traditional SELECT elements, i.e., the _alternateRender flag will be false.
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
    
    /** IE-specific event handler to prevent mouse-selection of text in DOM-rendered listbox component. */
    _processSelectStart: function(e) {
        Core.Web.DOM.preventEventDefault(e);
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._multipleSelect = this.component.get("selectionMode") == Echo.ListBox.MULTIPLE_SELECTION;
        if (this.listBox && Core.Web.Env.QUIRK_IE_SELECT_LIST_DOM_UPDATE) {
            this._alternateRender = true;
        }
        this._enabled = this.component.isRenderEnabled();
        
        if (this._alternateRender) {
            this._renderMainAsDiv(update, parentElement);
        } else {
            this._renderMainAsSelect(update, parentElement);
        }
    },

    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        this._renderSelection();
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) { 
        Core.Web.Event.removeAll(this._element);
        this._element = null;
        if (this._div) {
            Core.Web.Event.removeAll(this._div);
            this._div = null;
        }
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
     * Renders a list box as a DIV element containing DIV elements of selectable items.
     * This strategy is used on IE6 due to bugs in this browser's rendering engine.
     * This strategy is used when the _alternateRender flag is true.
     * 
     * @param {Echo.Update.ComponentUpdate} update the update
     * @param {Element} parent the parent DOM element 
     */
    _renderMainAsDiv: function(update, parentElement) {
        this._element = document.createElement("table");
        this._element.id = this.component.renderId;
        
        var tbodyElement = document.createElement("tbody");
        this._element.appendChild(tbodyElement);
        var trElement = document.createElement("tr");
        tbodyElement.appendChild(trElement);
        var tdElement = document.createElement("td");
        trElement.appendChild(tdElement);
        
        this._div = document.createElement("div");
        tdElement.appendChild(this._div);
        
        this._div.style.cssText = "cursor:default;overflow:auto;";
        this._div.style.height = Echo.Sync.Extent.toCssValue(this.component.render("height", "6em"), false, false);
        var width = this.component.render("width");
        if (!Echo.Sync.Extent.isPercent(width)) {
            this._div.style.width = Echo.Sync.Extent.toCssValue(width, true, false);
        }
        if (this._enabled) {
            Echo.Sync.renderComponentDefaults(this.component, this._element);
        } else {
            Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this._element);
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "foreground", "disabledForeground", true), 
                    this._div, "color");
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "background", "disabledBackground", true), 
                    this._div, "backgroundColor");
            Echo.Sync.Font.render(Echo.Sync.getEffectProperty(this.component, "font", "disabledFont", true), this._div);
        }
        Echo.Sync.Border.render(
                Echo.Sync.getEffectProperty(this.component, "border", "disabledBorder", !this._enabled, 
                Echo.Sync.ListComponent.DEFAULT_DIV_BORDER, null), 
                this._div);
        Echo.Sync.Insets.render(this.component.render("insets"), this._div, "padding");

        var items = this.component.get("items");
        if (items) {
            for (var i = 0; i < items.length; ++i) {
                var optionElement = document.createElement("div");
                if (items[i].text) {
                    optionElement.appendChild(document.createTextNode(items[i].text));
                } else {
                    optionElement.appendChild(document.createTextNode(items[i].toString()));
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
                this._div.appendChild(optionElement);
            }
        }
        
        if (this._enabled) {
            Core.Web.Event.add(this._element, "blur", Core.method(this, this._processBlur), false);
            Core.Web.Event.add(this._element, "focus", Core.method(this, this._processFocus), false);
            Core.Web.Event.add(this._div, "click", Core.method(this, this._processClick), false);
            Core.Web.Event.add(this._div, "selectstart", Core.method(this, this._processSelectStart), false);
        }
        
        parentElement.appendChild(this._element);
    },
    
    /**
     * Renders the list selection component as a standard SELECT element.
     * This strategy is always used in all browsers except IE6, and is used in IE6
     * for drop-down select fields.  IE6 cannot use this strategy for listboxes
     * do to major bugs in this browser (listboxes randomly change back into selectfields
     * when rendered by DOM manipulation).
     * This strategy is used when the _alternateRender flag is false.
     * 
     * @param {Echo.Update.ComponentUpdate} update the update
     * @param {Element} parent the parent DOM element 
     */
    _renderMainAsSelect: function(update, parentElement) {
        this._div = document.createElement("div");
    
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
                    this._div.style.width = width;
                    this._element.style.width = "100%";
                }
            } else {
                this._element.style.width = Echo.Sync.Extent.toCssValue(width, true, false);
            }
        }
        if (this._enabled) {
            Echo.Sync.renderComponentDefaults(this.component, this._element);
        } else {
            Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this._element);
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "foreground", "disabledForeground", true), 
                    this._element, "color");
            Echo.Sync.Color.render(Echo.Sync.getEffectProperty(this.component, "background", "disabledBackground", true), 
                    this._element, "backgroundColor");
            Echo.Sync.Font.render(Echo.Sync.getEffectProperty(this.component, "font", "disabledFont", true),this._element);
        }
        Echo.Sync.Border.render(Echo.Sync.getEffectProperty(this.component, "border", "disabledBorder", !this._enabled), 
                this._element);
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

        this._div.appendChild(this._element);

        parentElement.appendChild(this._div);
    },

    /**
     * Renders the current selection state.
     */
    _renderSelection: function() {
        var selection = this._getSelection(),
            i;
        
        if (this._alternateRender) {
            if (this._hasRenderedSelectedItems) {
                var items = this.component.get("items");
                for (i = 0; i < items.length; ++i) {
                    Echo.Sync.Color.renderClear(items[i].foreground, this._div.childNodes[i], 
                            "color");
                    Echo.Sync.Color.renderClear(items[i].background, this._div.childNodes[i], 
                            "backgroundColor");
                }
            }
            if (selection instanceof Array) {
                for (i = 0; i < selection.length; ++i) {
                    if (selection[i] >= 0 && selection[i] < this._div.childNodes.length) {
                        Echo.Sync.Color.render(Echo.Sync.ListComponent.DEFAULT_SELECTED_FOREGROUND,
                                this._div.childNodes[selection[i]], "color");
                        Echo.Sync.Color.render(Echo.Sync.ListComponent.DEFAULT_SELECTED_BACKGROUND,
                                this._div.childNodes[selection[i]], "backgroundColor");
                    }
                }
            } else if (selection >= 0 && selection < this._div.childNodes.length) {
                Echo.Sync.Color.render(Echo.Sync.ListComponent.DEFAULT_SELECTED_FOREGROUND,
                        this._div.childNodes[selection], "color");
                Echo.Sync.Color.render(Echo.Sync.ListComponent.DEFAULT_SELECTED_BACKGROUND,
                        this._div.childNodes[selection], "backgroundColor");
            }
        } else {
            if (this._hasRenderedSelectedItems) {
                this._element.selectedIndex = -1;
            }
            if (selection instanceof Array) {
                for (i = 0; i < selection.length; ++i) {
                    if (selection[i] >= 0 && selection[i] < this._element.options.length) {
                        this._element.options[selection[i]].selected = true;
                    }
                }
            } else if (selection >= 0 && selection < this._element.options.length) {
                this._element.options[selection].selected = true;
            }
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
