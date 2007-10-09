EchoAppRender.RemoteListComponentSync = function() { };

EchoAppRender.RemoteListComponentSync.updateListData = function(listData) {
    this.items = listData.items;
};

EchoAppRender.RemoteListComponentSync.ListBox = function(properties) { 
    EchoApp.ListBox.call(this, properties);
    this.componentType = "RemoteListBox";
};

EchoAppRender.RemoteListComponentSync.ListBox.prototype = EchoCore.derive(EchoApp.ListBox);

EchoAppRender.RemoteListComponentSync.ListBox.prototype.updateListData = EchoAppRender.RemoteListComponentSync.updateListData;

EchoAppRender.RemoteListComponentSync.SelectField = function(properties) {
    EchoApp.SelectField.call(this, properties);
    this.componentType = "RemoteSelectField";
};

EchoAppRender.RemoteListComponentSync.SelectField.prototype = EchoCore.derive(EchoApp.SelectField);

EchoAppRender.RemoteListComponentSync.SelectField.prototype.updateListData = EchoAppRender.RemoteListComponentSync.updateListData;

EchoAppRender.RemoteListComponentSync.ListData = function(items) { 
    this.items = items;
};

EchoAppRender.RemoteListComponentSync.ListData.prototype.toString = function() {
    return this.items.toString();
};

EchoAppRender.RemoteListComponentSync.ListDataItem = function(text) { 
    this.text = text;
};

EchoAppRender.RemoteListComponentSync.ListDataItem.prototype.toString = function() {
    return this.text;
};

EchoAppRender.RemoteListComponentSync.ListDataTranslator = function() { };

EchoAppRender.RemoteListComponentSync.ListDataTranslator.toProperty = function(client, propertyElement) {
    var items = new Array();
    var eElement = propertyElement.firstChild;
    while (eElement.nextSibling) {
        var text = eElement.getAttribute("t");
        var item = new EchoAppRender.RemoteListComponentSync.ListDataItem(text);
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
    return new EchoAppRender.RemoteListComponentSync.ListData(items);
};

EchoSerial.addPropertyTranslator("RemoteListData", EchoAppRender.RemoteListComponentSync.ListDataTranslator);

EchoApp.ComponentFactory.registerType("RemoteListBox", EchoAppRender.RemoteListComponentSync.ListBox);
EchoApp.ComponentFactory.registerType("RemoteSelectField", EchoAppRender.RemoteListComponentSync.SelectField);

EchoRender.registerPeer("RemoteListBox", EchoAppRender.ListBoxSync);
EchoRender.registerPeer("RemoteSelectField", EchoAppRender.SelectFieldSync);
