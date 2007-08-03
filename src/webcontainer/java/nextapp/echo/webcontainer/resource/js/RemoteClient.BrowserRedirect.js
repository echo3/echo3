/**
 * Command exeecution peer: Browser Redirect
 */

EchoRemoteClient.CommandExec.BrowserRedirect = function() { };

EchoRemoteClient.CommandExec.BrowserRedirect.execute = function(client, commandData) {
    if (!commandData.uri) {
        throw new Error("URI not specified in BrowserOpenWindowCommand.");
    }
    window.location.href = commandData.uri;
}    

EchoRemoteClient.CommandExecProcessor.registerPeer("nextapp.echo.webcontainer.command.BrowserRedirectCommand", 
        EchoRemoteClient.CommandExec.BrowserRedirect);
