/**
 * @fileoverview
 * Remote Client Implementation.
 * 
 * Requires: Core, Serial, Core.Web, Application, Render.
 */

/**
 * A client which provides a remote view of an Echo application being executed on the server.
 * This client exchanges data with the remote server in the form of XML messages containing
 * serialized components and events.
 *        
 * Component synchronization peers that will be working exclusively with a RemoteClient may 
 * implement an optional <code>storeProperty(clientMessage, property)</code> method to 
 * provide custom property XML serialization.  This should be avoided if possible, but may
 * be necessary for serializing certain information such as the state of a model.
 */
Echo.RemoteClient = Core.extend(Echo.Client, {

    $static: {
        
        /**
         * Base URL from which libraries should be retrieved.
         * Libraries are loaded into global scope, and are thus not
         * bound to any particular client instance.
         * @type String
         */
        libraryServerUrl: null,
        
        /**
         * Flag indicating whether global remote client initialization has been performed.
         * @type Boolean 
         */
        initialized: false,
        
        /**
         * Default client configuration data.
         */
        DEFAULT_CONFIGURATION: {
            "NetworkError.Message": "A network error has occurred, please try again.",
            "SessionExpiration.Message": "Your session has expired.",
            "Resync.Message": "This window was not synchronized with the server and has been reset.  " + 
                    "Please try your last request again."
        },
        
        /**
         * Initializes the remote-client-based application.
         */
        init: function() {
            if (Echo.RemoteClient.initialized) {
                return;
            }
            Echo.RemoteClient.initialized = true;
            Core.Web.init();
            if (Core.Web.Env.ENGINE_MSHTML) {
                // Set documentElement.style.overflow to hidden in order to hide root scrollbar in IE.
                // This is a non-standard CSS property.
                document.documentElement.style.overflow = "hidden";
            }
        }
    },
    
    /**
     * Server user instance identifier.
     * @type String
     */
    _uiid: null,
    
    /**
     * The base server URL.
     * @type String
     */
    _serverUrl: null,
    
    /**
     * Flag indicating whether a client-server synchronization is requested.
     * @type Boolean
     */
    _syncRequested: false,

    /**
     * Flag indicating whether a client-server transaction is currently in progress.
     * @type Boolean
     */
    _transactionInProgress: false,
    
    /**
     * Identifier for input restriction registered with client during transactions.
     * @type String
     */
    _inputRestrictionId: null,
    
    /**
     * Function wrapper to invoke _processClientEvent() method.
     * @type Function
     */
    _processClientEventRef: null,
    
    /**
     * Associative array mapping between shorthand URL codes and replacement values.
     */
    _urlMappings: null,
    
    /**
     * Queue of commands to be executed.  Each command occupies two
     * indices, first index is the command peer, second is the command data.
     * @type Array
     */
    _commandQueue: null,
    
    /**
     * Outgoing client message.
     * @type Echo.RemoteClient.ClientMessage
     */
    _clientMessage: null,
    
    /**
     * AsyncManager instance which will invoke server-pushed operations.
     * @type Echo.RemoteClient.HTTPAsyncManager
     */
    _asyncManager: null,
    
    /**
     * Flag indicating whether the remote client has been initialized.
     * @type Boolean
     */
    _initialized: false,
    
    /**
     * The last component which was focused on the client before synchronization.
     * @type Component
     */
    _clientFocusedComponent: null,
    
    /**
     * The component which the server has requested to be focused.
     * @type Component
     */
    _serverFocusedComponent: null,
    
    /**
     * Current client/server transaction id.
     * @type Number
     */
    transactionId: 0,

    /**
     * Events waiting for process.
     */
    _pending_events: null,

    _initialSyncComplete: false,

    /**
     * MethodRunnable that handle client async property updates.
     */
    _asyncUpdatesHandler: null,

    /**
     * Creates a new RemoteClient instance.
     * 
     * @param serverUrl the URL of the server
     * @param initId the initialization id, which should be provided in the initial client message
     */
    $construct: function(serverUrl, initId) {
        Echo.RemoteClient.init();
        Echo.Client.call(this);

        // Install default configuration.
        for (var x in Echo.RemoteClient.DEFAULT_CONFIGURATION) {
            this.configuration[x] = Echo.RemoteClient.DEFAULT_CONFIGURATION[x];    
        }
        this._serverUrl = serverUrl;
        
        this._processClientEventRef = Core.method(this, this._processClientEvent);
        this._commandQueue = null;
        this._clientMessage = new Echo.RemoteClient.ClientMessage(this, initId);
        this._pending_events = [];
        this._asyncUpdatesHandler = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._performAsyncUpdates), 250, false);
    },
    
    /**
     * Adds a listener for an arbitrary event type to a component.
     * This method is invoked by the Serial module when event tags are
     * processed during the deserialization of component synchronization
     * XML messages.
     * 
     * @param {Echo.Component} component the component on which the listener should be added
     * @param {String} eventType the type of event
     */
    addComponentListener: function(component, eventType) {
        component.addListener(eventType, this._processClientEventRef);
    },
    
    /**
     * Decompresses a shorthand URL into a valid full-length URL.
     * A shorthand URL is expressed as "!A!xxxx" where
     * "A" is a key whose value contains the first portion of the URL
     * and "xxxx" is the latter portion of the URL.  Such URLs are used
     * to reduce the amount of bandwidth used in transmitting large
     * numbers of the same URL from server-to-client.
     *
     * @param url the shorthand URL to process
     * @return the full-length valid URL
     * @type String
     */
    decompressUrl: function(url) {
        var urlTokens = url.split("!");
        if (urlTokens[0]) {
            // urlTokens[0] is not empty: URL is not a shorthand URL.
            return url;
        } else {
            // urlTokens[0] = empty
            // urlTokens[1] = key
            // urlTokens[2] = baseUrl
            if (urlTokens.length != 3) {
                throw new Error("Invalid encoded URL: " + url);
            }
            var replacementValue = this._urlMappings[urlTokens[1]]; 
            if (replacementValue == null) {
                throw new Error("Invalid URL shorthand key \"" + urlTokens[1] + "\" in URL: " + url);
            }
            return replacementValue + urlTokens[2];
        }
    },
    
    /**
     * Test a given event, if it is a async event.
     * An async-event starts by convention with 'async_' on property eventType.
     *
     * @param eventType the string-identifier of the event
     * @return true, if it is a async event, false if not
     * @type Boolean
     */
    _isAsyncEvent: function(eventType) {
        if(eventType && typeof eventType === "string") {
            // if it startsWith 'async_' return true ->
            if(eventType.length > 5) {
                return (eventType.substring(0,5) === 'async_');
            }
        }
        // if eventType is not a string or even null:
        return false;
    },

    /**
     * Enqueues a command to be processed after component synchronization has been completed.
     * 
     * @param commandPeer the command peer to execute
     * @param commandData an object containing the command data sent from the server
     */
    _enqueueCommand: function(commandPeer, commandData) {
        if (this._commandQueue == null) {
            this._commandQueue = [];
        }
        this._commandQueue.push(commandPeer, commandData);
    },
    
    /**
     * Executes all enqueued commands; empties the queue.
     */
    _executeCommands: function() {
        if (this._commandQueue) {
            for (var i = 0; i < this._commandQueue.length; i += 2) {
                this._commandQueue[i].execute(this, this._commandQueue[i + 1]);
            }
            this._commandQueue = null;
        }
    },
    
    /**
     * Returns the URL of a library service based on the serviceId.
     * 
     * @param {String} serviceId the serviceId
     * @return the full library URL
     * @type String
     */
    _getLibraryServiceUrl: function(serviceId) {
        if (!Echo.RemoteClient._libraryServerUrl) {
            Echo.RemoteClient._libraryServerUrl = this._serverUrl;
        }
        if (this._uiid == null) {
            return Echo.RemoteClient._libraryServerUrl + "?sid=" + serviceId;
        } else {
            return Echo.RemoteClient._libraryServerUrl + "?sid=" + serviceId + "&uiid=" + this._uiid;
        }
    },
    
    /** @see Echo.Client#getResoruceUrl */
    getResourceUrl: function(packageName, resourceName) {
        return this.getServiceUrl("Echo.Resource") + "&pkg=" + packageName + "&res=" + resourceName;
    },
    
    /**
     * Returns the URL of a remote server-side service.
     *
     * @param {String} serviceId the service id
     * @return the URL
     * @type String
     */
    getServiceUrl: function(serviceId) {
        if (this._uiid == null) {
            return this._serverUrl + "?sid=" + serviceId;
        } else {
            return this._serverUrl + "?sid=" + serviceId + "&uiid=" + this._uiid;
        }
    },

    /**
     * Handles an invalid response from the server.
     * 
     * @param e the HttpConnection response event
     */
    _handleInvalidResponse: function(e) {
        var detail = null;
        if (e.exception) {
            detail = e.exception.toString();
        } else if (e.source.getResponseText()) {
            if (e.source.getResponseText().indexOf("!*! Session Expired") != -1) {
                this._handleSessionExpiration();
                return;
            } else {
                if (this.configuration["InvalidResponse.Restart"]) {
                    window.location.reload();
                    return;
                } else if (this.configuration["InvalidResponse.URI"]) {
                    window.location.href = this.configuration["InvalidResponse.URI"];
                    return;
                }
                detail = e.source.getResponseText();
            }
        } else {
            this._handleNetworkError();
            return;
        }
        this.fail(detail);
    },
    
    /**
     * Handles server-side session expiration.
     */
    _handleSessionExpiration: function() {
        var element = this.domainElement;
        try {
            this.dispose();
        } finally {
            if (this.configuration["SessionExpiration.Restart"]) {
                // Restart immediately.
                window.location.reload();
            } else if (this.configuration["SessionExpiration.URI"]) {
                // Redirect.
                window.location.href = this.configuration["SessionExpiration.URI"];
            } else {
                // Display error.
                this.displayError(element, this.configuration["SessionExpiration.Message"], null, 
                        this.configuration["Action.Continue"], function() {
                    window.location.reload();
                }, Echo.Client.STYLE_MESSAGE);
            }
        }
    },
    
    _handleNetworkError: function() {
        var element = this.domainElement;
        try {
            this.dispose();
        } finally {
            // Display error.
            this.displayError(element, this.configuration["NetworkError.Message"], null, 
                    this.configuration["Action.Continue"], function() {
                window.location.reload();
            }, Echo.Client.STYLE_MESSAGE);
        }
    },
    
    /**
     * Initializes the remote client.  This method will perform the following operations:
     * <ul>
     *  <li>Find the domain element in which the application should exist by parsing the
     *   initial server message XML document.</li>
     *  <li>Create a new Echo.Application instance,</li>
     *  <li>Register a component update listener on that application instance such that
     *   a user's input will be stored in the outgoing ClientMessage.</li>
     *  <li>Invoke Echo.Client.configure() to initialize the client.</li>
     * </ul>  
     * 
     * @param {Document} initialResponseDocument the initial ServerMessage XML document 
     *        received from the server (this document contains some necessary start-up information
     *        such as the id of the root element)
     */
    init: function(initialResponseDocument) {
        this._uiid = initialResponseDocument.documentElement.getAttribute("u");
        if (this._uiid === "") {
            this._uiid = null;
        }

        this._urlMappings = {};
        this._urlMappings.I = this._serverUrl + "?" + (this._uiid == null ? "" : "uiid=" + this._uiid + "&") + 
              "sid=Echo.Image&iid=";

        // Find domain element.
        var domainElementId = initialResponseDocument.documentElement.getAttribute("root");
        var domainElement = document.getElementById(domainElementId);
        if (!domainElement) {
            throw new Error("Cannot find domain element: " + domainElementId);
        }
        
        // Create an application instance.
        var application = new Echo.Application();
        
        // Register an update listener to receive notification of user actions such that they
        // may be remarked in the outgoing ClientMessage.
        application.addListener("componentUpdate", Core.method(this, this._processClientUpdate));
        
        // Perform general purpose client configuration.
        this.configure(application, domainElement);
        
        // Mark the client as initialized.
        this._initialized = true;
    },
    
    _processPrendingClientEvent: function(e) {
        this._clientMessage.setEvent(e.source.renderId, e.type, e.data);
        this._syncRequested = true;
        Core.Web.Scheduler.run(Core.method(this, this.sync));

        // added: && !this._isAsyncEvent(e.type) to handle async events w/o input restriction
        if (!this._inputRestrictionId && !this._isAsyncEvent(e.type)) {
            this._inputRestrictionId = this.createInputRestriction();
        }
    },

    /**
     * Processes an event from a component that requires immediate server interaction.
     * 
     * @param e the event to process
     */
    _processClientEvent: function(e) {
        if (this._syncRequested || this._transactionInProgress || this._pending_events.length > 0) {
            this._pending_events.push( e );
            return;
        }
        this._processPrendingClientEvent(e);
    },
    
    /**
     * Processes a user update to a component (storing the updated state in the outgoing
     * client message).
     * 
     * @param e the property update event from the component
     */
    _processClientUpdate: function(e) {
        if (this._processServerMessage) {
            //ignore updates that are from serverMessage
        } else {
            //Store property update from the component. (by peer or clientMessage)
            if (e.parent.peer && e.parent.peer.storeProperty && e.parent.peer.storeProperty(this._clientMessage, e.propertyName)) {
                //property is stored by peer
            } else {
                this._clientMessage.storeProperty(e.parent.renderId, e.propertyName, e.newValue);
            }
            if (!this._transactionInProgress) {
                // has an asynchronous update (e.g: timer periodically set a property)
                Core.Web.Scheduler.update(this._asyncUpdatesHandler, true);
            }
        }
    },

   /**
    * Invoked when there is asynchronous property updates.
    */
    _performAsyncUpdates: function() {
        if (!this._transactionInProgress && !this._syncRequested && this._clientMessage.hasStoredProperties()) {
            this._syncRequested = true;
            this.sync();
        }
    },
    
    /**
     * ServerMessage completion listener.
     * 
     * @param e the server message completion event
     */
    _processSyncComplete: function(e) {
        this._processServerMessage = false;

        // Mark time of serialization completion with profiling timer.
        if (Echo.Client.profilingTimer) {
            Echo.Client.profilingTimer.mark("ser");
        }

        this.processUpdates();
        this._executeCommands();

        // Flag transaction as being complete.
        this._transactionInProgress = false;
        this.removeInputRestriction(this._inputRestrictionId);
        this._inputRestrictionId = null;

        // Focus component
        if (this._serverFocusedComponent) {
            this.application.setFocusedComponent(this._serverFocusedComponent);
        }
    
        if (Echo.Client.profilingTimer) {
            Core.Debug.consoleWrite(Echo.Client.profilingTimer + " /pc:" + Echo.Render._loadedPeerCount);
            Echo.Client.profilingTimer = null;
        }

        if (e.source.resync) {
            this.displayError(this.domainElement, this.configuration["Resync.Message"], null, 
                    this.configuration["Action.Continue"], null, Echo.Client.STYLE_MESSAGE);
        }

        if (this._pending_events.length > 0) {
            // if have pending events no need to check for "subupdates"
            this._processPrendingClientEvent(this._pending_events.shift());
        } else if (this.application.updateManager.hasUpdates()) {
            // current updates have created a new updates
            // make a new synchronization
            this._syncRequested = true;
            Core.Web.Scheduler.run(Core.method(this, this.sync));
        }

        if (this._asyncManager && this._asyncManager._syncComplete) {
            this._asyncManager._syncComplete();
        }

        if (!this._initialSyncComplete) {
            if (this._isBrowserOutdated()) {
                this._showBrowserWarning();
            }
            this._initialSyncComplete = true;
        }
    },
    
    /**
     * Process a response to a client-server synchronization.
     * 
     * @param e the HttpConnection response event
     */
    _processSyncResponse: function(e) {
        // Retrieve response document.
        var responseDocument = e.source.getResponseXml();
        
        // Verify that response document exists and is valid.
        if (!e.valid || !responseDocument || !responseDocument.documentElement) {
            this._handleInvalidResponse(e); 
            return;
        }
        
        // If this is the first ServerMessage received, initialize the client
        // This step will create the application, determine where in the DOM the application should be
        // rendered, and so forth.
        if (!this._initialized) {
            this.init(responseDocument);
        }
        
        // Profiling Timer (Un-comment to enable, comment to disable).
        Echo.Client.profilingTimer = new Echo.Client.Timer();
        
        // Create new ServerMessage object with response document.
        var serverMessage = new Echo.RemoteClient.ServerMessage(this, responseDocument);
        
        this.transactionId = serverMessage.transactionId;
        
        // Add completion listener to invoke _processSyncComplete when message has been fully processed.
        // (Some elements of the server message are processed asynchronously). 
        serverMessage.addCompletionListener(Core.method(this, this._processSyncComplete));
        
        // Start server message processing.
        this._processServerMessage = true;
        serverMessage.process();
    },
    
    /**
     * Removes a listener for an arbitrary event type from a component.
     * 
     * @param {Echo.Component} component the component from which the listener should be removed
     * @param {String} eventType the type of event
     */
    removeComponentListener: function(component, eventType) {
        component.removeListener(eventType, this._processClientEventRef);
    },
    
    /**
     * Initiates a client-server synchronization.
     */
    sync: function() {
        if (this._transactionInProgress) {
            throw new Error("Attempt to invoke client/server synchronization while another transaction is in progress; " + 
                    "event data: componentId=" + this._clientMessage._eventComponentId + " eventType=" + 
                    this._clientMessage._eventType + " eventData=" + this._clientMessage._eventData);  
        }
    
        this._clientFocusedComponent = this.application ? this.application.getFocusedComponent() : null;
        this._serverFocusedComponent = null;
        
        this._transactionInProgress = true;
        this._syncRequested = false;
        // added: && !this._isAsyncEvent(this._clientMessage._eventType) to handle async events
        if (!this._inputRestrictionId && !this._isAsyncEvent(this._clientMessage._eventType)) {
            this._inputRestrictionId = this.createInputRestriction();
        }
        if (this._asyncManager) {
            this._asyncManager._stop();
        }
        this._syncInitTime = new Date().getTime();

        var conn = new Core.Web.HttpConnection(this.getServiceUrl("Echo.Sync"), "POST",
                this._clientMessage._renderXml(), "text/xml;charset=utf-8");
        
        // Create new client message.
        this._clientMessage = new Echo.RemoteClient.ClientMessage(this, null);

        conn.addResponseListener(Core.method(this, this._processSyncResponse));
        conn.connect();
    }
});

/**
 * Abstract base class for server message directive processors.
 */
Echo.RemoteClient.DirectiveProcessor = Core.extend({
    
    /** 
     * The remote client instance.
     * @type Echo.RemoteClient
     */
    client: null,

    /**
     * Constructor.
     * @param {Echo.RemoteClient} client the remote client instance
     */
    $construct: function(client) {
        this.client = client;
    },
    
    $abstract: {
        
        /**
         * Process a server message directive.
         * 
         * @param {Element} dirElement the directive element 
         */
        process: function(dirElement) { }
    }
});

/**
 * Manages server-pushed updates to the client. 
 */
Echo.RemoteClient.AbstractAsyncManager = Core.extend({

    $static: {
      
      /**
        * Number of times the client should attempt to contact the server.
        * 
        * @type Number
        */
        MAX_CONNECT_ATTEMPTS: 3
    },

   /**
    * The supported client.
    *
    * @type Echo.RemoteClient
    */
    _client: null,
    
   /**
    * The number of times the client has unsuccessfully attempted to contact the server.
    *
    * @type Number
    */
    _failedConnectAttempts: null,

   /** 
    * Creates a new asynchronous manager.
    *
    * @param {Echo.RemoteClient} client the supported client
    */
    $construct: function(client) {
        this._client = client;
    },

    $abstract: true,

    $virtual: {
        /**
          * Starts server polling for asynchronous tasks.
          */
        _start: function() { },

        /**
          * Stops server polling for asynchronous tasks.
          */
        _stop: function() { }
    }
});

Echo.RemoteClient.WebSocketAsyncManager = Core.extend(Echo.RemoteClient.AbstractAsyncManager, {
  
    $static: {
      
        /**
         * Message from server when requaried synchronization.
         */
        RQ_SYNC_MESSAGE: "request-sync",
        
        /**
         * Close code when the user opens a new socket. (e.g: new browser tab).
         */
        SYNC_CLOSE_CODE: 8807,
        
        /**
         * Close code when application instance is disposed.
         */
        DISPOSE_CLOSE_CODE: 8806
    },
    
    /**
     * Socket that listens for messages from the server.
     *
     * @type Core.Web.WebSocketConnection
     */
    _wsConnection: null,

    /**
     * Function wrapper to invoke _onEvents() method.
     * @type Function
     */
    _eventsHandler: null,
    
    /**
     * Indicates that is sync successfully.
     */
    _unsync: null,    

    /** 
     * Creates a new asynchronous manager basedon Core.Web.WebSocketConnection.
     *
     * @param {Echo.RemoteClient} client the supported client
     */
    $construct: function(client) {
        Echo.RemoteClient.AbstractAsyncManager.call(this, client);
                
        var loc = window.location;
        var protocol = loc.protocol == "http:" ? "ws:" : loc.protocol == "https:" ? "wss:" : null;
        if (!protocol) {
            throw new Error("Echo.RemoteClient.WebSocketAsyncManager: unknown protocol!");
        }
        
        var URL = protocol + "//" + loc.hostname + ":" + loc.port + loc.pathname + "ws";
        if (this._client.uiid) {
            URL += "?uiid=" + this._client._uiid;
        }
        
        this._wsConnection = new Core.Web.WebSocketConnection(URL);
        this._eventsHandler = Core.method(this, this._onEvents);
    },

    /**
     * Open web socket connection.
     * Register for the required events.
     */
    _start: function() {
        var state = this._wsConnection.getState();
        if (state == Core.Web.WebSocketConnection.STATE_DISPOSED) {
            this._wsConnection.addEventListener(Core.Web.WebSocketConnection.EVENT_OPEN, this._eventsHandler);
            this._wsConnection.addEventListener(Core.Web.WebSocketConnection.EVENT_CLOSE, this._eventsHandler);
            this._wsConnection.addEventListener(Core.Web.WebSocketConnection.EVENT_MESSAGE, this._eventsHandler);
            this._wsConnection.addEventListener(Core.Web.WebSocketConnection.EVENT_ERROR, this._eventsHandler);
        }
        this._wsConnection.open();
    },

    /**
     * Close current web socket connection.
     */
    _stop: function(real) {
        if (real) {
            this._wsConnection.close();
        }
    },

    /**
     * Call is when an event occurs.
     *
     * For various events taking different approaches.
     */
    _onEvents: function(e) {
        switch(e.type) {
            case Core.Web.WebSocketConnection.EVENT_OPEN:
                this._failedConnectAttempts = 0;
                if (!this._executeSync()) {
                    this.unsync = true;
                }
                break;
            case Core.Web.WebSocketConnection.EVENT_MESSAGE:
                if (e.data.data == Echo.RemoteClient.WebSocketAsyncManager.RQ_SYNC_MESSAGE) {
                    if (!this._executeSync()) {
                        this._unsync = true;
                    }
                }
                break;
            case Core.Web.WebSocketConnection.EVENT_CLOSE:
                if (e.data.code == Echo.RemoteClient.WebSocketAsyncManager.DISPOSE_CLOSE_CODE) {
                    this._client.fail(e.data.reason);
                } else if (e.data.code == Echo.RemoteClient.WebSocketAsyncManager.SYNC_CLOSE_CODE || 
                        ++this._failedConnectAttempts >= Echo.RemoteClient.AbstractAsyncManager.MAX_CONNECT_ATTEMPTS) {
                    this._notifyForNetworkError();
                } else {
                    this._start();
                }
                break;
            case Core.Web.WebSocketConnection.EVENT_ERROR:
                this._notifyForNetworkError();
                break;
        }
    },

    /**
     * Call when synchronization finished.
     * If is unsync, start again.
     */
    _syncComplete: function() {        
        if (this._unsync && this._executeSync()) {
            this._unsync = false;
        }
    },
    
    /**
     * Make sync in new thread.
     * 
     * @return {Boolean} whether the sync method is started.
     */
    _executeSync: function() {
        if (!this._client._transactionInProgress && !this._client._syncRequested) {
            this._client._syncRequested = true;
            this._client.sync();
            return true;
        } else {
            return false;
        }
    },
    
    /**
     * Notify client for network errors.
     * Close WebScoket.
     */
    _notifyForNetworkError: function() {
        Core.Web.Scheduler.run(Core.method(this, function() { this._stop(true); }));
        this._client._handleNetworkError();
    }
});

Echo.RemoteClient.HTTPAsyncManager = Core.extend(Echo.RemoteClient.AbstractAsyncManager, {
    
    /**
     * The repeating runnable used for server polling.
     *
     * @type Core.Web.Scheduler.Runnable
     */
    _runnable: null,

    /** 
     * Creates a new asynchronous manager basedon Core.Web.HttpConnection.
     *
     * @param {Echo.RemoteClient} client the supported client
     */
    $construct: function(client) {
        Echo.RemoteClient.AbstractAsyncManager.call(this, client);
        this._runnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._pollServerForUpdates), 1000, false);
    },
    
    /**
     * Creates and invokes a new HttpConnection to the server to poll the server and determine whether
     * it has any updates that need to be pushed to the client.
     */
    _pollServerForUpdates: function() {
        var conn = new Core.Web.HttpConnection(this._client.getServiceUrl("Echo.AsyncMonitor"), "GET");
        conn.addResponseListener(Core.method(this, this._processPollResponse));
        conn.connect();
    },
    
    /**
     * Response processor for server polling request.
     * In the event a server action is required, this method will submit the client message to the 
     * server immediately.  The server will push any updates into the reciprocated server message.
     * If no action is required, the next polling interval will be scheduled.
     * 
     * @param e the poll response event 
     */
    _processPollResponse: function(e) {
        var responseDocument = e.source.getResponseXml();
        if (e.valid && responseDocument && responseDocument.documentElement) {
            this._failedConnectAttempts = 0;
            if (responseDocument.documentElement.getAttribute("request-sync") == "true") {
                if (!this._client._transactionInProgress && !this._client._syncRequested) {                    
                    this._client.sync();
                }
                return;
            }
        } else if (++this._failedConnectAttempts >= Echo.RemoteClient.AbstractAsyncManager.MAX_CONNECT_ATTEMPTS) {
            this._client._handleInvalidResponse(e); 
            this._failedConnectAttempts = 0;
            return;
        }
        
        Core.Web.Scheduler.add(this._runnable);
    },
    
    /**
     * Sets the interval at which the server should be polled.
     * 
     * @param {Number} interval the new polling interval, in milliseconds
     */
    _setInterval: function(interval) {
        this._runnable.timeInterval = interval;
    },
    
    /**
     * Starts server polling for asynchronous tasks.
     */
    _start: function() {
        this._failedConnectAttempts = 0;
        Core.Web.Scheduler.add(this._runnable);
    },
    
    /**
     * Stops server polling for asynchronous tasks.
     */
    _stop: function() {
        Core.Web.Scheduler.remove(this._runnable);
    }
});

/**
 * Client-to-server synchronization message.
 * This object is used to collect state changes on the client and then
 * render an XML version to be POSTed to a server-side Echo application.
 */
Echo.RemoteClient.ClientMessage = Core.extend({

    $static: {
    
        /**
         * @class Utility class for constructing the client properties directive.
         */
        _ClientProperties: Core.extend({
        
            /** 
             * The directive element
             * @type Element 
             */
            _element: null,
            
            /** 
             * The client message on which the client properties directive will be sent.
             * @type Echo.RemoteClient.ClientMessage 
             */
            _clientMessage: null,

            /**        
             * Creates a new ClientProperties directive object.
             * 
             * @param {Echo.RemoteClient.ClientMessage} clientMessage the client message object
             * @param map initial properties to store (key/value pairs)
             */
            $construct: function(clientMessage, map) {
                this._element = clientMessage._document.createElement("dir");
                this._element.setAttribute("proc", "ClientProperties");
                clientMessage._document.documentElement.appendChild(this._element);
                this._clientMessage = clientMessage;
                
                if (map) {
                    for (var key in map) {
                        this._add(key, map[key]);
                    }
                }
            },
            
            /**
             * Constructs a property element with the given key-value pair and adds that to the 
             * client properties directive in the client message.
             * 
             * @param {String} key the key
             * @param value the value
             */
            _add: function(key, value) {
                if (value == null) {
                    return;
                }
                var element = this._clientMessage._document.createElement("p");
                element.setAttribute("n", key);
                Echo.Serial.storeProperty(this._clientMessage._client, element, value);
                this._element.appendChild(element);
            }
        })
    },
    
    /**
     * The RemoteClient which generated this message.
     * @type Echo.RemoteClient
     */
    _client: null,
    
    /**
     * Mapping between component ids and updated property values.
     * Values in this map are updated by the storeProperty() method.
     * These values will be rendered to XML when required.
     */
    _componentIdToPropertyMap: null,

    /**
     * Id of the component which fired the event that is responsible for
     * the client message being sent to the server.
     * @type String
     */
    _eventComponentId: null,
    
    /**
     * Type of event fired to cause server interaction.
     * @type String
     */
    _eventType: null,
    
    /**
     * Event data object of event responsible for server interaction.
     */
    _eventData: null,
    
    /**
     * The DOM object to which the client message will be rendered.
     * @type Document
     */
    _document: null,

    /**
     * Creates a new client message.
     *
     * @param {Echo.RemoteClient} client the RemoteClient
     * @param {String} initId the initialization id provided to the RemoteClient constructor (if this an initialization request) 
     *        or null if it is not
     */
    $construct: function(client, initId) {
        this._client = client;
        this._componentIdToPropertyMap = {};
        
        this._document = Core.Web.DOM.createDocument("http://www.nextapp.com/products/echo/svrmsg/clientmessage.3.0", "cmsg");
        if (initId != null) {
            this._document.documentElement.setAttribute("t", "init");
            this._document.documentElement.setAttribute("w", Echo.Client.windowId);
            this._document.documentElement.setAttribute("ii", initId);
            this._renderClientProperties();
        }
    },
    
    /**
     * Queries the application for the currently focused component and renders
     * this information to the client message DOM.
     */
    _renderCFocus: function() {
        if (!this._client.application) {
            return;
        }
        var focusedComponent = this._client.application.getFocusedComponent();
        if (focusedComponent && focusedComponent.renderId.substring(0,2) == "C.") {
            var cFocusElement = this._document.createElement("dir");
            cFocusElement.setAttribute("proc", "CFocus");
            var focusElement = this._document.createElement("focus");
            focusElement.setAttribute("i", focusedComponent.renderId);
            cFocusElement.appendChild(focusElement);
            this._document.documentElement.appendChild(cFocusElement);
        }
    },
    
    /**
     * Renders component hierarchy state change information to the client message DOM.
     * This information is retrieved from instance variables of the client message object,
     * i.e., the component-id-to-property-value map and event properties.  
     */
    _renderCSync: function() {
        var cSyncElement = this._document.createElement("dir");
        cSyncElement.setAttribute("proc", "CSync");
        
        // Render event information.
        if (this._eventType) {
            var eElement = this._document.createElement("e");
            eElement.setAttribute("t", this._eventType);
            eElement.setAttribute("i", this._eventComponentId);
            if (this._eventData != null) {
                Echo.Serial.storeProperty(this._client, eElement, this._eventData);
            }
            cSyncElement.appendChild(eElement);
        }
        
        // Render property information.
        for (var componentId in this._componentIdToPropertyMap) {
            var propertyMap = this._componentIdToPropertyMap[componentId];
            var component = this._client.application.getComponentByRenderId(componentId);
            for (var propertyName in propertyMap) {
                var propertyValue = propertyMap[propertyName];
                var pElement = this._document.createElement("p");
                pElement.setAttribute("i", componentId);
                pElement.setAttribute("n", propertyName);
                Echo.Serial.storeProperty(this._client, pElement, propertyValue);
                cSyncElement.appendChild(pElement);
            }
        }
        
        this._document.documentElement.appendChild(cSyncElement);
    },
    
    /**
     * Renders information about the client environment to the client message DOM.
     * This information is rendered only in the first client message to the server.
     */
    _renderClientProperties: function() {
        var env = Core.Web.Env;
        var cp = new Echo.RemoteClient.ClientMessage._ClientProperties(this, {
            screenWidth: screen.width,
            screenHeight: screen.height,
            screenColorDepth: screen.colorDepth,
            utcOffset: 0 - parseInt(new Date().getTimezoneOffset(), 10),

            navigatorAppName: window.navigator.appName,
            navigatorAppVersion: window.navigator.appVersion,
            navigatorAppCodeName: window.navigator.appCodeName,
            navigatorCookieEnabled: window.navigator.cookieEnabled,
            navigatorJavaEnabled: window.navigator.javaEnabled(),
            navigatorLanguage: window.navigator.language ? window.navigator.language : window.navigator.userLanguage,
            navigatorPlatform: window.navigator.platform,
            navigatorUserAgent: window.navigator.userAgent,

            browserChrome: env.BROWSER_CHROME,
            browserOpera: env.BROWSER_OPERA,
            browserSafari: env.BROWSER_SAFARI,
            browserKonqueror: env.BROWSER_KONQUEROR,
            browserMozillaFirefox: env.BROWSER_FIREFOX,
            browserMozilla: env.BROWSER_MOZILLA,
            browserInternetExplorer: env.BROWSER_INTERNET_EXPLORER,
            browserVersionMajor: env.BROWSER_VERSION_MAJOR,
            browserVersionMinor: env.BROWSER_VERSION_MINOR,

            engineGecko: env.ENGINE_GECKO,
            engineKHTML: env.ENGINE_KHTML,
            engineMSHTML: env.ENGINE_MSHTML,
            enginePresto: env.ENGINE_PRESTO,
            engineWebKit: env.ENGINE_WEBKIT,
            engineVersionMajor: env.ENGINE_VERSION_MAJOR,
            engineVersionMinor: env.ENGINE_VERSION_MINOR
        });
    },
    
    /**
     * Renders all information to the XML DOM and returns it.
     * 
     * @return the DOM
     * @type Document
     */
    _renderXml: function() {
        if (!this._rendered) {
            this._renderCFocus();
            this._renderCSync();
            this._document.documentElement.setAttribute("i", this._client.transactionId);
            this._rendered = true;
        }
        return this._document;
    },
    
    /**
     * Sets the event that will cause the client-server interaction.
     *
     * @param {String} componentId the renderId of the event-firing component
     * @param {String} eventType the type of the event
     * @param the event data object
     */
    setEvent: function(componentId, eventType, eventData) {
        if (this._eventComponentId) {
            return;
        }
        this._eventComponentId = componentId;
        this._eventType = eventType;
        this._eventData = eventData;
    },
    
    /**
     * Stores information about a property change to a component.
     *
     * @param {String} componentId the renderId of the component
     * @param {String} propertyName the name of the property
     * @param the new property value
     */
    storeProperty: function(componentId, propertyName, propertyValue) {
        var propertyMap = this._componentIdToPropertyMap[componentId];
        if (!propertyMap) {
            propertyMap = {};
            this._componentIdToPropertyMap[componentId] = propertyMap;
        }
        propertyMap[propertyName] = propertyValue;
    },
    
    hasStoredProperties: function() {
        for(var property in this._componentIdToPropertyMap) {
            if(this._componentIdToPropertyMap.hasOwnProperty(property)) {
                return true;
            }
        }
        return false;
    }
});

/**
 * Namespace/base class for command execution peers.
 * @namespace
 */
Echo.RemoteClient.CommandExec = Core.extend({ 
    
    $abstract: true,

    $static: {

        /** 
         * Executes the command.
         * Command implementations should override.  Not inherited, provided for documentation purposes.
         * 
         * @param {Echo.Client} client the client
         * @param commandData object containing command properties provided from server
         */
        execute: function(client, commandData) { }
    }
});

/**
 * Server message processing facility.
 * Parses XML DOM of message received from server, first loading required modules and then delegating to registered server message
 * directive processors. 
 */
Echo.RemoteClient.ServerMessage = Core.extend({

    $static: {
    
        /**
         * Mapping between processor names and instantiable <code>Echo.RemoteClient.DirectiveProcessor</code> types.
         */
        _processorClasses: { },
        
        /**
         * Registers a server message directive processor.
         * 
         * @param {String} name the processor name
         * @param {Echo.RemoteClient.DirectiveProcessor} the processor
         */
        addProcessor: function(name, processor) {
            this._processorClasses[name] = processor;
        }
    },
    
    /**
     * @type Echo.RemoteClient
     */
    client: null,
    
    /** Provided transaction id. */
    transactionId: null,
    
    /** 
     * The server message DOM. 
     * @type Document
     */
    document: null,
    
    /**
     * Listener storage facility.
     * @type Core.ListenerList
     */
    _listenerList: null,
    
    /**
     * Mapping between directive processor names and processor instances.
     */
    _processorInstances: null,
    
    /**
     * Flag indicating whether full-resynchronization is required.
     */
    resync: false,

    /**
     * Creates a new <code>ServerMessage</code>.
     * 
     * @param {Echo.RemoteClient} the client
     * @param {Document} the received server message DOM
     */
    $construct: function(client, xmlDocument) { 
        this.client = client;
        this.document = xmlDocument;
        this._listenerList = new Core.ListenerList();
        this._processorInstances = { };
        this.transactionId = xmlDocument.documentElement.getAttribute("i");
        if (xmlDocument.documentElement.getAttribute("resync")) {
            this.resync = true;
        }
    },
    
    /**
     * Adds a completion listener to be notified when the server message has been processed.
     * 
     * @param {Function} l the listener to add
     */
    addCompletionListener: function(l) {
        this._listenerList.addListener("completion", l);
    },
    
    /**
     * Begins processing.  This method may return asynchronously, completion listeners should be registered to determine
     * when processing has completed.
     */
    process: function() {
        // Processing phase 1: load libraries.
        var libsElement = Core.Web.DOM.getChildElementByTagName(this.document.documentElement, "libs");
        if (libsElement) {
            var libraryGroup = new Core.Web.Library.Group();
            var element = libsElement.firstChild;
            while (element) {
                if (element.nodeType == 1) {
                    if (element.nodeName == "lib") {
                        var url = this.client._getLibraryServiceUrl(element.firstChild.data);
                        var type = element.getAttribute("type");
                        libraryGroup.add(url, type);
                    }
                }
                element = element.nextSibling;
            }
            if (libraryGroup.hasNewLibraries()) {
                libraryGroup.addLoadListener(Core.method(this, this._processPostLibraryLoad));
                libraryGroup.load();
            } else {
                this._processPostLibraryLoad();
            }
        } else {
            this._processPostLibraryLoad();
        }
    },
    
    /**
     * Performs processing operations after required JavaScript modules have been loaded.
     * May have been invoked directly by <code>process()</code> or as a Core.Web.LibraryGroup loadListener.
     * Notifies completion listeners of processing completion.
     */
    _processPostLibraryLoad: function(e) {
        try {
            if (Echo.Client.profilingTimer) {
                Echo.Client.profilingTimer.mark("lib"); // Library Loading
            }
            
            if (e && !e.success) {
                this.client.fail("Cannot install library: " + e.url + " Exception: " + e.ex);
                return;
            }
            
            // Processing phase 2: invoke directives.
            var groupElements = Core.Web.DOM.getChildElementsByTagName(this.document.documentElement, "group");
            for (var i = 0; i < groupElements.length; ++i) {
                var dirElements = Core.Web.DOM.getChildElementsByTagName(groupElements[i], "dir");
                for (var j = 0; j < dirElements.length; ++j) {
                    var procName = dirElements[j].getAttribute("proc");
                    var processor = this._processorInstances[procName];
                    if (!processor) {
                        // Create new processor instance.
                        if (!Echo.RemoteClient.ServerMessage._processorClasses[procName]) {
                            throw new Error("Invalid processor specified in ServerMessage: " + procName);
                        }
                        processor = new Echo.RemoteClient.ServerMessage._processorClasses[procName](this.client);
                        this._processorInstances[procName] = processor;
                    }
                    processor.process(dirElements[j]);
                }
            }
        
            // Complete: notify listeners of completion.
            this._listenerList.fireEvent({type: "completion", source: this});
            
            // Start server push listener if required.
            var async_interval = parseInt(this.document.documentElement.getAttribute("async-interval"), 10);
            var ws_enable = this.document.documentElement.getAttribute("ws-enable") == "true";
            if (async_interval) {
                if (Core.Web.WebSocketConnection.isAvailable() && ws_enable) {
                    if (!this.client._asyncManager) {
                        this.client._asyncManager = new Echo.RemoteClient.WebSocketAsyncManager(this.client);
                    }
                } else {
                    if (!this.client._asyncManager) {
                        this.client._asyncManager = new Echo.RemoteClient.HTTPAsyncManager(this.client);
                    }
                    this.client._asyncManager._setInterval(async_interval);
                }
                this.client._asyncManager._start();
            }
        } catch (ex) {
            this.client.fail("Exception: " + ex + " -> " + ex.stack);
        }
    },
    
    /**
     * Removes a completion listener to be notified when the server message has been processed.
     * 
     * @param {Function} l the listener to remove
     */
    removeCompletionListener: function(l) {
        this._listenerList.removeListener("completion", l);
    }
});

// Echo.RemoteClient.DirectiveProcessor Implementations

/**
 * SerevrMessage directive processor for general application-related synchronization.
 */
Echo.RemoteClient.ApplicationSyncProcessor = Core.extend(Echo.RemoteClient.DirectiveProcessor, {
    
    $load: function() {
        Echo.RemoteClient.ServerMessage.addProcessor("AppSync", this);
    },
    
    /** @see #Echo.RemoteClient.DirectiveProcessor#process */
    process: function(dirElement) {
        var propertyElement = dirElement.firstChild;
        while (propertyElement) {
            if (propertyElement.nodeName == "locale") {
                this.client.application.setLocale(propertyElement.firstChild.nodeValue);
            }
            if (propertyElement.nodeName == "dir") {
                this.client.application.setLayoutDirection(propertyElement.firstChild.nodeValue === "rtl" ?
                        Echo.LayoutDirection.RTL : Echo.LayoutDirection.LTR);
            }
            if (propertyElement.nodeName == "config") {
                // Install customized configuration.
                var pElement = propertyElement.firstChild;
                while (pElement) {
                    Echo.Serial.loadProperty(this.client, pElement, null, this.client.configuration, null);
                    pElement = pElement.nextSibling;
                }
            }
            propertyElement = propertyElement.nextSibling;
        }
    }
});

/**
 * SerevrMessage directive processor for command executions.
 */
Echo.RemoteClient.CommandExecProcessor = Core.extend(Echo.RemoteClient.DirectiveProcessor, {

    $static: {
    
        /** Mapping between command type names and command peer objects */
        _typeToPeerMap: {},
        
        /**
         * Registers a command execution peer.
         *
         * @param {String} type the command type name
         * @param {Echo.RemoteClient.CommandExec} commandPeer an object providing an 'execute()' method which be invoked to 
         *        execute the command.
         */
        registerPeer: function(type, commandPeer) {
            Echo.RemoteClient.CommandExecProcessor._typeToPeerMap[type] = commandPeer;
        }
    },
    
    $load: function() {
        Echo.RemoteClient.ServerMessage.addProcessor("CmdExec", this);
    },
    
    /** @see #Echo.RemoteClient.DirectiveProcessor#process */
    process: function(dirElement) {
        var cmdElement = dirElement.firstChild;
        while (cmdElement) {
            var type = cmdElement.getAttribute("t");
            var commandPeer = Echo.RemoteClient.CommandExecProcessor._typeToPeerMap[type];
            if (!commandPeer) {
                throw new Error("Command peer not found for: " + type);
            }
            var commandData = {};
            var pElement = cmdElement.firstChild;
            while (pElement) {
                Echo.Serial.loadProperty(this.client, pElement, null, commandData, null);
                pElement = pElement.nextSibling;
            }
            this.client._enqueueCommand(commandPeer, commandData);
            cmdElement = cmdElement.nextSibling;
        }
    }
});

/**
 * ServerMessage directive processor for component focus.
 */
Echo.RemoteClient.ComponentFocusProcessor = Core.extend(Echo.RemoteClient.DirectiveProcessor, {

    $load: function() {
        Echo.RemoteClient.ServerMessage.addProcessor("CFocus", this);
    },
    
    /** @see #Echo.RemoteClient.DirectiveProcessor#process */
    process: function(dirElement) {
        var element = dirElement.firstChild;
        while (element) {
            if (element.nodeType == 1 && element.nodeName == "focus") {
                var newComponent = this.client.application.getComponentByRenderId(element.getAttribute("i"));
                if (newComponent != this.client._clientFocusedComponent) {
                    this.client._serverFocusedComponent = newComponent;
                }
            }
            element = element.nextSibling;
        }
    }
});

/**
 * ServerMessage directive processor for component synchronizations (initialization phase).
 * 
 * Processes initialization directives related to component hierarchy.
 * Currently limited to clearing entire hierarchy.
 */
Echo.RemoteClient.ComponentSyncInitProcessor = Core.extend(Echo.RemoteClient.DirectiveProcessor, {

    $load: function() {
        Echo.RemoteClient.ServerMessage.addProcessor("CSyncIn", this);
    },

    /** @see #Echo.RemoteClient.DirectiveProcessor#process */
    process: function(dirElement) {
        var element = dirElement.firstChild;
        while (element) {
            if (element.nodeType == 1 && element.nodeName == "cl") {
                this.client.application.rootComponent.removeAll();
            }
            element = element.nextSibling;
        }
    }
});
    
/**
 * ServerMessage directive processor for component synchronizations (remove phase).
 * 
 * Processes directives to remove components.  Performed before update phase to 
 * bring component hierarchy to a minimal state before updates occur.
 */
Echo.RemoteClient.ComponentSyncRemoveProcessor = Core.extend(Echo.RemoteClient.DirectiveProcessor, {
    
    $static: {
        
        /** 
         * Reverse array sorter for removing components by index from last to first. 
         * @see Array#sort
         */
        _numericReverseSort: function(a, b) {
            return b - a;
        }
    },
    
    $load: function() {
        Echo.RemoteClient.ServerMessage.addProcessor("CSyncRm", this);
    },

    /** @see #Echo.RemoteClient.DirectiveProcessor#process */
    process: function(dirElement) {
        var rmElement = dirElement.firstChild;
        while (rmElement) {
            if (rmElement.nodeType != 1) {
                continue;
            }
            
            // Determine parent component.
            var parentComponent;
            if (rmElement.getAttribute("r") == "true") {
                parentComponent = this.client.application.rootComponent;
            } else {
                var parentId = rmElement.getAttribute("i");
                parentComponent = this.client.application.getComponentByRenderId(parentId);
            }
    
            // Retrieve child ids and remove.
            var childElementIds = rmElement.getAttribute("rm").split(",");
            this._removeComponents(parentComponent, childElementIds);
            
            rmElement = rmElement.nextSibling;
        }
    },
    
    /**
     * Removes components with specified ids from specified parent component.
     * 
     * @param {Echo.Component} parentComponent the parent component
     * @param {Array} childElementIds array containing ids of child elements to remove.  
     */
    _removeComponents: function(parentComponent, childElementIds) {
        var i;

        if (childElementIds.length > 5) {
            // Special case: many children being removed: create renderId -> index map and remove by index
            // in order to prevent Component.indexOf() of from being invoked n times.
            
            // Create map between ids and indices.
            var idToIndexMap = {};
            for (i = 0; i < parentComponent.children.length; ++i) {
                idToIndexMap[parentComponent.children[i].renderId] = i;
            }
            
            // Create array of indices to remove.
            var indicesToRemove = [];
            for (i = 0; i <  childElementIds.length; ++i) {
                var index = idToIndexMap[childElementIds[i]];
                if (index != null) {
                    indicesToRemove.push(parseInt(index, 10));
                }
            }
            indicesToRemove.sort(Echo.RemoteClient.ComponentSyncRemoveProcessor._numericReverseSort);
    
            // Remove components (last to first).
            for (i = 0; i < indicesToRemove.length; ++i) {
                parentComponent.remove(indicesToRemove[i]);
            }
        } else {
            for (i = 0; i < childElementIds.length; ++i) {
                var component = this.client.application.getComponentByRenderId(childElementIds[i]);
                if (component) {
                    parentComponent.remove(component);
                }
            }
        }
    }
});

/**
 * ServerMessage directive processor for component synchronizations (update phase).
 * 
 * Processes directives to update components (add children, update properties), 
 * clear entire component hierarchy (for full-rerender), set stylesheet,
 * and store referenced properties/styles.
 */
Echo.RemoteClient.ComponentSyncUpdateProcessor = Core.extend(Echo.RemoteClient.DirectiveProcessor, {
    
    $load: function() {
        Echo.RemoteClient.ServerMessage.addProcessor("CSyncUp", this);
    },
    
    /** Mapping between referenced property ids and values. */
    _propertyMap : null,

    /** Mapping between referenced style ids and values. */
    _styleMap: null,
    
    /** @see #Echo.RemoteClient.DirectiveProcessor#process */
    process: function(dirElement) {
        var element;
        
        element = dirElement.firstChild;
        while (element) {
            if (element.nodeType == 1) {
                switch (element.nodeName) {
                case "ss": this._processStyleSheet(element); break;
                case "up": this._processUpdate(element); break;
                case "rp": this._processReferencedProperties(element); break;
                case "rs": this._processReferencedStyles(element); break;
                }
            }
            element = element.nextSibling;
        }
    },
    
    /** 
     * Process an "rp" directive to store referenced properties during the synchronization. 
     * 
     * @param {Element} rpElement the directive element 
     */
    _processReferencedProperties: function(rpElement) {
        var propertyElement = rpElement.firstChild;
        while (propertyElement) {
            if (propertyElement.nodeName == "p") {
                var propertyId = propertyElement.getAttribute("i");
                var propertyType = propertyElement.getAttribute("t");
                var translator = Echo.Serial.getPropertyTranslator(propertyType);
                if (!translator) {
                    throw new Error("Translator not available for property type: " + propertyType);
                }
                var propertyValue = translator.toProperty(this.client, propertyElement);
                if (!this._propertyMap) {
                    this._propertyMap = {};
                }
                this._propertyMap[propertyId] = propertyValue;
            }
            propertyElement = propertyElement.nextSibling;
        }
    },
    
    /** 
     * Process an "rs" directive to store referenced styles during the synchronization. 
     * 
     * @param {Element} rsElement the directive element 
     */
    _processReferencedStyles: function(rsElement) {
        var styleElement = rsElement.firstChild;
        while (styleElement) {
            if (styleElement.nodeName == "s") {
                var styleId = styleElement.getAttribute("i");
                var style = { };
                var propertyElement = styleElement.firstChild;
                while (propertyElement) {
                    Echo.Serial.loadProperty(this.client, propertyElement, null, style, this._propertyMap);
                    propertyElement = propertyElement.nextSibling;
                }
                if (!this._styleMap) {
                    this._styleMap = {};
                }
                this._styleMap[styleId] = style;
            }
            styleElement = styleElement.nextSibling;
        }
    },
    
    /** 
     * Process an "ss" directive to load and install a new stylesheet onto the application.
     * 
     * @param {Element} ssElement the directive element 
     */
    _processStyleSheet: function(ssElement) {
        var styleSheet = Echo.Serial.loadStyleSheet(this.client, ssElement);
        this.client.application.setStyleSheet(styleSheet);
    },
    
    /** 
     * Process an "up" directive to update properties and/or add children to a component.
     * 
     * @param {Element} upElement the directive element 
     */
    _processUpdate: function(upElement) {
        // Determine parent component
        var parentComponent;
        if (upElement.getAttribute("r") == "true") {
            parentComponent = this.client.application.rootComponent;
        } else {
            var parentId = upElement.getAttribute("i");
            parentComponent = this.client.application.getComponentByRenderId(parentId);
        }
    
        // Child insertion cursor index (if index is omitted, children are added at this position).
        var cursorIndex = 0;

        var element = upElement.firstChild;
        while (element) {
            if (element.nodeType == 1) {
                switch (element.nodeName) {
                case "c": // Added child
                    var component = Echo.Serial.loadComponent(this.client, element, this._propertyMap, this._styleMap);
                    var index = element.getAttribute("x");
                    if (index == null) {
                        // No index specified, add children at current insertion cursor position.
                        parentComponent.add(component, cursorIndex);
                        ++cursorIndex;
                    } else {
                        // Index specified, add child at index, set insertion cursor position to index + 1.
                        index = parseInt(index, 10);
                        parentComponent.add(component, index);
                        cursorIndex = index + 1;
                    }
                    break;
                case "p": // Property update
                    Echo.Serial.loadProperty(this.client, element, parentComponent, null, this._propertyMap);
                    break;
                case "s": // Style name update
                    parentComponent.setStyleName(element.firstChild ? element.firstChild.nodeValue : null);
                    break;
                case "sr": // Style reference update
                    if (element.firstChild) {
                        parentComponent.setStyle(this._styleMap ? this._styleMap[element.firstChild.nodeValue] : null);
                    } else {
                        parentComponent.setStyle(null);
                    }
                    break;
                case "e": // Event update
                    var eventType = element.getAttribute("t");
                    if (element.getAttribute("v") == "true") {
                        this.client.removeComponentListener(parentComponent, eventType);
                        this.client.addComponentListener(parentComponent, eventType);
                    } else {
                        this.client.removeComponentListener(parentComponent, eventType);
                    }
                    break;
                case "en": // Enabled state update
                    parentComponent.setEnabled(element.firstChild.nodeValue == "true");
                    break;
                case "locale": // Locale update
                    parentComponent.setLocale(element.firstChild ? element.firstChild.nodeValue : null);
                    break;
                case "dir": // Layout direction update
                    parentComponent.setLayoutDirection(element.firstChild ?
                            (element.firstChild.nodeValue == "rtl" ? Echo.LayoutDirection.RTL : Echo.LayoutDirection.LTR) : null);
                    break;
                }
            }
            element = element.nextSibling;
        }
    }
});
