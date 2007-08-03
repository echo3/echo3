/**
 * Command exeecution peer: Browser Open Window
 */
EchoRemoteClient.CommandExec.BrowserOpenWindow = function() { };

EchoRemoteClient.CommandExec.BrowserOpenWindow.execute = function(client, commandData) {
    if (!commandData.uri) {
        throw new Error("URI not specified in BrowserOpenWindowCommand.");
    }
    
    var features = new Array();
    if (commandData.width) {
        features.push("width=" + EchoRender.Property.Extent.toPixels(commandData.width, true));
    }
    if (commandData.height) {
        features.push("height=" + EchoRender.Property.Extent.toPixels(commandData.height, false));
    }
    
    window.open(commandData.uri, commandData.name, features.length == 0 ? null : features.join(","));
};

EchoRemoteClient.CommandExecProcessor.registerPeer("nextapp.echo.webcontainer.command.BrowserOpenWindowCommand", 
        EchoRemoteClient.CommandExec.BrowserOpenWindow);
