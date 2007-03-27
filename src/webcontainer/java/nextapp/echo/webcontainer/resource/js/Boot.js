/**
 * Boot namespace.  DO NOT INSTANTIATE.
 * REQUIRES: Core, WebCore, Application, Render, Serial.
 */
EchoBoot = function() { };

EchoBoot.boot = function(serverBaseUrl, debug) {
    EchoWebCore.init();
    
    if (window.EchoDebugConsole) {
        EchoDebugConsole.install();
    }
    
    var client = new EchoRemoteClient(serverBaseUrl, "c_root");
    client.sync();
};