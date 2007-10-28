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
 * @class 
 * Client for application-rendered components.
 * These clients are automatically created and destroyed by the
 * ArcClient component synchronization peer.
 */
EchoArc.Client = EchoCore.extend(EchoFreeClient, {

    //FIXME This class has been created with the intention that methods will be added to it.  
    // If not, remove and use freeclient?
});

/**
 * @class 
 * Component synchronization peer for application rendered components.
 * Application rendered component peers should extend this peer.
 * The super-implementations of the renderAdd(), renderDispose(),
 * renderDisplay(), and renderUpdate() methods must be invoked.
 */
EchoArc.ComponentSync = EchoCore.extend(EchoRender.ComponentSync, {

    initialize: function() { },

    /**
     * Creates the base component of that will be added to the root
     * of the rendering application.  This component should probably be a
     * ContentPane or other container.
     * This method must be overridden by ARC implementations.
     * 
     * @type EchoApp.Component
     */
    createBaseComponent: function() { },

    /**
     * Returns the element in which the client should be rendered.
     * This method must be overridden by ARC implementations.
     * 
     * @type Element
     */
    getDomainElement: function() { 
        return this._defaultDomainElement;
    },
    
    /**
     * renderAdd() implementation: must be invoked by overriding method.
     */
    renderAdd: function(update, parentElement) {
        if (!this.getDomainElement()) {
            this._defaultDomainElement = document.createElement("div");
            parentElement.appendChild(this._defaultDomainElement);
        }
    },
    
    /**
     * renderDispose() implementation: must be invoked by overriding method.
     * 
     * Disposes of the client, application, and references to DOM resources.
     */
    renderDispose: function(update) {
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
    },
    
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
    renderDisplay: function() {
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
    },
    
    /**
     * Default implementation disposes of the existing client and application 
     * and creates a new one.  All application state will be lost.
     * This method should thus be overridden in the event that the application
     * rendered component desires to perform a more efficient update.
     * This implementation may be called by the overriding implementation if
     * replacing-and-redrawing is desired.
     */
    renderUpdate: function(update) {
        var domainElement = this.getDomainElement();
        var containerElement = domainElement.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
        containerElement.removeChild(domainElement);
        this.renderAdd(update, containerElement);
    }
});

/**
 * A simple container in which to render children of an application rendered component.
 * This container will render as a simple DIV element.
 */
EchoArc.ChildContainer = EchoCore.extend(EchoApp.Component, {

    globalInitialize: function() {
        EchoApp.ComponentFactory.registerType("ArcChildContainer", this);
    },

    componentType: "ArcChildContainer"
});

/**
 * Synchronization peer for ChildContainer.
 */
EchoArc.ChildContainerPeer = EchoCore.extend(EchoRender.ComponentSync, {

    globalInitialize: function() {
        EchoRender.registerPeer("ArcChildContainer", this);
    },

    initialize: function() {
    },

    renderAdd: function(update, parentElement) {
        this._divElement = document.createElement("div");
        var component = this.component.getProperty("component");
        if (component) {
            if (!component.parent || !component.parent.peer || !component.parent.peer.client) {
                throw new Error("Invalid component: not part of registered hierarchy.");
            }
            EchoRender.renderComponentAdd(null, component, this._divElement);
        }
        parentElement.appendChild(this._divElement);
    },
    
    renderDisplay: function() {
        var component = this.component.getProperty("component");
        if (component) {
            EchoRender.renderComponentDisplay(component);
        }
    },
    
    renderDispose: function(update) {
        var component = this.component.getProperty("component");
        if (component) {
            EchoRender.renderComponentDispose(null, component);
        }
        this._divElement = null;
    },
    
    renderUpdate: function(update) {
    }
});
