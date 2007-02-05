/**
 * Boot namespace.  DO NOT INSTANTIATE.
 * REQUIRES: Core, WebCore, Application, Render, Serial.
 */
EchoBoot = function() { };

EchoBoot.boot = function(serverBaseUrl, debug) {
    EchoWebCore.init();
    var client = new EchoRemoteClient(serverBaseUrl, "c_root");
    client.sync();
};