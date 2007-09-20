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
EchoArc.ComponentSync.prototype.getDomainElement = function() { };

/**
 * renderAdd() implementation: must be invoked by overriding method.
 */
EchoRender.ComponentSync.prototype.renderAdd = function(update, parentElement) { };

/**
 * renderDispose() implementation: must be invoked by overriding method.
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
};

/**
 * renderDispose() implementation: must be invoked by overriding method.
 */
EchoArc.ComponentSync.prototype.renderDisplay = function() {
    if (!this.arcApplication) {
        this.arcApplication = new EchoApp.Application();
        this.arcApplication.setStyleSheet(this.client.application.getStyleSheet());
        this.baseComponent = this.createBaseComponent();
        this.arcApplication.rootComponent.add(this.baseComponent);
        this.arcClient = new EchoArc.Client(this.arcApplication, this.getDomainElement());
        this.arcClient.parent = this.client;
        this.arcClient.init();
    }
};

/**
 * renderUpdate() implementation: must be invoked by overriding method.
 */
EchoRender.ComponentSync.prototype.renderUpdate = function(update) { };