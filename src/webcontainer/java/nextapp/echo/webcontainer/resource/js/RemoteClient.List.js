EchoRemoteClient.ListComponent = function() { };

EchoRemoteClient.ListComponent.updateListData = function(listdData) { 
    alert("property set!");
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

EchoRemoteClient.ListComponent.ListDataTranslator = function() { };

EchoRemoteClient.ListComponent.ListDataTranslator.toProperty = function(client, propertyElement) {
    return null;
};

EchoSerial.addPropertyTranslator("RemoteListData", EchoRemoteClient.ListComponent.ListDataTranslator);

EchoApp.ComponentFactory.registerType("ListBox", EchoRemoteClient.ListComponent.ListBox);
EchoApp.ComponentFactory.registerType("SelectField", EchoRemoteClient.ListComponent.SelectField);
