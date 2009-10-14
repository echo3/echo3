/**
 * Mixin methods for remote client-based <code>Echo.AbstractListComponent</code> derivatives.
 */
Echo.Sync._ListComponentMixins = {
    
    /**
     * Retrieves the selection state of the list component and converts it into a comma-delimited string
     * containing the selected indices.
     * 
     * @return the selection state as a comma-delimited string of indices
     * @type String
     */
    getSelectionString: function() {
        var selection = this.get("selection");
        if (selection == null) {
            return null;
        } else {
            if (selection instanceof Array) {
                return selection.join(",");
            } else {
                return selection.toString();
            }
        }
    },
    
    /**
     * Sets the selection of the list component given a comma-delimited string of indices.
     * Invoked by server-side synchronization peer directly.
     * 
     * @param {String} selectionString the selection new state as a comma-delimited string of indices
     */
    setSelectionString: function(selectionString) {
        var selection;
        if (selectionString == null) {
            selection = null;
        } else {
            selection = selectionString.split(",");
            if (selection.length === 0) {
                selection = null;
            } else if (selection.length == 1) {
                selection = selection[0] === "" ? null : selection[0];
            }
        }
        this.set("selection", selection);
    },
    
    /**
     * Sets the <code>items</code> property of the list component to the <code>items</code>s property of the given
     * <code>listData</code> object.  Invoked by server-side synchronization peer directly.
     * 
     * @param listData the new list data
     */
    updateListData: function(listData) {
        this.set("items", listData.items);
    }
};

/**
 * Mixin methods for remote client-based <code>Echo.Sync.ListComponent</code> derivatives.
 */
Echo.Sync._ListComponentSyncMixins = {

    /**
     * Custom serialization implementation for "selection" property.
     * @see Echo.RemoteClient
     */
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
 * RemoteListBox component.
 */
Echo.Sync.RemoteListBox = Core.extend(Echo.ListBox, {

    $load: function() {
        Echo.ComponentFactory.registerType("RLB", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "RLB",
    
    $include: [ Echo.Sync._ListComponentMixins ]
});

/**
 * @class Remote List Box synchronization peer implementation.
 */
Echo.Sync.RemoteListBoxSync = Core.extend(Echo.Sync.ListBox, {

    $load: function() {
        Echo.Render.registerPeer("RLB", this);
    },
    
    $include: [ Echo.Sync._ListComponentSyncMixins ]
});

/**
 * RemoteSelectField component.
 */
Echo.Sync.RemoteSelectField = Core.extend(Echo.SelectField, {

    $load: function() {
        Echo.ComponentFactory.registerType("RSF", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "RSF",

    $include: [ Echo.Sync._ListComponentMixins ]
});

/**
 * Creates a new RemoteSelectField synchronization peer instance.
 * @class Remote Select Field synchronization peer implementation.
 */
Echo.Sync.RemoteSelectFieldSync = Core.extend(Echo.Sync.SelectField, {

    $load: function() {
        Echo.Render.registerPeer("RSF", this);
    },

    $include: [ Echo.Sync._ListComponentSyncMixins ]
});
    
Echo.Sync.RemoteListData = Core.extend({

    /**
     * The rendered items
     * @type Array
     */
    items: null,
    
    /** 
     * Creates a new <code>RemoteListData</code>.
     * 
     * @param items the initial rendered items
     */
    $construct: function(items) { 
        this.items = items;
    },
    
    /** @see Object#toString */
    toString: function() {
        return this.items.toString();
    }
});
    
/**
 * List data property translator singleton.
 */
Echo.Sync.RemoteListDataTranslator = Core.extend(Echo.Serial.PropertyTranslator, {
        
    $static: {
    
        /** @see Echo.Serial.PropertyTranslator#toProperty */
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
                        if (childElement.nodeName == "p" && 
                                (childElement.getAttribute("t") == "F" || childElement.getAttribute("t") == "Font")) {
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
    },
    
    $load: function() {
        Echo.Serial.addPropertyTranslator("RemoteListData", this);
    }
});
