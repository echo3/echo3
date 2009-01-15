/**
 * Command execution peer: Browser Redirect
 */
Echo.RemoteClient.CommandExec.BrowserRedirect = Core.extend(Echo.RemoteClient.CommandExec, {
    
    $static: {

        /** @see Echo.RemoteClient.CommandExecProcessor#execute */
        execute: function(client, commandData) {
            if (!commandData.uri) {
                throw new Error("URI not specified in BrowserOpenWindowCommand.");
            }
            window.location.href = commandData.uri;
        }
    },
    
    $load: function() {
        Echo.RemoteClient.CommandExecProcessor.registerPeer("nextapp.echo.webcontainer.command.BrowserRedirectCommand", this);
    }
});

