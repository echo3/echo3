/**
 * Abstract base class for Echo clients.
 * @namespace
 */
Echo.Client = Core.extend({
    
    $static: {

        /**
         * Default client configuration, copied into client configuration.
         */
        DEFAULT_CONFIGURATION: {
            "StopError.Message": "This application has been stopped due to an error.",
            "WaitIndicator.Text": "Please wait...",
            "Action.Continue": "Continue",
            "Action.Restart": "Restart Application"
        },
        
        /**
         * Style property value for <code>displayError</code> indicating a critical error.
         * @type Number
         */
        STYLE_CRITICAL: 0,

        /**
         * Style property value for <code>displayError</code> indicating a message.
         * @type Number
         */
        STYLE_MESSAGE: 1,
    
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
     * Application-configurable properties.
     * Initialized at construction, this value should never be set, only individual properties of the configuration may
     * be modified.
     * @type Object
     */
    configuration: null,
    
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
     * The renderId of the compoennt which was focused during the last received <code>keyDown</code> event.
     */
    _keyFocusedComponentId: null,
    
    /**
     * Last received keycode from <code>keydown</code> event.  Used for firing cross-browser <Code>keypress</code> events.
     * @type Number
     */
    _lastKeyCode: null,
    
    /**
     * Method reference to this._processKey().
     * @type Function
     */
    _processKeyRef: null,
    
    /**
     * Flag indicating wait indicator is active.
     * @type Boolean
     */
    _waitIndicatorActive: false, 
    
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
     * Wait indicator.
     * @type Echo.Client.WaitIndicator
     */
    _waitIndicator: null,
    
    /**
     * Restriction time before raising wait indicator, in milliseconds.
     * @type Number
     */
    _preWaitIndicatorDelay: 500,
    
    /**
     * Runnable that will trigger initialization of wait indicator.
     * @type Core.Web.Scheduler.Runnable
     */
    _waitIndicatorRunnable: null,

    /**
     * Creates a new Client instance.  Derived classes must invoke.
     */
    $construct: function() { 
        this.configuration = { };
        for (var x in Echo.Client.DEFAULT_CONFIGURATION) {
            this.configuration[x] = Echo.Client.DEFAULT_CONFIGURATION[x];
        }
        
        this._inputRestrictionMap = { };
        this._processKeyRef = Core.method(this, this._processKey);
        this._processApplicationFocusRef = Core.method(this, this._processApplicationFocus);
        this._waitIndicator = new Echo.Client.DefaultWaitIndicator();
        this._waitIndicatorRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._waitIndicatorActivate), 
                this._preWaitIndicatorDelay, false);
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
         * Invokes configure(null, null) to deconfigure the client.  Disables wait indicator. 
         */
        dispose: function() {
            // Deconfigure.
            this.configure(null, null);

            // Disable wait indicator.
            this._setWaitVisible(false);
        }
    },
    
    /**
     * Registers an element (which is not a descendant of <code>domainElement</code>) that will contain rendered components.
     * The client will register event listeners to this element, such that it can provide notification of client-level events
     * to component synchronization peers when they occur within this element and its descendants.
     * Any component adding an element outside of the <code>domainElement</code> should invoke this method with said element.
     * Any object invoking this method <strong>MUST</strong> invoke <code>removeElement</code> when the element will no longer
     * be used.
     * This method should only be invoked <strong>once per element</code>, and only on the <strong>root element</code> of any 
     * element hierarchy added outside of the <code>domainElement</code>.
     * 
     * The common use case for this method is when adding elements directly to the <code>BODY</code> element of the DOM.
     * 
     * @param element the element to register
     * @see #removeElement
     */
    addElement: function(element) {
        Core.Web.Event.add(element, "keypress", this._processKeyRef, false);
        Core.Web.Event.add(element, "keydown", this._processKeyRef, false);
        Core.Web.Event.add(element, "keyup", this._processKeyRef, false);
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
            // Deconfigure current application if one is configured.
            Core.Arrays.remove(Echo.Client._activeClients, this);
            this.removeElement(this.domainElement);
            this.application.removeListener("focus", this._processApplicationFocusRef);
            this.application.doDispose();
            this.application.client = null;
        }
        
        // Update state.
        this.application = application;
        this.domainElement = domainElement;
        
        if (this.application) {
            // Configure new application if being set.
            this.application.client = this;
            this.application.doInit();
            this.application.addListener("focus", this._processApplicationFocusRef);
            this.addElement(this.domainElement);
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
        this._setWaitVisible(true);
        var id = (++this._lastInputRestrictionId).toString();
        ++this._inputRestrictionCount;
        this._inputRestrictionMap[id] = true;
        return id;
    },
    
    /**
     * Displays an error message, locking the state of the client.  The client is unlocked when the user presses an
     * (optionally configurable) action button.
     * 
     * @param {String} message the message to display
     * @param {String} detail optional details about the message (e.g., client-side exception)
     * @param {String} actionText optional text for an action button
     * @param {Function} actionFunction optional function to execute when action button is clicked
     * @param {Number} style the style in which to display the error, one of the following values:
     *        <ul>
     *         <li><code>STYLE_CRITICAL</code>: used to display a critical error (the default)</li>
     *         <li><code>STYLE_MESSAGE</code>: used to display a message to the user</li>
     *        </ul>
     */
    displayError: function(parentElement, message, detail, actionText, actionFunction, style) {
        parentElement = parentElement || document.body;
        
        // Create restriction.
        var restriction = this.createInputRestriction();

        // Disable wait indicator.
        this._setWaitVisible(false);

        // Darken screen.
        var blackoutDiv = document.createElement("div");
        blackoutDiv.style.cssText = "position:absolute;z-index:32766;width:100%;height:100%;background-color:#000000;opacity:0.75";
        if (Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
            blackoutDiv.style.filter = "alpha(opacity=75)";
        }
        parentElement.appendChild(blackoutDiv);
        
        // Render error message.
        var div = document.createElement("div");
        div.style.cssText = "position:absolute;z-index:32767;width:100%;height:100%;overflow:hidden;";
        parentElement.appendChild(div);
        
        var contentDiv = document.createElement("div");
        contentDiv.style.cssText = "color:#ffffff;padding:20px 40px 0px;" + 
              (style === Echo.Client.STYLE_MESSAGE ? "border-bottom:4px solid #1f1faf;background-color:#1f1f5f" :
              "border-bottom:4px solid #af1f1f;background-color:#5f1f1f");
        
        if (message) {
            var messageDiv = document.createElement("div");
            messageDiv.style.cssText = "font-weight: bold; margin-bottom:20px;";
            messageDiv.appendChild(document.createTextNode(message));
            contentDiv.appendChild(messageDiv);
        }
        
        if (detail) {
            var detailDiv = document.createElement("div");
            detailDiv.style.cssText = "max-height:10em;overflow:auto;margin-bottom:20px;";
            detailDiv.appendChild(document.createTextNode(detail));
            contentDiv.appendChild(detailDiv);
        }
        
        div.appendChild(contentDiv);

        if (actionText) {
            var actionDiv = document.createElement("div");
            actionDiv.tabIndex = "0";
            actionDiv.style.cssText = "margin-bottom:20px;cursor:pointer;font-weight:bold;padding:2px 10px;" +
                    (style === Echo.Client.STYLE_MESSAGE ? "border: 1px outset #2f2faf;background-color:#2f2faf;" :
                    "border: 1px outset #af2f2f;background-color:#af2f2f;");
            actionDiv.appendChild(document.createTextNode(actionText));
            contentDiv.appendChild(actionDiv);
            var listener = Core.method(this, function(e) {
                if (e.type != "keypress" || e.keyCode == 13) { 
                    try {
                        // Remove error elements.
                        Core.Web.DOM.removeEventListener(actionDiv, "click", listener, false);
                        Core.Web.DOM.removeEventListener(actionDiv, "keypress", listener, false);
                        div.parentNode.removeChild(div);
                        blackoutDiv.parentNode.removeChild(blackoutDiv);

                        // Remove restriction.
                        this.removeInputRestriction(restriction);
                    } finally {
                        if (actionFunction) {
                            actionFunction();
                        }
                    }
                }
            });
            
            Core.Web.DOM.addEventListener(actionDiv, "click", listener, false);
            Core.Web.DOM.addEventListener(actionDiv, "keypress", listener, false);
            Core.Web.DOM.focusElement(actionDiv);
        }
    },
    
    /**
     * Loads required libraries and then executes a function, adding input restrictions while the libraries are being loaded.
     *
     * @param {Array} requiredLibraries the URLs of the libraries which must be loaded before the function can execute
     * @param {Function} f the function to execute
     */
    exec: function(requiredLibraries, f) {
        var restriction = this.createInputRestriction();
        Core.Web.Library.exec(requiredLibraries, Core.method(this, function(e) {
            if (e && !e.success) {
                this.fail("Cannot install library: " + e.url + " Exception: " + e.ex);
                return;
            }
            this.removeInputRestriction(restriction);
            f();
        }));
    },
    
    /**
     * Handles an application failure.
     * If the "StopError.URI" property of the <code>configuration</code> is set, the window is redirected to that URI.
     * If it is not set, an error message is displayed over the domain element, and further input is refused.  A restart
     * button is provided to reload the document.
     * 
     * @param {String} detail the error details 
     */
    fail: function(detail) {
        var element = this.domainElement;
        try {
            // Attempt to dispose.
            this.dispose();
        } finally {
            if (this.configuration["StopError.URI"]) {
                // Redirect.
                window.location.href = this.configuration["StopError.URI"];
            } else {
                // Display error.
                this.displayError(element, this.configuration["StopError.Message"], detail, this.configuration["Action.Restart"], 
                        function() {
                    window.location.reload();
                });
            }
        }
    },
    
    /**
     * Force various browsers to redraw the screen correctly.  This method is used to workaround the blank screen bug in 
     * Internet Explorer and the CSS positioning bug in Opera. 
     */
    forceRedraw: function() {
        if (this.parent) {
            this.parent.forceRedraw();
        } else if (Core.Web.Env.QUIRK_IE_BLANK_SCREEN) {
            if (this.domainElement && this.domainElement.offsetHeight === 0) {
                // Force IE browser to re-render entire document if the height of the application's domain element measures zero.
                // This is a workaround for an Internet Explorer bug where the browser's rendering engine fundamentally fails and 
                // simply displays a blank screen (commonly referred to on bug-tracker/forum as the "blank screen of death").
                // This bug appears to be most prevalent in IE7. 
                var displayState = document.documentElement.style.display || "";
                document.documentElement.style.display = "none";
                document.documentElement.style.display = displayState;
            }
        }
    },
    
    /**
     * Returns the configured wait indicator.
     *
     * @return the wait indicator
     * @type Echo.Client.WaitIndicator
     */
    getWaitIndicator: function() {
        return this._waitIndicator;
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
     * Event handler for <code>keydown</code>, <code>keypress</code> events, and <code>keyup</code> events.
     * Notifies focsued component (and its ancestry) of event via <code>clientKeyDown</code>, <code>clientKeyPress</code>,
     * and <code>clientKeyUp</code> methods respectively.
     * 
     * @param e the event
     */
    _processKey: function(e) {
        var up = e.type == "keyup",
            press = e.type == "keypress",
            component = this.application.getFocusedComponent(),
            bubble = true,
            keyEvent = null,
            keyCode;
        
        // Determine key code.
        if (press) {
            // If key event is a keypress, retrieve keycode from previous keydown event.
            keyCode = this._lastKeyCode;
        } else {
            // If key event is not a keypress, translate value from event and additionally store in _lastKeyCode property.
            keyCode = this._lastKeyCode = Core.Web.Key.translateKeyCode(e.keyCode);
        }
        
        if (!up) {
            if (keyCode == 8) {
                // Prevent backspace from navigating to previous page.
                var nodeName = e.target.nodeName ? e.target.nodeName.toLowerCase() : null;
                if (nodeName != "input" && nodeName != "textarea") {
                    Core.Web.DOM.preventEventDefault(e);
                }
            } else if (!press && keyCode == 9) {
                // Process tab keydown event: focus next component in application, prevent default browser action.
                this.application.focusNext(e.shiftKey);
                Core.Web.DOM.preventEventDefault(e);
            }
        
            if (press && Core.Web.Env.QUIRK_KEY_PRESS_FIRED_FOR_SPECIAL_KEYS && !e.charCode) {
                // Do nothing in the event no char code is provided for a keypress.
                return true;
            }
        }
            
        if (!component) {
            // No component is focused, take no action.
            return true;
        }

        if (up || press) {
            if (this._keyFocusedComponentId != component.renderId) {
                // Focus has changed: do not fire clientKeyUp/clientKeyPress events.
                return true;
            }
        } else {
            // Store render id of focused component for keyDown events, such that it can be ensured that keyUp/keyPress events
            // will only be fired if that component remains focused when those events are received. 
            this._keyFocusedComponentId = component.renderId;
        }
        
        // Determine event method which should be invoked.
        var eventMethod = press ? "clientKeyPress" : (up ? "clientKeyUp" : "clientKeyDown");
        
        // Fire event to component and ancestry.
        while (component && bubble) {
            if (component.peer && component.peer[eventMethod]) {
                if (!keyEvent) {
                    // Lazy-create key event.
                    keyEvent = { type: e.type, source: this, keyCode: keyCode, domEvent: e };
                    if (press) {
                        keyEvent.charCode = Core.Web.Env.QUIRK_KEY_CODE_IS_CHAR_CODE ? e.keyCode : e.charCode;
                    }
                }
                // Fire event to clientKeyXXX() method.  Continue bubbling event only if clientKeyXXX() method returns true.
                bubble = component.peer[eventMethod](keyEvent);
            }
            component = component.parent;
        }        
        
        return true;
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
            this.removeInputRestriction(ir);
            this.forceRedraw();
        } catch (ex) {
            if (ex.lineNumber) {
                // Display reported line number and adjusted line number (used if script was loaded dynamically).
                Core.Debug.consoleWrite("Reported Line #: " + ex.lineNumber);
                Core.Debug.consoleWrite("Evaluated Line #: " + (ex.lineNumber - Core.Web.Library.evalLine) + 
                        " (if evaluated script)");
            }
            if (ex.stack) {
                // Display stack trace if available (Mozilla browsers).
                Core.Debug.consoleWrite("Exception: " + ex + ", Stack Trace: " + ex.stack);
            }
            this.fail("Exception during Client.processUpdates(): " + ex.message);
            throw (ex);
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
        
        if (this._inputRestrictionCount === 0) {
            // Last input restriction removed.

            // Disable wait indicator.
            this._setWaitVisible(false);
            
            if (this._inputRestrictionListeners) {
                // Copy restriction listeners to intermediate map, so that listeners can register new
                // listeners that will be invoked the next time all input restrictions are removed.
                var listeners = this._inputRestrictionListeners;
                this._inputRestrictionListeners = null;
               
                // Notify input restriction listeners.
                for (var x in listeners) {
                    listeners[x]();
                }
            }
        }
    },
    
    /**
     * Shows/hides wait indicator.
     * 
     * @param {Boolean} visible the new visibility state of the wait indicator
     */
    _setWaitVisible: function(visible) {
        if (visible) {
            if (!this._waitIndicatorActive) {
                this._waitIndicatorActive = true;
                
                // Schedule runnable to display wait indicator.
                Core.Web.Scheduler.add(this._waitIndicatorRunnable);
            }
        } else {
            if (this._waitIndicatorActive) {
                this._waitIndicatorActive = false;

                // Remove wait indicator from scheduling (if wait indicator has not been presented yet, it will not be).
                Core.Web.Scheduler.remove(this._waitIndicatorRunnable);
                
                // Deactivate if already displayed.
                this._waitIndicator.deactivate(this);
                this.forceRedraw();
            }
        }
    },
    
    /**
     * Sets the wait indicator that will be displayed when a client-server action takes longer than
     * a specified period of time.
     * 
     * @param {Echo.Client.WaitIndicator} waitIndicator the new wait indicator 
     */
    setWaitIndicator: function(waitIndicator) {
        if (this._waitIndicator) {
            this._setWaitVisible(false);
            if (this._waitIndicator.dispose) {
                this._waitIndicator.dispose(this);
            }
        }
        this._waitIndicator = waitIndicator;
    },
    
    /**
     * Unregisters an element (which is not a descendant of <code>domainElement</code>) that will contain rendered components.
     * 
     * @param element the element to unregister
     * @see #addElement
     */
    removeElement: function(element) {
        Core.Web.Event.remove(element, "keypress", this._processKeyRef, false);
        Core.Web.Event.remove(element, "keydown", this._processKeyRef, false);
        Core.Web.Event.remove(element, "keyup", this._processKeyRef, false);
    },
    
    /**
     * Activates the wait indicator.
     */
    _waitIndicatorActivate: function() {
        this._waitIndicator.activate(this);
    },

    /**
     * Instance listener to respond to resizing of browser window.
     * 
     * @param e the DOM resize event
     */
    _windowResizeListener: function(e) {
        if (this.application.rootComponent.peer) {
            Echo.Render.notifyResize(this.application.rootComponent);
        }
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

/**
 * Abstract base class for "Wait Indicators" which are displayed when the
 * application is not available (e.g., due to in-progress client/server
 * activity. A single wait indicator will be used by the application.
 */
Echo.Client.WaitIndicator = Core.extend({

    $abstract: {
        
        /**
         * Wait indicator activation method. Invoked when the wait indicator
         * should be activated. The implementation should add the wait indicator
         * to the DOM and begin any animation (if applicable).
         * 
         * @param {Echo.Client} the client
         */
        activate: function(client) { },
        
        /**
         * Wait indicator deactivation method. Invoked when the wait indicator
         * should be deactivated. The implementation should remove the wait
         * indicator from the DOM, cancel any animations, and dispose of any
         * resources.
         * 
         * @param {Echo.Client} the client
         */
        deactivate: function(client) { }
    },
    
    $virtual: {
        
        /**
         * Disposes of the wait indicator.
         * 
         * @param {Echo.Client} the client
         */
        dispose: null
    }
});

/**
 * Default wait indicator implementation.
 */
Echo.Client.DefaultWaitIndicator = Core.extend(Echo.Client.WaitIndicator, {
    
    /** Creates a new DefaultWaitIndicator. */
    $construct: function() {
        this._divElement = document.createElement("div");
        this._divElement.style.cssText = "display: none;z-index:32000;position:absolute;top:30px;right:30px;" +
                 "width:200px;padding:20px;border:1px outset #abcdef;background-color:#abcdef;color:#000000;text-align:center;";
        this._textNode = document.createTextNode("");
        this._divElement.appendChild(this._textNode);
        this._fadeRunnable = new Core.Web.Scheduler.MethodRunnable(Core.method(this, this._tick), 50, true);
        document.body.appendChild(this._divElement);
    },
    
    /** @see Echo.Client.WaitIndicator#activate */
    activate: function(client) {
        if (client.configuration["WaitIndicator.Background"]) {
            this._divElement.style.backgroundColor = client.configuration["WaitIndicator.Background"];
            this._divElement.style.borderColor = client.configuration["WaitIndicator.Background"];
        }
        if (client.configuration["WaitIndicator.Foreground"]) {
            this._divElement.style.color = client.configuration["WaitIndicator.Foreground"];
        }
        this._textNode.nodeValue = client.configuration["WaitIndicator.Text"];
        this._divElement.style.display = "block";
        Core.Web.Scheduler.add(this._fadeRunnable);
        this._opacity = 0;
    },
    
    /** @see Echo.Client.WaitIndicator#deactivate */
    deactivate: function(client) {
        this._divElement.style.display = "none";
        Core.Web.Scheduler.remove(this._fadeRunnable);
    },
    
    /** @see Echo.Client.WaitIndicator#dispose */
    dispose: function(client) {
        if (this._divElement && this._divElement.parentNode) {
            this._divElement.parentNode.removeChild(this._divElement);
        }
        this._divElement = null;
        this._textNode = null;
    },
    
    /**
     * Runnable-invoked method to animate (fade in/out) wait indicator.
     */
    _tick: function() {
        ++this._opacity;
        // Formula explained:
        // this._opacity starts at 0 and is incremented forever.
        // First operation is to modulo by 40 then subtract 20, result ranges from -20 to 20.
        // Next take the absolute value, result ranges from 20 to 0 to 20.
        // Divide this value by 30, so the range goes from 2/3 to 0 to 2/3.
        // Subtract that value from 1, so the range goes from 1/3 to 1 and back.
        var opacityValue = 1 - (Math.abs((this._opacity % 40) - 20) / 30);
        if (!Core.Web.Env.PROPRIETARY_IE_OPACITY_FILTER_REQUIRED) {
            this._divElement.style.opacity = opacityValue;
        }
    }
});
