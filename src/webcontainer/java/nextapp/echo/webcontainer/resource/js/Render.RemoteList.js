EchoAppRender._ListComponentMixins = {
    
    getSelectionString: function() {
        var selection = this.getProperty("selection");
        if (selection) {
            return selection.join(",");
        } else {
            return null;
        }
    },
    
    setSelectionString: function(selectionString) {
        this.setProperty("selection", selectionString ? selectionString.split(",") : null);
    },
    
    updateListData: function(listData) {
        this.items = listData.items;
    }
};

EchoAppRender._ListComponentSyncMixins = {

    storeProperty: function(clientMessage, propertyName) {
        if (propertyName == "selection") {
            clientMessage.storeProperty(this.component.renderId, propertyName, this.component.getSelectionString());
            return true;
        } else {
            return false;
        }
    }
};

/**
 * @class Remote List Box implementation.
 */
EchoAppRender.RemoteListBox = Core.extend(EchoApp.ListBox, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("RemoteListBox", this);
        EchoApp.ComponentFactory.registerType("RLB", this);
    },

    componentType: "RemoteListBox",
    
    $include: [ EchoAppRender._ListComponentMixins ]
});

/**
 * @class Remote List Box synchronization peer implementation.
 */
EchoAppRender.RemoteListBoxSync = Core.extend(EchoAppRender.ListBoxSync, {

    $load: function() {
        EchoRender.registerPeer("RemoteListBox", this);
    },
    
    $include: [ EchoAppRender._ListComponentSyncMixins ]
});

/**
 * Creates a new RemoteSelectField.
 * @param properties initial property values
 * @class Remote Select Field implementation.
 */
EchoAppRender.RemoteSelectField = Core.extend(EchoApp.SelectField, {

    $load: function() {
        EchoApp.ComponentFactory.registerType("RemoteSelectField", this);
        EchoApp.ComponentFactory.registerType("RSF", this);
    },

    componentType: "RemoteSelectField",

    $include: [ EchoAppRender._ListComponentMixins ]
});

/**
 * Creates a new RemoteSelectField synchronization peer instance.
 * @class Remote Select Field synchronization peer implementation.
 */
EchoAppRender.RemoteSelectFieldSync = Core.extend(EchoAppRender.SelectFieldSync, {

    $load: function() {
        EchoRender.registerPeer("RemoteSelectField", this);;
    },

    $include: [ EchoAppRender._ListComponentSyncMixins ]
});
    
EchoAppRender.RemoteListData = Core.extend({

    $construct: function(items) { 
        this.items = items;
    },
    
    toString: function() {
        return this.items.toString();
    }
});

    
EchoAppRender.RemoteListDataItem = Core.extend({

    $construct: function(text) {
        this.text = text;
    },
    
    toString: function() {
        return this.text;
    }
});
    
/**
 * Property Translator for List Data (rendered model elements).
 */
EchoAppRender.RemoteListDataTranslator = { 
    
    toProperty: function(client, propertyElement) {
        var items = [];
        var eElement = propertyElement.firstChild;
        while (eElement) {
            var text = eElement.getAttribute("t");
            var item = new EchoAppRender.RemoteListDataItem(text);
            if (eElement.getAttribute("f")) {
                item.foreground = new EchoApp.Color(eElement.getAttribute("f"));
            }
            if (eElement.getAttribute("b")) {
                item.background = new EchoApp.Color(eElement.getAttribute("b"));
            }
            if (eElement.firstChild) {
                var childElement = eElement.firstChild;
                while (childElement) {
                    if (childElement.nodeName == "p" && childElement.getAttribute("t") == "Font") {
                        item.font = EchoSerial.PropertyTranslator.Font.toProperty(client, childElement);
                    }
                    childElement = childElement.nextSibling;
                }
            }
            
            items.push(item);
            eElement = eElement.nextSibling;
        }
        return new EchoAppRender.RemoteListData(items);
    }
};
    
EchoSerial.addPropertyTranslator("RemoteListData", EchoAppRender.RemoteListDataTranslator);
