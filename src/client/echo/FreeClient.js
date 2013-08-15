/**
 * @fileoverview
 * Freestanding Client Implementation.
 * Provides capability to develop server-independent applications.
 * Requires Core, Core.Web, Application, Render, Serial, Client.
 */
 
/**
 * FreeClient implementation.
 * The init() and dispose() lifecycle methods must be called before the client is used,
 * and when the client will no longer be used, respectively.
 * @namespace
 */ 
Echo.FreeClient = Core.extend(Echo.Client, {

    /** 
     * Method reference to <code>_processUpdate()</code> 
     * @type Function
     */
    _processUpdateRef: null,
    
    /** 
     * Method reference to <code>_doRender()</code> 
     * @type Function
     */
    _doRenderRef: null,
    
    /** Resource package name to base URL mapping for resource paths. */
    _resourcePaths: null,
    
    /** 
     * Flag indicating that a runnable has been enqueued to invoke _doRender(). 
     * @type Boolean
     */
    _renderPending: false,

    /**
     * Creates a new FreeClient.
     *
     * @param {Echo.Application} application the application which the client will contain
     * @param {Element} domainElement the HTML element in which the client will be rendered
     */
    $construct: function(application, domainElement) {
        Echo.Client.call(this);
        this._doRenderRef = Core.method(this, this._doRender);
        this._processUpdateRef = Core.method(this, this._processUpdate);
        this.configure(application, domainElement);
        this._processUpdate();
    },
    
    /**
     * Associates a resource package name with a base URL.
     * Later inquiries to <code>getResourceUrl()</code> with the specified package name will return
     * URLs with the specified <code>baseUrl</code> prepended to the resource name provided in the
     * call to <code>getResourceUrl()</code>.
     *
     * @param {String} packageName the resource package name
     * @param {String} baseUrl the base URL to prepend to resources in the specified package
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
        this.application.updateManager.removeUpdateListener(this._processUpdateRef);
        Echo.Render.renderComponentDispose(null, this.application.rootComponent);
        Echo.Client.prototype.dispose.call(this);
    },
    
    /**
     * Performs rendering operations by invoking Echo.Render.processUpdates().
     * Invoked in separate execution context (scheduled).
     */
    _doRender: function() {
        if (this.application) {
            // Only execute updates in the event client has not been deconfigured, which can
            // occur before auto-update fires if other operations were scheduled for immediate
            // execution.
            this.processUpdates();
            this._renderPending = false;
        }
    },
    
    /** @see Echo.Client#getResoruceUrl */
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
        if (this._isBrowserOutdated()) {
            this._showBrowserWarning();
        }
        this.application.updateManager.addUpdateListener(this._processUpdateRef);
    },
    
    /**
     * Loads an XML style sheet into the client application from a URL.
     * 
     * @param {String} url the URL from which the StyleSheet should be fetched.
     */
    loadStyleSheet: function(url) {
        var conn = new Core.Web.HttpConnection(url, "GET");
        conn.addResponseListener(Core.method(this, this._processStyleSheet));
        conn.connect();
    },
    
    /**
     * Event listener invoked when a StyleSheet fetched via loadStyleSheet() has been retrieved.
     * 
     * @param e the HttpConnection response event
     */
    _processStyleSheet: function(e) {
        if (!e.valid) {
            throw new Error("Received invalid response from StyleSheet HTTP request.");
        }
        
        var ssElement =  e.source.getResponseXml().documentElement;
        var styleSheet = Echo.Serial.loadStyleSheet(this, ssElement);
        this.application.setStyleSheet(styleSheet);
    },

    /** Schedules doRender() to run in next execution context. */  
    _processUpdate: function(e) {
        if (!this._renderPending) {
            this._renderPending = true;
            Core.Web.Scheduler.run(this._doRenderRef);
        }
    }
});
