/**
 * Freestanding Client Implementation.
 * REQUIRES: Core, WebCore, Application, Render, Serial.
 * 
 * This API allows the development of server-independent applications.
 */
EchoFreeClient = function(application, domainElement) {
    EchoClient.call(this);
    this.configure(application, domainElement);
};

EchoFreeClient.prototype = EchoCore.derive(EchoClient);

EchoFreeClient.prototype.dispose = function() {
    EchoCore.Scheduler.remove(this._autoUpdate);
    this.application.updateManager.removeUpdateListener(new EchoCore.MethodRef(this, this._processUpdate));
    this._autoUpdate = null;
    EchoRender.renderComponentDispose(null, this.application.rootComponent);
    EchoClient.prototype.dispose.call(this);
};

EchoFreeClient.prototype._processUpdate = function(e) {
};

EchoFreeClient.prototype.init = function() {
    EchoWebCore.init();
    this._autoUpdate = new EchoFreeClient.AutoUpdate(this);
    this.application.updateManager.addUpdateListener(new EchoCore.MethodRef(this, this._processUpdate));
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
    this.application.setStyleSheet(styleSheet);
};

EchoFreeClient.AutoUpdate = function(client) {
    this.client = client;
    EchoCore.Scheduler.Runnable.call(this, null, 10, true);
};

EchoFreeClient.AutoUpdate.prototype = EchoCore.derive(EchoCore.Scheduler.Runnable);

EchoFreeClient.AutoUpdate.prototype.run = function() {
    EchoRender.processUpdates(this.client);
};

EchoFreeClient.AppComponent = function() {
};

