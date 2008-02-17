/**
 * Command exeecution peer: Browser Open Window
 */
EchoRemoteClient.CommandExec.BrowserOpenWindow = { 

    FLAG_REPLACE: 0x1,
    FLAG_MENUBAR: 0x2,
    FLAG_TOOLBAR: 0x4,
    FLAG_LOCATION: 0x8,
    FLAG_STATUS: 0x10,
    FLAG_RESIZABLE: 0x20,
    
    execute: function(client, commandData) {
        if (!commandData.uri) {
            throw new Error("URI not specified in BrowserOpenWindowCommand.");
        }
        
        var features = [];
        if (commandData.width) {
            if (EchoAppRender.Extent.isPercent(commandData.width)) {
                features.push("width=" + screen.width * parseInt(commandData.width) / 100);
            } else {
                features.push("width=" + EchoAppRender.Extent.toPixels(commandData.width, true));
            }
        }
        if (commandData.height) {
            if (EchoAppRender.Extent.isPercent(commandData.height)) {
                features.push("height=" + screen.height * parseInt(commandData.height) / 100);
            } else {
                features.push("height=" + EchoAppRender.Extent.toPixels(commandData.height, false));
            }
        }
        var replace = commandData.flags & this.FLAG_REPLACE;
        features.push("menubar=" + (commandData.flags & this.FLAG_MENUBAR ? "yes" : "no"));
        features.push("toolbar=" + (commandData.flags & this.FLAG_TOOLBAR ? "yes" : "no"));
        features.push("location=" + (commandData.flags & this.FLAG_LOCATION ? "yes" : "no"));
        features.push("status=" + (commandData.flags & this.FLAG_STATUS ? "yes" : "no"));
        features.push("resizable=" + (commandData.flags & this.FLAG_RESIZABLE ? "yes" : "no"));
        
        window.open(commandData.uri, commandData.name, features.join(","), replace);
    }
};

EchoRemoteClient.CommandExecProcessor.registerPeer("nextapp.echo.webcontainer.command.BrowserOpenWindowCommand", 
        EchoRemoteClient.CommandExec.BrowserOpenWindow);
