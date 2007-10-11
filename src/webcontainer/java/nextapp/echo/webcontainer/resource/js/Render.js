/**
 * @fileoverview
 * Module for rendering state of application to DOM.
 * <ul>
 *  <li>Provides capability to process updates in Application UpdateManager,
 *   rendering state changes to the DOM.</li>
 *  <li>Provides component synchronization peer base class.</li>
 *  <li>Provides root component synchronization peer implementation.</li>
 *  <li>Provides rendering utilities for the core properties.</li>
 * </ul>
 */

/**
 * @class Application rendering namespace.  Non-instantiable object.
 */
EchoRender = function() { };

/**
 * Mapping between component type names and instantiable peer classes.
 * 
 * @type Object
 * @private
 */
EchoRender._peers = new Object();

/**
 * Map containing removed components.  Maps component ids to removed components.
 * Created and destroyed during each render.
 * 
 * @type Object
 * @private
 */
EchoRender._disposedComponents = null;

//FIXME.  Scrollbar position tracking code in SplitPane appears to suggest that
// disposed states are not in good shape....SplitPane is being disposed when
// parent contentPane is redrawn.

/**
 * An array sorting implemention to organize an array by component depth.
 * @private
 */
EchoRender._componentDepthArraySort = function(a, b) {
    return EchoRender._getComponentDepth(a.parent) - EchoRender._getComponentDepth(b.parent);
};

/**
 * Recursively invokes renderDisplay() method on a sub-hierarchy of the
 * component hierarchy.  If a peer does not provide a renderDisplay() implementation,
 * it is skipped (although its descendants will NOT be skipped).
 * 
 * @param the root component of the sub-hierarchy on which renderDisplay() should be invoked
 * @param includeSelf flag indicating whether renderDisplay() should be invoked on the
 *        specified component (if false, it will only be invoked on child components)
 * @private
 */
EchoRender._doRenderDisplay = function(component, includeSelf) {
    if (includeSelf) {
        EchoRender._doRenderDisplayImpl(component);
    } else {
        for (var i = 0; i < component.children.length; ++i) {
            EchoRender._doRenderDisplayImpl(component.children[i]);
        }
    }
};

/**
 * Recursive work method for _doRenderDisplay().  
 * 
 * @param component the component on which to invoke renderDisplay()
 * @private
 */
EchoRender._doRenderDisplayImpl = function(component) {
    if (component.peer) {
        // components that are present on the client, but are not rendered (lazy rendered as in tree), 
        // have no peer installed.
        if (component.peer.renderDisplay) {
            component.peer.renderDisplay();
        }
        
        for (var i = 0; i < component.children.length; ++i) {
            EchoRender._doRenderDisplayImpl(component.children[i]);
        }
    }
};

/**
 * Returns the depth of a specific component in the hierarchy.
 * The root component is at depth 0, its immediate children are
 * at depth 1, their children are at depth 2, and so on.
 *
 * @param component the component whose depth is to be calculated
 * @return the depth of the component
 * @private
 */
EchoRender._getComponentDepth = function(component) {
    var depth = -1;
    while (component != null) {
        component = component.parent;
        ++depth;
    }
    return depth;
};

EchoRender.getPeerClass = function(component) {
    return EchoRender._peers[component.componentType];
}

/**
 * Creates a component synchronization peer for a component.
 * The peer will be stored in the "peer" property of the component.
 * The client will be stored in the "client" property of the component.
 * 
 * @param {EchoClient} client the relevant Client
 * @param {EchoApp.Component} component the component
 * @private
 */
EchoRender._loadPeer = function(client, component) {
    if (component.peer) {
        return;
// FIXME. which behavior is correct for this scenario: ignore or fail?    
//        throw new Error("Peer already installed: " + component);
    }
    
    var peerClass = EchoRender._peers[component.componentType];
    
    if (!peerClass) {
        throw new Error("Peer not found for: " + component.componentType);
    }
    
    component.peer = new peerClass();
    component.peer.component = component;
    component.peer.client = client;
    
    // Initialize the peer.
    component.peer.init();
};

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
 * @param {EchoApp.Component} parent the component whose size changed
 */
EchoRender.notifyResize = function(parent) {
    EchoRender._doRenderDisplay(parent, false);
};

/**
 * Invokes renderDispose() on all removed children and descendants found in the specified update.
 * 
 * @param {EchoApp.Update.ComponentUpdate} update the update
 * @private
 */
EchoRender._processDispose = function(update) {
    var components = update.getRemovedDescendants();
    if (components) {
        for (var i = 0; i < components.length; ++i) {
            EchoRender._renderComponentDisposeImpl(update, components[i]);
        }
    }
    components = update.getRemovedChildren();
    if (components) {
        for (var i = 0; i < components.length; ++i) {
            EchoRender._renderComponentDisposeImpl(update, components[i]);
        }
    }
};

/**
 * Processes all pending updates in the client's application's update manager.
 * 
 * @param {EchoClient} client the client
 */
EchoRender.processUpdates = function(client) {
    var updateManager = client.application.updateManager;
    
    // Do nothing if no updates exist.
    if (!updateManager.hasUpdates()) {
        return;
    }
    
    // Create map to contain removed components (for peer unloading).
    EchoRender._disposedComponents = new Object();
    
    // Retrieve updates, sorting by depth in hierarchy.  This will ensure that higher
    // level updates have a chance to execute first, in case they null out lower-level
    // updates if they require re-rendering their descendants.
    var updates = updateManager.getUpdates();
    updates.sort(EchoRender._componentDepthArraySort);

    // Load peers for any root components being updated.
    for (var i = 0; i < updates.length; ++i) {
        var peers = updates[i].parent.peer;
        if (peer == null && updates[i].parent.componentType == "Root") {
            EchoRender._loadPeer(client, updates[i].parent);
        }
    }

    // Remove Phase: Invoke renderDispose on all updates.
    for (var i = updates.length - 1; i >= 0; --i) {
        if (updates[i] == null) {
            // Skip removed updates.
            continue;
        }
        var peer = updates[i].parent.peer;
        EchoRender._processDispose(updates[i]);
    }
    
    // Profiling: Mark completion of remove phase. 
    if (EchoCore.profilingTimer) {
        EchoCore.profilingTimer.mark("rem");
    }
    
    // Update Phase: Invoke renderUpdate on all updates.
    for (var i = 0; i < updates.length; ++i) {
        if (updates[i] == null) {
            // The update has been removed, skip it.
            continue;
        }
        
        // Obtain component synchronization peer.
        var peer = updates[i].parent.peer;
        
        // Perform update by invoking peer's renderUpdate() method.
        var fullRender = peer.renderUpdate(updates[i]);
        
        // If the update required re-rendering descendants of the updated component,
        // null-out any pending updates to descandant components.
        if (fullRender) {
            for (var j = i + 1; j < updates.length; ++j) {
                if (updates[j] != null && updates[i].parent.isAncestorOf(updates[j].parent)) {
                    updates[j] = null;
                }
            }
        }

        //FIXME ....moved after loop, ensure this is okay (evaluate use of dispose).
        // Set disposed set of peer to false.
        EchoRender._setPeerDisposedState(updates[i].parent, false);
    }
    
    // Profiling: Mark completion of update phase.
    if (EchoCore.profilingTimer) {
        EchoCore.profilingTimer.mark("up");
    }
    
    // Display Phase: Invoke renderDisplay on all updates.
    for (var i = 0; i < updates.length; ++i) {
        if (updates[i] == null) {
            // Skip removed updates.
            continue;
        }
        //FIXME. this does needless work....resizing twice is quite possible.
        // if property updates are present.
        EchoRender._doRenderDisplay(updates[i].parent, true);
    }

    // Profiling: Mark completion of display phase.
    if (EchoCore.profilingTimer) {
        EchoCore.profilingTimer.mark("disp");
    }

    // Unload peers for truly removed components, destroy mapping.
    for (var componentId in EchoRender._disposedComponents) {
        var component = EchoRender._disposedComponents[componentId];
        EchoRender._unloadPeer(component);
    }
    EchoRender._disposedComponents = null;
    
    // Inform UpdateManager that all updates have been completed.
    updateManager.purge();
    
    // Focus the currently specified focused component, if possible.
    var component = client.application.getFocusedComponent();
    if (component && component.peer && component.peer.renderFocus) {
        component.peer.renderFocus();
    }
};

/**
 * Registers a component type name with an instantiable peer class.
 * Components of the specified type name will be assigned new instasnces of the peer class
 * when rendered for the first time.
 * 
 * @param {String} componentName the component type name
 * @param {Function} peerObject the peer class object
 */
EchoRender.registerPeer = function(componentName, peerObject) {
    EchoRender._peers[componentName] = peerObject;
};

/**
 * Renders a new component inside of a DOM element.
 * This method should be called by container components in order to render their children.
 * 
 * @param {EchoApp.Update.ComponentUpdate} update the revelant ComponentUpdate
 * @param {EchoApp.Component} component the component to add
 * @param {Element} parentElement the DOM element to which the rendered component should be added
 */
EchoRender.renderComponentAdd = function(update, component, parentElement) {
    if (!component.parent || !component.parent.peer || !component.parent.peer.client) {
        throw new Error("Cannot find reference to the Client with which this component should be associated: "
                + "cannot load peer.  This is due to the component's parent's peer not being associated with a Client. "
                + "Component = " + component);
    }

    EchoRender._loadPeer(component.parent.peer.client, component);
    EchoRender._setPeerDisposedState(component, false);
    component.peer.renderAdd(update, parentElement);
};

/**
 * Manually invokes renderDisplay on a component (and its descendants) that was added to the
 * hierarchy outside of processUpdates().  This method is only used in special cases,
 * e.g., by in the case of Application Rendered Components that need to render children.
 * 
 * @param parent the parent component of the sub-hierarchy on which renderDisplay() should
 *        be invoked (note that renderDisplay WILL be invoked on the parent as well 
 *        as its descendants)
 */
EchoRender.renderComponentDisplay = function(parent) {
    EchoRender._doRenderDisplay(parent, true);
};

/**
 * Disposes of a component and its descendants.
 * This method should be invoked by any peer that will be updating a component in such
 * a fashion that it will be destroying the rendering of its children and re-rendering them.
 * It is not necessary to invoke this method on components that may not contain children.
 *
 * @param update the <code>ComponentUpdate</code> for which this change is being performed
 * @param component the <code>Component</code> to be disposed
 */
EchoRender.renderComponentDispose = function(update, component) {
    EchoRender._renderComponentDisposeImpl(update, component);
};

/**
 * Recursive implementation of renderComponentDispose.  Invokes
 * renderDispose() on all child peers, sets disposed state on each.
 * 
 * @param update the <code>ComponentUpdate</code> for which this change is being performed
 * @param component the <code>Component</code> to be disposed
 * @private
 */
EchoRender._renderComponentDisposeImpl = function(update, component) {
    if (!component.peer || component.peer.disposed) {
        return;
    }
    EchoRender._setPeerDisposedState(component, true);

    component.peer.renderDispose(update);
    for (var i = 0; i < component.children.length; ++i) {
        EchoRender._renderComponentDisposeImpl(update, component.children[i]);
    }
};

/**
 * Sets the peer disposed state of a component.
 * The peer disposed state indicates whether the renderDispose()
 * method of the component has been executed since it was last rendered.
 * 
 * @param {EchoApp.Component} component the component
 * @param {Boolean} disposed the disposed state, true indicating the component has
 *        been disposed
 * @private
 */
EchoRender._setPeerDisposedState = function(component, disposed) {
    if (disposed) {
        component.peer.disposed = true;
        EchoRender._disposedComponents[component.renderId] = component;
    } else {
        component.peer.disposed = false;
        delete EchoRender._disposedComponents[component.renderId];
    }
};

// FIXME. Ensure this is properly invoked and no peers are being leaked.
/**
 * Destroys a component synchronization peer for a specific compoennt.
 * The peer will be removed from the "peer" property of the component.
 * The client will be removed from the "client" property of the component.
 * The peer to component association will be removed.
 * 
 * @param {EchoApp.Component} component the component
 * @private
 */
EchoRender._unloadPeer = function(component) {
    component.peer.client = null;
    component.peer.component = null;
    component.peer = null;
};

/**
 * Creates a new copmonent synchronization peer.
 * @constructor
 * @class
 * Component synchronization peer.
 * <p>
 * <strong>Optional methods:</strong>
 * <ul>
 *  <li><code>renderFocus()</code>: Invoked when component is rendered focused.</li>
 *  <li><code>renderDisplay()</code>: Invoked when the component has been added to the hierarchy and first appears
 *                                    on screen, and when ancestors of the component (or the containing window) have
 *                                    resized.</li>
 * </ul>
 */
EchoRender.ComponentSync = function() { };

EchoRender.ComponentSync.prototype.init = function() {

};

EchoRender.ComponentSync.prototype.renderAdd = function(update, parentElement) {
    throw new Error("Operation \"renderAdd\" not supported (Component: " + this.component + ").");
};

EchoRender.ComponentSync.prototype.renderDispose = function(update) {
    throw new Error("Operation \"renderDispose\" not supported (Component: " + this.component + ").");
};

/**
 * @return true if this invocation has re-rendered all child components, false otherwise
 */
EchoRender.ComponentSync.prototype.renderUpdate = function(update) {
    throw new Error("Operation \"renderUpdate\" not supported (Component: " + this.component + ").");
};

/**
 * Creates a new root component synchronization peer.
 * The root component is not managed by the server, but rather is an existing
 * element within which the Echo application is rendered.
 * This is a very special case in that there is no renderAdd() method.
 * 
 * @constructor
 * @class Root component synchronization peer.
 */
EchoRender.RootSync = function() { };

EchoRender.RootSync.prototype = EchoCore.derive(EchoRender.ComponentSync);

EchoRender.RootSync.prototype.renderDispose = function(update) {
};

EchoRender.RootSync.prototype.renderUpdate = function(update) {
    var fullRender = false;
    if (update.hasAddedChildren() || update.hasRemovedChildren()) {
        EchoWebCore.DOM.removeAllChildren(this.client.domainElement);
        for (var i = 0; i < update.parent.children.length; ++i) {
            EchoRender.renderComponentAdd(update, update.parent.children[i], this.client.domainElement);
        }
        fullRender = true;
    }
    
    if (update.hasUpdatedProperties()) {
        var titleUpdate = update.getUpdatedProperty("title");
        if (titleUpdate) {
            document.title = titleUpdate.newValue;
        }
    }
    
    return fullRender;
};

/**
 * @class
 * Namespace for utility objects.
 */
EchoRender.Util = function() { };

// FIXME abstract this somehow so it works with FreeClient too
EchoRender.Util.TRANSPARENT_IMAGE = "?sid=Echo.TransparentImage";

EchoRender.registerPeer("Root", EchoRender.RootSync);
