/**
 * Abstract base class for SELECT-element based list components.
 */
EchoAppRender.ListComponentSync = Core.extend(EchoRender.ComponentSync, {

    $static: {
        DEFAULT_DIV_HEIGHT: "6em",
        DEFAULT_DIV_BORDER: "1px solid",
        DEFAULT_SELECTED_BACKGROUND: "#0a246a",
        DEFAULT_SELECTED_FOREGROUND: "#ffffff"
    },

    $abstract: true,

    _hasRenderedSelectedItems: false,
    
    _multipleSelect: false,
    
    /**
     * Flag indicating that selection should be determined based on "selectedId"
     * property rather than "selection" property.  this flag is enabled when
     * "selectedId" is updated and disabled when an item is selected by the user.
     */
    _selectedIdPriority: false,

    /**
     * Flag indicating that component will be rendered as a DHTML-based ListBox.
     * This form of rendering is necessary on Internet Explorer 6 browsers due to unstable
     * code in this web browser when using listbox-style SELECT elements.
     */
    _alternateRender: false,
    
    _element: null,
    
    _div: null,
    
    /**
     * Processes a click event.
     * This event handler is registered only in the case of the "alternate" DHTML-based rendered
     * listbox for IE6, i.e., the _alternateRender flag will be true. 
     */
    _processClick: function(e) {
        if (!this.client.verifyInput(this.component)) {
            WebCore.DOM.preventEventDefault(e);
            this._renderSelection();
            return;
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
     * This event handler is registered only for traditional SELECT elements, i.e., the _alternateRender flag will be false.
     */
    _processChange: function(e) {
        if (!this.client.verifyInput(this.component)) {
            WebCore.DOM.preventEventDefault(e);
            this._renderSelection();
            return;
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
    
    /**
     * IE-specific event handler to prevent mouse-selection of text in DOM-rendered listbox component.
     */
    _processSelectStart: function(e) {
        WebCore.DOM.preventEventDefault(e);
    },

    /**
     * Renders the list selection component as a standard SELECT element.
     * This strategy is always used in all browsers except IE6, and is used in IE6
     * for drop-down select fields.  IE6 cannot use this strategy for listboxes
     * do to major bugs in this browser (listboxes randomly change back into selectfields
     * when rendered by DOM manipulation).
     * This strategy is used when the _alternateRender flag is false.
     */
    _renderMainAsSelect: function(update, parentElement, size) {
        this._element = document.createElement("select");
        this._element.id = this.component.renderId;
        this._element.size = size;

        if (!this._enabled) {
            this._element.disabled = true;
        }
        if (this._multipleSelect) {
            this._element.multiple = "multiple";
        }

        EchoAppRender.Border.render(
                EchoAppRender.getEffectProperty(this.component, "border", "disabledBorder", !this._enabled), 
                this._element);
        EchoAppRender.Color.render(
                EchoAppRender.getEffectProperty(this.component, "foreground", "disabledForeground", !this._enabled), 
                this._element, "color");
        EchoAppRender.Color.render(
                EchoAppRender.getEffectProperty(this.component, "background", "disabledBackground", !this._enabled), 
                this._element, "backgroundColor");
        EchoAppRender.Font.render(
                EchoAppRender.getEffectProperty(this.component, "font", "disabledFont", !this._enabled), 
                this._element);
        EchoAppRender.Insets.render(this.component.render("insets"), this._element, "padding");

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
                    EchoAppRender.Color.render(items[i].foreground, optionElement, "color");
                }
                if (items[i].background) {
                    EchoAppRender.Color.render(items[i].background, optionElement, "backgroundColor");
                }
                if (items[i].font) {
                    EchoAppRender.Font.render(items[i].font, optionElement);
                }
                this._element.appendChild(optionElement);
            }
        }
    
        if (this._enabled) {
            WebCore.EventProcessor.add(this._element, "change", Core.method(this, this._processChange), false);
        }

        parentElement.appendChild(this._element);
    },

    /**
     * Renders a list box as a DIV element containing DIV elements of selectable items.
     * This strategy is used on IE6 due to bugs in this browser's rendering engine.
     * This strategy is used when the _alternateRender flag is true.
     */
    _renderMainAsDiv: function(update, parentElement, size) {
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
        
        //FIXME        
        this._div.style.height = "6em";
        
        EchoAppRender.Border.render(
                EchoAppRender.getEffectProperty(this.component, "border", "disabledBorder", !this._enabled, 
                EchoAppRender.ListComponentSync.DEFAULT_DIV_BORDER, EchoAppRender.ListComponentSync.DEFAULT_DIV_BORDER), 
                this._div);
        EchoAppRender.Color.render(
                EchoAppRender.getEffectProperty(this.component, "foreground", "disabledForeground", !this._enabled), 
                this._div, "color");
        EchoAppRender.Color.render(
                EchoAppRender.getEffectProperty(this.component, "background", "disabledBackground", !this._enabled), 
                this._div, "backgroundColor");
        EchoAppRender.Font.render(
                EchoAppRender.getEffectProperty(this.component, "font", "disabledFont", !this._enabled), 
                this._div);
        EchoAppRender.Insets.render(this.component.render("insets"), this._div, "padding");

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
                    EchoAppRender.Color.render(items[i].foreground, optionElement, "color");
                }
                if (items[i].background) {
                    EchoAppRender.Color.render(items[i].background, optionElement, "backgroundColor");
                }
                if (items[i].font) {
                    EchoAppRender.Font.render(items[i].font, optionElement);
                }
                this._div.appendChild(optionElement);
            }
        }
        
        if (this._enabled) {
            WebCore.EventProcessor.add(this._div, "click", Core.method(this, this._processClick), false);
            WebCore.EventProcessor.add(this._div, "selectstart", Core.method(this, this._processSelectStart), false);
        }
        
        parentElement.appendChild(this._element);
    },
    
    /**
     * Delegates to _renderMainAsSelect() or _renderMainAsDiv() depending on type of list selection component and browser bugs.
     */
    _renderMain: function(update, parentElement, size) {
        this._multipleSelect = this.component.get("selectionMode") == EchoApp.ListBox.MULTIPLE_SELECTION;
        if (this.component instanceof EchoApp.ListBox && WebCore.Environment.QUIRK_IE_SELECT_LIST_DOM_UPDATE) {
            this._alternateRender = true;
        }
        this._enabled = this.component.isRenderEnabled();
        
        if (this._alternateRender) {
            this._renderMainAsDiv(update, parentElement, size);
        } else {
            this._renderMainAsSelect(update, parentElement, size);
        }
    },
    
    renderDisplay: function() {
        this._renderSelection();
    },
    
    renderDispose: function(update) { 
        WebCore.EventProcessor.removeAll(this._element);
        this._element = null;
        if (this._div) {
            WebCore.EventProcessor.removeAll(this._div);
            this._div = null;
        }
    },
    
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
                    }
                }
            }
            
            // If selection is null (selectedId not set, or not corresponding item not found),
            // set selection to null/default value.
            if (selection == null) {
                selection = this._multipleSelect ? [] : 0;
            }
        }
        
        return selection;
    },
    
    _renderSelection: function() {
        // Set selection.
        var selection = this._getSelection();
        
        if (this._alternateRender) {
            if (this._hasRenderedSelectedItems) {
                var items = this.component.get("items");
                for (var i = 0; i < items.length; ++i) {
                    EchoAppRender.Color.renderClear(items[i].foreground, this._div.childNodes[i], 
                            "color");
                    EchoAppRender.Color.renderClear(items[i].background, this._div.childNodes[i], 
                            "backgroundColor");
                }
            }
            if (selection instanceof Array) {
                for (var i = 0; i < selection.length; ++i) {
                    if (selection[i] >= 0 && selection[i] < this._div.childNodes.length) {
                        EchoAppRender.Color.render(EchoAppRender.ListComponentSync.DEFAULT_SELECTED_FOREGROUND,
                                this._div.childNodes[selection[i]], "color");
                        EchoAppRender.Color.render(EchoAppRender.ListComponentSync.DEFAULT_SELECTED_BACKGROUND,
                                this._div.childNodes[selection[i]], "backgroundColor");
                    }
                }
            } else if (selection >= 0 && selection < this._div.childNodes.length) {
                EchoAppRender.Color.render(EchoAppRender.ListComponentSync.DEFAULT_SELECTED_FOREGROUND,
                        this._div.childNodes[selection], "color");
                EchoAppRender.Color.render(EchoAppRender.ListComponentSync.DEFAULT_SELECTED_BACKGROUND,
                        this._div.childNodes[selection], "backgroundColor");
            }
        } else {
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
        }
        this._hasRenderedSelectedItems = true;
    },
    
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
EchoAppRender.ListBoxSync = Core.extend(EchoAppRender.ListComponentSync, {

    $load: function() {
        EchoRender.registerPeer("ListBox", this);
    },

    renderAdd: function(update, parentElement) {
        this._renderMain(update, parentElement, 6);
    }
});

/**
 * Component rendering peer: SelectField
 */
EchoAppRender.SelectFieldSync = Core.extend(EchoAppRender.ListComponentSync, { 

    $load: function() {
        EchoRender.registerPeer("SelectField", this);
    },
    
    renderAdd: function(update, parentElement) {
        this._renderMain(update, parentElement, 0);
    }
});
