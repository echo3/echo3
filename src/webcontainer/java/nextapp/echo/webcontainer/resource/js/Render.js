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
 * @class
 * Namespace for core property rendering utilities.
 */
EchoRender.Property = function() {
};

EchoRender.Property.getEffectProperty = function(component, defaultPropertyName, effectPropertyName, effectState) {
	var property;
	if (effectState) {
        property = component.getRenderProperty(effectPropertyName);
	}
	if (!property) {
		property = component.getRenderProperty(defaultPropertyName);
	}
	return property;
};

EchoRender.Property.Alignment = function() { };

EchoRender.Property.Alignment.getRenderedHorizontal = function(alignment, component) {
    var layoutDirection = component ? component.getRenderLayoutDirection() : EchoApp.LayoutDirection.LTR;
    switch (alignment.horizontal) {
    case EchoApp.Alignment.LEADING:
        return layoutDirection.isLeftToRight() ? EchoApp.Alignment.LEFT : EchoApp.Alignment.RIGHT;
    case EchoApp.Alignment.TRAILING:
        return layoutDirection.isLeftToRight() ? EchoApp.Alignment.RIGHT : EchoApp.Alignment.LEFT;
    default:
        return alignment.horizontal;
    }
};

EchoRender.Property.Alignment.renderComponentProperty 
        = function(component, componentProperty, defaultValue, element, renderToElement, referenceComponent) {
    referenceComponent = referenceComponent ? referenceComponent : component;
    var alignment = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    if (!alignment) {
        alignment = defaultValue;
    }
    var horizontal = alignment ? EchoRender.Property.Alignment.getRenderedHorizontal(alignment, referenceComponent) : null;
    var vertical = alignment ? alignment.vertical : null;
    
    var horizontalValue;
    switch (horizontal) {
    case EchoApp.Alignment.LEFT:   horizontalValue = "left";   break;
    case EchoApp.Alignment.CENTER: horizontalValue = "center"; break;
    case EchoApp.Alignment.RIGHT:  horizontalValue = "right";  break;
    default:                       horizontalValue = "";       break;
    }
    var verticalValue;
    switch (vertical) {
    case EchoApp.Alignment.TOP:    verticalValue = "top";      break;
    case EchoApp.Alignment.CENTER: verticalValue = "middle";   break;
    case EchoApp.Alignment.BOTTOM: verticalValue = "bottom";   break;
    default:                       verticalValue = "";         break;
    }
    
    if (renderToElement) {
        element.align = horizontalValue;
        element.vAlign = verticalValue;
    } else {
        element.style.textAlign = horizontalValue;
        element.style.verticalAlign = verticalValue;
    }
};

EchoRender.Property.Border = function() { };

/**
 * @private
 */
EchoRender.Property.Border._SIDE_STYLE_NAMES = new Array("borderTop", "borderRight", "borderBottom", "borderLeft");

/**
 * @private
 */
EchoRender.Property.Border._SIDE_RENDER_STRATEGIES 
        = new Array(new Array(0, 1, 2, 3), new Array(0, 1, 2, 1), new Array(0, 1, 0, 1), new Array(0, 0, 0, 0));

EchoRender.Property.Border.render = function(border, element) {
    if (!border) {
    	return;
    }
    if (border.multisided) {
        var renderStrategy = EchoRender.Property.Border._SIDE_RENDER_STRATEGIES[4 - border.sides.length];
        for (var i = 0; i < 4; ++i) {
            EchoRender.Property.Border.renderSide(border.sides[renderStrategy[i]], element, 
                    EchoRender.Property.Border._SIDE_STYLE_NAMES[i]);
        }
    } else {
        var color = border.color ? border.color.value : null;
        element.style.border = EchoRender.Property.Extent.toPixels(border.size) + "px " + border.style + " " 
                + (color ? color : "");
    }
};

EchoRender.Property.Border.renderClear = function(border, element) {
	if (border) {
		EchoRender.Property.Border.render(border, element);
	} else {
		element.style.border = "";
	}
};

EchoRender.Property.Border.renderComponentProperty = function(component, componentProperty, defaultValue, element) { 
    var border = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.Border.render(border ? border : defaultValue, element);
};

EchoRender.Property.Border.renderSide = function(borderSide, element, styleName) {
    var color = borderSide.color ? borderSide.color.value : null;
    element.style[styleName] = EchoRender.Property.Extent.toPixels(borderSide.size) + "px " + borderSide.style + " " 
            + (color ? color : "");
};

EchoRender.Property.Color = function() { };

EchoRender.Property.Color.render = function(color, element, styleProperty) {
	if (color) {
	    element.style[styleProperty] = color.value;
	}
};

EchoRender.Property.Color.renderClear = function(color, element, styleProperty) {
    element.style[styleProperty] = color ? color.value : "";
};

EchoRender.Property.Color.renderComponentProperty = function(component, componentProperty, defaultValue, element, styleProperty) { 
    var color = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.Color.render(color ? color : defaultValue, element, styleProperty);
};

EchoRender.Property.Color.renderFB = function(component, element) { 
	var color;
    if (color = component.getRenderProperty("foreground")) {
	    element.style.color = color.value;
    }
    if (color = component.getRenderProperty("background")) {
	    element.style.backgroundColor = color.value;
    }
};

EchoRender.Property.Extent = function() { };

EchoRender.Property.Extent.toPixels = function(extent, horizontal) {
    if (extent == null) {
        return 0;
    } else {
        return EchoWebCore.Render.extentToPixels(extent.value, extent.units, horizontal);
    }
};

EchoRender.Property.FillImage = function() { };

EchoRender.Property.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER = 0x1;

EchoRender.Property.FillImage.render = function(fillImage, element, flags) {
    if (!fillImage) {
        // No image specified, do nothing.
        return;
    }
    
    var url = fillImage.image ? fillImage.image.url : "";
    
    if (EchoWebCore.Environment.PROPRIETARY_IE_PNG_ALPHA_FILTER_REQUIRED &&
            flags && (flags & EchoRender.Property.FillImage.FLAG_ENABLE_IE_PNG_ALPHA_FILTER)) {
        // IE6 PNG workaround required.
        element.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" 
            + url + "', sizingMethod='scale')";
    } else {
        // IE6 PNG workaround not required.
        element.style.backgroundImage = "url(" + url + ")";
    }
    
    if (fillImage.repeat || fillImage.repeat == EchoApp.FillImage.NO_REPEAT) {
		var repeat;
		switch (fillImage.repeat) {
        case EchoApp.FillImage.NO_REPEAT:
            repeat = "no-repeat";
            break;
        case EchoApp.FillImage.REPEAT_HORIZONTAL:
            repeat = "repeat-x";
            break;
        case EchoApp.FillImage.REPEAT_VERTICAL:
            repeat = "repeat-y";
            break;
        default:
            repeat = "repeat";
        }
        element.style.backgroundRepeat = repeat;
    }
    
    if (fillImage.x || fillImage.y) {
        element.style.backgroundPosition = (fillImage.x ? fillImage.x : "0px") + " " + (fillImage.y ? fillImage.y : "0px");
    }
};

EchoRender.Property.FillImage.renderClear = function(fillImage, element, flags) {
	if (fillImage) {
		EchoRender.Property.FillImage.render(fillImage, element, flags);
	} else {
		element.style.backgroundImage = "";
	    element.style.backgroundPosition = "";
	    element.style.backgroundRepeat = "";
	}
};

EchoRender.Property.FillImage.renderComponentProperty = function(component, componentProperty, defaultValue,
        element, flags) {
    var fillImage = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.FillImage.render(fillImage ? fillImage : defaultValue, element, flags);
};

EchoRender.Property.Font = function() { };

EchoRender.Property.Font.render = function(font, element) {
    if (!font) {
        return;
    }
    if (font.typeface) {
        if (font.typeface instanceof Array) {
            element.style.fontFamily = font.typeface.join(",");
        } else {
            element.style.fontFamily = font.typeface;
        }
    }
    if (font.size) {
        element.style.fontSize = EchoRender.Property.Extent.toPixels(font.size) + "px";
    }
    if (font.style) {
        if (font.style & EchoApp.Font.BOLD) {
            element.style.fontWeight = "bold";
        }
        if (font.style & EchoApp.Font.ITALIC) {
            element.style.fontStyle = "italic";
        }
        if (font.style & EchoApp.Font.UNDERLINE) {
            element.style.textDecoration = "underline";
        } else if (font.style & EchoApp.Font.OVERLINE) {
            element.style.textDecoration = "overline";
        } else if (font.style & EchoApp.Font.LINE_THROUGH) {
            element.style.textDecoration = "line-through";
        }
    } else if (font.style == EchoApp.Font.PLAIN) {
        element.style.fontWeight = "";
		element.style.fontStyle = "";
		element.style.textDecoration = "";
    }
};

EchoRender.Property.Font.renderClear = function(font, element) {
    if (font) {
    	EchoRender.Property.Font.render(font, element);
    } else {
		element.style.fontFamily = "";
		element.style.fontSize = "";
		element.style.fontWeight = "";
		element.style.fontStyle = "";
		element.style.textDecoration = "";
    }
};

EchoRender.Property.Font.renderComponentProperty = function(component, componentProperty, defaultValue, 
        element) {
    var font = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.Font.render(font ? font : defaultValue, element);
};

EchoRender.Property.Font.renderDefault = function(component, element, defaultValue) {
	EchoRender.Property.Font.renderComponentProperty(component, "font", defaultValue, element);
};

EchoRender.Property.Insets = function() { };

EchoRender.Property.Insets.renderComponentProperty = function(component, componentProperty, defaultValue, 
        element, styleProperty) { 
    var insets = component.getRenderProperty ? component.getRenderProperty(componentProperty)
            : component.getProperty(componentProperty);
    EchoRender.Property.Insets.renderPixel(insets ? insets : defaultValue, element, styleProperty);
};

EchoRender.Property.Insets.renderPixel = function(insets, element, styleAttribute) {
    if (insets) {
        var pixelInsets = EchoRender.Property.Insets.toPixels(insets);
        element.style[styleAttribute] = pixelInsets.top + "px " + pixelInsets.right + "px "
                + pixelInsets.bottom + "px " + pixelInsets.left + "px";
    }
};

EchoRender.Property.Insets.toCssValue = function(insets) {
    if (insets) {
        var pixelInsets = EchoRender.Property.Insets.toPixels(insets);
        return pixelInsets.top + "px " + pixelInsets.right + "px "
                + pixelInsets.bottom + "px " + pixelInsets.left + "px";
    } else {
        return "";
    }
};

EchoRender.Property.Insets.toPixels = function(insets) {
    var pixelInsets = new Object();
    pixelInsets.top = EchoWebCore.Render.extentToPixels(insets.top.value, insets.top.units, false);
    pixelInsets.right = EchoWebCore.Render.extentToPixels(insets.right.value, insets.right.units, true);
    pixelInsets.bottom = EchoWebCore.Render.extentToPixels(insets.bottom.value, insets.bottom.units, false);
    pixelInsets.left = EchoWebCore.Render.extentToPixels(insets.left.value, insets.left.units, true);
    return pixelInsets;
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
