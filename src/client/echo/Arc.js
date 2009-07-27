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
 * Application class.
 */
Echo.Arc.Application = Core.extend(Echo.Application, {
    
    /**
     * The containing <code>Echo.Arc.ComponentSync</code> instance.
     */
    arcSync: null,
    
    /** @see Echo.Application#isActive */
    isActive: function() {
        if (!this.arcSync.component.isActive()) {
            return false;
        } else {
            return Echo.Application.prototype.isActive.call(this);
        }
    }
});

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
    
    /**
     * Default domain element.  A DIV element which is created/returned if 
     */
    _defaultDomainElement: null,
    
    _applicationFocusRef: null,
    
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
         * Default implementation creates/returns a DIV.
         * May be overridden.  This implementation does not need to be invoked by overriding implementation. 
         * 
         * @type Element
         */
        getDomainElement: function() { 
            if (!this._defaultDomainElement) {
                this._defaultDomainElement = document.createElement("div");
            }
            return this._defaultDomainElement;
        },

        /**
         * Listener for application focus change events.
         * Registered to both the rendered application and the containing component's application.
         */
        _processApplicationFocus: function(e) {
            if (e.source == this.component.application) {
                if (e.newValue != this.component) {
                    // Set focus of rendered application to null when containing application's focus moves
                    // away from the application rendered component.
                    this.arcApplication.setFocusedComponent(null);
                }
            } else if (e.source == this.arcApplication && e.newValue) {
                // Set focus of containing application to the application rendered component when a component contained
                // within the rendered application is focused.
                this.component.application.setFocusedComponent(this.component);
            }
        },
     
        /**
         * Default renderAdd() implementation: appends the element returned by getDomainElement() to the parent.
         * May be overridden.  This implementation does not need to be invoked by overriding implementation. 
         * 
         * @see Echo.Render.ComponentSync#renderAdd
         */
        renderAdd: function(update, parentElement) {
            var element = this.getDomainElement();
            parentElement.appendChild(element);
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
                if (!this.baseComponent.peer) {
                    // Do nothing in the event application peers have not been instantiated.
                    return;
                }
                Echo.Render.renderComponentDisplay(this.baseComponent);
            } else {
                this.arcApplication = new Echo.Arc.Application();
                this.arcApplication.arcSync = this;
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
                
                // Register application focus listeners for both containing application and rendered application.
                this._applicationFocusRef = Core.method(this, this._processApplicationFocus);
                this.arcApplication.addListener("focus", this._applicationFocusRef);
                this.client.application.addListener("focus", this._applicationFocusRef);
            }
        },
        
        /**
         * renderDispose() implementation: must be invoked by overriding method.
         * 
         * @see Echo.Render.ComponentSync#renderDispose
         */
        renderDispose: function(update) {
            if (this._applicationFocusRef) {
                // Unregister application focus listeners for both containing application and rendered application.
                this.arcApplication.removeListener("focus", this._applicationFocusRef);
                this.client.application.removeListener("focus", this._applicationFocusRef);
                this._applicationFocusRef = null;
            }
            if (this.arcClient) {
                this.arcClient.dispose();
                this.arcClient = null;
            }
            if (this.arcApplication) {
                this.arcApplication.arcSync = null;
                this.arcApplication = null;
                this.baseComponent = null;
            }
            this._defaultDomainElement = null;
        },
        
        /**
         * renderHide() implementation: must be invoked by overriding method.
         * 
         * @see Echo.Render.ComponentSync#renderHide
         */
        renderHide: function() {
            if (this.arcApplication) {
                if (!this.baseComponent.peer) {
                    // Do nothing in the event application peers have not been instantiated.
                    return;
                }
                Echo.Render.renderComponentHide(this.baseComponent);
            }
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
