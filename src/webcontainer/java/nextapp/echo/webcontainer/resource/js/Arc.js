/**
 * @fileoverview
 * Application rendered component module.
 * Requires Core, WebCore, Application, Render, Serial, Client, FreeClient.
 */

/**
 * @class Namespace for application-rendered component support.  Non-instantiable object.
 */
EchoArc = function() { }

/**
 * @class Client for application-rendered components.  
 * These clients are automatically created and destroyed by the
 * ArcClient component synchronization peer.
 */
EchoArc.Client = function(application, domainElement) {
    EchoFreeClient.call(this, application, domainElement);
};

EchoArc.Client.prototype = EchoCore.derive(EchoFreeClient);

/**
 * @class Component synchronization peer for application rendered components.
 * Application rendered component peers should extend this peer.
 * The super-implementations of the renderAdd(), renderDispose(),
 * renderDisplay(), and renderUpdate() methods must be invoked.
 */
EchoArc.ComponentSync = function() {

};

EchoArc.ComponentSync.prototype = EchoCore.derive(EchoRender.ComponentSync);

/**
 * Creates the base component of that will be added to the root
 * of the rendering application.  This component should probably be a
 * ContentPane or other container.
 * This method must be overridden by ARC implementations.
 * 
 * @type EchoApp.Component
 */
EchoArc.ComponentSync.prototype.createBaseComponent = function() { };

/**
 * Returns the element in which the client should be rendered.
 * This method must be overridden by ARC implementations.
 * 
 * @type Element
 */
EchoArc.ComponentSync.prototype.getDomainElement = function() { 
    return this._defaultDomainElement;
};

/**
 * renderAdd() implementation: must be invoked by overriding method.
 */
EchoArc.ComponentSync.prototype.renderAdd = function(update, parentElement) {
    if (!this.getDomainElement()) {
        this._defaultDomainElement = document.createElement("div");
        parentElement.appendChild(this._defaultDomainElement);
    }
};

/**
 * renderDispose() implementation: must be invoked by overriding method.
 * 
 * Disposes of the client, application, and references to DOM resources.
 */
EchoArc.ComponentSync.prototype.renderDispose = function(update) {
    if (this.arcClient) {
        this.arcClient.dispose();
        this.arcClient = null;
    }
    if (this.arcApplication) {
        this.arcApplication.dispose();
        this.arcApplication = null;
        this.baseComponent = null;
    }
    this._defaultDomainElement = null;
};

/**
 * renderDisplay() implementation: must be invoked by overriding method.
 * 
 * This method will create a new client and application instance if one does
 * not exist (i.e., if this method is being called for the first time after
 * renderAdd()).
 * 
 * When the application is created, the component returned by createBaseComponent() 
 * will be added to the root component of the application.  The application will
 * be installed in th DOM at the element returned by the getDomainElement().
 */
EchoArc.ComponentSync.prototype.renderDisplay = function() {
    if (!this.arcApplication) {
        this.arcApplication = new EchoApp.Application();
        this.arcApplication.setStyleSheet(this.client.application.getStyleSheet());
        this.baseComponent = this.createBaseComponent();
        if (this.baseComponent == null) {
            throw new Error("Invalid base component: null");
        }
        this.arcApplication.rootComponent.add(this.baseComponent);
        this.arcClient = new EchoArc.Client(this.arcApplication, this.getDomainElement());
        this.arcClient.parent = this.client;
        this.arcClient.init();
    }
};

/**
 * Default implementation disposes of the existing client and application 
 * and creates a new one.  All application state will be lost.
 * This method should thus be overridden in the event that the application
 * rendered component desires to perform a more efficient update.
 * This implementation may be called by the overriding implementation if
 * replacing-and-redrawing is desired.
 */
EchoArc.ComponentSync.prototype.renderUpdate = function(update) {
    var domainElement = this.getDomainElement();
    var containerElement = domainElement.parentNode;
    EchoRender.renderComponentDispose(update, update.parent);
    containerElement.removeChild(domainElement);
    this.renderAdd(update, containerElement);
};
