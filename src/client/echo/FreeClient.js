/**
 * @fileoverview
 * Freestanding Client Implementation.
 * Provides capapbility to develop server-independent applications.
 * Requires Core, Core.Web, Application, Render, Serial, Client.
 */
 
/**
 * FreeClient implementation.
 * The init() and dispose() lifecycle methods must be called before the client is used,
 * and when the client will no longer be used, respectively.
 * @namespace
 */ 
Echo.FreeClient = Core.extend(Echo.Client, {

    _processUpdateRef: null,
    _resourcePaths: null,

    /**
     * Creates a new FreeClient.
     *
     * @param {Echo.Application} application the application the client operate on.
     * @param {Element} domainElement the HTML 
     */
    $construct: function(application, domainElement) {
        Echo.Client.call(this);
        this._processUpdateRef = Core.method(this, this._processUpdate);;
        this.configure(application, domainElement);
    },
    
    /**
     * Associates a resource package name with a base URL.
     * Later inquiries to <code>getResourceUrl()</code> with the specified package name will return
     * URLs with the specified <code>baseUrl</code> prepended to the resource name provided in the
     * call to <code>getResourceUrl()</code>.
     *
     * @param packageName the resource package name
     * @param baseUrl the base URL to prepend to resources in the specified package
     */
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
        Core.Web.Scheduler.remove(this._autoUpdate);
        this.application.updateManager.removeUpdateListener(this._processUpdateRef);
        this._autoUpdate = null;
        Echo.Render.renderComponentDispose(null, this.application.rootComponent);
        Echo.Client.prototype.dispose.call(this);
    },

    /**
     * @override
     */    
    getResourceUrl: function(packageName, resourceName) {
        if (this._resourcePaths && this._resourcePaths[packageName]) {
            return this._resourcePaths[packageName] + resourceName;
        } else {
            return Echo.Client.prototype.getResourceUrl.call(this, packageName, resourceName);
        }
    },
    
    /**
     * Initializes the FreeClient.
     * This method must be invoked before the client is initially used.
     */
    init: function() {
        Core.Web.init();
        this._autoUpdate = new Echo.FreeClient.AutoUpdate(this);
        this.application.updateManager.addUpdateListener(this._processUpdateRef);
        Core.Web.Scheduler.add(this._autoUpdate);
    },
    
    //FIXME This method is asynchronous, first autoupdate might want to wait on it being completed.
    // This currently causes occassional bugginess in the freeclient test app (race).
    /**
     * Loads an XML style sheet into the client application from a URL.
     * 
     * @param url the URL from which the StyleSheet should be fetched.
     */
    loadStyleSheet: function(url) {
        var conn = new Core.Web.HttpConnection(url, "GET");
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
        var styleSheet = Echo.Serial.loadStyleSheet(this, ssElement);
        this.application.setStyleSheet(styleSheet);
    },

    _processUpdate: function(e) {
        //FIXME implement or remove
    }
});

/**
 * <code>Core.Web.Scheduler.Runnable</code> to automatically update client when application state has changed.
 */
Echo.FreeClient.AutoUpdate = Core.extend(Core.Web.Scheduler.Runnable, {

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
        Echo.Render.processUpdates(this._client);
    }
});
