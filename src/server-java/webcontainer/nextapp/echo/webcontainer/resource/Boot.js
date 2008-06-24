/**
 * @fileoverview
 * 
 * Requires Core, Core.Web, Application, Render, Serial, Client, RemoteClient.
 */

/**
 * Boot namespace.  Do not instantiate.
 */
Echo.Boot = { 

    /**
     * Array of methods which should be invoked at boot.
     */
    _initMethods: [],
    
    /**
     * Adds a method to be invoked at boot.
     */
    addInitMethod: function(initMethod) {
        Echo.Boot._initMethods.push(initMethod);
    },
    
    /**
     * Boots a remote client.
     * 
     * @param serverBaseUrl the servlet URL
     */
    boot: function(serverBaseUrl, debug) {
        Core.Web.init();
        
        if (window.Echo.DebugConsole) {
            Echo.DebugConsole.install();
        }
    
        var client = new Echo.RemoteClient(serverBaseUrl);
        for (var i = 0; i < Echo.Boot._initMethods.length; ++i) {
            Echo.Boot._initMethods[i](client);
        }
        client.sync();
    }
};
