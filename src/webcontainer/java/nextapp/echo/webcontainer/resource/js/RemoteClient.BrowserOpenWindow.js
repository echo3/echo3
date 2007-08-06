/**
 * Command exeecution peer: Browser Open Window
 */
EchoRemoteClient.CommandExec.BrowserOpenWindow = function() { };

EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_REPLACE = 0x1;
EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_MENUBAR = 0x2;
EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_TOOLBAR = 0x4;
EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_LOCATION = 0x8;
EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_STATUS = 0x10;
EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_RESIZABLE = 0x20;

EchoRemoteClient.CommandExec.BrowserOpenWindow.execute = function(client, commandData) {
    if (!commandData.uri) {
        throw new Error("URI not specified in BrowserOpenWindowCommand.");
    }
    
    var features = new Array();
    if (commandData.width) {
        if (commandData.width.units == "%") {
            features.push("width=" + screen.width * commandData.width.value / 100);
        } else {
            features.push("width=" + EchoRender.Property.Extent.toPixels(commandData.width, true));
        }
    }
    if (commandData.height) {
        if (commandData.height.units == "%") {
            features.push("height=" + screen.height * commandData.height.value / 100);
        } else {
            features.push("height=" + EchoRender.Property.Extent.toPixels(commandData.height, false));
        }
    }
    var replace = commandData.flags & EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_REPLACE;
    features.push("menubar=" + (commandData.flags 
            & EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_MENUBAR ? "yes" : "no"));
    features.push("toolbar=" + (commandData.flags 
            & EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_TOOLBAR ? "yes" : "no"));
    features.push("location=" + (commandData.flags 
            & EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_LOCATION ? "yes" : "no"));
    features.push("status=" + (commandData.flags 
            & EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_STATUS ? "yes" : "no"));
    features.push("resizable=" + (commandData.flags 
            & EchoRemoteClient.CommandExec.BrowserOpenWindow.FLAG_RESIZABLE ? "yes" : "no"));
    
    window.open(commandData.uri, commandData.name, features.join(","), replace);
};

EchoRemoteClient.CommandExecProcessor.registerPeer("nextapp.echo.webcontainer.command.BrowserOpenWindowCommand", 
        EchoRemoteClient.CommandExec.BrowserOpenWindow);
