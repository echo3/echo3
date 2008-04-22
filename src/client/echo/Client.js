/**
 * Abstract base class for Echo clients.
 * @namespace
 */
Echo.Client = Core.extend({
    
    $static: {
    
        /**
         * Flag for verifyInput() flags parameter, indicating that input is 
         * a property update.
         */
        FLAG_INPUT_PROPERTY: 0x1,

        /**
         * Global array containing all active client instances in the current browser window.
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
     * The root DOM element in which the application is contained.
     */
    domainElement: null,
    
    /**
     * The application being managed by this client.
     */
    application: null,
    
    /**
     * Flag indicating whether a focus update is required once the renderer has completed its next update cycle.
     */
    focusUpdateRequired: false,
    
    /**
     * Id of last issued input restriction id (incremented to deliver unique identifiers). 
     * @type Integer
     * @private
     */
    _lastInputRestrictionId: 0,
    
    /**
     * Number of currently registered input restrictions.
     * @type Integer
     * @private
     */
    _inputRestrictionCount: 0,
    
    /**
     * Id (String) map containing input restrictions.
     * Values are booleans, true indicating property updates are NOT restricted, and false
     * indicated all updates are restricted.
     * @type Object
     * @private
     */
    _inputRescriptionMap: null,
    
    _keyPressListener: null,
    
    _applicationFocusListener: null,
    
    /**
     * The parent client.
     */
    parent: null,

    /**
     * Creates a new Client instance.  Derived classes must invoke.
     */
    $construct: function() { 
        this._inputRestrictionMap = { };
        this._keyPressListener = Core.method(this, this._processKeyPress);
        this._applicationFocusListener = Core.method(this, this._processApplicationFocus);
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
         * @param component optional parameter indicating the component to query (if omitted, only the
         *        applications readiness state will be investigated)
         * @param flags optional flags describing the property update, one or more of the following flags
         *        ORed together:
         *        <ul>
         *         <li><code>FLAG_INPUT_PROPERTY</code></li>
         *        </ul>
         * @return true if the application/component are ready to receive input
         */
        verifyInput: function(component, flags) {
            // Check for input restrictions.
            if (this._inputRestrictionCount != 0) {
                if (!flags & Echo.Client.FLAG_INPUT_PROPERTY) {
                    // Input is not a property update, automatically return false if any input restrictions pressent.
                    return false;
                }
                for (var x in this._inputRestrictionMap) {
                    if (this._inputRestrictionMap[x] === false) {
                        // Input restriction set to false, indicating no updates, not even property updates.
                        return false;
                    }
                }
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
     * @param application the application the client will support (if configuring)
     *        or null (if deconfiguring)
     * @param domainElement the DOM element into which the client will be rendered (if configuring),
     *        or null (if deconfiguring)
     */
    configure: function(application, domainElement) {
        if (this.application) {
            Core.Arrays.remove(Echo.Client._activeClients, this);
            Core.Web.Event.remove(this.domainElement, 
                    Core.Web.Env.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress", this._keyPressListener, false);
            this.application.removeListener("focus", this._applicationFocusListener);
        }
        
        this.application = application;
        this.domainElement = domainElement;
    
        if (this.application) {
            this.application.addListener("focus", this._applicationFocusListener);
            Core.Web.Event.add(this.domainElement, 
                    Core.Web.Env.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress", this._keyPressListener, false);
            Echo.Client._activeClients.push(this);
        }
    },
    
    /**
     * Registers a new input restriction.  Input will be restricted until this and all other
     * input restrictiosn are removed.
     *
     * @param {Boolean} allowPropertyUpdates flag indicating whether property updates should be
     *        allowed (if true) or whether all input should be restricted (if false)
     * @return a handle identifier for the input restriction, which will be used to unregister
     *         the restriction by invoking removeInputRestriction()
     */
    createInputRestriction: function(allowPropertyUpdates) {
        var id = (++this._lastInputRestrictionId).toString();
        ++this._inputRestrictionCount;
        this._inputRestrictionMap[id] = allowPropertyUpdates;
        return id;
    },
    
    /**
     * Listener for application change of component focus:
     * invokes focus() method on focused component's peer.
     * 
     * @param {Event} e the event
     */
    _processApplicationFocus: function(e) {
        var focusedComponent = this.application.getFocusedComponent();
        if (focusedComponent && focusedComponent.peer && focusedComponent.peer.renderFocus) {
            focusedComponent.peer.renderFocus();
            this.focusUpdateRequired = false;
        } else {
            this.focusUpdateRequired = true;
        }
    },
    
    /**
     * Root KeyDown event handler.
     * Specifically processes tab key events for focus management.
     * 
     * @param {Event} e the event
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
     * Removes an input restriction.
     *
     * @param id the id (handle) of the input restriction to remove
     */
    removeInputRestriction: function(id) {
        if (this._inputRestrictionMap[id] === undefined) {
            return;
        }
        delete this._inputRestrictionMap[id];
        --this._inputRestrictionCount;
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
 * Provides a tool for measuring performance of the Echo3 client engine.
 */
Echo.Client.Timer = Core.extend({

    _times: null,
    
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

