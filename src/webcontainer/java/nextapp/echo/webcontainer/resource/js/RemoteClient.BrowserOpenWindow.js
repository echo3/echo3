/**
 * Command exeecution peer: Browser Open Window
 */
EchoRemoteClient.CommandExec.BrowserOpenWindow = function() { };

EchoRemoteClient.CommandExec.BrowserOpenWindow.execute = function(client, commandData) {
    alert("BOW!");
};

EchoRemoteClient.CommandExecProcessor.registerPeer("nextapp.echo.webcontainer.command.BrowserOpenWindowCommand", 
        EchoRemoteClient.CommandExec.BrowserOpenWindow);
