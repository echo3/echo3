EchoRemoteClient.ListComponent = function() { };

EchoRemoteClient.ListComponent.ListDataTranslator = function() { };

EchoRemoteClient.ListComponent.ListDataTranslator.toProperty = function(client, propertyElement) {
    return null;
};

EchoSerial.addPropertyTranslator("RemoteListData", EchoRemoteClient.ListComponent.ListDataTranslator);
