/**
 * Abstract base class for SELECT-element based list components.
 */
EchoAppRender.ListComponentSync = Core.extend(EchoRender.ComponentSync, {

    $static: {
        DEFAULT_DIV_HEIGHT: "6em",
        DEFAULT_DIV_BORDER: new EchoApp.Border(1, "solid", null),
        DEFAULT_SELECTED_BACKGROUND: "#0a246a",
        DEFAULT_SELECTED_FOREGROUND: "#ffffff"
    },

    $abstract: true,

    _hasRenderedSelectedItems: false,
    
    _multipleSelect: false,

    /**
     * Flag indicating that component will be rendered as a DHTML-based ListBox.
     * This form of rendering is necessary on Internet Explorer 6 browsers due to unstable
     * code in this web browser when using listbox-style SELECT elements.
     */
    _alternateRender: false,
    
    _mainElement: null,
    
    _divElement: null,
    
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
        
        var child = this._divElement.firstChild;
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
            var selection = this.component.get("selection");
            if (!selection) {
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
            selection = [i];
        }
        
        this.component.set("selection", selection);
        this.component.doAction();

        this._renderSelection();
    },
    
    _processChange: function(e) {
        if (!this.client.verifyInput(this.component)) {
            WebCore.DOM.preventEventDefault(e);
            this._renderSelection();
            return;
        }
        
        var selection = [];
        if (this._multipleSelect) {
            for (var i = 0; i < this._mainElement.options.length; ++i) {
                if (this._mainElement.options[i].selected) {
                    selection.push(i);
                }
            }
        } else {
            if (this._mainElement.selectedIndex != -1) {
                selection.push(this._mainElement.selectedIndex);
            }
        }
    
        this.component.set("selection", selection);
        this.component.doAction();
    },
    
    _processSelectStart: function(e) {
        WebCore.DOM.preventEventDefault(e);
    },

    _renderMainAsSelect: function(update, parentElement, size) {
        this._mainElement = document.createElement("select");
        this._mainElement.id = this.component.renderId;
        this._mainElement.size = size;

        if (!this._enabled) {
            this._mainElement.disabled = true;
        }
        if (this._multipleSelect) {
            this._mainElement.multiple = "multiple";
        }

        EchoAppRender.Border.render(
                EchoAppRender.getEffectProperty(this.component, "border", "disabledBorder", !this._enabled), 
                this._mainElement);
        EchoAppRender.Color.render(
                EchoAppRender.getEffectProperty(this.component, "foreground", "disabledForeground", !this._enabled), 
                this._mainElement, "color");
        EchoAppRender.Color.render(
                EchoAppRender.getEffectProperty(this.component, "background", "disabledBackground", !this._enabled), 
                this._mainElement, "backgroundColor");
        EchoAppRender.Font.render(
                EchoAppRender.getEffectProperty(this.component, "font", "disabledFont", !this._enabled), 
                this._mainElement);
        EchoAppRender.Insets.renderPixel(this.component.render("insets"), this._mainElement, "padding");

        if (this.component.items) {
            for (var i = 0; i < this.component.items.length; ++i) {
                var optionElement = document.createElement("option");
                optionElement.appendChild(document.createTextNode(this.component.items[i].toString()));
                if (this.component.items[i].foreground) {
                    EchoAppRender.Color.render(this.component.items[i].foreground, optionElement, "color");
                }
                if (this.component.items[i].background) {
                    EchoAppRender.Color.render(this.component.items[i].background, optionElement, "backgroundColor");
                }
                if (this.component.items[i].font) {
                    EchoAppRender.Font.render(this.component.items[i].font, optionElement);
                }
                this._mainElement.appendChild(optionElement);
            }
        }
    
        if (this._enabled) {
            WebCore.EventProcessor.add(this._mainElement, "change", Core.method(this, this._processChange), false);
        }

        parentElement.appendChild(this._mainElement);
    },

    _renderMainAsDiv: function(update, parentElement, size) {
        this._mainElement = document.createElement("table");
        this._mainElement.id = this.component.renderId;
        
        var tbodyElement = document.createElement("tbody");
        this._mainElement.appendChild(tbodyElement);
        var trElement = document.createElement("tr");
        tbodyElement.appendChild(trElement);
        var tdElement = document.createElement("td");
        trElement.appendChild(tdElement);
        
        this._divElement = document.createElement("div");
        tdElement.appendChild(this._divElement);
        
        this._divElement.style.cssText = "cursor:default;overflow:auto;";
        
        //FIXME        
        this._divElement.style.height = "6em";
        
        EchoAppRender.Border.render(
                EchoAppRender.getEffectProperty(this.component, "border", "disabledBorder", !this._enabled, 
                EchoAppRender.ListComponentSync.DEFAULT_DIV_BORDER, EchoAppRender.ListComponentSync.DEFAULT_DIV_BORDER), 
                this._divElement);
        EchoAppRender.Color.render(
                EchoAppRender.getEffectProperty(this.component, "foreground", "disabledForeground", !this._enabled), 
                this._divElement, "color");
        EchoAppRender.Color.render(
                EchoAppRender.getEffectProperty(this.component, "background", "disabledBackground", !this._enabled), 
                this._divElement, "backgroundColor");
        EchoAppRender.Font.render(
                EchoAppRender.getEffectProperty(this.component, "font", "disabledFont", !this._enabled), 
                this._divElement);
        EchoAppRender.Insets.renderPixel(this.component.render("insets"), this._divElement, "padding");

        if (this.component.items) {
            for (var i = 0; i < this.component.items.length; ++i) {
                var optionElement = document.createElement("div");
                optionElement.appendChild(document.createTextNode(this.component.items[i].toString()));
                if (this.component.items[i].foreground) {
                    EchoAppRender.Color.render(this.component.items[i].foreground, optionElement, "color");
                }
                if (this.component.items[i].background) {
                    EchoAppRender.Color.render(this.component.items[i].background, optionElement, "backgroundColor");
                }
                if (this.component.items[i].font) {
                    EchoAppRender.Font.render(this.component.items[i].font, optionElement);
                }
                this._divElement.appendChild(optionElement);
            }
        }
        
        if (this._enabled) {
            WebCore.EventProcessor.add(this._divElement, "click", Core.method(this, this._processClick), false);
            WebCore.EventProcessor.add(this._divElement, "selectstart", Core.method(this, this._processSelectStart), false);
        }
        
        parentElement.appendChild(this._mainElement);
    },
    
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
        WebCore.EventProcessor.removeAll(this._mainElement);
        this._mainElement = null;
    },
    
    _renderSelection: function() {
        // Set selection.
        var selection = this.component.get("selection");
        
        if (!selection) {
            selection = this._multipleSelect ? [] : [0];
        }

        if (this._alternateRender) {
            if (this._hasRenderedSelectedItems) {
                for (var i = 0; i < this.component.items.length; ++i) {
                    EchoAppRender.Color.renderClear(this.component.items[i].foreground, this._divElement.childNodes[i], 
                            "color");
                    EchoAppRender.Color.renderClear(this.component.items[i].background, this._divElement.childNodes[i], 
                            "backgroundColor");
                }
            }
            for (var i = 0; i < selection.length; ++i) {
                if (selection[i] >= 0 && selection[i] < this._divElement.childNodes.length) {
                    EchoAppRender.Color.render(EchoAppRender.ListComponentSync.DEFAULT_SELECTED_FOREGROUND,
                            this._divElement.childNodes[selection[i]], "color");
                    EchoAppRender.Color.render(EchoAppRender.ListComponentSync.DEFAULT_SELECTED_BACKGROUND,
                            this._divElement.childNodes[selection[i]], "backgroundColor");
                }
            }
        } else {
            if (this._hasRenderedSelectedItems) {
                this._mainElement.selectedIndex = -1;
            }
            for (var i = 0; i < selection.length; ++i) {
                if (selection[i] >= 0 && selection[i] < this._mainElement.options.length) {
                    this._mainElement.options[selection[i]].selected = true;
                }
            }
        }
        this._hasRenderedSelectedItems = true;
    },
    
    renderUpdate: function(update) {
        var element = this._mainElement;
        var containerElement = element.parentNode;
        this.renderDispose(update);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false; // Child elements not supported: safe to return false.
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
