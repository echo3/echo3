EchoRemoteClient.ListComponent = function() { };

EchoRemoteClient.ListComponent.updateListData = function(listData) {
    this.items = listData.items;
};

EchoRemoteClient.ListComponent.ListBox = function(renderId) { 
    EchoApp.ListBox.call(this, renderId);
    this.componentType = "ListBox";
};

EchoRemoteClient.ListComponent.ListBox.prototype = EchoCore.derive(EchoApp.ListBox);

EchoRemoteClient.ListComponent.ListBox.prototype.updateListData = EchoRemoteClient.ListComponent.updateListData;

EchoRemoteClient.ListComponent.SelectField = function(renderId) {
    EchoApp.SelectField.call(this, renderId);
    this.componentType = "RemoteSelectField";
};

EchoRemoteClient.ListComponent.SelectField.prototype = EchoCore.derive(EchoApp.SelectField);

EchoRemoteClient.ListComponent.SelectField.prototype.updateListData = EchoRemoteClient.ListComponent.updateListData;

EchoRemoteClient.ListComponent.ListData = function(items) { 
    this.items = items;
};

EchoRemoteClient.ListComponent.ListData.prototype.toString = function() {
    return this.items.toString();
};

EchoRemoteClient.ListComponent.ListDataItem = function(text) { 
    this.text = text;
};

EchoRemoteClient.ListComponent.ListDataItem.prototype.toString = function() {
    return this.text;
};

EchoRemoteClient.ListComponent.ListDataTranslator = function() { };

EchoRemoteClient.ListComponent.ListDataTranslator.toProperty = function(client, propertyElement) {
    var items = new Array();
    var eElement = propertyElement.firstChild;
    while (eElement.nextSibling) {
        var text = eElement.getAttribute("t");
        var item = new EchoRemoteClient.ListComponent.ListDataItem(text);
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
    return new EchoRemoteClient.ListComponent.ListData(items);
};

EchoSerial.addPropertyTranslator("RemoteListData", EchoRemoteClient.ListComponent.ListDataTranslator);

EchoApp.ComponentFactory.registerType("RemoteListBox", EchoRemoteClient.ListComponent.ListBox);
EchoApp.ComponentFactory.registerType("RemoteSelectField", EchoRemoteClient.ListComponent.SelectField);

EchoRender.registerPeer("RemoteListBox", EchoRender.ComponentSync.ListBox);
EchoRender.registerPeer("RemoteSelectField", EchoRender.ComponentSync.SelectField);
