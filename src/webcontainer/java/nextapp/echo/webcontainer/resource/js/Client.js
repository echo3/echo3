/**
 * Abstract base class for Echo clients.
 */
EchoClient = Core.extend({
    
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
            for (var i = 0; i < EchoClient._activeClients.length; ++i) {
                EchoClient._activeClients[i]._windowResizeListener(e);
            }
        }
    },
    
    $load: function() {
        // Register resize listener on containing window one time.
        WebCore.DOM.addEventListener(window, "resize", this._globalWindowResizeListener, false);
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
    
    /**
     * The parent client.
     */
    parent: null,

    $construct: function() { 
        this._inputRestrictionMap = { };
    },
    
    $virtual: {

        /**
         * Returns a default named image.
         * May return null if the client does not provide a default image for the specified name.
         * Default implementation delegates to parent client
         * (if one is present) or otherwise returns null.
         * 
         * @param {String} imageName the image name 
         */
        getDefaultImage: function(imageName) {
            if (this.parent) {
                return this.parent.getDefaultImage(imageName);
            } else {
                return null;
            }
        },
        
        /**
         * Returns the URL of a service based on the serviceId.
         * Default implementation delegates to parent client
         * (if one is present) or otherwise returns null.
         * 
         * @param {String} serviceId the serviceId
         * @return the full URL
         * @type String
         */
        getServiceUrl: function(serviceId) {
            if (this.parent) {
                return this.parent.getServiceUrl(serviceId);
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
         * @return true if the application/component are ready to receive inputs
         */
        verifyInput: function(component, flags) {
            // Check for input restrictions.
            if (this._inputRestrictionCount != 0) {
                if (!flags & EchoClient.FLAG_INPUT_PROPERTY) {
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
            Core.Arrays.remove(EchoClient._activeClients, this);
            WebCore.EventProcessor.remove(this.domainElement, 
                    WebCore.Environment.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress",
                    new Core.MethodRef(this, this._processKeyPress), false);
            this.application.removeFocusListener(new Core.MethodRef(this, this._processApplicationFocus));
        }
        
        this.application = application;
        this.domainElement = domainElement;
    
        if (this.application) {
            this.application.addFocusListener(new Core.MethodRef(this, this._processApplicationFocus));
            WebCore.EventProcessor.add(this.domainElement, 
                    WebCore.Environment.QUIRK_IE_KEY_DOWN_EVENT_REPEAT ? "keydown" : "keypress",
                    new Core.MethodRef(this, this._processKeyPress), false);
            EchoClient._activeClients.push(this);
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
            Core.Debug.consoleWrite("OLD focused: " + this.application.getFocusedComponent());
            this.application.focusNext(e.shiftKey);
            Core.Debug.consoleWrite("NEW focused: " + this.application.getFocusedComponent());
            WebCore.DOM.preventEventDefault(e);
            return false; // Stop propagation.
        }
        return true; // Allow propagation.
    },
    
    /**
     * Removes an input restriction.
     *
     * @param id the id of the input restriction to remove
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
        EchoRender.notifyResize(this.application.rootComponent);
    }
});