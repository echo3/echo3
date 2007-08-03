/**
 * Command exeecution peer: Browser Open Window
 */
EchoRemoteClient.CommandExec.BrowserOpenWindow = function() { };

EchoRemoteClient.CommandExec.BrowserOpenWindow.execute = function(client, commandData) {
    if (!commandData.uri) {
        throw new Error("URI not specified in BrowserOpenWindowCommand.");
    }
    window.open(commandData.uri);
};

EchoRemoteClient.CommandExecProcessor.registerPeer("nextapp.echo.webcontainer.command.BrowserOpenWindowCommand", 
        EchoRemoteClient.CommandExec.BrowserOpenWindow);
