/**
 * Abstract base class for SELECT-element based list components.
 */
EchoAppRender.ListComponentSync = Core.extend(EchoRender.ComponentSync, {

    $abstract: true,

    _hasRenderedSelectedItems: false,
    
    _multipleSelect: false,

    _processChange: function(e) {
        if (!this.client.verifyInput(this.component)) {
            WebCore.DOM.preventEventDefault(e);
            this._renderSelection();
            return;
        }
        var selectElement = e.registeredTarget;
        var selection = [];
        if (this._multipleSelect) {
            for (var i = 0; i < selectElement.options.length; ++i) {
                if (selectElement.options[i].selected) {
                    selection.push(i);
                }
            }
        } else {
            if (selectElement.selectedIndex != -1) {
                selection.push(selectElement.selectedIndex);
            }
        }
    
        this.component.setProperty("selection", selection);
        this.component.doAction();
    },
    
    _renderMain: function(update, parentElement, size) {
        this._multipleSelect = this.component.getProperty("selectionMode") == EchoApp.ListBox.MULTIPLE_SELECTION;
    
        this._enabled = this.component.isRenderEnabled();
        this._selectElement = document.createElement("select");
        this._selectElement.id = this.component.renderId;
        this._selectElement.size = size;
        if (this._multipleSelect) {
            this._selectElement.multiple = "multiple";
        }
        if (!this._enabled) {
        	this._selectElement.disabled = true;
        }
        
        EchoAppRender.Border.render(
                EchoAppRender.getEffectProperty(this.component, "border", "disabledBorder", !this._enabled), 
                this._selectElement);
        EchoAppRender.Color.render(
                EchoAppRender.getEffectProperty(this.component, "foreground", "disabledForeground", !this._enabled), 
                this._selectElement, "color");
        EchoAppRender.Color.render(
                EchoAppRender.getEffectProperty(this.component, "background", "disabledBackground", !this._enabled), 
                this._selectElement, "backgroundColor");
        EchoAppRender.Font.render(
                EchoAppRender.getEffectProperty(this.component, "font", "disabledFont", !this._enabled), 
                this._selectElement);
        EchoAppRender.Insets.renderComponentProperty(this.component, "insets", null, this._selectElement, "padding");
    
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
                this._selectElement.appendChild(optionElement);
            }
        }
        
        if (this._enabled) {
	        WebCore.EventProcessor.add(this._selectElement, "change", Core.method(this, this._processChange), false);
        }
        
        if (size != 0 && WebCore.Environment.QUIRK_IE_SELECT_LIST_DOM_UPDATE) {
            // Render select element inside of a table to stop crazy IE6 behavior where listboxes turn into
            // select fields when removed and then re-added to the DOM.
            // As ridiculous as this might seem, it does appear necessary.  It is unknown why a table is required,
            // but a div does not cure the problem. 
            this._tableElement = document.createElement("table");
            var tbodyElement = document.createElement("tbody");
            this._tableElement.appendChild(tbodyElement);
            var trElement = document.createElement("tr");
            tbodyElement.appendChild(trElement);
            var tdElement = document.createElement("td");
            trElement.appendChild(tdElement);
            tdElement.appendChild(this._selectElement);

            parentElement.appendChild(this._tableElement);
        } else {
            parentElement.appendChild(this._selectElement);
        }
    },
    
    renderDisplay: function() {
        this._renderSelection();
    },
    
    renderDispose: function(update) { 
        WebCore.EventProcessor.removeAll(this._selectElement);
        this._selectElement = null;
        this._tableElement = null;
    },
    
    _renderSelection: function() {
        // Set selection.
        var selection = this.component.getProperty("selection");
        if (selection) {
            if (this._hasRenderedSelectedItems) {
                for (var i = 0; i < this._selectElement.options.length; ++i) {
                    this._selectElement.options[i].selected = false;
                }
            }
            for (var i = 0; i < selection.length; ++i) {
                if (selection[i] >= 0 && selection[i] < this._selectElement.options.length) {
                    this._selectElement.options[selection[i]].selected = true;
                }
            }
        } else {
            if (this._multipleSelect) {
                this._selectElement.selectedIndex = -1;
            } else {
                this._selectElement.selectedIndex = 0;
            }
        }
        this._hasRenderedSelectedItems = true;
    },
    
    renderUpdate: function(update) {
        var element = this._tableElement ? this._tableElement : this._selectElement;
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
