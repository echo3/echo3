Echo.Sync._ListComponentMixins = {
    
    getSelectionString: function() {
        var selection = this.get("selection");
        if (selection != null) {
            if (selection instanceof Array) {
                return selection.join(",");
            } else {
                return selection.toString();
            }
        } else {
            return null;
        }
    },
    
    setSelectionString: function(selectionString) {
        var selection;
        if (selectionString == null) {
            selection = null;
        } else {
            selection = selectionString.split(",");
            if (selection.length == 0) {
                selection = null;
            } else if (selection.length == 1) {
                selection = selection == "" ? null : selection[0];
            }
        }
        this.set("selection", selection);
    },
    
    updateListData: function(listData) {
        this.set("items", listData.items);
    }
};

Echo.Sync._ListComponentSyncMixins = {

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
Echo.Sync.RemoteListBox = Core.extend(Echo.ListBox, {

    $load: function() {
        Echo.ComponentFactory.registerType("RemoteListBox", this);
        Echo.ComponentFactory.registerType("RLB", this);
    },

    componentType: "RemoteListBox",
    
    $include: [ Echo.Sync._ListComponentMixins ]
});

/**
 * @class Remote List Box synchronization peer implementation.
 */
Echo.Sync.RemoteListBoxSync = Core.extend(Echo.Sync.ListBox, {

    $load: function() {
        Echo.Render.registerPeer("RemoteListBox", this);
    },
    
    $include: [ Echo.Sync._ListComponentSyncMixins ]
});

/**
 * Creates a new RemoteSelectField.
 * @param properties initial property values
 * @class Remote Select Field implementation.
 */
Echo.Sync.RemoteSelectField = Core.extend(Echo.SelectField, {

    $load: function() {
        Echo.ComponentFactory.registerType("RemoteSelectField", this);
        Echo.ComponentFactory.registerType("RSF", this);
    },

    componentType: "RemoteSelectField",

    $include: [ Echo.Sync._ListComponentMixins ]
});

/**
 * Creates a new RemoteSelectField synchronization peer instance.
 * @class Remote Select Field synchronization peer implementation.
 */
Echo.Sync.RemoteSelectFieldSync = Core.extend(Echo.Sync.SelectField, {

    $load: function() {
        Echo.Render.registerPeer("RemoteSelectField", this);;
    },

    $include: [ Echo.Sync._ListComponentSyncMixins ]
});
    
Echo.Sync.RemoteListData = Core.extend({

    $construct: function(items) { 
        this.items = items;
    },
    
    toString: function() {
        return this.items.toString();
    }
});
    
/**
 * Property Translator for List Data (rendered model elements).
 */
Echo.Sync.RemoteListDataTranslator = { 
    
    toProperty: function(client, propertyElement) {
        var items = [];
        var eElement = propertyElement.firstChild;
        while (eElement) {
            var item = { text: eElement.getAttribute("t") };
            if (eElement.getAttribute("f")) {
                item.foreground = eElement.getAttribute("f");
            }
            if (eElement.getAttribute("b")) {
                item.background = eElement.getAttribute("b");
            }
            if (eElement.firstChild) {
                var childElement = eElement.firstChild;
                while (childElement) {
                    if (childElement.nodeName == "p" && childElement.getAttribute("t") == "Font") {
                        item.font = Echo.Serial.Font.toProperty(client, childElement);
                    }
                    childElement = childElement.nextSibling;
                }
            }
            
            items.push(item);
            eElement = eElement.nextSibling;
        }
        return new Echo.Sync.RemoteListData(items);
    }
};
    
Echo.Serial.addPropertyTranslator("RemoteListData", Echo.Sync.RemoteListDataTranslator);
