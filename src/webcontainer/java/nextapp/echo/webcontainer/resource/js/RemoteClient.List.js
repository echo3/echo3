EchoRemoteClient.ListComponent = function() { };

EchoRemoteClient.ListComponent.updateListData = function(listData) {
    this.items = listData.items;
};

EchoRemoteClient.ListComponent.ListBox = function(renderId) { 
    EchoApp.Component.call(this, "RemoteListBox", renderId);
};

EchoRemoteClient.ListComponent.ListBox.prototype = new EchoApp.ListBox;

EchoRemoteClient.ListComponent.ListBox.prototype.updateListData = EchoRemoteClient.ListComponent.updateListData;

EchoRemoteClient.ListComponent.SelectField = function(renderId) {
    EchoApp.Component.call(this, "RemoteSelectField", renderId);
};

EchoRemoteClient.ListComponent.SelectField.prototype = new EchoApp.SelectField;

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
        items.push(new EchoRemoteClient.ListComponent.ListDataItem(text));
        eElement = eElement.nextSibling;
    }
    return new EchoRemoteClient.ListComponent.ListData(items);
};

EchoSerial.addPropertyTranslator("RemoteListData", EchoRemoteClient.ListComponent.ListDataTranslator);

EchoApp.ComponentFactory.registerType("RemoteListBox", EchoRemoteClient.ListComponent.ListBox);
EchoApp.ComponentFactory.registerType("RemoteSelectField", EchoRemoteClient.ListComponent.SelectField);

EchoRender.registerPeer("RemoteListBox", EchoRender.ComponentSync.ListBox);
EchoRender.registerPeer("RemoteSelectField", EchoRender.ComponentSync.SelectField);
