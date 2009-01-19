/**
 * Abstract base class for Echo clients.
 * @namespace
 */
Echo.Client = Core.extend({
    
    $static: {
    
        /**
         * Global array containing all active client instances in the current browser window.
         * @type Array
         */
        _activeClients: [],

        /**
         * Global listener to respond to resizing of browser window.
         * Invokes _windowResizeListener() method on all active clients.
         * 
         * @param e the DOM resize event
         */
        _globalWindowResizeListener: function(e) {
            for (var i = 0; i < Echo.Client._activeClients.length; ++i) {
                Echo.Client._activeClients[i]._windowResizeListener(e);
            }
        }
    },
    
    $load: function() {
        // Register resize listener on containing window one time.
        Core.Web.DOM.addEventListener(window, "resize", this._globalWindowResizeListener, false);
    },

    /**
     * Flag indicating the user interface should be rendered in design-mode, where all rendered component elements are
     * assigned an id.
     * @type Boolean
     */
    designMode: false,
    
    /**
     * The root DOM element in which the application is contained.
     * @type Element
     */
    domainElement: null,
    
    /**
     * The application being managed by this client.
     * @type Echo.Application
     */
    application: null,
    
    /**
     * Id of last issued input restriction id (incremented to deliver unique identifiers). 
     * @type Number
     */
    _lastInputRestrictionId: 0,
    
    /**
     * Number of currently registered input restrictions.
     * @type Number
     */
    _inputRestrictionCount: 0,
    
    /** 
     * Echo.Component renderId-to-restriction listener mapping.
     */
    _inputRestrictionListeners: null,
    
    /**
     * Id (String) map containing input restrictions.
     * Values are booleans, true indicating property updates are NOT restricted, and false
     * indicated all updates are restricted.
     */
    _inputRescriptionMap: null,
    
    /**
     * Method reference to this._processKeyPressRef().
     * @type Function
     */
    _processKeyPressRef: null,
    
    /**
     * Method reference to this._processApplicationFocus().
     * @type Function
     */
    _processApplicationFocusRef: null,
    
    /**
     * The parent client.
     * @type Echo.Client
     */
    parent: null,

    /**
     * Creates a new Client instance.  Derived classes must invoke.
     */
    $construct: function() { 
        this._inputRestrictionMap = { };
        this._processKeyPressRef = Core.method(this, this._processKeyPress);
        this._processApplicationFocusRef = Core.method(this, this._processApplicationFocus);
    },
    
    $abstract: true,
    
    $virtual: {

        /**
         * Returns the URL of a resource based on package name / 
         * resource name information.
         * Derived implementations should generally override this
         * method, and delegate to superclass if they are unable
         * to provide a resource for a specific URL.
         * Default implementation delegates to parent client
         * (if one is present) or otherwise returns null.
         * 
         * @param {String} packageName the package name in which the resource is contained
         * @param {String} resourceName the resource name
         * @return the full URL
         * @type String
         */
        getResourceUrl: function(packageName, resourceName) {
            if (this.parent) {
                return this.parent.getResourceUrl(packageName, resourceName);
            } else {
                return null;
            }
        },

        /**
         * Determines if the specified component and containing application is ready to receive input.
         * This method should be overridden by client implementations as needed, returning the value
         * from this implementation if the client has no other reason to disallow input.
         * 
         * @param {Echo.Component} component optional parameter indicating the component to query (if omitted, only the
         *        application's readiness state will be investigated)
         * @return true if the application/component are ready to receive input
         * @type Boolean
         */
        verifyInput: function(component) {
            // Check for input restrictions.
            if (this._inputRestrictionCount !== 0) {
                return false;
            }
        
            if (component) {
                return component.isActive();
            } else {
                return this.application.isActive();
            }
        },
        
        /**
         * Default dispose implementation.
         * Invokes configure(null, null) to deconfigure the client. 
         */
        dispose: function() {
            this.configure(null, null);
        }
    },
    
    /**
     * Configures/Deconfigures the client.  This method must be invoked
     * with the supported application/containing domain element before
     * the client is used, and invoked with null values before it is
     * disposed (in order to clean up resources).
     * 
     * @param {Echo.Application} application the application the client will support (if configuring)
     *        or null (if deconfiguring)
     * @param {Element} domainElement the DOM element into which the client will be rendered (if configuring),
     *        or null (if deconfiguring)
     */
    configure: function(application, domainElement) {
        if (this.application) {
            Core.Arrays.remove(Echo.Client._activeClients, this);
            Core.Web.Event.remove(this.domainElement, 
                    Core.Web.Env.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress", this._processKeyPressRef, false);
            this.application.removeListener("focus", this._processApplicationFocusRef);
        }
        
        this.application = application;
        this.domainElement = domainElement;
    
        if (this.application) {
            this.application.addListener("focus", this._processApplicationFocusRef);
            Core.Web.Event.add(this.domainElement, 
                    Core.Web.Env.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress", this._processKeyPressRef, false);
            Echo.Client._activeClients.push(this);
        }
    },
    
    /**
     * Registers a new input restriction.  Input will be restricted until this and all other
     * input restrictions are removed.
     *
     * @return a handle identifier for the input restriction, which will be used to unregister
     *         the restriction by invoking removeInputRestriction()
     */
    createInputRestriction: function() {
        var id = (++this._lastInputRestrictionId).toString();
        ++this._inputRestrictionCount;
        this._inputRestrictionMap[id] = true;
        return id;
    },
    
    /**
     * Handles an application failure, refusing future input and displaying an error message over the entirety of the domain 
     * element.
     * 
     * @param {String} msg the message to display (a generic message will be used if omitted) 
     */
    fail: function(msg) {
        // Block future input.
        this.createInputRestriction(false);
        
        // Default message.
        msg = msg || "This application has been stopped due to an error. Press the reload or refresh button.";
        
        // Darken screen.
        if (!Core.Web.Env.NOT_SUPPORTED_CSS_OPACITY) {
            var blackoutDiv = document.createElement("div");
            blackoutDiv.style.cssText = "position:absolute;z-index:32766;width:100%;height:100%;background-color:#000000;"
                    + "opacity:0.75;"
            this.domainElement.appendChild(blackoutDiv);
        }

        // Display fail message.
        var div = document.createElement("div");
        div.style.cssText = "position:absolute;z-index:32767;width:100%;height:100%;"
        this.domainElement.appendChild(div);
        var msgDiv = document.createElement("div");
        msgDiv.style.cssText = "border:#5f1f1f outset 1px;background-color:#5f1f1f;color:#ffffff;padding:2px 10px;";
        msgDiv.appendChild(document.createTextNode(msg));
        div.appendChild(msgDiv);
        var xDiv = document.createElement("div");
        xDiv.style.cssText = "color:red;line-height:90%;font-size:" + 
                (new Core.Web.Measure.Bounds(this.domainElement).height || 100) + 
                "px;text-align:center;overflow:hidden;";
        xDiv.appendChild(document.createTextNode("X"));
        div.appendChild(xDiv);
        
        // Attempt to dispose.
        this.dispose();
    },
    
    /**
     * Listener for application change of component focus:
     * invokes focus() method on focused component's peer.
     * 
     * @param e the event
     */
    _processApplicationFocus: function(e) {
        var focusedComponent = this.application.getFocusedComponent();
        if (focusedComponent && focusedComponent.peer && focusedComponent.peer.renderFocus) {
            focusedComponent.peer.renderFocus();
        }
    },
    
    /**
     * Root KeyDown event handler.
     * Specifically processes tab key events for focus management.
     * 
     * @param e the event
     */
    _processKeyPress: function(e) {
        if (e.keyCode == 9) { // Tab
            this.application.focusNext(e.shiftKey);
            Core.Web.DOM.preventEventDefault(e);
            return false; // Stop propagation.
        }
        return true; // Allow propagation.
    },
    
    /**
     * Processes updates to the component hierarchy.
     * Invokes <code>Echo.Render.processUpdates()</code>.
     */
    processUpdates: function() {
        var ir = null;
        try {
            ir = this.createInputRestriction();
            Echo.Render.processUpdates(this);
        } finally {
            this.removeInputRestriction(ir);
        }
    },
    
    /**
     * Registers a listener to be notified when all input restrictions have been removed.
     * 
     * @param {Echo.Component} component the component for which the restriction listener is being registered
     * @param {Function} l the method to notify when all input restrictions have been cleared 
     */
    registerRestrictionListener: function(component, l) {
        if (!this._inputRestrictionListeners) {
            this._inputRestrictionListeners = { };
        }
        this._inputRestrictionListeners[component.renderId] = l;
    },
    
    /**
     * Removes an input restriction.
     *
     * @param {String} id the id (handle) of the input restriction to remove
     */
    removeInputRestriction: function(id) {
        if (this._inputRestrictionMap[id] === undefined) {
            return;
        }
        delete this._inputRestrictionMap[id];
        --this._inputRestrictionCount;
        
        if (this._inputRestrictionCount == 0 && this._inputRestrictionListeners) {
            // Last input restriction removed: notify input restriction listeners.
            for (var x in this._inputRestrictionListeners) {
                this._inputRestrictionListeners[x]();
            }
            this._inputRestrictionListeners = null;
        }
    },
    
    /**
     * Instance listener to respond to resizing of browser window.
     * 
     * @param e the DOM resize event
     */
    _windowResizeListener: function(e) {
        Echo.Render.notifyResize(this.application.rootComponent);
    }
});

/**
 * Provides a debugging tool for measuring performance of the Echo3 client engine.
 * This is generally best used to measure performance before/after modifications. 
 */
Echo.Client.Timer = Core.extend({

    /** Array of times. */
    _times: null,
    
    /** Array of labels. */
    _labels: null,
    
    /**
     * Creates a new debug timer.
     * 
     * @constructor
     */
    $construct: function() {
        this._times = [new Date().getTime()];
        this._labels = ["Start"];
    },
    
    /**
     * Marks the time required to complete a task.  This method should be invoked
     * when a task is completed with the 'label' specifying a description of the task.
     * 
     * @param {String} label a description of the completed task.
     */
    mark: function(label) {
        this._times.push(new Date().getTime());
        this._labels.push(label);
    },
    
    /**
     * Returns a String representation of the timer results, showing how long
     * each task required to complete (and included a total time).
     * 
     * @return the timer results
     * @type String
     */
    toString: function() {
        var out = "";
        for (var i = 1; i < this._times.length; ++i) {
            var time = this._times[i] - this._times[i - 1];
            out += this._labels[i] + ":" + time + " ";
        }
        out += "TOT:" + (this._times[this._times.length - 1] - this._times[0]) + "ms";
        return out;
    }
});
