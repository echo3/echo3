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
EchoAppRender.RemoteListBox = EchoCore.extend(EchoApp.ListBox, {

    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("RemoteListBox", this);
    },

    componentType: "RemoteListBox",
    
    include: [ EchoAppRender._ListComponentMixins ],

    /**
     * Creates a new RemoteListBox.
     * @param properties initial property values
     */
    initialize: function(properties) { 
        EchoApp.ListBox.prototype.initialize.call(this, properties);
    }
});

/**
 * @class Remote List Box synchronization peer implementation.
 */
EchoAppRender.RemoteListBoxSync = EchoCore.extend(EchoAppRender.ListBoxSync, {

    globalInitialize: function() {
        EchoRender.registerPeer("RemoteListBox", this);
    },
    
    include: [ EchoAppRender._ListComponentSyncMixins ],

    /**
     * Creates a new RemoteListBox synchronization peer instance.
     */
    initialize: function() {
        EchoAppRender.ListBoxSync.prototype.initialize.call(this);
    }
});

/**
 * Creates a new RemoteSelectField.
 * @param properties initial property values
 * @class Remote Select Field implementation.
 */
EchoAppRender.RemoteSelectField = EchoCore.extend(EchoApp.SelectField, {

    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("RemoteSelectField", this);
    },

    componentType: "RemoteSelectField",

    include: [ EchoAppRender._ListComponentMixins ],

    initialize: function(properties) {
        EchoApp.SelectField.prototype.initialize.call(this, properties);
        this.componentType = "RemoteSelectField";
    }
});

/**
 * Creates a new RemoteSelectField synchronization peer instance.
 * @class Remote Select Field synchronization peer implementation.
 */
EchoAppRender.RemoteSelectFieldSync = EchoCore.extend(EchoAppRender.SelectFieldSync, {

    globalInitialize: function() {
        EchoRender.registerPeer("RemoteSelectField", this);;
    },

    include: [ EchoAppRender._ListComponentSyncMixins ],

    initialize: function() {
        EchoAppRender.SelectFieldSync.prototype.initialize.call(this);
    }
});
    
EchoAppRender.RemoteListData = EchoCore.extend({

    initialize: function(items) { 
        this.items = items;
    },
    
    $toString: function() {
        return this.items.toString();
    }
});

    
EchoAppRender.RemoteListDataItem = EchoCore.extend({

    initialize: function(text) { 
        this.text = text;
    },
    
    $toString: function() {
        return this.text;
    }
});
    
/**
 * Property Translator for List Data (rendered model elements).
 */
EchoAppRender.RemoteListDataTranslator = { 
    
    toProperty: function(client, propertyElement) {
        var items = new Array();
        var eElement = propertyElement.firstChild;
        while (eElement.nextSibling) {
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
    
