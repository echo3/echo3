//FIXME.  This code is fairly temporary, once I'm comfortable with the way selection/model/rendering data properties are being set
// during serialization, it needs to be gutted to support IE6 (with a DIV/DHTML based listbox impl because of this browser's
// totally broken impl of rendering listbox-style select elements.

/**
 * Abstract base class for SELECT-element based list components.
 */
EchoRender.ComponentSync.SelectListComponent = function() { };

EchoRender.ComponentSync.SelectListComponent.prototype = EchoCore.derive(EchoRender.ComponentSync);

EchoRender.ComponentSync.SelectListComponent.prototype._processChange = function(e) {
    if (!this.component.isActive()) {
        EchoWebCore.DOM.preventEventDefault(e);
        return;
    }
    var selectElement = e.registeredTarget;
    var selection = new Array();
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
    this.component.setProperty("selection", selection.join(","));
    this.component.fireEvent(new EchoCore.Event(this.component, "action"));
};

EchoRender.ComponentSync.SelectListComponent.prototype._renderMain = function(update, parentElement, size) {
    this._selectElement = document.createElement("select");
    this._selectElement.size = size;
    if (this.component.getProperty("selectionMode") == EchoApp.ListBox.MULTIPLE_SELECTION) {
        this._selectElement.multiple = "multiple";
    }
    
    EchoRender.Property.Border.render(this.component.getRenderProperty("border"), this._selectElement);
    EchoRender.Property.Color.renderFB(this.component, this._selectElement);
    EchoRender.Property.Font.renderComponentProperty(this.component, "font", null, this._selectElement);
    EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, this._selectElement, "padding");

    if (this.component.items) {
        for (var i = 0; i < this.component.items.length; ++i) {
            var optionElement = document.createElement("option");
            optionElement.appendChild(document.createTextNode(this.component.items[i].toString()));
            if (this.component.items[i].foreground) {
                EchoRender.Property.Color.render(this.component.items[i].foreground, optionElement, "color");
            }
            if (this.component.items[i].background) {
                EchoRender.Property.Color.render(this.component.items[i].background, optionElement, "backgroundColor");
            }
            if (this.component.items[i].font) {
                EchoRender.Property.Font.render(this.component.items[i].font, optionElement);
            }
            this._selectElement.appendChild(optionElement);
        }
    }
    
    // Set selection.
    var selectionString = this.component.getProperty("selection");
    if (selectionString) {
        var selectionArray = selectionString.split(",");
        for (var i = 0; i < selectionArray.length; ++i) {
            var index = selectionArray[i];
            if (index >= 0 && index < this._selectElement.childNodes.length) {
                this._selectElement.childNodes[index].selected = "selected";
            }
        }
    }
    
    EchoWebCore.EventProcessor.add(this._selectElement, "change", new EchoCore.MethodRef(this, this._processChange), false);
    
    parentElement.appendChild(this._selectElement);
};

EchoRender.ComponentSync.SelectListComponent.prototype.renderDispose = function(update) { 
    EchoWebCore.EventProcessor.removeAll(this._selectElement);
    this._selectElement = null;
};

EchoRender.ComponentSync.SelectListComponent.prototype.renderUpdate = function(update) {
    var element = this._selectElement;
    var containerElement = element.parentNode;
    this.renderDispose(update);
    containerElement.removeChild(element);
    this.renderAdd(update, containerElement);
    return false; // Child elements not supported: safe to return false.
};

/**
 * Component rendering peer: ListBox
 */
EchoRender.ComponentSync.ListBox = function() { };

EchoRender.ComponentSync.ListBox.prototype = EchoCore.derive(EchoRender.ComponentSync.SelectListComponent);

EchoRender.ComponentSync.ListBox.prototype.renderAdd = function(update, parentElement) {
    this._renderMain(update, parentElement, 6);
};

/**
 * Component rendering peer: SelectField
 */
EchoRender.ComponentSync.SelectField = function() { };

EchoRender.ComponentSync.SelectField.prototype = EchoCore.derive(EchoRender.ComponentSync.SelectListComponent);

EchoRender.ComponentSync.SelectField.prototype.renderAdd = function(update, parentElement) {
    this._renderMain(update, parentElement, 0);
};

EchoRender.registerPeer("ListBox", EchoRender.ComponentSync.ListBox);
EchoRender.registerPeer("SelectField", EchoRender.ComponentSync.SelectField);
