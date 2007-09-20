/**
 * @fileoverview
 * Freestanding Client Implementation.
 * Provides capapbility to develop server-independent applications.
 * Requires Core, WebCore, Application, Render, Serial, Client.
 */

/**
 * Creates a new FreeClient.
 * 
 * @param {EchoApp.Application} application the application the client operate on.
 * @param {Element} domainElement the HTML 
 * 
 * @class FreeClient implementation.
 * The init() and dispose() lifecycle methods must be called before the client is used,
 * and when the client will no longer be used, respectively. 
 */
EchoFreeClient = function(application, domainElement) {
    EchoClient.call(this);
    this.configure(application, domainElement);
};

EchoFreeClient.prototype = EchoCore.derive(EchoClient);

/**
 * Disposes of the FreeClient.
 * This method must be invoked when the client will no longer be used, in order to clean up resources.
 */
EchoFreeClient.prototype.dispose = function() {
    EchoCore.Scheduler.remove(this._autoUpdate);
    this.application.updateManager.removeUpdateListener(new EchoCore.MethodRef(this, this._processUpdate));
    this._autoUpdate = null;
    EchoRender.renderComponentDispose(null, this.application.rootComponent);
    EchoClient.prototype.dispose.call(this);
};

EchoFreeClient.prototype._processUpdate = function(e) {
    //FIXME implement or remove
};

/**
 * Initializes the FreeClient.
 * This method must be invoked before the client is initially used.
 */
EchoFreeClient.prototype.init = function() {
    EchoWebCore.init();
    this._autoUpdate = new EchoFreeClient.AutoUpdate(this);
    this.application.updateManager.addUpdateListener(new EchoCore.MethodRef(this, this._processUpdate));
    EchoCore.Scheduler.add(this._autoUpdate);
};

//FIXME This method is asynchronous, first autoupdate might want to wait on it being completed.
// This currently causes occassional bugginess in the freeclient test app (race).
/**
 * Loads an XML style sheet into the client application from a URL.
 * 
 * @param url the URL from which the StyleSheet should be fetched.
 */
EchoFreeClient.prototype.loadStyleSheet = function(url) {
    var conn = new EchoWebCore.HttpConnection(url, "GET");
    conn.addResponseListener(new EchoCore.MethodRef(this, this._processStyleSheet));
    conn.connect();
};

/**
 * Event listener invoked when a StyleSheet fetched via
 * loadStyleSheet() has been retrieved.
 * 
 * @param {Event} e the HttpConnection response event
 */
EchoFreeClient.prototype._processStyleSheet = function(e) {
    if (!e.valid) {
        throw new Error("Received invalid response from StyleSheet HTTP request.");
    }
    
    var ssElement =  e.source.getResponseXml().documentElement;
    var styleSheet = EchoSerial.loadStyleSheet(this, ssElement);
    this.application.setStyleSheet(styleSheet);
};

/**
 * Creates a new automatic render update runnable.
 * 
 * @param client the supported client
 * 
 * @class EchoCore.Scheduler.Runnable to automatically update client when application state has changed.
 */
EchoFreeClient.AutoUpdate = function(client) {
    this.client = client;
    EchoCore.Scheduler.Runnable.call(this, null, 10, true);
};

EchoFreeClient.AutoUpdate.prototype = EchoCore.derive(EchoCore.Scheduler.Runnable);

/**
 * Runnable run() implementation.
 */
EchoFreeClient.AutoUpdate.prototype.run = function() {
    EchoRender.processUpdates(this.client);
};