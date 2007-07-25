/**
 * Boot namespace.  DO NOT INSTANTIATE.
 * REQUIRES: Core, WebCore, Application, Render, Serial.
 */
EchoBoot = function() { };

EchoBoot.boot = function(serverBaseUrl, rootElementId, debug) {
    EchoWebCore.init();
    
    if (window.EchoDebugConsole) {
        EchoDebugConsole.install();
    }
    
    var client = new EchoRemoteClient(serverBaseUrl, rootElementId);
    client.sync();
};