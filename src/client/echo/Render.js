/**
 * @namespace
 * Module for rendering state of application to DOM.
 * <ul>
 *  <li>Provides capability to process updates in Application UpdateManager,
 *   rendering state changes to the DOM.</li>
 *  <li>Provides component synchronization peer base class.</li>
 *  <li>Provides root component synchronization peer implementation.</li>
 *  <li>Provides rendering utilities for the core properties.</li>
 * </ul>
 * 
 * <h3>renderContext</h3>
 * 
 * <p>This object will add a <code>renderContext</code> property to all <code>Echo.Update.ComponentUpdate</code>
 * objects which are processed by it.
 */

/**
 * Application rendering namespace.
 * @namespace
 */
Echo.Render = {

    /**
     * Count of loaded/unloaded peers.  Used for testing purposes to ensure peers are not being leaked.
     * @type Number
     */
    _loadedPeerCount: 0,

    /**
     * Next sequentially assigned unique peer identifier.
     * @type Number
     */
    _nextPeerId: 0,
    
    /**
     * Mapping between component type names and instantiable peer classes.
     */
    _peers: {},
    
    /**
     * Map containing removed components.  Maps component ids to removed components.
     * Created and destroyed during each render.
     */
    _disposedComponents: null,
    
    /**
     * An array sorting implementation to organize an array by component depth.
     * @see Array#sort
     */
    _componentDepthArraySort: function(a, b) {
        return Echo.Render._getComponentDepth(a.parent) - Echo.Render._getComponentDepth(b.parent);
    },
    
    /**
     * Recursively invokes renderDisplay() method on a sub-hierarchy of the
     * component hierarchy.  If a peer does not provide a renderDisplay() implementation,
     * it is skipped (although its descendants will NOT be skipped).
     * 
     * @param {Echo.Component} the root component of the sub-hierarchy on which renderDisplay() should be invoked
     * @param {Boolean} includeSelf flag indicating whether renderDisplay() should be invoked on the
     *        specified component (if false, it will only be invoked on child components)
     */
    _doRenderDisplay: function(component, includeSelf) {
        // Ensure component is visible.
        var i, testComponent = component;
        var testParent = testComponent.parent;
        while (testParent) {
            if (testParent.peer.isChildVisible && !testParent.peer.isChildVisible(testComponent)) {
                // Do nothing for components that are not visible. 
                return;
            }
            testComponent = testParent;
            testParent = testParent.parent;
        }
        
        if (includeSelf) {
            Echo.Render._doRenderDisplayImpl(component);
        } else {
            if (component.peer.isChildVisible) {
                for (i = 0; i < component.children.length; ++i) {
                    if (component.peer.isChildVisible(component.children[i])) {
                        Echo.Render._doRenderDisplayImpl(component.children[i]);
                    }
                }
            } else {
                for (i = 0; i < component.children.length; ++i) {
                    Echo.Render._doRenderDisplayImpl(component.children[i]);
                }
            }
        }
    },
    
    /**
     * Recursive work method for _doRenderDisplay().  
     * 
     * @param {Echo.Component} component the component on which to invoke renderDisplay()
     */
    _doRenderDisplayImpl: function(component) {
        if (!component.peer) {
            // Do nothing for components that are not rendered. 
            return;
        }
        
        if (component.peer.renderDisplay) {
            component.peer.renderDisplay();
        }
        component.peer.displayed = true;
        
        var i;
        if (component.peer.isChildVisible) {
            for (i = 0; i < component.children.length; ++i) {
                if (component.peer.isChildVisible(component.children[i])) {
                    Echo.Render._doRenderDisplayImpl(component.children[i]);
                }
            }
        } else {
            for (i = 0; i < component.children.length; ++i) {
                Echo.Render._doRenderDisplayImpl(component.children[i]);
            }
        }
    },
    
    /**
     * Returns the depth of a specific component in the hierarchy.
     * The root component is at depth 0, its immediate children are
     * at depth 1, their children are at depth 2, and so on.
     *
     * @param {Echo.Component} component the component whose depth is to be calculated
     * @return the depth of the component
     * @type Number
     */
    _getComponentDepth: function(component) {
        var depth = -1;
        while (component != null) {
            component = component.parent;
            ++depth;
        }
        return depth;
    },
    
    /**
     * Creates a component synchronization peer for a component.
     * The peer will be stored in the "peer" property of the component.
     * The client will be stored in the "client" property of the component.
     * 
     * @param {Echo.Client} client the relevant Client
     * @param {Echo.Component} component the component
     */
    _loadPeer: function(client, component) {
        if (component.peer) {
            // If peer already loaded, do nothing.
            return;
        }
        
        var peerClass = Echo.Render._peers[component.componentType];
        
        if (!peerClass) {
            throw new Error("Peer not found for: " + component.componentType);
        }
        
        ++this._loadedPeerCount;        
        component.peer = new peerClass();
        component.peer._peerId = this._nextPeerId++;
        component.peer.component = component;
        component.peer.client = client;
    },
    
    /**
     * Notifies child components that the parent component has been drawn
     * or resized.  At this point the parent component is on the screen
     * (the parent element is part of the DOM hierarchy).
     * Child components (and their descendants) will be notified by having 
     * their renderDisplay() implementations invoked.
     * Note that the parent WILL NOT have its renderDisplay() method
     * invoked.
     * <p>
     * If your component requires virtual positioning (for IE6) you should invoke
     * this method after informing the virtual positioning system to recalculate
     * the size of your component.
     * 
     * @param {Echo.Component} parent the component whose size changed
     */
    notifyResize: function(parent) {
        Echo.Render._doRenderDisplay(parent, false);
    },
    
    /**
     * Invokes renderDispose() on all removed children and descendants found in the specified update.
     * 
     * @param {Echo.Update.ComponentUpdate} update the update
     */
    _processDispose: function(update) {
        var i, components = update.getRemovedDescendants();
        if (components) {
            for (i = 0; i < components.length; ++i) {
                Echo.Render._renderComponentDisposeImpl(update, components[i]);
            }
        }
        components = update.getRemovedChildren();
        if (components) {
            for (i = 0; i < components.length; ++i) {
                Echo.Render._renderComponentDisposeImpl(update, components[i]);
            }
        }
    },
    
    /**
     * Processes all pending updates in the client's application's update manager.
     * 
     * @param {Echo.Client} client the client
     */
    processUpdates: function(client) {
        var updateManager = client.application.updateManager;
        
        // Do nothing if no updates exist.
        if (!updateManager.hasUpdates()) {
            return;
        }
        
        // Create map to contain removed components (for peer unloading).
        Echo.Render._disposedComponents = {};
        
        // Retrieve updates, sorting by depth in hierarchy.  This will ensure that higher
        // level updates have a chance to execute first, in case they null out lower-level
        // updates if they require re-rendering their descendants.
        var updates = updateManager.getUpdates();
        updates.sort(Echo.Render._componentDepthArraySort);
        
        var peer, i, j;
    
        // Load peers for any new root components being updated.
        for (i = 0; i < updates.length; ++i) {
            updates[i].renderContext = {};
        
            peer = updates[i].parent.peer;
            if (peer == null && updates[i].parent.componentType == "Root") {
                Echo.Render._loadPeer(client, updates[i].parent);
            }
        }
    
        // Remove Phase: Invoke renderDispose on all updates.
        for (i = updates.length - 1; i >= 0; --i) {
            if (updates[i] == null) {
                // Skip removed updates.
                continue;
            }
            peer = updates[i].parent.peer;
            Echo.Render._processDispose(updates[i]);
        }
        
        // Profiling: Mark completion of remove phase. 
        if (Echo.Client.profilingTimer) {
            Echo.Client.profilingTimer.mark("rem");
        }
        
        // Update Phase: Invoke renderUpdate on all updates.
        for (i = 0; i < updates.length; ++i) {
            if (updates[i] == null) {
                // The update has been removed, skip it.
                continue;
            }
            
            // Obtain component synchronization peer.
            peer = updates[i].parent.peer;
            
            // Perform update by invoking peer's renderUpdate() method.
            var fullRender = peer.renderUpdate(updates[i]);
            
            // If the update required re-rendering descendants of the updated component,
            // null-out any pending updates to descendant components.
            if (fullRender) {
                for (j = i + 1; j < updates.length; ++j) {
                    if (updates[j] != null && updates[i].parent.isAncestorOf(updates[j].parent)) {
                        updates[j] = null;
                    }
                }
            }

            // Invoke _setPeerDisposedState() to ensure that peer is marked as non-disposed.
            // (A full-re-render may have invoked renderComponentDispose()).
            Echo.Render._setPeerDisposedState(updates[i].parent, false);
        }
        
        // Profiling: Mark completion of update phase.
        if (Echo.Client.profilingTimer) {
            Echo.Client.profilingTimer.mark("up");
        }
        
        // Display Phase: Invoke renderDisplay on all updates.
        // The "displayed" array holds component who have already had renderDisplay() invoked on themselves (and their descendants).
        // This is done to avoid invoking renderDisplay() multiple times on a single component during a single rendering.
        var displayed = [];
        for (i = 0; i < updates.length; ++i) {
            if (updates[i] == null) {
                // Skip removed updates.
                continue;
            }
            
            // Determine if component hierarchy has already had renderDisplay() invoked, skipping to next update if necessary.
            var cancelDisplay = false;
            for (j = 0; j < displayed.length; ++j) {
                if (displayed[j].isAncestorOf(updates[i].parent)) {
                    cancelDisplay = true;
                    break;
                }
            }
            if (cancelDisplay) {
                continue;
            }
            
            if (updates[i].renderContext.displayRequired) {
                // The renderContext has specified only certain child components should have their
                // renderDisplay() methods invoked.
                for (j = 0; j < updates[i].renderContext.displayRequired.length; ++j) {
                    displayed.push(updates[i].renderContext.displayRequired[j]);
                    Echo.Render._doRenderDisplay(updates[i].renderContext.displayRequired[j], true);
                }
            } else {
                displayed.push(updates[i].parent);
                Echo.Render._doRenderDisplay(updates[i].parent, true);
            }
        }
    
        // Profiling: Mark completion of display phase.
        if (Echo.Client.profilingTimer) {
            Echo.Client.profilingTimer.mark("disp");
        }
    
        // Unload peers for truly removed components, destroy mapping.
        for (var peerId in Echo.Render._disposedComponents) {
            var component = Echo.Render._disposedComponents[peerId];
            Echo.Render._unloadPeer(component);
        }

        // Clear disposed component list.
        Echo.Render._disposedComponents = null;
        
        // Inform UpdateManager that all updates have been completed.
        updateManager.purge();
        
        // Perform focus update.
        Echo.Render.updateFocus(client);
    },
    
    /**
     * Registers a component type name with an instantiable peer class.
     * Components of the specified type name will be assigned new instances of the peer class
     * when rendered for the first time.
     * 
     * @param {String} componentName the component type name
     * @param {Function} peerObject the peer class object
     */
    registerPeer: function(componentName, peerObject) {
        if (this._peers[componentName]) {
            throw new Error("Peer already registered: " + componentName);
        }
        this._peers[componentName] = peerObject;
    },
    
    /**
     * Renders a new component inside of a DOM element.
     * This method should be called by container components in order to render their children.
     * 
     * @param {Echo.Update.ComponentUpdate} update the relevant ComponentUpdate
     * @param {Echo.Component} component the component to add
     * @param {Element} parentElement the DOM element to which the rendered component should be added
     */
    renderComponentAdd: function(update, component, parentElement) {
        if (!component.parent || !component.parent.peer || !component.parent.peer.client) {
            throw new Error("Cannot find reference to the Client with which this component should be associated: " +
                    "cannot load peer.  This is due to the component's parent's peer not being associated with a Client. " +
                    "Component = " + component + ", Parent = " + component.parent + ", Parent Peer = " + 
                    (component.parent ? component.parent.peer : "N/A") + ", Parent Peer Client = " + 
                    ((component.parent && component.parent.peer) ? component.parent.peer.client : "N/A"));
        }
    
        Echo.Render._loadPeer(component.parent.peer.client, component);
        Echo.Render._setPeerDisposedState(component, false);
        component.peer.renderAdd(update, parentElement);
    },
    
    /**
     * Manually invokes renderDisplay on a component (and its descendants) that was added to the
     * hierarchy outside of processUpdates().  This method is only used in special cases,
     * e.g., by in the case of Application Rendered Components that need to render children.
     * 
     * @param {Echo.Component} parent the parent component of the sub-hierarchy on which renderDisplay() should
     *        be invoked (note that renderDisplay WILL be invoked on the parent as well 
     *        as its descendants)
     */
    renderComponentDisplay: function(parent) {
        this._doRenderDisplay(parent, true);
    },
    
    /**
     * Disposes of a component and its descendants.
     * This method should be invoked by any peer that will be updating a component in such
     * a fashion that it will be destroying the rendering of its children and re-rendering them.
     * It is not necessary to invoke this method on components that may not contain children.
     *
     * @param {Echo.Update.ComponentUpdate} update the <code>ComponentUpdate</code> for which this change is being performed
     * @param {Echo.Component} component the <code>Component</code> to be disposed
     */
    renderComponentDispose: function(update, component) {
        this._renderComponentDisposeImpl(update, component);
    },
    
    /**
     * Recursive implementation of renderComponentDispose.  Invokes
     * renderDispose() on all child peers, sets disposed state on each.
     * 
     * @param {Echo.Update.ComponentUpdate} update the <code>ComponentUpdate</code> for which this change is being performed
     * @param {Echo.Component} component the <code>Component</code> to be disposed
     */
    _renderComponentDisposeImpl: function(update, component) {
        if (!component.peer || component.peer.disposed) {
            return;
        }
        Echo.Render._setPeerDisposedState(component, true);
    
        component.peer.renderDispose(update);
        for (var i = 0; i < component.children.length; ++i) {
            Echo.Render._renderComponentDisposeImpl(update, component.children[i]);
        }
    },
    
    /**
     * Notifies a child component and its descendants that it is about to be removed from the DOM or otherwise hidden from view.
     * The <code>renderHide()</code> methods of the peers of the specified child component and its descendants will be invoked.
     * <strong>It is absolutely critical that this method be invoked before the component's rendered state is removed from the DOM 
     * hierarchy.</strong>
     * 
     * @param {Echo.Component} component the child component being hidden
     */
    renderComponentHide: function(component) {
        if (!component.peer || component.peer.disposed) {
            return;
        }
        
        if (component.peer.displayed) {
            if (component.peer.renderHide) {
                component.peer.renderHide();
            }
            component.peer.displayed = false;
            for (var i = 0; i < component.children.length; ++i) {
                Echo.Render.renderComponentHide(component.children[i]);
            }
        }
    },
    
    /**
     * Sets the peer disposed state of a component.
     * The peer disposed state indicates whether the renderDispose()
     * method of the component has been executed since it was last rendered.
     * 
     * @param {Echo.Component} component the component
     * @param {Boolean} disposed the disposed state, true indicating the component has
     *        been disposed
     */
    _setPeerDisposedState: function(component, disposed) {
        if (disposed) {
            component.peer.disposed = true;
            Echo.Render._disposedComponents[component.peer._peerId] = component;
        } else {
            component.peer.disposed = false;
            delete Echo.Render._disposedComponents[component.peer._peerId];
        }
    },
    
    /**
     * Destroys a component synchronization peer for a specific components.
     * The peer will be removed from the "peer" property of the component.
     * The client will be removed from the "client" property of the component.
     * The peer to component association will be removed.
     * 
     * @param {Echo.Component} component the component
     */
    _unloadPeer: function(component) {
        component.peer.client = null;
        component.peer.component = null;
        component.peer = null;
        --this._loadedPeerCount;        
    },

    /**
     * Focuses the currently focused component of the application.  
     *
     * This method may be necessary to invoke manually by component renderers
     * that use animation and may be hiding the focused component (such that
     * the client browser will not focus it) when processUpdates() completes.
     * 
     * @param {Echo.Client} client the client 
     */
    updateFocus: function(client) {
        var focusedComponent = client.application.getFocusedComponent();
        if (focusedComponent && focusedComponent.peer) {
            if (!focusedComponent.peer.renderFocus) {
                throw new Error("Cannot focus component: " + focusedComponent + 
                        ", peer does not provide renderFocus() implementation."); 
            }
            focusedComponent.peer.renderFocus();
        }
    }
};

/**
 * Component synchronization peer. 
 * @class
 */
Echo.Render.ComponentSync = Core.extend({ 

    $static: {
    
        /**
         * Focus flag indicating up arrow keypress events should be handled by focus manager when
         * the component is focused.
         * @type Number
         */
        FOCUS_PERMIT_ARROW_UP: 0x1,

        /**
         * Focus flag indicating down arrow keypress events should be handled by focus manager when
         * the component is focused.
         * @type Number
         */
        FOCUS_PERMIT_ARROW_DOWN: 0x2, 

        /**
         * Focus flag indicating left arrow keypress events should be handled by focus manager when
         * the component is focused.
         * @type Number
         */
        FOCUS_PERMIT_ARROW_LEFT: 0x4,
        
        /**
         * Focus flag indicating right arrow keypress events should be handled by focus manager when
         * the component is focused.
         * @type Number
         */
        FOCUS_PERMIT_ARROW_RIGHT: 0x8, 

        /**
         * Focus flag indicating all arrow keypress events should be handled by focus manager when
         * the component is focused.
         * @type Number
         */
        FOCUS_PERMIT_ARROW_ALL: 0xf,
        
        /**
         * Dimension value for <code>getPreferredSize()</code> indicating height should be calculated.
         * @type Number
         */
        SIZE_HEIGHT: 0x1,
        
        /**
         * Dimension value for <code>getPreferredSize()</code> indicating width should be calculated.
         * @type Number
         */
        SIZE_WIDTH: 0x2
    },
    
    /**
     * Unique peer identifier, for internal use only.
     * Using component renderId is inadequate, as two unique component instances may have same id across
     * add-remove-add operations.
     * @type Number
     */
    _peerId: null,

    /**
     * The client supported by this peer.
     * @type Echo.Client
     */
    client: null,

    /**
     * The component instance supported by this peer.  
     * Each peer instance will support a single component instance.
     * @type Echo.Component
     */
    component: null,
    
    /**
     * Flag indicating whether component is displayed or hidden.  Initially false until <code>renderDisplay()</code> has been
     * invoked, then will be set to true.  Will again be set false after invocation of <code>renderHide()</code>.
     */
    displayed: false,
    
    /**
     * Flag indicating that the component has been disposed, i.e., the peer's <code>renderDispose()</code> method 
     * has run since the last time <code>renderAdd()</code> was last invoked.
     * @type Boolean
     */
    disposed: false,

    /**
     * Creates a new component synchronization peer.
     */
    $construct: function() { },
    
    $abstract: {

        /**
         * Renders the component to the DOM.
         * The supplied update will refer to a ancestor component of the supported component
         * being updated.
         *
         * @param {Echo.Update.ComponentUpdate} update the update being rendered
         * @param {Element} parentElement the parent DOM element to which the component should be rendered.
         */
        renderAdd: function(update, parentElement) { },

        /**
         * Invoked when the rendered component is about to be removed from the DOM.
         * This method should dispose of any client resources in use by the component, e.g.,
         * unregistering event listeners and removing any DOM elements that are not children of
         * the parent component's DOM element.
         * The DOM should NOT be modified to remove the element(s) representing this component
         * for performance as well as aesthetic reasons (e.g., in the case where a parent component
         * might be using an animated transition effect to remove the component.
         * The supplied update will refer to a ancestor component of the supported component
         * being updated.
         *
         * A component may be re-added to the screen after being disposed, e.g., in the case
         * where a parent component does not possess a 'partial update' capability and removes
         * a child component hierarchy and then re-renders it.  A synchronization peer should
         * allow for the fact that its renderAdd() method may be invoked at some point in time
         * after renderDispose() has been invoked.
         *        
         * @param {Echo.Update.ComponentUpdate} update the update being rendered
         */
        renderDispose: function(update) { },
        
        /**
         * Renders an update to a component, e.g., children added/removed, properties updated.
         * The supplied update will refer specifically to an update of the supported component.
         * 
         * The provided update will contain a <code>renderContext</code> object property.
         * The following properties of <code>renderContext</code> may be configured by the
         * implementation, if desired:
         *  
         * <ul>
         *  <li><code>displayRequired</code>: an array of child component objects whose synchronization peers should have their
         *  renderDisplay() methods invoked once the update cycle is complete.  The default value of null indicates the peers
         *  of all descendant components and the updated component itself will have their renderDisplay() methods invoked.
         *  Specifying an empty array will cause NO components to have their renderDisplay() methods invoked.
         *  This property is generally used on container components (or application-rendered components) which may have property
         *  updates that need not cause renderDisplay() to be invoked on their entire descendant tree for performance reasons.
         * </ul> 
         *
         * @param {Echo.Update.ComponentUpdate} update the update being rendered
         * @return true if this invocation has re-rendered all child components, false otherwise
         * @type Boolean
         */
        renderUpdate: function(update) { }
    },
    
    $virtual: {
    
        /**
         * (Optional) Processes a key down event received by the client's key listeners.  
         * Invoked by client based on current focused component of application.
         * 
         * @function
         * @param e the key event, containing (processed) keyCode property
         * @return true if higher-level containers should be allowed to process the key event as well
         * @type Boolean
         */
        clientKeyDown: null,

        /**
         * (Optional) Processes a key press event received by the client's key listeners.  
         * Invoked by client based on current focused component of application.
         * 
         * @function
         * @param e the key event, containing (processed) charCode and keyCode properties
         * @return true if higher-level containers should be allowed to process the key event as well
         * @type Boolean
         */
        clientKeyPress: null,
        
        /**
         * (Optional) Processes a key up event received by the client's key listeners.  
         * Invoked by client based on current focused component of application.
         * 
         * @function
         * @param e the key event, containing (processed) charCode and keyCode properties
         * @return true if higher-level containers should be allowed to process the key event as well
         * @type Boolean
         */
        clientKeyUp: null,
        
        /**
         * Returns the focus flags for the component, one or more of the following values, ORed together.
         * <ul>
         *  <li><code>FOCUS_PERMIT_ARROW_UP</code>: indicates that the container may change focus from the current component if
         *   the up arrow key is pressed.</li>
         *  <li><code>FOCUS_PERMIT_ARROW_DOWN</code>: indicates that the container may change focus from the current component if
         *   the down arrow key is pressed.</li>
         *  <li><code>FOCUS_PERMIT_ARROW_LEFT</code>: indicates that the container may change focus from the current component if
         *   the left arrow key is pressed.</li>
         *  <li><code>FOCUS_PERMIT_ARROW_RIGHT</code>: indicates that the container may change focus from the current component if
         *   the right arrow key is pressed.</li>
         *  <li><code>FOCUS_PERMIT_ARROW_ALL</code>: indicates that the container may change focus from the current component if
         *   any arrow key is pressed (this is a shorthand for up, left, down, and right ORed together).</li>
         * </ul>
         * 
         * @function
         * @return the focus flags
         * @type Number
         */
        getFocusFlags: null,
        
        /**
         * (Optional) Returns the preferred rendered size of the component in pixels.  Certain parent
         * components may query this method during <code>renderDisplay()</code> to determine
         * the space provided to the child component.  If implemented, this method should return
         * an object containing height and/or width properties specifying integer pixel values.
         * 
         * @function
         * @param dimension the dimension to be calculated, one of the following values, or null
         *        to specify that all dimensions should be calculated:
         *        <ul>
         *         <li><code>SIZE_WIDTH</code></li>
         *         <li><code>SIZE_HEIGHT</code></li>
         *        </ul>
         * @return the preferred rendered size of the component
         */
        getPreferredSize: null,
        
        /**
         * (Optional) Determines if the specified child component is currently displayed.  Implementations
         * should return true if the specified child component is on-screen and should have its <code>renderDisplay()</code>
         * method invoked when required, or false if the component is off-screen.
         * 
         * @function
         * @param component the child component
         * @return true if the component should have its renderDisplay() method invoked
         * @type Boolean
         */
        isChildVisible: null,
        
        /**
         * (Optional) Invoked when component is rendered focused.
         * 
         * @function
         */
        renderFocus: null,
        
        /**
         * (Optional) Invoked when a parent/ancestor component is hiding the content of this component, possibly removing it from
         * the DOM.  An parent/ancestor DOM element will automatically be removed/hidden, but the component may need to take action 
         * to remove any rendered items not contained within that element.
         * The renderDisplay() method will be invoked the when/if the component is displayed again.
         * This method may be invoked on components which are already in a hidden state.
         * This method will not necessarily be invoked prior to disposal.
         * 
         * @function
         */
        renderHide: null,
        
        /**
         * (Optional) Invoked when the component has been added (or-readded) to the hierarchy and first appears
         * on screen, and when ancestors of the component (or the containing window) have
         * resized.
         * 
         * @function
         */
        renderDisplay: null
    }
});

/**
 * Root component synchronization peer.
 * The root component is not managed by the server, but rather is an existing
 * element within which the Echo application is rendered.
 * This is a very special case in that there is no renderAdd() method.
 */
Echo.Render.RootSync = Core.extend(Echo.Render.ComponentSync, { 

    $load: function() {
        Echo.Render.registerPeer("Root", this);
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        throw new Error("Unsupported operation: renderAdd().");
    },
    
    /**
     * Removes all content from root container and adds current content.
     * 
     * @param {Echo.Update.ComponentUpdate} update the causing update 
     */
    _renderContent: function(update) {
        Echo.Render.renderComponentDispose(update, update.parent);
        Core.Web.DOM.removeAllChildren(this.client.domainElement);
        for (var i = 0; i < update.parent.children.length; ++i) {
            Echo.Render.renderComponentAdd(update, update.parent.children[i], this.client.domainElement);
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) { },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        var property, fullRender = false;

        if (update.fullRefresh || update.hasAddedChildren() || update.hasRemovedChildren()) {
            Echo.Sync.renderComponentDefaults(this.component, this.client.domainElement);
            var title = this.component.render("title");
            if (title) {
                document.title = title;
            }
            this._renderContent(update);
            fullRender = true;
        } else {
            this.client.domainElement.dir = this.client.application.getLayoutDirection().isLeftToRight() ? "ltr" : "rtl";
            if (update.hasUpdatedProperties()) {
                property = update.getUpdatedProperty("title");
                if (property) {
                    document.title = property.newValue;
                }
                property = update.getUpdatedProperty("background");
                if (property) {
                    Echo.Sync.Color.renderClear(property.newValue, this.client.domainElement, "backgroundColor");
                }
                property = update.getUpdatedProperty("foreground");
                if (property) {
                    Echo.Sync.Color.renderClear(property.newValue, this.client.domainElement, "foreground");
                }
                property = update.getUpdatedProperty("font");
                if (property) {
                    Echo.Sync.Font.renderClear(property.newValue, this.client.domainElement);
                }
                Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this.client.domainElement);
            }
        }
        
        return fullRender;
    }
});
