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
};

EchoClient.CONTEXT_PROPERTY_NAME = "Client";

EchoClient.prototype.configure = function(application, domainElement) {
    if (this.application) {
        this.application.setContextProperty(EchoClient.CONTEXT_PROPERTY_NAME, null);
    }
    
    this.application = application;
    this.domainElement = domainElement;

    if (this.application) {
        this.application.setContextProperty(EchoClient.CONTEXT_PROPERTY_NAME, this);
    }
};

EchoClient.prototype.dispose = function() {
    this.configure(null, null);
};

/**
 * Returns the URL of a service based on the serviceId.
 * Default implementation, returns null.
 * 
 * @param serviceId the serviceId
 * @return the full URL
 * @type String
 * @private
 */
EchoClient.prototype.getServiceUrl = function(serviceId) {
    return null;
};

EchoClient.prototype.setApplication = function(application) {
};

