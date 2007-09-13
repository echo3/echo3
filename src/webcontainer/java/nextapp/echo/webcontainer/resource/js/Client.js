/**
 * Abstract base class for Echo clients.
 */
EchoClient = function() { 
    
    /**
     * The root DOM element in which the application is contained.
     */
    this.domainElement = null;
    
    /**
     * The application being managed by this client.
     */
    this.application = null;
    
    /**
     * The parent client.
     */
    this.parent = null;
};

/**
 * Global array containing all active client instances. 
 */
EchoClient._activeClients = new Array();

/**
 * Global listener to respond to resizing of browser window.
 * Invokes _windowResizeListener() on all active clients.
 * 
 * @param e the DOM resize event
 */
EchoClient._globalWindowResizeListener = function(e) {
    for (var i = 0; i < EchoClient._activeClients.length; ++i) {
        EchoClient._activeClients[i]._windowResizeListener(e);
    }
};

EchoClient.CONTEXT_PROPERTY_NAME = "Client";

EchoClient.prototype.configure = function(application, domainElement) {
    if (this.application) {
        EchoCore.Arrays.remove(EchoClient._activeClients, this);
        this.application.setContextProperty(EchoClient.CONTEXT_PROPERTY_NAME, null);
        EchoWebCore.EventProcessor.remove(this.domainElement, "keydown", new EchoCore.MethodRef(this, this._processKeyDown), false);
        this.application.removeFocusListener(new EchoCore.MethodRef(this, this._processApplicationFocus));
    }
    
    this.application = application;
    this.domainElement = domainElement;

    if (this.application) {
        this.application.addFocusListener(new EchoCore.MethodRef(this, this._processApplicationFocus));
        EchoWebCore.EventProcessor.add(this.domainElement, "keydown", new EchoCore.MethodRef(this, this._processKeyDown), false);
        this.application.setContextProperty(EchoClient.CONTEXT_PROPERTY_NAME, this);
        EchoClient._activeClients.push(this);
    }
};

EchoClient.prototype.dispose = function() {
    this.configure(null, null);
};

/**
 * Returns a default named image.
 * May return null if the client does not provide a default iamge for the specified name.
 * Default implementation delegates to parent client
 * (if one is present) or otherwise returns null.
 */
EchoClient.prototype.getDefaultImage = function(imageName) {
    if (this.parent) {
        return this.parent.getDefaultImage(imageName);
    } else {
        return null;
    }
};

/**
 * Returns the URL of a service based on the serviceId.
 * Default implementation delegates to parent client
 * (if one is present) or otherwise returns null.
 * 
 * @param serviceId the serviceId
 * @return the full URL
 * @type String
 */
EchoClient.prototype.getServiceUrl = function(serviceId) {
    if (this.parent) {
        return this.parent.getServiceUrl(serviceId);
    } else {
        return null;
    }
};

EchoClient.prototype._processApplicationFocus = function(e) {
    var focusedComponent = this.application.getFocusedComponent();
    if (focusedComponent) {
        focusedComponent.peer.focus();
    }
};

EchoClient.prototype._processKeyDown = function(e) {
    if (e.keyCode == 9) { // Tab
        EchoWebCore.DOM.preventEventDefault(e);
        this.application.focusNext(e.shiftKey);
        return false; // Stop propagation.
    }
    return true; // Allow propagation.
};

EchoClient.prototype.setApplication = function(application) {
};

/**
 * Instance listener to respond to resizing of browser window.
 * 
 * @param e the DOM resize event
 */
EchoClient.prototype._windowResizeListener = function(e) {
    EchoRender.notifyResize(this.application.rootComponent);
};

EchoWebCore.DOM.addEventListener(window, "resize", EchoClient._globalWindowResizeListener, false);

