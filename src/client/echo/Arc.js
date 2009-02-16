/**
 * @fileoverview
 * Application rendered component module.
 * Requires Core, Core.Web, Application, Render, Serial, Client, FreeClient.
 */

/**
 * Namespace for application-rendered component support.
 * @namespace
 */
Echo.Arc = { };

/**
 * Client for application-rendered components.
 * These clients are automatically created and destroyed by the
 * ArcClient component synchronization peer.
 */
Echo.Arc.Client = Core.extend(Echo.FreeClient, {
    
    /**
     * The synchronization peer for the application-rendered component.
     * @type Echo.Arc.ComponentSync
     */
    arcSync: null,
    
    /** @see Echo.Client#verifyInput */
    verifyInput: function(component, flags) {
        if (!this.arcSync.client.verifyInput(this.arcSync.component, flags)) {
            return false;
        }
        return Echo.FreeClient.prototype.verifyInput.call(this, component, flags);
    }
});

/**
 * Component synchronization peer for application rendered components.
 * Application rendered component peers should extend this peer.
 * The super-implementations of the renderAdd(), renderDispose(),
 * renderDisplay(), and renderUpdate() methods must be invoked.
 */
Echo.Arc.ComponentSync = Core.extend(Echo.Render.ComponentSync, {

    /**
     * The embedded application.
     * @type Echo.Application
     */
    arcApplication: null,
    
    /**
     * The embedded client.
     * @type Echo.Client
     */
    arcClient: null,

    /**
     * The base component that will serve as the rendered form of this synchronization peer's supported component.
     * @type Echo.Component
     */
    baseComponent: null,
    
    $abstract: {
    
        /**
         * Creates the base component that will be added to the root
         * of the rendering application.  This component should probably be a
         * ContentPane or other container.
         * This method must be overridden by ARC implementations.
         * 
         * @type Echo.Component
         */
        createComponent: function() { }
    },
    
    $virtual: {
        
        /**
         * Returns the element in which the client should be rendered.
         * 
         * @type Element
         */
        getDomainElement: function() { 
            return this._defaultDomainElement;
        },
        
        /**
         * renderAdd() implementation: must be invoked by overriding method.
         * 
         * @see Echo.Render.ComponentSync#renderAdd
         */
        renderAdd: function(update, parentElement) {
            if (!this.getDomainElement()) {
                this._defaultDomainElement = document.createElement("div");
                parentElement.appendChild(this._defaultDomainElement);
            }
        },
    
        /**
         * renderDisplay() implementation: must be invoked by overriding method.
         * 
         * This method will create a new client and application instance if one does
         * not exist (i.e., if this method is being called for the first time after
         * renderAdd()).
         * 
         * When the application is created, the component returned by createComponent() 
         * will be added to the root component of the application.  The application will
         * be installed in the DOM at the element returned by the getDomainElement().
         * 
         * @see Echo.Render.ComponentSync#renderDisplay
         */
        renderDisplay: function() {
            if (this.arcApplication) {
                Echo.Render.renderComponentDisplay(this.baseComponent);
            } else {
                this.arcApplication = new Echo.Application();
                this.arcApplication.setStyleSheet(this.client.application.getStyleSheet());
                this.baseComponent = this.createComponent();
                if (!this.baseComponent) {
                    throw new Error("Invalid base component: null");
                }
                this.arcApplication.rootComponent.add(this.baseComponent);
                this.arcClient = new Echo.Arc.Client(this.arcApplication, this.getDomainElement());
                this.arcClient.arcSync = this;
                this.arcClient.parent = this.client;
                this.arcClient.init();
            }
        },
        
        /**
         * renderDispose() implementation: must be invoked by overriding method.
         * 
         * @see Echo.Render.ComponentSync#renderDispose
         */
        renderDispose: function(update) {
            if (this.arcClient) {
                this.arcClient.dispose();
                this.arcClient = null;
            }
            if (this.arcApplication) {
                this.arcApplication = null;
                this.baseComponent = null;
            }
            this._defaultDomainElement = null;
        },
        
        /**
         * Default implementation disposes of the existing client and application 
         * and creates a new one.  All application state will be lost.
         * This method should thus be overridden in the event that the application
         * rendered component desires to perform a more efficient update.
         * This implementation may be called by the overriding implementation if
         * replacing-and-redrawing is desired.
         * 
         * @see Echo.Render.ComponentSync#renderUpdate
         */
        renderUpdate: function(update) {
            var domainElement = this.getDomainElement();
            var containerElement = domainElement.parentNode;
            Echo.Render.renderComponentDispose(update, update.parent);
            containerElement.removeChild(domainElement);
            this.renderAdd(update, containerElement);
        }
    }
});

/**
 * A simple container in which to render children of an application rendered component.
 * This container will render as a simple DIV element.
 */
Echo.Arc.ChildContainer = Core.extend(Echo.Component, {

    $load: function() {
        Echo.ComponentFactory.registerType("ArcChildContainer", this);
    },

    /** @see Echo.Component#componentType */
    componentType: "ArcChildContainer"
});

/**
 * Synchronization peer for ChildContainer.
 */
Echo.Arc.ChildContainerPeer = Core.extend(Echo.Render.ComponentSync, {

    $load: function() {
        Echo.Render.registerPeer("ArcChildContainer", this);
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._div = document.createElement("div");
        var component = this.component.get("component");
        if (component) {
            if (!component.parent || !component.parent.peer || !component.parent.peer.client) {
                throw new Error("Invalid component: not part of registered hierarchy.");
            }
            Echo.Render.renderComponentAdd(null, component, this._div);
        }
        parentElement.appendChild(this._div);
    },
    
    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        var component = this.component.get("component");
        if (component) {
            Echo.Render.renderComponentDisplay(component);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        var component = this.component.get("component");
        if (component) {
            Echo.Render.renderComponentDispose(null, component);
        }
        this._div = null;
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) { }
});
