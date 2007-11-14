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
     * The parent client.
     */
    parent: null,
    
    /**
     * Number of tab keyDown/keyPress events since the last tab keyUp event.
     * Used to handle out-of-order/missing keyDown/keyPress events presented by browsers
     * It is necessary to capture keyDown and keyPress events in order to invoke
     * preventEventDefault() and manually manage all tab processing.  The missing/out-of-order
     * event scenario is handled by ignoring the second KeyPress or KeyDown tab event since the
     * last KeyUp event.
     */
    _tabDown: 0,

    $construct: function() { },
    
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
            WebCore.EventProcessor.remove(this.domainElement, "keydown", 
                    new Core.MethodRef(this, this._processKeyDown), false);
            WebCore.EventProcessor.remove(this.domainElement, "keypress", 
                    new Core.MethodRef(this, this._processKeyPress), false);
            WebCore.EventProcessor.remove(this.domainElement, "keyup", 
                    new Core.MethodRef(this, this._processKeyUp), false);
            this.application.removeFocusListener(new Core.MethodRef(this, this._processApplicationFocus));
        }
        
        this.application = application;
        this.domainElement = domainElement;
    
        if (this.application) {
            this.application.addFocusListener(new Core.MethodRef(this, this._processApplicationFocus));
            WebCore.EventProcessor.add(this.domainElement, "keydown", 
                    new Core.MethodRef(this, this._processKeyDown), false);
            WebCore.EventProcessor.add(this.domainElement, "keyup", 
                    new Core.MethodRef(this, this._processKeyUp), false);
            WebCore.EventProcessor.add(this.domainElement, "keypress", 
                    new Core.MethodRef(this, this._processKeyPress), false);
            EchoClient._activeClients.push(this);
        }
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
        }
    },
    
    /**
     * Root KeyDown event handler.
     * Specifically processes tab key events for focus management.
     * 
     * @param {Event} e the event
     */
    _processKeyDown: function(e) {
        if (e.keyCode == 9) { // Tab
            if (this._tabDown != 1) {
                // See this._tabDown comment for explanation of this unsual code.
                this.application.focusNext(e.shiftKey);
            }
            this._tabDown++;
            WebCore.DOM.preventEventDefault(e);
            return false; // Stop propagation.
        }
        return true; // Allow propagation.
    },
    
    /**
     * Root KeyPress event handler.
     * Specifically processes tab key events for focus management.
     * 
     * @param {Event} e the event
     */
    _processKeyPress: function(e) {
        if (e.keyCode == 9) { // Tab
            if (this._tabDown != 1) {
                // See this._tabDown comment for explanation of this unsual code.
                this.application.focusNext(e.shiftKey);
            }
            this._tabDown++;
            WebCore.DOM.preventEventDefault(e);
            return false; // Stop propagation.
        }
        return true; // Allow propagation.
    },
    
    /**
     * Root KeyUp event handler.
     * Specifically processes tab key events for focus management.
     * 
     * @param {Event} e the event
     */
    _processKeyUp: function(e) {
        this._tabDown = 0;
        return true;
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