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

EchoClient.prototype.dispose = function() { };

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

