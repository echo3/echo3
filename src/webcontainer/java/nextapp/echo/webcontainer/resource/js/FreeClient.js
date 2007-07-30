/**
 * Freestanding Client Implementation.
 * REQUIRES: Core, WebCore, Application, Render, Serial.
 * 
 * This API allows the development of server-independent applications.
 */
EchoFreeClient = function(application) {
    EchoClient.call(this);
    
    this._application = application;
    this._autoUpdate = new EchoFreeClient.AutoUpdate(this._application.updateManager);
};

EchoFreeClient.prototype = EchoCore.derive(EchoClient);

EchoFreeClient.prototype.dispose = function() {
    this._application.updateManager.removeUpdateListener(new EchoCore.MethodRef(this, this._processUpdate));
};

EchoFreeClient.prototype._processUpdate = function(e) {
};

EchoFreeClient.prototype.init = function() {
    EchoWebCore.init();
    this._application.updateManager.addUpdateListener(new EchoCore.MethodRef(this, this._processUpdate));
    EchoCore.Scheduler.add(this._autoUpdate);
};

EchoFreeClient.prototype.loadStyleSheet = function(url) {
    var conn = new EchoWebCore.HttpConnection(url, "GET");
    conn.addResponseListener(new EchoCore.MethodRef(this, this._processStyleSheet));
    conn.connect();
};

EchoFreeClient.prototype._processStyleSheet = function(e) {
    if (!e.valid) {
        throw new Error("Received invalid response from StyleSheet HTTP request.");
    }
    
    var ssElement =  e.source.getResponseXml().documentElement;
    var styleSheet = EchoSerial.loadStyleSheet(this, ssElement);
    this._application.setStyleSheet(styleSheet);
};

EchoFreeClient.AutoUpdate = function(updateManager) {
    EchoCore.Scheduler.Runnable.call(this, 10, true);
    this._updateManager = updateManager;
};

EchoFreeClient.AutoUpdate.prototype = EchoCore.derive(EchoCore.Scheduler.Runnable);

EchoFreeClient.AutoUpdate.prototype.run = function() {
    EchoRender.processUpdates(this._updateManager);
};
