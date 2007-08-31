/**
 * Boot namespace.  DO NOT INSTANTIATE.
 * REQUIRES: Core, WebCore, Application, Render, Serial.
 */
EchoBoot = function() { };

EchoBoot.initMethods = new Array();

EchoBoot.addInitMethod = function(initMethod) {
    EchoBoot.initMethods.push(initMethod);
};

EchoBoot.boot = function(serverBaseUrl, debug) {
    EchoWebCore.init();
    
    if (window.EchoDebugConsole) {
        EchoDebugConsole.install();
    }

    var client = new EchoRemoteClient(serverBaseUrl);
    for (var i = 0; i < EchoBoot.initMethods.length; ++i) {
        EchoBoot.initMethods[i](client);
    }
    client.sync();
};
