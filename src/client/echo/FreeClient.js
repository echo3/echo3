/**
 * @fileoverview
 * Freestanding Client Implementation.
 * Provides capapbility to develop server-independent applications.
 * Requires Core, WebCore, Application, Render, Serial, Client.
 */
 
/** 
 * @class 
 * FreeClient implementation.
 * The init() and dispose() lifecycle methods must be called before the client is used,
 * and when the client will no longer be used, respectively.
 */ 
EchoFreeClient = Core.extend(EchoClient, {

    _processUpdateRef: null,
    _resourcePaths: null,

    /**
     * Creates a new FreeClient.
     *
     * @param {EchoApp.Application} application the application the client operate on.
     * @param {Element} domainElement the HTML 
     */
    $construct: function(application, domainElement) {
        EchoClient.call(this);
        this._processUpdateRef = Core.method(this, this._processUpdate);;
        this.configure(application, domainElement);
    },
    
    addResourcePath: function(packageName, baseUrl) {
        if (!this._resourcePaths) {
            this._resourcePaths = { };
        }
        this._resourcePaths[packageName] = baseUrl;
    },

    /**
     * Disposes of the FreeClient.
     * This method must be invoked when the client will no longer be used, in order to clean up resources.
     */
    dispose: function() {
        WebCore.Scheduler.remove(this._autoUpdate);
        this.application.updateManager.removeUpdateListener(this._processUpdateRef);
        this._autoUpdate = null;
        EchoRender.renderComponentDispose(null, this.application.rootComponent);
        EchoClient.prototype.dispose.call(this);
    },
    
    getResourceUrl: function(packageName, resourceName) {
        if (this._resourcePaths && this._resourcePaths[packageName]) {
            return this._resourcePaths[packageName] + resourceName;
        } else {
            return EchoClient.prototype.getResourceUrl.call(this, packageName, resourceName);
        }
    },
    
    /**
     * Initializes the FreeClient.
     * This method must be invoked before the client is initially used.
     */
    init: function() {
        WebCore.init();
        this._autoUpdate = new EchoFreeClient.AutoUpdate(this);
        this.application.updateManager.addUpdateListener(this._processUpdateRef);
        WebCore.Scheduler.add(this._autoUpdate);
    },
    
    //FIXME This method is asynchronous, first autoupdate might want to wait on it being completed.
    // This currently causes occassional bugginess in the freeclient test app (race).
    /**
     * Loads an XML style sheet into the client application from a URL.
     * 
     * @param url the URL from which the StyleSheet should be fetched.
     */
    loadStyleSheet: function(url) {
        var conn = new WebCore.HttpConnection(url, "GET");
        conn.addResponseListener(Core.method(this, this._processStyleSheet));
        conn.connect();
    },
    
    /**
     * Event listener invoked when a StyleSheet fetched via
     * loadStyleSheet() has been retrieved.
     * 
     * @param {Event} e the HttpConnection response event
     */
    _processStyleSheet: function(e) {
        if (!e.valid) {
            throw new Error("Received invalid response from StyleSheet HTTP request.");
        }
        
        var ssElement =  e.source.getResponseXml().documentElement;
        var styleSheet = EchoSerial.loadStyleSheet(this, ssElement);
        this.application.setStyleSheet(styleSheet);
    },

    _processUpdate: function(e) {
        //FIXME implement or remove
    }
});

/**
 * @class WebCore.Scheduler.Runnable to automatically update client when application state has changed.
 */
EchoFreeClient.AutoUpdate = Core.extend(WebCore.Scheduler.Runnable, {

    timeInterval: 10,
    
    repeat: true,
    
    _client: null,

    /**
     * Creates a new automatic render update runnable.
     * 
     * @param client the supported client
     */
    $construct: function(client) {
        this._client = client;
    },
    
    /**
     * Runnable run() implementation.
     */
    run: function() {
        EchoRender.processUpdates(this._client);
    }
});
