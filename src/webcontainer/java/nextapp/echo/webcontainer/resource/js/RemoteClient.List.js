EchoRemoteClient.ListComponent = function() { };

EchoRemoteClient.ListComponent.updateListData = function(listdData) { 
    
};

EchoRemoteClient.ListComponent.ListBox = function() { };

EchoRemoteClient.ListComponent.ListBox.prototype.updateListData = EchoRemoteClient.ListComponent.updateListData;

EchoRemoteClient.ListComponent.SelectField = function() { };

EchoRemoteClient.ListComponent.SelectField.prototype.updateListData = EchoRemoteClient.ListComponent.updateListData;

EchoRemoteClient.ListComponent.ListDataTranslator = function() { };

EchoRemoteClient.ListComponent.ListDataTranslator.toProperty = function(client, propertyElement) {
    return null;
};

EchoSerial.addPropertyTranslator("RemoteListData", EchoRemoteClient.ListComponent.ListDataTranslator);

