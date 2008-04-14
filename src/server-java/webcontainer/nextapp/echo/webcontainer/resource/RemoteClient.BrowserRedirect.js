/**
 * Command exeecution peer: Browser Redirect
 */
Echo.RemoteClient.CommandExec.BrowserRedirect = {

    execute: function(client, commandData) {
        if (!commandData.uri) {
            throw new Error("URI not specified in BrowserOpenWindowCommand.");
        }
        window.location.href = commandData.uri;
    }    
};

Echo.RemoteClient.CommandExecProcessor.registerPeer("nextapp.echo.webcontainer.command.BrowserRedirectCommand", 
        Echo.RemoteClient.CommandExec.BrowserRedirect);
