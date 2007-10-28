//FIXME.  This code is fairly temporary, once I'm comfortable with the way selection/model/rendering data properties are being set
// during serialization, it needs to be gutted to support IE6 (with a DIV/DHTML based listbox impl because of this browser's
// totally broken impl of rendering listbox-style select elements.

/**
 * Abstract base class for SELECT-element based list components.
 */
EchoAppRender.ListComponentSync = Core.extend(EchoRender.ComponentSync, {

    $abstract: true,

    _processChange: function(e) {
        if (!this.client.verifyInput(this.component)) {
            WebCore.DOM.preventEventDefault(e);
            return;
        }
        var selectElement = e.registeredTarget;
        var selection = [];
        if (this.component.getProperty("selectionMode") == EchoApp.ListBox.MULTIPLE_SELECTION) {
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
        
        //FIXME fire from component
        this.component.fireEvent(new Core.Event("action", this.component));
    },
    
    _renderMain: function(update, parentElement, size) {
        this._selectElement = document.createElement("select");
        this._selectElement.size = size;
        if (this.component.getProperty("selectionMode") == EchoApp.ListBox.MULTIPLE_SELECTION) {
            this._selectElement.multiple = "multiple";
        }
        
        EchoAppRender.Border.render(this.component.getRenderProperty("border"), this._selectElement);
        EchoAppRender.Color.renderFB(this.component, this._selectElement);
        EchoAppRender.Font.renderComponentProperty(this.component, "font", null, this._selectElement);
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
        
        // Set selection.
        var selection = this.component.getProperty("selection");
        if (selection) {
            for (var i = 0; i < selection.length; ++i) {
                if (selection[i] >= 0 && selection[i] < this._selectElement.options.length) {
                    this._selectElement.options[selection[i]].selected = "selected";
                }
            }
        }
        
        WebCore.EventProcessor.add(this._selectElement, "change", new Core.MethodRef(this, this._processChange), false);
        
        parentElement.appendChild(this._selectElement);
    },
    
    renderDispose: function(update) { 
        WebCore.EventProcessor.removeAll(this._selectElement);
        this._selectElement = null;
    },
    
    renderUpdate: function(update) {
        var element = this._selectElement;
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

    $staticConstruct: function() {
        EchoRender.registerPeer("ListBox", this);
    },
    
    $construct: function() {
    },

    renderAdd: function(update, parentElement) {
        this._renderMain(update, parentElement, 6);
    }
});


/**
 * Component rendering peer: SelectField
 */
EchoAppRender.SelectFieldSync = Core.extend(EchoAppRender.ListComponentSync, { 

    $staticConstruct: function() {
        EchoRender.registerPeer("SelectField", this);
    },
    
    $construct: function() {
    },
    
    renderAdd: function(update, parentElement) {
        this._renderMain(update, parentElement, 0);
    }
});
