/**
 * Creates a new RemoteListBox.
 * @param properties initial property values
 * @class Remote List Box implementation.
 */
EchoAppRender.RemoteListBox = function(properties) { 
    EchoApp.ListBox.call(this, properties);
    this.componentType = "RemoteListBox";
};

EchoAppRender.RemoteListBox.prototype = EchoCore.derive(EchoApp.ListBox);

EchoAppRender.RemoteListBox.prototype.updateListData = function(listData) {
    this.items = listData.items;
};

EchoAppRender.RemoteListBox.prototype.updateListSelection = function(selectionString) {
    this.setProperty("selection", selectionString ? selectionString.split(",") : null);
};

/**
 * Creates a new RemoteListBox synchronization peer instance.
 * @class Remote List Box synchronization peer implementation.
 */
EchoAppRender.RemoteListBoxSync = function() {
    EchoAppRender.ListBoxSync.call(this);
};

EchoAppRender.RemoteListBoxSync.prototype = EchoCore.derive(EchoAppRender.ListBoxSync);

EchoAppRender.RemoteListBoxSync.getPropertyType = function(propertyName) {
    return "RemoteListSelection";
};

/**
 * Creates a new RemoteSelectField.
 * @param properties initial property values
 * @class Remote Select Field implementation.
 */
EchoAppRender.RemoteSelectField = function(properties) {
    EchoApp.SelectField.call(this, properties);
    this.componentType = "RemoteSelectField";
};

EchoAppRender.RemoteSelectField.prototype = EchoCore.derive(EchoApp.SelectField);

EchoAppRender.RemoteSelectField.prototype.updateListData = function(listData) {
    this.items = listData.items;
};

EchoAppRender.RemoteSelectField.prototype.updateListSelection = function(selectionString) {
    this.setProperty("selection", selectionString ? selectionString.split(",") : null);
};

/**
 * Creates a new RemoteSelectField synchronization peer instance.
 * @class Remote Select Field synchronization peer implementation.
 */
EchoAppRender.RemoteSelectFieldSync = function() {
    EchoAppRender.SelectFieldSync.call(this);
};

EchoAppRender.RemoteSelectFieldSync.prototype = EchoCore.derive(EchoAppRender.SelectFieldSync);

EchoAppRender.RemoteSelectFieldSync.getPropertyType = function(propertyName) {
    return "RemoteListSelection";
};

EchoAppRender.RemoteListData = function(items) { 
    this.items = items;
};

EchoAppRender.RemoteListData.prototype.toString = function() {
    return this.items.toString();
};

EchoAppRender.RemoteListDataItem = function(text) { 
    this.text = text;
};

EchoAppRender.RemoteListDataItem.prototype.toString = function() {
    return this.text;
};

/**
 * Property Translator for List Data (rendered model elements).
 */
EchoAppRender.RemoteListDataTranslator = function() { };

EchoAppRender.RemoteListDataTranslator.toProperty = function(client, propertyElement) {
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
};

/**
 * Property Translator for List Selection State.
 */
EchoAppRender.RemoteListSelectionTranslator = function() { };

EchoAppRender.RemoteListSelectionTranslator.toProperty = function(client, propertyElement) {
    return propertyElement.getAttribute("v").split(",");
};

EchoAppRender.RemoteListSelectionTranslator.toXml = function(client, propertyElement, propertyValue) {
    propertyElement.setAttribute("v", propertyValue ? propertyValue.join(",") : ""); 
};

EchoSerial.addPropertyTranslator("RemoteListData", EchoAppRender.RemoteListDataTranslator);
EchoSerial.addPropertyTranslator("RemoteListSelection", EchoAppRender.RemoteListSelectionTranslator);

EchoApp.ComponentFactory.registerType("RemoteListBox", EchoAppRender.RemoteListBox);
EchoApp.ComponentFactory.registerType("RemoteSelectField", EchoAppRender.RemoteSelectField);

EchoRender.registerPeer("RemoteListBox", EchoAppRender.RemoteListBoxSync);
EchoRender.registerPeer("RemoteSelectField", EchoAppRender.RemoteSelectFieldSync);
